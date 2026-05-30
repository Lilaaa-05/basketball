# HOOP STATS 产品技术文档（已补全）

**文档名称：** 产品技术文档（Product Technical Specification）

**项目名称：** HOOP STATS

**文档版本：** V1.0（As-Is 补全版）

**文档状态：** 现状梳理版（As-Is）

**最后更新：** 2026-05-30

**维护人：** Project Owner

**补全方式：** 基于仓库代码静态审计（Cursor）

---

# 0. 文档说明

## 0.1 文档目标

本文档用于完整描述当前 HOOP STATS 系统的实际实现情况。

文档覆盖范围：

* 产品功能
* 页面结构
* 数据结构
* 技术架构
* 部署架构
* 国际化方案
* 数据计算逻辑
* 已知问题
* 技术债务

本文档作为未来所有版本迭代的基础文档。

---

## 0.2 文档维护规则

### 功能编号

所有功能必须拥有唯一编号。

示例：

```text
F-3.1.1
```

含义：

```text
F = Function（功能）

3 = 所属模块

1 = 子模块

1 = 功能点
```

---

### 数据结构编号

```text
D-7.1
```

---

### 运维编号

```text
O-9.1
```

---

### BUG编号

```text
BUG-001
```

---

### 技术债务编号

```text
TD-001
```

---

# 1. 系统概述

## 1.1 产品名称

HOOP STATS（导航品牌文案：`HoopStats`，见 `src/App.vue`）

---

## 1.2 产品定位

面向业余/社团篮球队（当前数据为「雪谷火箭」）的 **静态 Web 数据统计与展示站点**：展示比赛记录、球员档案、数据排行榜；无实时比分、无后台录入界面。

依据：`index.html` 标题为「雪谷火箭」；数据为本地 JSON；功能仅为浏览统计。

---

## 1.3 目标用户

### U-001 球队成员

查看个人与队友场均/单场数据、排行榜名次；从比赛页进入球员详情。

### U-002 球队管理员

【需人工确认】代码中无管理员角色。实际由维护者 **直接编辑** `public/data/matches.json` 与 `public/data/players.json` 更新数据。

### U-003 访客用户（如适用）

任意可访问 GitHub Pages URL 的用户均可浏览，**无需登录**。

---

## 1.4 当前访问地址

生产环境：

```text
https://<GitHub用户名或组织名>.github.io/basketball/#/
```

依据：`vite.config.js` 中 `base: '/basketball/'`；路由为 Hash 模式（`createWebHashHistory`）。

具体用户名/组织名：**【需人工确认】**（仓库 remote 未在本次审计中读取成功）。

示例路径：

* 比赛：`#/matches`
* 球员：`#/players`
* 排行：`#/rankings`
* 球员详情：`#/player/:id`

本地开发：

```text
npm run dev
→ 默认 http://localhost:5173/basketball/（Vite 默认端口，以终端输出为准）
```

依据：`package.json` scripts、`vite.config.js` base。

---

## 1.5 当前运行状态

| 项 | 结论 |
| --- | --- |
| 是否上线 | **【需人工确认】** 若 `main` 分支已启用 GitHub Pages 且使用 `deploy.yml`，则会上线构建产物 |
| 是否公开访问 | 是（静态 Pages，无鉴权） |
| 是否需要登录 | 否 |
| 是否存在后台系统 | 否 |

---

# 2. 技术架构

## 2.1 技术栈总览

| 分类 | 技术 |
| --- | --- |
| 前端框架 | Vue 3.5.x（`<script setup>` SFC） |
| UI 框架 | 无第三方 UI 库；自定义 CSS（`src/style.css`）+ Google Fonts（Inter、Barlow Condensed） |
| 构建工具 | Vite 5.4.x + `@vitejs/plugin-vue` |
| 路由方案 | Vue Router 4.6.x，`createWebHashHistory` |
| 状态管理 | 无 Pinia/Vuex；各页面 `ref` + `onMounted` fetch；全局仅 `src/i18n.js` 的 `lang` |
| 国际化方案 | 自研：`src/i18n.js` 内嵌 `zh`/`ja` 字典 + `t(key)` |
| 数据来源 | 静态 JSON（`public/data/*.json`），运行时 `fetch` |
| 部署平台 | GitHub Pages（工作流见 `.github/workflows/`） |

