---
id: rec-aimemory-system
type: event
status: active
created: 2026-08-16
updated: 2026-08-17
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
  uses: 0
---

# 建立 AImemory 长期记忆体系

## 内容
2026-08-16 在本地 AImemory vault（`$DSH_AIMEMORY_VAULT`）参考 dsh-obsidian-math 建立了 DeepSeek Harness 的长期记忆体系：五层记忆（profile/topics/records/episodes/inbox）、note_recall 统一检索、每日记忆体检、捕获策略与备忘录生命周期。vault 根有 AGENTS.md 工作协议。2026-08-17 整理为 DSH skill 项目（SKILL.md → `$DSH_HOME/skills/aimemory.md`）并发布到 GitHub。服务运行在 3180 端口，模型 deepseek-official / deepseek-v4-flash。

## 证据
- 来源事件：[[2026-08-16-bootstrap]]
- 原始表述摘录：用户要求"在本地目录打造一套 DeepSeek Harness 的长期记忆管理体系"

## 变更历史
- 2026-08-16：创建
- 2026-08-17：整理为 DSH skill 项目并发布 GitHub，证据见 [[2026-08-17-publish-skill]]
- 2026-08-17：配置 GCM credential helper；README 英文版 + 徽章 + 中文版；隐私审计与 git 历史重写（线上 0 命中），证据见 [[2026-08-17-publish-skill]]
