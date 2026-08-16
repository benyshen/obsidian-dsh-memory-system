# 模板库说明

> 本目录存放可复用的**问题/任务模板**：从真实处理过的问题中抽象出“题型/任务类型 → 解法/流程 → 关联知识”的模式，遇到新问题时先做“问题蒸馏”（抽象成模板表达）再查询。

## 单张模板卡模板（`templates/<slug>.md`）

```markdown
---
id: tpl-<slug>
type: problem        # problem / solution
status: active
created: YYYY-MM-DD
updated: YYYY-MM-DD
related_theorems: []  # 关联结论/知识索引
related: []
---

# <模板名>

## 适用场景
<什么样的问题属于此类>

## 解法/流程
<步骤化的处理流程>

## 关键技巧
<可迁移的技巧>

## 实例
- [[episode-slug]]：<该实例如何套用此模板>
```

## 维护规则

- 从真实处理过的问题抽象，不得凭空编造；
- 模板会随实际使用逐步生长；
- 每次新建/修改后更新 `index.md`。