---

## 2.2 项目目录结构

```text
basketball/
├── .github/
│   └── workflows/
│       ├── deploy.yml          # 推荐：npm ci + build + Pages artifact
│       ├── static.yml          # 上传整个仓库（未 build）
│       └── static1.yml         # 与 static.yml 同名重复
├── .vscode/
│   └── extensions.json
├── public/
│   └── data/
│       ├── matches.json
│       └── players.json
├── src/
│   ├── App.vue                 # 顶栏导航 + RouterView
│   ├── main.js
│   ├── i18n.js
│   ├── style.css
│   ├── router/
│   │   └── index.js
│   └── views/
│       ├── MatchesView.vue
│       ├── PlayersView.vue
│       ├── PlayerView.vue
│       └── RankingsView.vue
├── index.html
├── package.json
├── package-lock.json
├── vite.config.js
├── README.md                   # Vue 模板默认说明，未描述本项目
└── PRODUCT_TECH_SPEC.md
```

**【未发现】** 独立 `data/` 根目录；数据仅在 `public/data/`。

---

## 2.3 页面路由

| 路由 | 页面组件 | 说明 |
| --- | --- | --- |
| `/` | — | 重定向至 `/matches` |
| `/matches` | `MatchesView.vue` | 比赛列表 + Box Score 展开 |
| `/players` | `PlayersView.vue` | 球员卡片列表 |
| `/player/:id` | `PlayerView.vue` | 球员详情（三 Tab） |
| `/rankings` | `RankingsView.vue` | 数据排行榜 |

代码：`src/router/index.js`

**页面关系：**

```mermaid
flowchart LR
  Nav[App.vue 导航]
  M[/matches]
  P[/players]
  R[/rankings]
  PD["/player/:id"]
  Nav --> M
  Nav --> P
  Nav --> R
  M -->|RouterLink 得分王/Box Score| PD
  P -->|点击卡片| PD
  R -->|点击行| PD
  PD -->|返回链接| P
```

---

## 2.4 国际化实现

* **资源位置：** `src/i18n.js`（非独立 JSON 文件）
* **语言：** `zh`（默认）、`ja`
* **切换：** `App.vue` 按钮调用 `toggleLang()`，切换 `lang` ref（`zh` ↔ `ja`）
* **翻译函数：** `t(key)`，日文缺失 key 时回退中文
* **持久化：** 【未发现】刷新后恢复默认 `zh`

---

## 2.5 部署架构

```text
开发者 push main
    → GitHub Actions (deploy.yml)
        → npm ci → npm run build → dist/
        → upload-pages-artifact
        → deploy-pages
    → GitHub Pages 托管 dist
    → 浏览器访问 /basketball/ + Hash 路由
```

**注意：** `static.yml` / `static1.yml` 将 **整个仓库**（含源码）作为 artifact，**不执行 Vite build**，与 `deploy.yml` 冲突风险高；以何者为准 **【需人工确认】**（建议在 GitHub 仓库 Actions 中查看实际启用/最近成功的工作流）。

---

# 3. 全局模块

## F-3.1 顶部导航栏

### F-3.1.1 Logo

* 功能：品牌展示「🏀 Hoop*Stats*」
* 当前状态：不可点击（非链接）
* 代码：`src/App.vue`（`.nav-brand`）

---

### F-3.1.2 比赛 Tab

* 跳转：`/matches`
* 代码：`src/App.vue` + `src/router/index.js`

---

### F-3.1.3 球员 Tab

* 跳转：`/players`
* 代码：同上

---

### F-3.1.4 排行 Tab

* 跳转：`/rankings`
* 代码：同上

