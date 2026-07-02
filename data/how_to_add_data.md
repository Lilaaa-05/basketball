# 如何手动添加数据

本文档用于回忆 `data/source` 目录下各个 CSV 的字段含义、可填值，以及它们之间的关联关系。修改 CSV 后，运行 `npm run build` 会触发数据校验并生成 `public/data/generated/dataset.json`。

## 总体规则

- CSV 表头顺序必须保持不变，生成脚本会严格校验表头。
- ID 字段建议只使用小写英文、数字、短横线或下划线，避免空格和中文。
- 空值可以直接留空，但布尔值必须写成 `true` 或 `false`。
- 数字字段可以留空；填写时必须是数字。
- `teams.csv`、`players.csv`、`events.csv` 里的主 ID 不能重复。
- `game_stats.csv` 中同一个 `event_id + player_id` 只能出现一次。
- 多值字段目前只有 `players.csv` 的 `tags` 和 `honors`，用半角竖线 `|` 分隔，例如 `射手|防守尖兵`。

## 文件关系速览

- `teams.csv` 定义球队或临时分组，其他文件通过 `team_id` 引用它。
- `players.csv` 定义球员，`primary_team_id` 引用 `teams.csv` 的 `team_id`。
- `events.csv` 定义一场比赛、训练赛或活动，`team_a_id`、`team_b_id` 引用球队，`mvp_player_id` 引用球员。
- `game_stats.csv` 记录某场活动中每个球员的数据，`event_id` 引用 `events.csv`，`player_id` 引用 `players.csv`，`team_id` 引用 `teams.csv`。
- 对于 `side_mode=two_sides` 的活动，`game_stats.csv` 中 `side=a` 必须对应该活动的 `team_a_id`，`side=b` 必须对应 `team_b_id`。

## `data/source/teams.csv`

球队、对手、内部临时分组的基础表。

| 字段 | 含义 | 填写规则 / 作用 |
| --- | --- | --- |
| `team_id` | 球队唯一 ID | 必填，不能重复。会被 `players.primary_team_id`、`events.team_a_id/team_b_id`、`game_stats.team_id` 引用。 |
| `team_type` | 球队类型 | 可填 `main_club`、`opponent`、`internal_group`。`main_club` 是主队，`opponent` 是外部对手，`internal_group` 是队内分组。 |
| `team_name_zh` | 中文队名 | 页面展示中文队名时使用。 |
| `team_name_ja` | 日文队名 | 页面需要日文队名时使用。 |
| `is_primary` | 是否主队 | 必须是 `true` 或 `false`。通常只有雪谷火箭本队为 `true`。多个 `true` 会产生警告。 |
| `notes` | 备注 | 给自己看的说明，不参与核心统计。 |

## `data/source/players.csv`

球员资料表。公开展示的球员卡、球员详情页、排名页等主要来自这里。

| 字段 | 含义 | 填写规则 / 作用 |
| --- | --- | --- |
| `player_id` | 球员唯一 ID | 必填，不能重复。会被 `events.mvp_player_id` 和 `game_stats.player_id` 引用。 |
| `display_name` | 展示名 | 页面上显示的正式名字。 |
| `nickname` | 昵称 / 简称 | 比赛卡片、阵容等位置可能使用。 |
| `number` | 球衣号码 | 数字字段，可留空。 |
| `position` | 场上位置 | 目前常见值如 `G`、`F`，主要用于展示。 |
| `primary_team_id` | 主要所属球队 | 可留空；填写时必须存在于 `teams.csv`。`keepb` 球员会被视为本队成员。 |
| `player_status` | 球员状态 | 可填 `regular`、`guest`、`inactive`。公开本队列表会排除 `inactive`。 |
| `is_public` | 是否公开展示 | 必须是 `true` 或 `false`。公开本队球员页只展示 `primary_team_id=keepb`、`is_public=true`、且非 `inactive` 的球员。 |
| `avatar` | 头像路径 | 相对于 `public` 目录，例如 `pic/Feng.jpeg`。留空则页面使用默认样式。 |
| `height` | 身高 | 文本字段，例如 `180cm`。 |
| `weight` | 体重 | 文本字段，例如 `80kg`。 |
| `joined` | 加入时间 | 文本字段，当前数据常用 `YYYY-MM`，例如 `2026-01`。 |
| `wingspan` | 臂展 | 文本字段，例如 `180cm`。 |
| `standing_reach` | 站立摸高 | 文本字段，例如 `220cm`。 |
| `school` | 学校 / 背景 | 球员详情页资料展示。 |
| `contract` | 合同 / 梗资料 | 球员详情页资料展示。 |
| `idol` | 偶像 | 球员详情页资料展示。 |
| `mold` | 模版 | 球员详情页资料展示。 |
| `tags` | 标签 | 多个标签用 `|` 分隔，会展示在球员详情页顶部。 |
| `honors` | 荣誉 | 多条荣誉用 `|` 分隔，会展示在球员详情页荣誉区。 |
| `notes` | 备注 | 给自己看的说明，不参与核心统计。 |

## `data/source/events.csv`

比赛、训练赛、内部赛等活动的基础信息。列表页按这里决定展示哪场活动、标题、比分、胜负、MVP 和视频链接。

