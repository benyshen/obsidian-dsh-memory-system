# AImemory · Long-Term Memory System for DeepSeek Harness (DSH Skill)

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![DSH Skill](https://img.shields.io/badge/DSH-Skill-aimemory-blue.svg)](SKILL.md)
[![Language](https://img.shields.io/badge/language-PowerShell%20%7C%20JavaScript-2f74c0.svg)]()
[![Platform](https://img.shields.io/badge/platform-Windows%20%7C%20macOS%20%7C%20Linux-lightgrey.svg)]()
[![Model](https://img.shields.io/badge/model-DeepSeek%20V4-4b32c3.svg)]()
[![Probe](https://img.shields.io/badge/probe-17%2F17%20PASS-brightgreen.svg)](.dsh-preset/probe-aimemory.mjs)
[![GitHub stars](https://img.shields.io/github/stars/benyshen/obsidian-dsh-memory-system)](https://github.com/benyshen/obsidian-dsh-memory-system)

**English** | [中文](README.zh.md)

A **DSH Skill project** that gives [DeepSeek Harness](https://github.com/deepseek-ai/deepseek-harness) a **cross-session, layered long-term memory** — five memory layers, unified retrieval, a deterministic daily memory audit, and a full memo lifecycle. It is a fully local alternative to external memory servers (e.g. OpenViking): no server to deploy, everything lives in a plain markdown vault on your machine.

Architecture inspired by [dsh-obsidian-math](https://github.com/maple110011/dsh-obsidian-math), generalized to be domain-agnostic.

---

## What you get

Installing this repo gives you **three components**:

| # | Component | Source → Install target | What it does |
|---|-----------|------------------------|--------------|
| 1 | **DSH Skill** | `SKILL.md` → `$DSH_HOME/skills/aimemory.md` | Model-loadable memory-management instructions (via the `skill` tool) |
| 2 | **Agent preset** | `.dsh-preset/` → `$DSH_HOME/.agent-presets/aimemory/` | Memory-injection plugin + dedicated note tools + daily audit |
| 3 | **Profile + memory vault** | `.dsh-profile/` → `$DSH_HOME/profiles/aimemory/`, vault templates → any directory | A standalone `dsh --profile aimemory` service + the vault structure |

## Features

- **Five memory layers**: `profile` (semantic) / `topics` (navigation) / `records` (typed atomic cards) / `episodes` (raw evidence, append-only) / `inbox` (idea memos).
- **Cross-session memory injection**: every system prompt automatically carries the profile, topic index, record digest, memo list, episode timeline, recent Q&A cues, and the daily memory-audit report — so a new session starts where the last one ended.
- **Unified retrieval**: `note_recall` (BM25 + hook-field weighting + CJK char containment over notes **and** all memory layers in one pass), `note_search` (tag filter), `note_create` (refuses to overwrite), `note_links` (backlinks).
- **Daily memory audit**: a deterministic, zero-token scan flags weak / duplicate / unused / unverified cards and structural problems (missing `source`, broken links, missing index rows); the report is injected into the system prompt.
- **Capture policy**: `idea` / `fact` / `preference` × `auto` / `ask` / `off`, user-maintained in `.deepseek/capture-policy.md`.
- **Memo lifecycle**: `inbox → polishing → done` with automatic polish reminders (stale or relevant memos surface, ranked by relevance × recency).
- **Verification badges**: `✅ user-confirmed / ⚖️ cross-referenced / ❓ single-source` on memory cards.
- **Fail-closed safety**: writes confined to the vault (`workspace-write` sandbox), approval `never` (no accidental permission escalation), no shell / web / subagent tools in the preset.

## Quick start

### Prerequisites

- A working [DeepSeek Harness](https://github.com/deepseek-ai/deepseek-harness) install (`$DSH_HOME`, default `~/.dsh`).
- Model credentials configured (e.g. `DEEPSEEK_API_KEY`).

### 1. Install

```powershell
# Installs the skill + agent preset + profile into $DSH_HOME and scaffolds
# vault templates into the current directory (or -Vault <dir>)
powershell -ExecutionPolicy Bypass -File .\install.ps1
# Optionally scaffold a fresh memory vault anywhere:
powershell -ExecutionPolicy Bypass -File .\install.ps1 -Vault D:\path\to\myvault
```

### 2. Start the service

```powershell
.\start-aimemory.cmd        # or:
powershell -ExecutionPolicy Bypass -File .\start.ps1
```

Open **http://127.0.0.1:3180** (coexists with the regular `dsh web` on 3080). Stop with `.\stop.ps1`.

### 3. Use it

- Chat in the 3180 web UI: the `aimemory` agent preset is already wired with memory injection and the note tools.
- Any DSH session can load the `aimemory` **skill** via the skill tool (`$DSH_HOME/skills/aimemory.md`) and maintain memory in **any** working directory.
- Drive it from scripts / other agents over the API:

```python
POST http://127.0.0.1:3180/api/session.create
{"type":"client-request","rpcId":"<uuid>","method":"session.create",
 "payload":{"cwd":"D:\\path\\to\\vault","agentPreset":"aimemory"}}
# then session.prompt / session.history with the same envelope
```

## Vault layout

```text
vault/
  AGENTS.md                       working protocol (auto-loaded, governs memory behavior)
  .deepseek/
    memory/profile.md             semantic layer (user profile & stable preferences)
    memory/topics/                navigation layer (topic index)
    memory/records/               record layer (typed atomic cards + hook retrieval features)
    memory/theorems/              conclusions / theorem index
    memory/templates/             problem / task template library
    memory/episodes/              evidence layer (append-only event cards)
    memory/notation.md            terminology & notation ledger
    inbox/                        idea memos (inbox → polishing → done)
    capture-policy.md             capture policy (user-maintained)
    cache/                        machine caches — do not edit
```

## Install layout (`$DSH_HOME`)

| Component | Path |
|---|---|
| DSH skill | `$DSH_HOME/skills/aimemory.md` |
| Agent preset | `$DSH_HOME/.agent-presets/aimemory/` |
| Profile | `$DSH_HOME/profiles/aimemory/` |
| Model config | `$DSH_HOME/profiles/aimemory/settings.aimemory.yaml` (`deepseek-official` / `deepseek-v4-flash`) |
| API key | `DEEPSEEK_API_KEY` in `$DSH_HOME/.credentials.yaml` or environment |

## Verification

```powershell
node .dsh-preset\probe-aimemory.mjs    # 17/17 zero-token engine probe
```

End-to-end verified with a real DeepSeek session: `note_recall` hit the memory card, the answer was accurate, and the model honestly reported a broken `source` link instead of fabricating — exactly per the AGENTS.md protocol.

## How it works (brief)

1. **`aimemory-memory.mjs`** (agent preset plugin) hooks system-prompt assembly: reads `.deepseek/memory/*` + `.deepseek/inbox/*`, distills a bounded dialogue index from past `$DSH_HOME/sessions` logs, runs the daily deterministic audit, and appends one bounded memory section.
2. **`aimemory-notes.mjs`** registers `note_recall` / `note_search` / `note_create` / `note_links` through the harness tool registry, confined to the vault.
3. The **`aimemory` profile** pins the preset, a `workspace-write` sandbox, fail-closed approval, and a dedicated settings file so the main web profile is never touched.

## FAQ

- **Port conflict?** Change `--port` in `start-aimemory.cmd` / `start.ps1` (keep away from 3080).
- **Different model?** Edit `$DSH_HOME/profiles/aimemory/settings.aimemory.yaml` and restart.
- **Where is the audit report?** Injected as the 「记忆体检」 section of the system prompt; raw data at `.deepseek/cache/memory-audit.json`.

## License

[MIT](LICENSE)