---

### F-3.1.5 语言切换

* 支持：中文 / 日文
* 实现：`src/i18n.js` + `src/App.vue` 按钮文案（中文界面显示「日本語」，日文界面显示「中文」）

---

# 4. 比赛模块（M-MATCH）

## 模块概述

展示 `matches.json` 中的比赛卡片；支持展开 Box Score、球队基本/高阶汇总、单场得分榜（Game Leaders）。球员逐场数据来自 `players.json` 中 `games` 按 `match_id` 关联。

主文件：`src/views/MatchesView.vue`

---

## F-4.1 比赛列表

### 页面位置

比赛 Tab → `/matches`

---

### 展示内容

| 字段 | 来源 |
| --- | --- |
| 比赛日期 | `match.date` |
| 标签 | `match.label`（如 "Game 1"） |
| 双方队名 / 比分 | `team_a` / `team_b` |
| MVP 姓名 | `match.mvp` → 查 `players.json` |
| 比赛状态 | UI **写死** `FINAL`（非 JSON 字段） |
| Game Leaders | 运行时按本场得分排序 Top 5 |

---

### 数据来源

`fetch(BASE_URL + 'data/matches.json')` 与 `players.json`（并行加载）

---

### 排序规则

**【未发现】** 列表按 JSON 数组顺序展示，无 `sort`。

---

### 代码位置

`src/views/MatchesView.vue`

---

## F-4.2 比赛详情

### 进入方式

点击 **Box Score** 按钮展开（非独立路由页）。

---

### 展示字段

**卡片头部：** `label`、`date`、状态 FINAL

**比分区：** `team_a.name/score`、`team_b.name/score`；胜方 CSS class `winner`（比较 `score`）

**Game Leaders（每场最多 5 人）：** 号码、姓名（链至 `/player/:id`）、PTS/REB/AST

**球队基本统计（仅 team_a 球员汇总 + team_a 总分）：**
PTS（用 `team_a.score`）、REB、AST、STL、BLK、TOV、FG%、3P%

**高阶统计（仅 team_a）：** ORtg、DRtg、Net、eFG%、TOV%、OREB%

**Box Score 表（两队各一张表）：**
球员名、MIN、PTS、REB、AST、BLK、STL、TOV、FGM、FGA、FG%、3PM、3PA、3P%

---

### 高阶数据（公式均来自代码）

| 指标 | 计算（team_a 本场球员合计） |
| --- | --- |
| 估算回合 `poss` | `max(FGA - OREB + TOV, 1)` |
| ORtg | `team_a.score / poss * 100`，保留 1 位小数 |
| DRtg | `team_b.score / poss * 100` |
| Net | `ORtg - DRtg` |
| eFG% | `(FGM + 0.5 * FG3M) / FGA * 100` |
| TOV% | `TOV / poss * 100` |
| OREB% | `OREB / (FGA - FGM) * 100`（miss=0 时为 0） |

说明文案：`t('adv_note')`（未计罚球）

---

### 数据计算方式

* 球员单场：`players[].games` 中 `match_id` 匹配
* FG%：`fgm/fga*100`，整数百分比；无出手为 `-`
* 3P%：`fg3m/fg3a*100`
* MIN：`gs(pid, mid, 'min')` — JSON **无 `min` 字段** 时显示 `-`

---

### 代码位置

`src/views/MatchesView.vue`（`teamBasicStats`、`advStats`、`gs`、`fgp`、`fg3`、`topScorers`）

---

## F-4.3 MVP

### 展示位置

比赛列表卡片底部（有 `mvp` 时显示 ★ MVP + 姓名）

---

### MVP 计算逻辑

**非运行时计算。** MVP 为 `matches.json` 每条记录的 **`mvp` 字段**（球员 `id` 字符串），由数据维护者录入。

示例：`"mvp": "harada"`（`public/data/matches.json`）

**【未发现】** 按得分/效率自动评选 MVP 的代码。

---

# 5. 球员模块（M-PLAYER）

