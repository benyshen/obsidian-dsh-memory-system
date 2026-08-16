# 记忆记录层说明（原子记忆卡）

> 本目录是**类型化原子记忆层**：把每轮对话的证据提炼成一条条独立记录，位于原始事件（episodes）与主题/画像之间。

## 记录类型

| type | 含义 | 例子 |
|---|---|---|
| `fact` | 客观事实 | “用户在 AImemory vault 建立长期记忆体系” |
| `event` | 发生过的事件/决定 | “2026-08-16 决定采用 aimemory profile” |
| `instruction` | 用户的长期指令/约定 | “关键想法默认写入备忘录” |
| `preference` | 偏好/习惯/倾向 | “偏好简洁回复，先结论后细节” |
| `artifact` | 工作产物 | 例子、反例、分解计划、障碍、提取到的模式（中间产物） |

## 单条记录模板（`records/<slug>.md`）

```markdown
---
id: rec-<slug>
type: fact            # fact / event / instruction / preference / artifact
status: active        # active / superseded
created: YYYY-MM-DD
updated: YYYY-MM-DD
source: '[[YYYY-MM-DD-episode-slug]]'
topic: <相关主题或“未归类”>
related: []
hook:                 # 可选：检索特征块（供 note_recall 加权打分与算子过滤）
  operator: ai-agent        # 算子类型，如 ai-agent / dev / infra / workflow ...
  pattern: memory-system    # 结构模式（下划线分词）
  techniques:               # 可迁移技巧（reinforce 时追加）
    - layered-memory
  applications: 建立跨会话长期记忆  # 能解决什么挑战（与查询侧对齐）
  verified: single-source   # single-source / cross-referenced / user-confirmed（升级需用户参与）
  # uses / success_rate / last_used 由插件维护，不要手写
---

# <一句话陈述>

## 内容
<精确、可独立理解的事实/决定/指令/偏好>

## 证据
- 来源事件：[[YYYY-MM-DD-episode-slug]]
- 原始表述摘录：<引用原文>

## 变更历史
- YYYY-MM-DD：创建
```

## hook 块说明

- **写什么**：`operator/pattern/techniques/applications/verified` 由你在创建卡片时填写，`techniques` 在 reinforce 时追加（来自真实过程，不得编造）。
- **谁维护统计**：`uses/success_rate/last_used` 由插件确定性维护——`note_recall` 命中计数写入 `cache/retrieval-stats.json`，每日体检把计数回写进 hook 块。**你永远不手写/手改这三个字段**。
- **验证等级**：新建只能写 `single-source`；与 vault 内笔记互证后可升级 `cross-referenced`；`user-confirmed` 只能在用户明确确认后写。
- **为什么要 hook**：统一检索（`note_recall`）用 hook 字段加权打分与算子过滤；没有 hook 的卡只能靠全文匹配被找到，检索质量明显更低。artifact 类卡片**建议必有**，fact/preference 类可省略。
