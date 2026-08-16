// AImemory engine probe v2 — zero-token verification.
// Verifies: (1) module imports, (2) classifyVaultDoc routing matches design,
// (3) BM25 recall hits a real seed record card, (4) memory section builder.
import { existsSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const presetDir = dirname(fileURLToPath(import.meta.url));
const notes = await import(pathToFileURL(join(presetDir, "aimemory-notes.mjs")));
const memory = await import(pathToFileURL(join(presetDir, "aimemory-memory.mjs")));

const splitFrontmatter = (raw) => {
  if (!raw.startsWith("---")) return { frontmatter: null, body: raw };
  const close = raw.indexOf("\n---", 3);
  if (close < 0) return { frontmatter: null, body: raw };
  return { frontmatter: raw.slice(3, close), body: raw.slice(close + 4) };
};

let pass = 0, fail = 0;
const check = (label, ok, extra = "") => { console.log(ok ? "[PASS]" : "[FAIL]", label, extra); ok ? pass++ : fail++; };

// 1. classifyVaultDoc routing (design contract)
check("classify: user note → note", notes.classifyVaultDoc("notes/项目A.md") === "note");
check("classify: record card → record", notes.classifyVaultDoc(".deepseek/memory/records/rec-abc.md") === "record");
check("classify: records/index → skip", notes.classifyVaultDoc(".deepseek/memory/records/index.md") === "skip");
check("classify: episode body → skip", notes.classifyVaultDoc(".deepseek/memory/episodes/2026-08-16-x.md") === "skip");
check("classify: episode index → episode-index", notes.classifyVaultDoc(".deepseek/memory/episodes/index.md") === "episode-index");
check("classify: inbox memo → memo", notes.classifyVaultDoc(".deepseek/inbox/idea.md") === "memo");
check("classify: AGENTS.md → skip", notes.classifyVaultDoc("AGENTS.md") === "skip");
check("classify: capture-policy → skip", notes.classifyVaultDoc(".deepseek/capture-policy.md") === "skip");
check("classify: profile → skip", notes.classifyVaultDoc(".deepseek/memory/profile.md") === "skip");

// 2. tokenize / BM25 sanity
const t = notes.tokenize("长期记忆 分层 vault AImemory");
check("tokenize CJK bigrams", t.some((x) => x === "长期") && t.some((x) => x === "记忆"));
const stats = notes.computeCorpusStats([notes.tokenize("a b c"), notes.tokenize("a b")]);
const s1 = notes.bm25Score(notes.tokenize("a b"), notes.tokenize("a b c"), stats);
check("bm25 basic > 0", s1 > 0);

// 3. recall over the real vault: create a seed record card + index row
const vault = process.env.DSH_AIMEMORY_VAULT || process.cwd();
const seedSlug = "rec-aimemory-system";
const seedRel = ".deepseek/memory/records/" + seedSlug + ".md";
const seedCard = `---
id: ${seedSlug}
type: event
status: active
created: 2026-08-16
updated: 2026-08-16
source: '[[2026-08-16-bootstrap]]'
topic: aimemory
related: []
hook:
  operator: ai-agent
  pattern: layered-memory
  techniques:
    - five-layer-memory
  applications: 为 DeepSeek Harness 建立跨会话长期记忆
  verified: single-source
---

# 建立 AImemory 长期记忆体系

## 内容
2026-08-16 在 D:\\AI\\work\\AImemory 参考 dsh-obsidian-math 建立了 DeepSeek Harness 的长期记忆体系：五层记忆（profile/topics/records/episodes/inbox）、note_recall 统一检索、每日记忆体检、捕获策略与备忘录生命周期。vault 根有 AGENTS.md 工作协议。

## 证据
- 来源事件：[[2026-08-16-bootstrap]]
- 原始表述摘录：用户要求“在本地目录 D:\\AI\\work\\AImemory 打造一套 DeepSeek Harness 的长期记忆管理体系”

## 变更历史
- 2026-08-16：创建
`;
if (!existsSync(join(vault, seedRel))) writeFileSync(join(vault, seedRel), seedCard, "utf8");
const indexPath = join(vault, ".deepseek/memory/records/index.md");
let indexText = readFileSync(indexPath, "utf8");
if (!indexText.includes(`[[${seedSlug}`)) {
  indexText = indexText.replace("## event（事件）\n\n（暂无）", "## event（事件）\n\n- [[" + seedSlug + "|建立 AImemory 长期记忆体系]] · aimemory · updated: 2026-08-16");
  writeFileSync(indexPath, indexText, "utf8");
}

// rebuild corpus
const files = [];
const walk = (dir, rel) => {
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    if (e.isDirectory()) { if ([".obsidian", ".trash", ".git", "node_modules"].includes(e.name)) continue; walk(join(dir, e.name), rel === "" ? e.name : rel + "/" + e.name); }
    else if (e.name.toLowerCase().endsWith(".md")) files.push(rel === "" ? e.name : rel + "/" + e.name);
  }
};
walk(vault, "");
const docs = [];
for (const rel of files) {
  const kind = notes.classifyVaultDoc(rel);
  if (kind === "skip") continue;
  let raw; try { raw = readFileSync(join(vault, rel), "utf8"); } catch { continue; }
  const { frontmatter, body } = splitFrontmatter(raw);
  const metaOf = (key) => { if (frontmatter === null) return undefined; const m = new RegExp("^" + key + ":\\s*(.*)$", "m").exec(frontmatter); return m ? m[1].trim() : undefined; };
  const h = /^#\s+(.+)$/m.exec(body);
  docs.push({ kind, rel, title: metaOf("title") ?? h?.[1]?.trim() ?? rel.replace(/\.md$/i, ""), topic: metaOf("topic") ?? "", hook: frontmatter === null ? null : notes.parseHookFrontmatter(frontmatter), body });
}
check("corpus has seed card", docs.some((d) => d.rel.includes(seedSlug)));