## 模块概述

球员列表按 **场均得分 PPG** 降序；点击进入详情页，含场均、单场、资料三 Tab。

文件：`src/views/PlayersView.vue`、`src/views/PlayerView.vue`

---

## F-5.1 球员列表

### 页面位置

球员 Tab → `/players`

---

### 展示字段

姓名、号码（大号球衣样式）、位置、身高、体重、出场次数（`games.length`）、场均 PTS/REB/AST

**【未发现】** 列表使用 `avatar` 字段（JSON 有 `avatar` 但 UI 未展示头像）。

---

### 数据来源

`public/data/players.json`

---

### 计算逻辑

```javascript
avg(player, key) = sum(games[].key) / games.length  // 保留 1 位小数
```

排序：加载后按 PPG 降序（`PlayersView.vue` onMounted）。

---

### 代码位置

`src/views/PlayersView.vue`

---

## F-5.2 球员详情

**存在。** 路由 `/player/:id`

### Tab：总体平均

* 基础场均：PTS、REB、AST、STL、BLK、TOV、OREB、DREB（`reb - oreb` 场均）
* 投篮场均率：FG%、2P%（`fg2m/fg2a`）、3P%、eFG%
* 场均 FGM/FGA/3PM/3PA
* 进阶：eFG%、AST/TOV、3P Rate、Pts/FGA、OREB%、Def（场均 STL+BLK）
* 生涯合计表：GP、PTS、REB…

### Tab：比赛数据

按 `games` **倒序** 列表；每场 FG%、3P%、eFG% 当场计算。

### Tab：资料

姓名、号码、位置、场次、身高、体重、臂展、站立摸高、加入时间、母校、偶像；可选 mold、contract、honors。

### 代码位置

`src/views/PlayerView.vue`

---

# 6. 排行模块（M-RANK）

## 模块概述

从 `players.json` 聚合指标，分组切换 + 指标 pill + 排序列表（可点击进详情）。

文件：`src/views/RankingsView.vue`

---

## F-6.1 一级分类

| key | 文案 key |
| --- | --- |
| `avg` | `rnk_grp_avg` 场均 |
| `pct` | `rnk_grp_pct` 命中率 |
| `total` | `rnk_grp_total` 总计 |

---

## F-6.2 二级分类

**场均 `avg`：** ppg, rpg, apg, spg, bpg, topg（失误 **升序** 为优）

**命中率 `pct`：** fgpct, fg3pct, efgpct

**总计 `total`：** pts, reb, ast

定义：`src/views/RankingsView.vue` 中 `statsByGroup`

---

## F-6.3 排名逻辑

1. `computeStats(p)`：无 `games` 或长度为 0 → 不参与
2. 取当前指标 `val`，按 `asc` 升序或降序排序
3. 条形图宽度：`barWidth`（领先者约 100%，其余按比例；`topg` 用反向比例）

---

## F-6.4 数据计算逻辑

```text
n = games.length
sum(k) = Σ games[].k
场均: sum(k)/n  (ppg, rpg, apg, spg, bpg, topg)
fgpct:  sum(fgm)/sum(fga)     (fga>0)
fg3pct: sum(fg3m)/sum(fg3a)   (fg3a>0)
efgpct: (sum(fgm)+0.5*sum(fg3m))/sum(fga)  (fga>0)
总计: sum(pts|reb|ast)
```

展示：`pct` → `*100` 一位小数 + `%`；`int` 整数；`dec` 一位小数。

---

## F-6.5 代码位置

`src/views/RankingsView.vue`

---

# 7. 数据模型（D-DATA）

> 结构由 `public/data/*.json` 与读取代码推断；无独立 TypeScript 类型定义。

## D-7.1 Match

```json
{
  "id": "string",
  "date": "YYYY-MM-DD",
  "label": "string",
  "team_a": {
    "name": "string",
    "score": "number",
    "players": ["playerId", "..."]
  },
  "team_b": {
    "name": "string",
    "score": "number",
    "players": ["playerId", "..."]
  },
  "result": "team_a | team_b",
  "mvp": "playerId"
}
```

