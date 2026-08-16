# 2026-08-16 建立 AImemory 长期记忆体系

## 00:30 用户要求建立 DSH 长期记忆体系

- 用户原话/关键表述："在本地目录打造一套 DeepSeek Harness 的长期记忆管理体系"，参考 https://github.com/maple110011/dsh-obsidian-math
- 结论/产出：确定方案为参考 dsh-obsidian-math 架构（五层记忆 + 记忆注入插件 + note 检索工具 + 每日体检），但领域无关通用化；替代先前 OpenViking 服务器方案（完全本地，无需外部服务器）。
- 涉及：[[rec-aimemory-system]] · 主题：aimemory

## 01:00 完成体系搭建并端到端验证

- 结论/产出：AImemory vault（AGENTS.md + .deepseek/ 五层结构）、agent preset（aimemory-memory.mjs 记忆注入 + aimemory-notes.mjs note 工具）、aimemory profile 全部搭建完成；服务运行在 3180 端口；零 token 探针 17/17 通过；真实 DeepSeek 会话端到端验证通过（note_recall 命中记忆卡、诚实报告断链不编造）。
- 事实修正：模型路由最初缺 DEEPSEEK_API_KEY（MISSING_CREDENTIAL），用户提供 key 后改用 deepseek-official / deepseek-v4-flash。
- 涉及：[[rec-aimemory-system]] · 主题：aimemory