const rank = (query, limit = 8) => {
  const qTokens = notes.tokenize(query);
  const passages = docs.map((d) => notes.composePassage(d.kind, d));
  const stats2 = notes.computeCorpusStats(passages.map((x) => notes.tokenize(x)));
  const docTokens = passages.map((x) => notes.tokenize(x));
  const raw = docs.map((d, i) => notes.bm25Score(qTokens, docTokens[i], stats2));
  const max = Math.max(1e-9, ...raw);
  const cjk = docs.map((d, i) => notes.cjkCharOverlap(query, passages[i]));
  return docs.map((d, i) => ({ d, score: 0.85 * (raw[i] / max) + 0.10 * cjk[i], coverage: notes.queryCoverage(qTokens, docTokens[i]) }))
    .filter((x) => x.score > 0).sort((a, b) => b.score - a.score).slice(0, limit);
};

const top = rank("AImemory 长期记忆 体系 建立");
const hitIdx = top.findIndex((x) => x.d.rel.includes(seedSlug));
check("recall hits seed card", hitIdx >= 0 && hitIdx < 3, `→ rank ${hitIdx + 1}`);

const top2 = rank("量子引力 超弦理论 卡拉比-丘流形 拓扑绝缘体");
const weak = top2.length === 0 || top2[0].coverage < 0.4;
check("out-of-vault query is weak signal", weak, top2.length > 0 ? `→ top1 cov ${top2[0].coverage.toFixed(2)}` : "→ empty");

// 4. memory section builder
try {
  const section = memory.buildMemorySection(
    { vaultRoot: vault, sessionsRoot: join(vault, ".deepseek", "cache") },
    "probe-session",
    { entries: [] },
    undefined,
    ""
  );
  check("memory section: layered heading", /分层长期记忆/.test(section));
  check("memory section: capture policy", /捕获策略/.test(section));
  check("memory section: profile hint", /用户画像/.test(section));
} catch (e) {
  check("memory section builder", false, String(e).slice(0, 120));
}

console.log("\nprobe result: " + pass + "/" + (pass + fail) + " PASS");
process.exit(fail === 0 ? 0 : 1);