**【未发现】** 代码读取 `result` 字段（胜方仅由 `score` 比较）。

---

## D-7.2 Player

```json
{
  "id": "string",
  "name": "string",
  "nickname": "string",
  "number": "number",
  "position": "string",
  "height": "string",
  "weight": "string",
  "joined": "string",
  "avatar": "string",
  "wingspan": "string",
  "standing_reach": "string",
  "school": "string",
  "contract": "string",
  "idol": "string",
  "mold": "string",
  "tags": ["string"],
  "honors": ["string"],
  "games": [ { /* PlayerGameStat */ } ]
}
```

---

## D-7.3 Team

无独立实体；嵌入 `Match.team_a` / `team_b`。

```json
{
  "name": "string",
  "score": "number",
  "players": ["playerId"]
}
```

---

## D-7.4 Ranking

无持久化模型；运行时对象（`RankingsView.vue` `computeStats` 返回值）：

```json
{
  "id": "string",
  "name": "string",
  "number": "number",
  "position": "string",
  "n": "number",
  "ppg": "number",
  "rpg": "number",
  "apg": "number",
  "spg": "number",
  "bpg": "number",
  "topg": "number",
  "fgpct": "number",
  "fg3pct": "number",
  "efgpct": "number",
  "pts": "number",
  "reb": "number",
  "ast": "number",
  "val": "number"
}
```

`val` 为当前选中排行榜指标值。

---

## D-7.5 PlayerGameStat（实际代码使用的单场字段）

```json
{
  "match_id": "string",
  "pts": "number",
  "reb": "number",
  "ast": "number",
  "stl": "number",
  "blk": "number",
  "tov": "number",
  "fgm": "number",
  "fga": "number",
  "fg2m": "number",
  "fg2a": "number",
  "fg3m": "number",
  "fg3a": "number",
  "oreb": "number"
}
```

可选 **`min`**：UI 支持读取，当前 JSON **未提供**。

**【未发现】** `dreb` 字段；DREB 由 `reb - oreb` 推导。

---

# 8. 数据来源

## D-8.1 数据存储方式

本地静态 JSON（构建时复制到 `dist/data/`，由 `public/` 提供）。

---

## D-8.2 数据文件位置

| 文件 | 路径 |
| --- | --- |
| 比赛 | `public/data/matches.json` |
| 球员 | `public/data/players.json` |

---

## D-8.3 数据更新流程

1. 编辑上述 JSON（比赛比分、阵容 `players` 列表、`mvp`、球员单场 `games` 条目等）
2. 本地 `npm run dev` 验证
3. 提交并 push `main` 触发部署（若启用 `deploy.yml`）

**【未发现】** 管理后台、表单、Excel 导入脚本（`xlsx` 在 `package.json` devDependencies 但 **src 未引用**）。

---

## D-8.4 数据计算流程

| 类型 | 预计算（JSON） | 运行时计算 |
| --- | --- | --- |
| 比赛比分、MVP、阵容 | ✓ | — |
| 球员单场 stat | ✓ | FG%/3P%/eFG% 等 |
| 场均、总计、排行榜 | — | ✓ 各 View |
| 比赛 ORtg/DRtg 等 | — | ✓ MatchesView |
| Game Leaders | — | ✓ 按 pts 排序 |

---

# 9. 部署与运维（O-OPS）

## O-9.1 Git 仓库

仓库名（package）：`basketball`

远程 URL：**【需人工确认】**

---

## O-9.2 Branch 结构

工作流均监听 **`main`** push。其他分支策略：**【需人工确认】**

---

## O-9.3 Build 命令

```bash
npm ci
npm run build   # → vite build，输出 dist/
```

---

## O-9.4 Deploy 命令

无本地 deploy 脚本；由 GitHub Actions：

