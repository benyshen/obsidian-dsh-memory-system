# AImemory · DeepSeek Harness 长期记忆体系（DSH Skill）

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![DSH Skill](https://img.shields.io/badge/DSH-Skill-aimemory-blue.svg)](SKILL.md)

[English](README.md) | **中文**

一个 **DeepSeek Harness 的 DSH Skill 项目**：为 Harness 提供**跨会话分层长期记忆**（五层记忆 + 统一检索 + 每日体检 + 备忘录生命周期）。架构参考 [dsh-obsidian-math](https://github.com/maple110011/dsh-obsidian-math)（火山引擎 OpenViking 的本地替代方案——完全本地运行，无需外部服务器：所有记忆都是你机器上的普通 markdown）。

安装后包含三部分：

1. **DSH Skill**（`SKILL.md` → `$DSH_HOME/skills/aimemory.md`）——模型可通过 skill 工具加载的记忆管理指令；
2. **Agent preset**（`.dsh-preset/` → `$DSH_HOME/.agent-presets/aimemory/`）——记忆注入插件 + note 检索工具 + 每日体检；
3. **Profile + 记忆 vault**（`.dsh-profile/` → `$DSH_HOME/profiles/aimemory/`，vault 模板 → 任意目录）——独立服务与记忆库结构。

## 它能做什么

- **五层记忆**：profile（语义层）/ topics（导航层）/ records（类型化原子记录）/ episodes（原始证据，append-only）/ inbox（想法备忘录）
- **跨会话记忆注入**：每次对话的系统提示自动注入画像、主题索引、记录摘要、备忘录清单、事件时间线、最近问答线索、记忆体检报告
- **统一检索**：`note_recall`（BM25 + hook 加权 + CJK 匹配，一次查笔记 + 全部记忆层）、`note_search`（tag 过滤）、`note_create`（拒绝覆盖）、`note_links`（反链）
- **记忆体检**：插件每日确定性扫描（weak/duplicate/unused/unverified/断链），报告注入系统提示
- **捕获策略**：idea/fact/preference × auto/ask/off，由用户维护
- **备忘录生命周期**：inbox → polishing → done，自动提醒打磨
- **验证徽标**：记忆卡标注 ✅用户确认 / ⚖️互证 / ❓单源
- **fail-closed 安全**：写入限定在 vault（workspace-write 沙箱）、审批 never（不弹权限升级）、preset 不含 shell/web/subagent 工具

## 快速开始

### 0. 前提

- DeepSeek Harness 已安装（`$DSH_HOME`，默认 `~/.dsh`），模型凭据已配置（如 `DEEPSEEK_API_KEY`）。

### 1. 安装

```powershell
# 安装 skill + agent preset + profile 到 $DSH_HOME，并在当前目录（或 -Vault 指定目录）铺记忆库模板
powershell -ExecutionPolicy Bypass -File .\install.ps1
# 可选：在任意目录新建记忆 vault
powershell -ExecutionPolicy Bypass -File .\install.ps1 -Vault D:\path\to\myvault
```

### 2. 启动服务

```powershell
.\start-aimemory.cmd        # 或：
powershell -ExecutionPolicy Bypass -File .\start.ps1
```

浏览器打开 **http://127.0.0.1:3180**（与主 web 3080 并存）。停止：`stop.ps1`。

### 3. 使用

- 在 3180 的 web 界面聊天即可；agent 预设 `aimemory` 已装配记忆注入与 note 工具。
- 任意 DSH 会话可通过 **skill 工具**加载 `aimemory` skill（`$DSH_HOME/skills/aimemory.md`），在**任意工作目录**按五层记忆协议维护记忆。
- 通过 API（脚本/其他 agent 接入）：

```python
POST http://127.0.0.1:3180/api/session.create
{"type":"client-request","rpcId":"<uuid>","method":"session.create",
 "payload":{"cwd":"D:\\path\\to\\vault","agentPreset":"aimemory"}}
# 之后 session.prompt / session.history 同协议
```

## 目录结构

```text
vault/
  AGENTS.md                          工作协议（自动加载，约束 agent 记忆行为）
  .deepseek/
    memory/profile.md                语义层（用户画像与稳定偏好）
    memory/topics/                   导航层（主题索引）
    memory/records/                  记录层（类型化原子卡 + hook 检索特征）
    memory/theorems/                 结论/定理索引
    memory/templates/                问题/任务模板库
    memory/episodes/                 证据层（append-only 事件卡）
    memory/notation.md               术语与记号体系
    inbox/                           想法备忘录（inbox→polishing→done）
    capture-policy.md                捕获策略（用户维护）
    cache/                           机器缓存（勿动）
```

## 安装位置（$DSH_HOME）

| 组件 | 路径 |
|---|---|
| DSH skill | `$DSH_HOME/skills/aimemory.md` |
| agent preset | `$DSH_HOME/.agent-presets/aimemory/` |
| profile | `$DSH_HOME/profiles/aimemory/` |
| 模型配置 | `$DSH_HOME/profiles/aimemory/settings.aimemory.yaml`（deepseek-official / deepseek-v4-flash） |
| API key | `DEEPSEEK_API_KEY` 于 `$DSH_HOME/.credentials.yaml` 或环境变量 |

## 验证

```powershell
node .dsh-preset\probe-aimemory.mjs   # 17/17 零 token 探针
```

端到端已验证：真实 DeepSeek 会话中 `note_recall` 检索命中记忆卡、回答准确、诚实报告断链不编造。

## 工作原理（简述）

1. **`aimemory-memory.mjs`**（agent preset 插件）挂接系统提示组装：读 `.deepseek/memory/*` 与 `.deepseek/inbox/*`，从 `$DSH_HOME/sessions` 历史日志蒸馏有界对话索引，执行每日确定性体检，追加一个有界记忆段。
2. **`aimemory-notes.mjs`** 通过 harness 工具注册表注册 `note_recall` / `note_search` / `note_create` / `note_links`，写入限定在 vault 内。
3. **`aimemory` profile** 固定该 preset、`workspace-write` 沙箱、fail-closed 审批与独立 settings 文件，绝不改动主 web profile。

## 常见问题

- **端口占用**：改 `start-aimemory.cmd` / `start.ps1` 里的 `--port`（与 3080 主服务并存，勿用 3080）。
- **换模型**：编辑 `$DSH_HOME/profiles/aimemory/settings.aimemory.yaml` 后重启。
- **记忆体检**：每日自动一次，报告见系统提示「记忆体检」段与 `.deepseek/cache/memory-audit.json`。

## License

[MIT](LICENSE)