| 字段 | 含义 | 填写规则 / 作用 |
| --- | --- | --- |
| `event_id` | 活动唯一 ID | 必填，不能重复。会被 `game_stats.event_id` 引用。 |
| `event_date` | 活动日期 | 必填，格式必须是 `YYYY-MM-DD`。列表页按日期倒序排序。 |
| `event_type` | 活动类型 | 可填 `official_match`、`internal_fullcourt_match`、`fun_fullcourt_match`、`halfcourt_game`、`one_v_one`。正式比赛数据会进入球员页、排名页和球队页统计。非正式比赛显示在训练/娱乐比赛页面。 |
| `side_mode` | 分队模式 | 可填 `two_sides`、`multi_sides`、`individual`。当前已有比赛主要使用 `two_sides`。`official_match` 必须使用 `two_sides`。 |
| `title` | 活动标题 | 页面列表和比赛卡片显示的标题。 |
| `display_group` | 展示分组 | 可填 `latest`、`old`、`hidden`。`latest` 显示在最新区域，`old` 显示在历史区域，`hidden` 不显示。 |
| `team_a_id` | A 方球队 ID | `two_sides` 时必填，必须存在于 `teams.csv`。 |
| `team_a_score` | A 方比分 | `two_sides` 时必填，数字字段。生成脚本会警告它是否等于 `game_stats` 中 A 方球员 `pts` 总和。 |
| `team_b_id` | B 方球队 ID | `two_sides` 时必填，必须存在于 `teams.csv`。 |
| `team_b_score` | B 方比分 | `two_sides` 时必填，数字字段。生成脚本会警告它是否等于 `game_stats` 中 B 方球员 `pts` 总和。 |
| `win_side` | 胜方 | 可填 `a`、`b`、`draw` 或留空。页面会用它判断胜负展示。 |
| `mvp_player_id` | MVP 球员 ID | 可留空；填写时必须存在于 `players.csv`。 |
| `video_url` | 视频链接 | 页面上跳转到比赛视频。 |
| `notes` | 备注 | 给自己看的说明，不参与核心统计。 |

## `data/source/game_stats.csv`

逐场逐球员技术统计。每一行代表一个球员在一场活动里的数据。

| 字段 | 含义 | 填写规则 / 作用 |
| --- | --- | --- |
| `event_id` | 活动 ID | 必填，必须存在于 `events.csv`。 |
| `player_id` | 球员 ID | 必填，必须存在于 `players.csv`。 |
| `side` | 所属阵营 | 可填 `a`、`b` 或留空。`two_sides` 活动必填；`a` 对应 `events.team_a_id`，`b` 对应 `events.team_b_id`。 |
| `team_id` | 本场所属球队 | `two_sides` 活动必填，必须存在于 `teams.csv`，并且要和 `side` 对应的队伍一致。 |
| `fg2m` | 两分命中数 | 数字字段。 |
| `fg2a` | 两分出手数 | 数字字段，必须大于等于 `fg2m`。 |
| `fg3m` | 三分命中数 | 数字字段。 |
| `fg3a` | 三分出手数 | 数字字段，必须大于等于 `fg3m`。 |
| `fgm` | 总投篮命中数 | 数字字段，必须等于 `fg2m + fg3m`。 |
| `fga` | 总投篮出手数 | 数字字段，必须等于 `fg2a + fg3a`。 |
| `pts` | 得分 | 数字字段。当前没有罚球字段，所以如果有罚球得分，需要手动体现在 `pts` 中；同时注意和球队总分核对。 |
| `oreb` | 进攻篮板 | 数字字段。用于进攻篮板率、回合数估算等高级统计。 |
| `reb` | 总篮板 | 数字字段。防守篮板会按 `reb - oreb` 计算。 |
| `ast` | 助攻 | 数字字段。 |
| `stl` | 抢断 | 数字字段。 |
| `tov` | 失误 | 数字字段。用于影响值、回合数等统计。 |
| `blk` | 盖帽 | 数字字段。 |
| `min` | 上场时间 | 数字字段，可留空。当前数据多为空；若填写，可用于每 48 分钟换算。 |
| `win_games_count` | 小局胜场数 | 数字字段，可留空。适合记录训练、小局、半场赛等额外胜负统计；当前页面核心统计暂未大量使用。 |
| `lose_games_count` | 小局负场数 | 数字字段，可留空。作用同上。 |
| `notes` | 备注 | 给自己看的说明，不参与核心统计。 |

## 添加一场 `two_sides` 比赛的建议流程

1. 如果出现新球队或新分组，先在 `teams.csv` 新增 `team_id`。
2. 如果出现新球员，先在 `players.csv` 新增 `player_id`，并按需要设置 `primary_team_id`、`player_status`、`is_public`。
3. 在 `events.csv` 新增一行活动，填好 `event_id`、日期、类型、双方球队、比分、胜方、MVP、视频链接。
4. 在 `game_stats.csv` 为每个出场球员新增一行，确保 `event_id` 相同，`side` 和 `team_id` 对得上。
5. 核对每个球员：`fgm = fg2m + fg3m`，`fga = fg2a + fg3a`，命中数不能大于出手数。
6. 核对每队：同一 `event_id` 下 A 方 `pts` 总和应等于 `team_a_score`，B 方 `pts` 总和应等于 `team_b_score`。
7. 运行 `npm run build`，如果有错误或警告，根据终端提示修正 CSV。

## 展示与统计口径提醒

- `official_match` 会进入正式比赛统计，包括球员列表、排名、球员详情和球队页。
- 非 `official_match` 会进入训练/娱乐比赛页面，不计入正式排名。
- `display_group=hidden` 的活动不会出现在比赛/训练列表中，但数据仍会被生成到数据集中。
- `primary_team_id=keepb`、`is_public=true`、`player_status` 不是 `inactive` 的球员，会出现在公开本队球员相关页面。
- 页面中的三分命中率使用 `fg3m / fg3a`，两分命中率使用 `fg2m / fg2a`，有效命中率使用 `(fgm + 0.5 * fg3m) / fga`。
- 进攻篮板率等高级统计依赖 `oreb` 和全队投丢数，因此 `oreb`、`fgm`、`fga` 填错会影响后续分析。