* **推荐：** `.github/workflows/deploy.yml`（build + `deploy-pages`）
* **慎用：** `static.yml` / `static1.yml`（直接上传 `.`，无 Vite 构建）

---

## O-9.5 GitHub Pages 配置

* `vite.config.js`：`base: '/basketball/'`（须与仓库名一致）
* Hash 路由：无需服务器 rewrite
* Pages 权限：`contents: read`, `pages: write`, `id-token: write`（见 deploy.yml）

---

# 10. 已知问题（BUG）

## BUG-001

**Box Score MIN 列恒为 `-`**：UI 读取 `min` 字段，但 `players.json` 的 `games` 无该字段。

位置：`src/views/MatchesView.vue` `gs(..., 'min')`

---

## BUG-002

**team_b 无球员数据时 Box Score / 高阶统计不完整**：当前样本 `team_b.players` 为空；球队高阶仅汇总 `team_a`；客队表无行。

位置：`public/data/matches.json`、`MatchesView.vue`

---

## BUG-003

**重复且冲突的 Pages 工作流**：`deploy.yml`（构建 dist）与 `static.yml`/`static1.yml`（上传全仓库）同名逻辑重复，可能导致错误部署。

位置：`.github/workflows/`

---

## BUG-004

**favicon 缺失**：`index.html` 引用 `/vite.svg`，仓库中 **【未发现】** 该文件。

---

## BUG-005

**比赛状态写死 FINAL**：无法表达未开始/进行中。

位置：`MatchesView.vue` 模板

---

# 11. 技术债务（Technical Debt）

## TD-001

无全局状态/数据层：每个页面重复 `fetch(players.json)`，无缓存与错误处理。

---

## TD-002

`xlsx` 依赖未使用；若曾为录入工具预留，缺少文档与脚本。

---

## TD-003

国际化未持久化；翻译全部硬编码在单文件，扩展语言成本高。

---

## TD-004

无类型定义与 JSON Schema，数据与 UI 字段易漂移（如 `avatar`、`result` 未使用）。

---

## TD-005

`README.md` 仍为 Vite 模板，未描述 HOOP STATS 与数据维护方式。

---

# 12. Cursor分析任务

（原版清单已完成于本文档。）

---

# Cursor分析总结

## 当前项目规模评估

| 维度 | 评估 |
| --- | --- |
| 代码规模 | 小型：约 9 个前端源文件 + 1145 行 CSS；Vue 逻辑合计约 850 行 |
| 数据规模 | 2 场比赛、6 名球员（当前 JSON） |
| 依赖 | 生产依赖仅 `vue`、`vue-router` |
| 功能模块 | 4 个路由页面 + 顶栏 |

## 技术债务评估

* **中低**：体量和依赖小，易读；但数据/展示/部署三处存在「约定优于配置」的隐式风险（MVP 手填、team_b 空阵容、多工作流）。
* **测试**：【未发现】单元/E2E 测试。
* **可访问性/SEO**：SPA + Hash，SEO 有限；属预期内。

## 可维护性评估

* **优点**：无构建期魔法、计算逻辑集中在 View 内函数，便于对照篮球公式；i18n key 清晰。
* **缺点**：统计公式在 `MatchesView` 与 `PlayerView`/`RankingsView` 重复；改公式需多处同步；无数据校验。

## 后续推荐改进方向（仅建议，不涉及本次实现）

1. 统一数据服务层（单次 fetch + 缓存）并抽取 `statsUtils.js` 共享公式。
2. 为 JSON 增加 JSON Schema 或 Zod 校验；可选 CLI 用 `xlsx` 导入再生成 JSON。
3. 清理重复 GitHub Actions，仅保留 `deploy.yml`；在 README 写明 Pages URL 与录入流程。
4. MVP 要么文档标明「手填」，要么实现可选自动规则（需产品确认）。
5. 补全 `team_b.players` 或隐藏空表；比赛状态从数据驱动。
6. 语言 preference 存 `localStorage`；考虑 `vue-i18n` 若语言继续增加。
