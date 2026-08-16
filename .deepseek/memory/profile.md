---
type: memory/profile
updated: 2026-08-16
---

# 用户画像与稳定偏好

> 本文件由 AI 维护：只放**现在仍然成立**的稳定事实（语义层）。过程性内容与原始对话证据放 `.deepseek/memory/episodes/`。更新原则：合并同类项；事实被推翻时用“~~旧值~~ → 新值（日期）”标注，不要删除历史。

## 关注领域

- （待填充：用户长期关注/工作的领域与方向）
- （例如：AI Agent、工业软件、……）

## 当前关注

- （待填充：近期在想的问题、在做的项目；收束后下沉到 episodes 引用）

## 偏好与习惯

- （待填充：工具偏好、工作流偏好、表达风格、回复深度偏好……）

## 术语与写作习惯

- （待填充：用户惯用术语/缩写/命名约定；完整术语体系见 `memory/notation.md`）

## 工具与工作流

- 记忆库：AImemory（vault: `$DSH_AIMEMORY_VAULT` 或仓库根）
- GitHub：用户名 benyshen（公开），发布仓库用 GCM（credential.helper=manager）管理凭据，push 无需手动带 token
- 技术栈：DeepSeek Harness + PowerShell 脚本 + Node.js/ESM 插件

## 长期授权

- 发布到 GitHub 的公开项目默认 public 可见
- 发布前检查隐私（API key / 本机用户名 / 本地路径 / 邮箱不写入公开文件）；git 历史泄露时重建干净历史

## 修订历史

- （AI 每次修改某条事实时在此加一行：`YYYY-MM-DD 事项：旧值 → 新值，证据见 episodes/YYYY-MM-DD-*`）
