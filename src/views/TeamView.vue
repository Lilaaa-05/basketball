<template>
  <div class="page">
    <div v-if="loading" class="loading">{{ t('loading') }}</div>

    <template v-else>
      <!-- Team Hero -->
      <div class="team-hero">
        <div class="th-top">
          <div class="th-left">
            <div class="th-subtitle">{{ t('team_subtitle') }}</div>
            <div class="th-name">{{ t('team_name') }} 🚀</div>
            <div class="th-record-row">
              <span class="th-record-wins">{{ wins }}{{ t('team_wins') }}</span>
              <span class="th-record-sep">-</span>
              <span class="th-record-losses">{{ losses }}{{ t('team_losses') }}</span>
              <span class="th-season-label">· 2026 {{ t('team_season') }}</span>
            </div>
          </div>
          <div class="th-right">
            <div class="th-winpct-wrap">
              <div class="th-winpct-num">{{ winPct }}%</div>
              <div class="th-winpct-label">{{ t('team_win_pct') }}</div>
            </div>
          </div>
        </div>
        <div class="th-stats-bar">
          <div class="ths">
            <div class="ths-num">{{ teamAvg('pts') }}</div>
            <div class="ths-meta">
              <div class="ths-abbr">PPG</div>
              <div class="ths-label">{{ t('team_ppg') }}</div>
            </div>
          </div>
          <div class="ths ths-opp">
            <div class="ths-num">{{ oppAvgPts }}</div>
            <div class="ths-meta">
              <div class="ths-abbr">OPP</div>
              <div class="ths-label">{{ t('team_opp_ppg') }}</div>
            </div>
          </div>
          <div class="ths">
            <div class="ths-num">{{ teamAvg('reb') }}</div>
            <div class="ths-meta">
              <div class="ths-abbr">RPG</div>
              <div class="ths-label">{{ t('team_rpg') }}</div>
            </div>
          </div>
          <div class="ths">
            <div class="ths-num">{{ teamAvg('ast') }}</div>
            <div class="ths-meta">
              <div class="ths-abbr">APG</div>
              <div class="ths-label">{{ t('team_apg') }}</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Tabs -->
      <div class="tabs">
        <button class="tab" :class="{ active: tab === 'avg' }"   @click="tab = 'avg'">{{ t('tab_avg') }}</button>
        <button class="tab" :class="{ active: tab === 'games' }" @click="tab = 'games'">{{ t('tab_games') }}</button>
        <button class="tab tab--ai" :class="{ active: tab === 'ai' }" @click="tab = 'ai'">🤖 {{ t('tab_ai') }}</button>
      </div>

      <!-- 综合平均 Tab -->
      <div v-if="tab === 'avg'">
        <!-- 基础数据 -->
        <div class="stats-section-label">{{ t('basic_data') }}</div>
        <div class="avg-grid">
          <div class="avg-item">
            <div class="ag-abbr">PTS</div>
            <div class="ag-num">{{ teamAvg('pts') }}</div>
            <div class="ag-desc">{{ t('d_pts') }}</div>
          </div>
          <div class="avg-item">
            <div class="ag-abbr">REB</div>
            <div class="ag-num">{{ teamAvg('reb') }}</div>
            <div class="ag-desc">{{ t('d_reb') }}</div>
          </div>
          <div class="avg-item">
            <div class="ag-abbr">AST</div>
            <div class="ag-num">{{ teamAvg('ast') }}</div>
            <div class="ag-desc">{{ t('d_ast') }}</div>
          </div>
          <div class="avg-item">
            <div class="ag-abbr">STL</div>
            <div class="ag-num">{{ teamAvg('stl') }}</div>
            <div class="ag-desc">{{ t('d_stl') }}</div>
          </div>
          <div class="avg-item">
            <div class="ag-abbr">BLK</div>
            <div class="ag-num">{{ teamAvg('blk') }}</div>
            <div class="ag-desc">{{ t('d_blk') }}</div>
          </div>
          <div class="avg-item">
            <div class="ag-abbr">TOV</div>
            <div class="ag-num">{{ teamAvg('tov') }}</div>
            <div class="ag-desc">{{ t('d_tov') }}</div>
          </div>
          <div class="avg-item">
            <div class="ag-abbr">OREB</div>
            <div class="ag-num">{{ teamAvg('oreb') }}</div>
            <div class="ag-desc">{{ t('d_oreb') }}</div>
          </div>
          <div class="avg-item">
            <div class="ag-abbr">DREB</div>
            <div class="ag-num">{{ teamAvgDreb }}</div>
            <div class="ag-desc">{{ t('d_dreb') }}</div>
          </div>
          <div class="avg-item avg-item--opp">
            <div class="ag-abbr">OPP PTS</div>
            <div class="ag-num ag-num--opp">{{ oppAvgPts }}</div>
            <div class="ag-desc">{{ t('team_opp_ppg') }}</div>
          </div>
          <div class="avg-item avg-item--diff" :class="avgDiff >= 0 ? 'avg-item--pos' : 'avg-item--neg'">
            <div class="ag-abbr">DIFF</div>
            <div class="ag-num" :class="avgDiff >= 0 ? 'ag-num--pos' : 'ag-num--neg'">{{ avgDiff >= 0 ? '+' : '' }}{{ avgDiff }}</div>
            <div class="ag-desc">{{ t('team_point_diff') }}</div>
          </div>
        </div>

        <!-- 高阶数据：投篮 -->
        <div class="stats-section-label" style="margin-top:24px">{{ t('adv_shooting') }}</div>
        <div class="avg-grid">
          <div class="avg-item">
            <div class="ag-abbr">FG%</div>
            <div class="ag-num">{{ teamFgPct }}</div>
            <div class="ag-desc">{{ t('d_fgpct') }}</div>
          </div>
          <div class="avg-item">
            <div class="ag-abbr">3P%</div>
            <div class="ag-num">{{ teamFg3Pct }}</div>
            <div class="ag-desc">{{ t('d_fg3pct') }}</div>
          </div>
          <div class="avg-item">
            <div class="ag-abbr">eFG%</div>
            <div class="ag-num">{{ teamEfgPct }}</div>
            <div class="ag-desc">{{ t('d_efgpct') }}</div>
          </div>
          <div class="avg-item">
            <div class="ag-abbr">FGM</div>
            <div class="ag-num">{{ teamAvg('fgm') }}</div>
            <div class="ag-desc">{{ t('d_fgm') }}</div>
          </div>
          <div class="avg-item">
            <div class="ag-abbr">FGA</div>
            <div class="ag-num">{{ teamAvg('fga') }}</div>
            <div class="ag-desc">{{ t('d_fga') }}</div>
          </div>
          <div class="avg-item">
            <div class="ag-abbr">3PM</div>
            <div class="ag-num">{{ teamAvg('fg3m') }}</div>
            <div class="ag-desc">{{ t('d_3pm') }}</div>
          </div>
          <div class="avg-item">
            <div class="ag-abbr">3PA</div>
            <div class="ag-num">{{ teamAvg('fg3a') }}</div>
            <div class="ag-desc">{{ t('d_3pa') }}</div>
          </div>
        </div>

        <!-- 进阶数据 -->
        <div class="gc-adv" style="margin-top:24px">
          <div class="gc-adv-header">
            <span class="gc-adv-title">{{ t('adv_section') }}</span>
          </div>
          <div class="gc-adv-note">{{ t('team_adv_note') }}</div>
          <div class="gc-adv-row" style="grid-template-columns:repeat(3,1fr)">
            <div v-for="s in teamAdvStats" :key="s.abbr" class="gc-adv-stat">
              <div class="gc-adv-abbr" :title="s.tip">{{ s.abbr }} <span class="gc-adv-q">ⓘ</span></div>
              <div class="gc-adv-val" :class="s.colorClass">{{ s.val }}</div>
              <div class="gc-adv-desc">{{ s.label }}</div>
            </div>
          </div>
        </div>
      </div>

      <!-- 比赛记录 Tab -->
      <div v-if="tab === 'games'">
        <div class="table-wrap">
          <table class="g-table">
            <thead>
              <tr>
                <th>{{ t('g_th_match') }}</th>
                <th>{{ t('team_th_result') }}</th>
                <th>{{ t('team_th_score') }}</th>
                <th>PTS</th><th>REB</th><th>OREB</th><th>AST</th>
                <th>STL</th><th>BLK</th><th>TOV</th>
                <th>FGM</th><th>FGA</th><th>FG%</th>
                <th>3PM</th><th>3PA</th><th>3P%</th><th>eFG%</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="row in gameLog" :key="row.matchId">
                <td>{{ row.label }}</td>
                <td>
                  <span class="result-badge" :class="row.win ? 'result-w' : 'result-l'">
                    {{ row.win ? t('team_w') : t('team_l') }}
                  </span>
                </td>
                <td class="score-cell">
                  <span :class="row.win ? 'score-win' : 'score-loss'">{{ row.teamScore }}</span>
                  <span class="score-sep">-</span>
                  <span :class="!row.win ? 'score-win' : 'score-loss'">{{ row.oppScore }}</span>
                </td>
                <td class="g-pts">{{ row.pts }}</td>
                <td>{{ row.reb }}</td>
                <td>{{ row.oreb }}</td>
                <td>{{ row.ast }}</td>
                <td>{{ row.stl }}</td>
                <td>{{ row.blk }}</td>
                <td>{{ row.tov }}</td>
                <td>{{ row.fgm }}</td>
                <td>{{ row.fga }}</td>
                <td>{{ row.fga ? (row.fgm / row.fga * 100).toFixed(0) + '%' : '-' }}</td>
                <td>{{ row.fg3m }}</td>
                <td>{{ row.fg3a }}</td>
                <td>{{ row.fg3a ? (row.fg3m / row.fg3a * 100).toFixed(0) + '%' : '-' }}</td>
                <td>{{ row.fga ? ((row.fgm + 0.5 * row.fg3m) / row.fga * 100).toFixed(0) + '%' : '-' }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- AI教练指导 Tab -->
      <div v-if="tab === 'ai'" class="ai-coach">
        <div v-if="aiCoachAnalysis">
          <!-- Report Header -->
          <div class="ai-report-header">
            <div class="ai-report-icon">🤖</div>
            <div class="ai-report-info">
              <div class="ai-report-title">AI 教练指导报告</div>
              <div class="ai-report-sub">基于 {{ matches.length }} 场比赛数据 · {{ aiCoachAnalysis.record }}</div>
            </div>
            <div class="ai-grade-badge">
              <div class="ai-grade-val" :style="{ color: aiCoachAnalysis.gradeColor }">{{ aiCoachAnalysis.grade }}</div>
              <div class="ai-grade-label">综合评级</div>
            </div>
          </div>

          <!-- Summary -->
          <div class="ai-summary-box">
            <div class="ai-summary-label">📊 赛季总结</div>
            <div class="ai-summary-text">{{ aiCoachAnalysis.summary }}</div>
            <div class="ai-summary-stats">
              <div class="ai-sum-stat">
                <div class="ai-sum-num">{{ aiCoachAnalysis.wpct }}</div>
                <div class="ai-sum-lbl">胜率</div>
              </div>
              <div class="ai-sum-stat">
                <div class="ai-sum-num" :style="{ color: aiCoachAnalysis.diffColor }">{{ aiCoachAnalysis.diff }}</div>
                <div class="ai-sum-lbl">场均得失分差</div>
              </div>
              <div class="ai-sum-stat">
                <div class="ai-sum-num">{{ matches.length }}</div>
                <div class="ai-sum-lbl">场比赛</div>
              </div>
            </div>
          </div>

          <!-- Strengths & Weaknesses -->
          <div class="ai-sw-grid">
            <div class="ai-sw-col">
              <div class="ai-sw-header ai-sw-str">💪 球队优势</div>
              <div class="ai-sw-items">
                <div v-for="s in aiCoachAnalysis.strengths" :key="s.title" class="ai-sw-item">
                  <span class="ai-sw-ico">{{ s.icon }}</span>
                  <div>
                    <div class="ai-sw-title">{{ s.title }}</div>
                    <div class="ai-sw-desc">{{ s.desc }}</div>
                  </div>
                </div>
                <div v-if="!aiCoachAnalysis.strengths.length" class="ai-sw-empty">持续努力，优势正在积累！</div>
              </div>
            </div>
            <div class="ai-sw-col">
              <div class="ai-sw-header ai-sw-wk">⚠️ 待改进点</div>
              <div class="ai-sw-items">
                <div v-for="w in aiCoachAnalysis.weaknesses" :key="w.title" class="ai-sw-item">
                  <span class="ai-sw-ico">{{ w.icon }}</span>
                  <div>
                    <div class="ai-sw-title">{{ w.title }}</div>
                    <div class="ai-sw-desc">{{ w.desc }}</div>
                  </div>
                </div>
                <div v-if="!aiCoachAnalysis.weaknesses.length" class="ai-sw-empty">🎉 整体表现出色！</div>
              </div>
            </div>
          </div>

          <!-- Player Spotlights -->
          <div v-if="aiCoachAnalysis.playerSpotlights.length" class="ai-section">
            <div class="ai-section-title">🌟 球员聚焦分析</div>
            <div class="ai-players-grid">
              <div v-for="p in aiCoachAnalysis.playerSpotlights" :key="p.name" class="ai-player-card">
                <div class="ai-pc-top">
                  <span class="ai-pc-icon">{{ p.icon }}</span>
                  <div class="ai-pc-info">
                    <div class="ai-pc-name">{{ p.name }}</div>
                    <div class="ai-pc-role">{{ p.role }}</div>
                  </div>
                  <div class="ai-pc-stat">{{ p.stat }}</div>
                </div>
                <div class="ai-pc-insight">{{ p.insight }}</div>
              </div>
            </div>
          </div>

          <!-- Tactical Recommendations -->
          <div v-if="aiCoachAnalysis.recommendations.length" class="ai-section">
            <div class="ai-section-title">📋 战术建议</div>
            <div class="ai-recs">
              <div v-for="(r, i) in aiCoachAnalysis.recommendations" :key="r.title"
                   class="ai-rec" :class="'ai-rec--' + r.priority">
                <div class="ai-rec-num">{{ i + 1 }}</div>
                <div class="ai-rec-body">
                  <div class="ai-rec-title">{{ r.icon }} {{ r.title }}</div>
                  <div class="ai-rec-detail">{{ r.detail }}</div>
                </div>
                <div class="ai-rec-badge" :class="'ai-badge--' + r.priority">
                  {{ r.priority === 'high' ? '高优先' : r.priority === 'medium' ? '重要' : '建议' }}
                </div>
              </div>
            </div>
          </div>

          <!-- Footer -->
          <div class="ai-footer-note">
            📊 分析基于球队与球员统计数据 · 回合数估算：出手 − 进攻篮板 + 失误
          </div>
        </div>
        <div v-else class="ai-no-data">暂无足够数据生成分析报告</div>
      </div>
    </template>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { t } from '../i18n.js'

const loading = ref(true)
const matches = ref([])    // 雪谷火箭 matches (always team_a)
const allPlayers = ref([])
const tab = ref('avg')

onMounted(async () => {
  const [mr, pr] = await Promise.all([
    fetch(import.meta.env.BASE_URL + 'data/matches.json'),
    fetch(import.meta.env.BASE_URL + 'data/players.json'),
  ])
  const allMatches = await mr.json()
  allPlayers.value = await pr.json()

  // 雪谷火箭 is always team_a
  matches.value = allMatches.filter(m => m.team_a?.name === '雪谷火箭')
  loading.value = false
})

// For a given match, aggregate stats for all team_a players found in players.json
function getTeamGameStats(match) {
  const playerIds = match.team_a.players ?? []
  const stats = { pts: 0, reb: 0, ast: 0, stl: 0, blk: 0, tov: 0, oreb: 0, fgm: 0, fga: 0, fg3m: 0, fg3a: 0 }
  for (const pid of playerIds) {
    const player = allPlayers.value.find(p => p.id === pid)
    if (!player) continue
    const gameEntry = player.games?.find(g => g.match_id === match.id)
    if (!gameEntry) continue
    for (const key of Object.keys(stats)) {
      stats[key] += gameEntry[key] ?? 0
    }
  }
  return stats
}

// Per-game stats aggregated across all matches
const perGameStats = computed(() => {
  return matches.value.map(m => getTeamGameStats(m))
})

function teamAvg(key) {
  const n = matches.value.length
  if (!n) return '-'
  const total = perGameStats.value.reduce((a, g) => a + (g[key] ?? 0), 0)
  return (total / n).toFixed(1)
}

const teamAvgDreb = computed(() => {
  const n = matches.value.length
  if (!n) return '-'
  const total = perGameStats.value.reduce((a, g) => a + ((g.reb ?? 0) - (g.oreb ?? 0)), 0)
  return (total / n).toFixed(1)
})

function teamTotal(key) {
  return perGameStats.value.reduce((a, g) => a + (g[key] ?? 0), 0)
}

const wins = computed(() => matches.value.filter(m => m.result === 'team_a').length)
const losses = computed(() => matches.value.filter(m => m.result !== 'team_a').length)
const winPct = computed(() => {
  const n = matches.value.length
  if (!n) return '0.0'
  return ((wins.value / n) * 100).toFixed(1)
})

const oppAvgPts = computed(() => {
  const n = matches.value.length
  if (!n) return '-'
  const total = matches.value.reduce((a, m) => a + (m.team_b?.score ?? 0), 0)
  return (total / n).toFixed(1)
})

const avgDiff = computed(() => {
  const n = matches.value.length
  if (!n) return 0
  const teamPts = matches.value.reduce((a, m) => a + (m.team_a?.score ?? 0), 0)
  const oppPts  = matches.value.reduce((a, m) => a + (m.team_b?.score ?? 0), 0)
  return +((teamPts - oppPts) / n).toFixed(1)
})

const teamFgPct = computed(() => {
  const fgm = teamTotal('fgm'), fga = teamTotal('fga')
  return fga ? (fgm / fga * 100).toFixed(1) + '%' : '-'
})
const teamFg3Pct = computed(() => {
  const m = teamTotal('fg3m'), a = teamTotal('fg3a')
  return a ? (m / a * 100).toFixed(1) + '%' : '-'
})
const teamEfgPct = computed(() => {
  const fgm = teamTotal('fgm'), fg3m = teamTotal('fg3m'), fga = teamTotal('fga')
  return fga ? ((fgm + 0.5 * fg3m) / fga * 100).toFixed(1) + '%' : '-'
})

// Advanced stats (team level)
const teamAdvStats = computed(() => {
  const n = matches.value.length
  if (!n) return []

  // Possession estimate per game: FGA - OREB + TOV  (no FTA data)
  const paceArr = perGameStats.value.map(g => (g.fga ?? 0) - (g.oreb ?? 0) + (g.tov ?? 0))
  const avgPace = paceArr.reduce((a, v) => a + v, 0) / n

  // Official scores per game
  const teamPtsArr = matches.value.map(m => m.team_a?.score ?? 0)
  const oppPtsArr  = matches.value.map(m => m.team_b?.score ?? 0)
  const avgTeamPts = teamPtsArr.reduce((a, v) => a + v, 0) / n
  const avgOppPts  = oppPtsArr.reduce((a, v) => a + v, 0) / n

  const ort = avgPace ? (avgTeamPts / avgPace) * 100 : null
  const drt = avgPace ? (avgOppPts  / avgPace) * 100 : null
  const net = ort != null && drt != null ? ort - drt : null

  // TOV%
  const avgTov = perGameStats.value.reduce((a, g) => a + (g.tov ?? 0), 0) / n
  const tovPct = avgPace ? (avgTov / avgPace) * 100 : null

  // OREB% = OREB / (FGA - FGM)
  const avgOreb = perGameStats.value.reduce((a, g) => a + (g.oreb ?? 0), 0) / n
  const avgMisses = perGameStats.value.reduce((a, g) => a + ((g.fga ?? 0) - (g.fgm ?? 0)), 0) / n
  const orebPct = avgMisses ? (avgOreb / avgMisses) * 100 : null

  // eFG%
  const fgm  = teamTotal('fgm'), fg3m = teamTotal('fg3m'), fga = teamTotal('fga')
  const efg  = fga ? (fgm + 0.5 * fg3m) / fga * 100 : null

  const fmt1 = v => v == null ? '-' : v.toFixed(1)
  const fmtPct = v => v == null ? '-' : v.toFixed(1) + '%'

  return [
    { abbr: 'ORT',   val: fmt1(ort),      label: t('team_ort'),    tip: t('team_ort_tip'),    colorClass: '' },
    { abbr: 'DRT',   val: fmt1(drt),      label: t('team_drt'),    tip: t('team_drt_tip'),    colorClass: '' },
    { abbr: 'NET',   val: net == null ? '-' : (net >= 0 ? '+' : '') + net.toFixed(1),
                     label: t('team_net'), tip: t('team_net_tip'),  colorClass: net == null ? '' : net >= 0 ? 'val-pos' : 'val-neg' },
    { abbr: 'Pace',  val: fmt1(avgPace),  label: t('team_pace'),   tip: t('team_pace_tip'),   colorClass: '' },
    { abbr: 'TOV%',  val: fmtPct(tovPct), label: t('team_tovpct'), tip: t('team_tovpct_tip'), colorClass: '' },
    { abbr: 'OREB%', val: fmtPct(orebPct),label: t('team_orebpct'),tip: t('team_orebpct_tip'),colorClass: '' },
    { abbr: 'eFG%',  val: fmtPct(efg),    label: t('team_efgpct'), tip: t('team_efgpct_tip'), colorClass: '' },
  ]
})

// Per-game log
const gameLog = computed(() => {
  return [...matches.value].reverse().map((m, i) => {
    const origIdx = matches.value.length - 1 - i
    const gs = perGameStats.value[origIdx]
    return {
      matchId: m.id,
      label: m.label || m.id,
      win: m.result === 'team_a',
      teamScore: m.team_a?.score ?? 0,
      oppScore:  m.team_b?.score ?? 0,
      pts:  gs.pts,  reb: gs.reb,  oreb: gs.oreb,
      ast:  gs.ast,  stl: gs.stl,  blk:  gs.blk,
      tov:  gs.tov,  fgm: gs.fgm,  fga:  gs.fga,
      fg3m: gs.fg3m, fg3a: gs.fg3a,
    }
  })
})

// AI Coach Analysis
const aiCoachAnalysis = computed(() => {
  const n = matches.value.length
  if (!n) return null

  const numAvg = (key) => { const v = teamAvg(key); return v === '-' ? 0 : parseFloat(v) }

  const pts   = numAvg('pts')
  const opp   = parseFloat(oppAvgPts.value) || 0
  const ast   = numAvg('ast')
  const stl   = numAvg('stl')
  const blk   = numAvg('blk')
  const tov   = numAvg('tov')
  const oreb  = numAvg('oreb')
  const fgm   = numAvg('fgm')
  const fga   = numAvg('fga')
  const fg3m  = numAvg('fg3m')
  const fg3a  = numAvg('fg3a')

  const fgPct   = fga ? fgm / fga * 100 : 0
  const fg3Pct  = fg3a ? fg3m / fg3a * 100 : 0
  const fg3Rate = fga ? fg3a / fga * 100 : 0
  const astTov  = tov > 0 ? ast / tov : ast
  const diff    = pts - opp

  // Roster players with per-game averages
  const teamMatchIds = new Set(matches.value.map(m => m.id))
  const rosterPlayers = allPlayers.value
    .map(p => {
      const playerGames = (p.games || []).filter(g => teamMatchIds.has(g.match_id))
      const gp = playerGames.length
      if (!gp) return null
      const sum = key => playerGames.reduce((a, g) => a + (g[key] ?? 0), 0)
      const fgaTotal  = sum('fga')
      const fg3aTotal = sum('fg3a')
      return {
        id: p.id,
        name: p.name || p.id,
        gp,
        ppg:       sum('pts') / gp,
        rpg:       sum('reb') / gp,
        apg:       sum('ast') / gp,
        spg:       sum('stl') / gp,
        bpg:       sum('blk') / gp,
        topg:      sum('tov') / gp,
        fgPct:     fgaTotal  ? sum('fgm')  / fgaTotal  * 100 : 0,
        fg3Pct:    fg3aTotal ? sum('fg3m') / fg3aTotal * 100 : 0,
        fgaPerGame:  fgaTotal  / gp,
        fg3aPerGame: fg3aTotal / gp,
      }
    })
    .filter(Boolean)
    .sort((a, b) => b.ppg - a.ppg)

  const strengths       = []
  const weaknesses      = []
  const recommendations = []

  // — Shooting efficiency —
  if (fgPct >= 42) {
    strengths.push({ icon: '🎯', title: '投篮效率扎实', desc: `球队场均FG% ${fgPct.toFixed(1)}%，整体出手质量高，减少了无效进攻回合。` })
  } else if (fgPct < 35) {
    weaknesses.push({ icon: '🎯', title: '投篮效率偏低', desc: `场均FG% ${fgPct.toFixed(1)}% 低于及格线，出手时机选择需要优化。` })
    recommendations.push({ priority: 'high', icon: '📋', title: '提升出手质量', detail: `当前FG% ${fgPct.toFixed(1)}%。建议加强传切配合，优先制造空位后再出手，减少单打硬来的低效进攻。` })
  }

  // — Three-point shooting —
  if (fg3Pct >= 33) {
    strengths.push({ icon: '3️⃣', title: '三分威胁强', desc: `三分命中率 ${fg3Pct.toFixed(1)}%，有效拉开防线，为突破创造空间。` })
  } else if (fg3Pct < 25 && fg3a > 4) {
    weaknesses.push({ icon: '3️⃣', title: '三分出手低效', desc: `三分命中率 ${fg3Pct.toFixed(1)}%，场均 ${fg3a.toFixed(1)} 次出手但转化率低，消耗大量进攻资源。` })
    recommendations.push({ priority: 'medium', icon: '🏹', title: '优化三分策略', detail: `三分命中率 ${fg3Pct.toFixed(1)}%。建议缩减冲动型远投，将外线机会留给手感更稳的球员，多利用内线空间。` })
  }

  // — Ball movement & turnovers —
  if (astTov >= 2.0) {
    strengths.push({ icon: '🤝', title: '传控出色', desc: `助攻失误比 ${astTov.toFixed(1)}，持球决策优秀，团队配合流畅。` })
  } else if (astTov < 1.2) {
    weaknesses.push({ icon: '🤝', title: '持球失误偏多', desc: `助攻失误比 ${astTov.toFixed(1)}，场均 ${tov.toFixed(1)} 次失误，给对手额外得分机会。` })
    recommendations.push({ priority: 'high', icon: '🛡️', title: '控制失误', detail: `场均 ${tov.toFixed(1)} 次失误，助攻失误比 ${astTov.toFixed(1)}。建议快攻时适当放缓节奏，以稳定的阵地进攻代替仓促传切。` })
  }

  // — Offensive rebounding —
  if (oreb >= 5) {
    strengths.push({ icon: '💪', title: '二次进攻能力强', desc: `场均 ${oreb.toFixed(1)} 个进攻篮板，持续给对手施压，创造更多得分机会。` })
  }

  // — Steals / active defense —
  if (stl >= 4) {
    strengths.push({ icon: '🛡️', title: '主动防守积极', desc: `场均 ${stl.toFixed(1)} 次抢断，防守强度高，能快速转化为快攻得分。` })
  } else if (stl < 2) {
    weaknesses.push({ icon: '🛡️', title: '主动防守不足', desc: `场均仅 ${stl.toFixed(1)} 次抢断，防守压迫力弱，难以通过防守带动进攻节奏。` })
  }

  // — Rim protection —
  if (blk >= 2) {
    strengths.push({ icon: '🚫', title: '内线护框到位', desc: `场均 ${blk.toFixed(1)} 次盖帽，有效抑制对手内线进攻，是防守的重要威慑。` })
  } else if (blk < 1) {
    weaknesses.push({ icon: '🚫', title: '护框威慑不足', desc: `场均 ${blk.toFixed(1)} 次盖帽，内线防守较脆弱，对手可轻易突入油漆区得分。` })
    recommendations.push({ priority: 'medium', icon: '🏰', title: '加强内线协防', detail: `场均 ${blk.toFixed(1)} 次盖帽偏低。建议内线球员强化协防意识，遇到突破时及时轮转补防，而非消极等待。` })
  }

  // — Scoring margin —
  if (diff > 5) {
    strengths.push({ icon: '🏆', title: '得失分优势明显', desc: `场均净胜分 +${diff.toFixed(1)}，球队竞争力在联赛中处于领先位置。` })
  } else if (diff < -3) {
    weaknesses.push({ icon: '📉', title: '失分偏多', desc: `场均得失分差 ${diff.toFixed(1)}，防守端需要系统性加强。` })
    recommendations.push({ priority: 'high', icon: '🔒', title: '全面提升防守强度', detail: `当前失分差 ${diff.toFixed(1)}。建议强化防守轮转训练，减少给对手的空位机会，可针对对手核心球员布置重点包夹。` })
  }

  // — Team ball movement —
  if (ast >= 10) {
    strengths.push({ icon: '🎭', title: '团队篮球意识好', desc: `场均 ${ast.toFixed(1)} 次助攻，积极的传球文化让进攻更多样化。` })
  }

  // — Three-point rate —
  if (fg3Rate > 55) {
    recommendations.push({ priority: 'low', icon: '⚖️', title: '平衡进攻结构', detail: `三分出手占总投篮 ${fg3Rate.toFixed(0)}%，比例偏高。建议增加中距离及内线进攻，以内外结合让防守更难针对。` })
  }

  // — OREB utilization tip —
  if (oreb >= 5) {
    recommendations.push({ priority: 'low', icon: '🏃', title: '二次进攻转化', detail: `场均 ${oreb.toFixed(1)} 个进攻篮板是宝贵资源。抢到进攻板后不急于强行出手，重新组织阵地进攻可获得更高质量的机会。` })
  }

  // — High-turnover player —
  if (rosterPlayers.length > 2) {
    const highTov = [...rosterPlayers].sort((a, b) => b.topg - a.topg)[0]
    if (highTov && highTov.topg >= 3) {
      recommendations.push({ priority: 'medium', icon: '⚠️', title: `关注 ${highTov.name} 的持球决策`, detail: `${highTov.name} 场均 ${highTov.topg.toFixed(1)} 次失误居全队最高。建议减少其强对抗下的单打，通过更多传切配合降低失误风险。` })
    }
  }

  // Sort by priority
  const order = { high: 0, medium: 1, low: 2 }
  recommendations.sort((a, b) => order[a.priority] - order[b.priority])

  // — Player spotlights —
  const playerSpotlights = []
  if (rosterPlayers.length > 0) {
    const topScorer    = rosterPlayers[0]
    const topRebounder = [...rosterPlayers].sort((a, b) => b.rpg  - a.rpg)[0]
    const topAssister  = [...rosterPlayers].sort((a, b) => b.apg  - a.apg)[0]
    const best3p       = [...rosterPlayers].filter(p => p.fg3aPerGame >= 3).sort((a, b) => b.fg3Pct - a.fg3Pct)[0]

    playerSpotlights.push({
      name: topScorer.name,
      role: '得分核心',
      icon: '🌟',
      stat: `${topScorer.ppg.toFixed(1)} PPG · ${topScorer.fgPct.toFixed(1)}% FG`,
      insight: topScorer.fgPct < 35
        ? `${topScorer.name}是球队得分领袖，但命中率（${topScorer.fgPct.toFixed(1)}%）仍有改善空间。建议借助掩护制造空位出手，减少对抗状态下的强行进攻。`
        : `${topScorer.name}是球队的进攻支柱，场均 ${topScorer.ppg.toFixed(1)} 分且命中率稳定。应持续为其创造空切和高位掩护机会，最大化产出。`,
    })

    if (best3p && best3p.id !== topScorer.id && best3p.fg3Pct >= 28) {
      playerSpotlights.push({
        name: best3p.name,
        role: '三分射手',
        icon: '🎯',
        stat: `${best3p.fg3Pct.toFixed(1)}% 3P · ${best3p.fg3aPerGame.toFixed(1)} 3PA`,
        insight: `${best3p.name}是球队最稳定的外线射手，三分命中率 ${best3p.fg3Pct.toFixed(1)}%。战术上应多为其设计无球跑动和挡拆配合，提高空位出手比例。`,
      })
    }

    if (topAssister.id !== topScorer.id && topAssister.apg >= 3) {
      playerSpotlights.push({
        name: topAssister.name,
        role: '场上指挥官',
        icon: '🎭',
        stat: `${topAssister.apg.toFixed(1)} APG · ${topAssister.spg.toFixed(1)} SPG`,
        insight: `${topAssister.name}是球队组织核心，场均 ${topAssister.apg.toFixed(1)} 次助攻调动全队。建议赋予其更多组织权，通过传导激活其他球员。`,
      })
    }
  }

  // — Grade & summary —
  const winsCount = wins.value
  const lossCount = losses.value
  const wpct      = parseFloat(winPct.value)

  let grade, gradeColor
  if      (wpct >= 70 && diff >= 5)              { grade = 'A';  gradeColor = '#4ade80' }
  else if (wpct >= 60 || (wpct >= 50 && diff >= 3)) { grade = 'B+'; gradeColor = '#86efac' }
  else if (wpct >= 50 || diff >= 0)              { grade = 'B';  gradeColor = '#fbbf24' }
  else if (wpct >= 35 || diff >= -5)             { grade = 'C+'; gradeColor = '#fb923c' }
  else                                            { grade = 'C';  gradeColor = '#f87171' }

  let summary
  if (wpct >= 70 && diff >= 5) {
    summary = `雪谷火箭以 ${wpct.toFixed(0)}% 的胜率高居榜首，进攻火力充沛，防守同样稳固。球队当前状态正佳，需要在保持体系的同时打磨细节，向总冠军冲击。`
  } else if (wpct >= 50 && diff >= 0) {
    summary = `雪谷火箭战绩 ${winsCount}胜${lossCount}负，处于争夺季后赛的关键位置。球队整体运转良好，但在失误控制与投篮效率上仍有精进空间，保持专注将换来更稳定的胜率。`
  } else if (diff < -3) {
    summary = `雪谷火箭当前战绩 ${winsCount}胜${lossCount}负，得失分差为负，需要在后续比赛中做出调整。防守端的强化与进攻效率的提升是球队翻盘的关键所在。`
  } else {
    summary = `雪谷火箭本赛季战绩 ${winsCount}胜${lossCount}负，整体表现稳中有进。通过专项训练和针对性战术调整，球队具备更进一步的潜力，每场比赛都是宝贵的积累。`
  }

  return {
    grade, gradeColor,
    record: `${winsCount}胜${lossCount}负`,
    wpct:   `${wpct.toFixed(1)}%`,
    diff:   diff >= 0 ? `+${diff.toFixed(1)}` : diff.toFixed(1),
    diffColor: diff >= 0 ? '#4ade80' : '#f87171',
    summary,
    strengths,
    weaknesses,
    playerSpotlights,
    recommendations,
  }
})
</script>

<style scoped>
/* ── Team Hero ─────────────────────────────────────────── */
.team-hero {
  background: linear-gradient(135deg, #0d1b3e 0%, #1d428a 60%, #162040 100%);
  border-radius: 14px;
  padding: 32px 36px 0;
  margin-bottom: 28px;
  overflow: hidden;
  position: relative;
}
.team-hero::before {
  content: '🚀';
  position: absolute;
  right: 24px;
  top: 12px;
  font-size: 96px;
  opacity: .08;
  pointer-events: none;
  line-height: 1;
}
.th-top {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: 24px;
}
.th-subtitle {
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 2px;
  text-transform: uppercase;
  color: rgba(255,255,255,.5);
  margin-bottom: 6px;
}
.th-name {
  font-family: 'Barlow Condensed', sans-serif;
  font-size: 40px;
  font-weight: 900;
  letter-spacing: 2px;
  color: #fff;
  line-height: 1.1;
  margin-bottom: 10px;
}
.th-record-row {
  display: flex;
  align-items: baseline;
  gap: 4px;
}
.th-record-wins {
  font-family: 'Barlow Condensed', sans-serif;
  font-size: 20px;
  font-weight: 700;
  color: #4ade80;
}
.th-record-sep {
  font-size: 18px;
  color: rgba(255,255,255,.4);
  margin: 0 2px;
}
.th-record-losses {
  font-family: 'Barlow Condensed', sans-serif;
  font-size: 20px;
  font-weight: 700;
  color: #f87171;
}
.th-season-label {
  font-size: 13px;
  color: rgba(255,255,255,.45);
  margin-left: 8px;
}
.th-winpct-wrap {
  background: rgba(255,255,255,.1);
  border: 1px solid rgba(255,255,255,.15);
  border-radius: 12px;
  padding: 14px 22px;
  text-align: center;
}
.th-winpct-num {
  font-family: 'Barlow Condensed', sans-serif;
  font-size: 34px;
  font-weight: 900;
  color: #fbbf24;
  line-height: 1;
}
.th-winpct-label {
  font-size: 11px;
  color: rgba(255,255,255,.55);
  margin-top: 4px;
  letter-spacing: 1px;
  text-transform: uppercase;
}

/* ── Stats bar ────────────────────────────────────────── */
.th-stats-bar {
  display: flex;
  border-top: 1px solid rgba(255,255,255,.1);
  margin: 0 -36px;
}
.ths {
  flex: 1;
  padding: 18px 0 20px;
  text-align: center;
  border-right: 1px solid rgba(255,255,255,.1);
}
.ths:last-child { border-right: none; }
.ths-num {
  font-family: 'Barlow Condensed', sans-serif;
  font-size: 30px;
  font-weight: 800;
  color: #fff;
  line-height: 1;
}
.ths-opp .ths-num { color: #f87171; }
.ths-meta { margin-top: 4px; }
.ths-abbr {
  font-family: 'Barlow Condensed', sans-serif;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 1.5px;
  text-transform: uppercase;
  color: rgba(255,255,255,.45);
}
.ths-label {
  font-size: 10px;
  color: rgba(255,255,255,.35);
  margin-top: 2px;
}

/* ── avg-item extensions ─────────────────────────────── */
.avg-item--opp .ag-num { color: #dc2626; }
.avg-item--pos .ag-num--pos { color: #16a34a; }
.avg-item--neg .ag-num--neg { color: #dc2626; }

/* ── game log ─────────────────────────────────────────── */
.result-badge {
  display: inline-block;
  padding: 2px 8px;
  border-radius: 4px;
  font-family: 'Barlow Condensed', sans-serif;
  font-size: 13px;
  font-weight: 700;
  letter-spacing: 1px;
}
.result-w { background: var(--win-bg); color: var(--win); }
.result-l { background: var(--loss-bg); color: var(--loss); }
.score-cell { font-family: 'Barlow Condensed', sans-serif; font-size: 15px; font-weight: 700; }
.score-win { color: #16a34a; }
.score-loss { color: #dc2626; }
.score-sep { color: #999; margin: 0 2px; }

/* ── advanced value color ─────────────────────────────── */
.val-pos { color: #16a34a !important; }
.val-neg { color: #dc2626 !important; }

/* ── adv note ────────────────────────────────────────── */
.gc-adv-note {
  font-size: 11px;
  color: var(--text-3);
  padding: 4px 16px 12px;
  font-style: italic;
}

/* ══ AI Coach Tab ══════════════════════════════════════ */
.tab--ai { position: relative; }

.ai-coach { padding-bottom: 32px; }

/* Report Header */
.ai-report-header {
  display: flex;
  align-items: center;
  gap: 16px;
  background: linear-gradient(135deg, #0d1b3e 0%, #1a2e5a 100%);
  border: 1px solid rgba(255,255,255,.12);
  border-radius: 14px;
  padding: 20px 24px;
  margin-bottom: 20px;
}
.ai-report-icon { font-size: 40px; line-height: 1; flex-shrink: 0; }
.ai-report-info { flex: 1; }
.ai-report-title {
  font-family: 'Barlow Condensed', sans-serif;
  font-size: 22px;
  font-weight: 800;
  color: #fff;
  letter-spacing: 1px;
}
.ai-report-sub {
  font-size: 12px;
  color: rgba(255,255,255,.5);
  margin-top: 4px;
}
.ai-grade-badge {
  background: rgba(255,255,255,.08);
  border: 1px solid rgba(255,255,255,.12);
  border-radius: 10px;
  padding: 10px 20px;
  text-align: center;
  flex-shrink: 0;
}
.ai-grade-val {
  font-family: 'Barlow Condensed', sans-serif;
  font-size: 36px;
  font-weight: 900;
  line-height: 1;
}
.ai-grade-label {
  font-size: 10px;
  color: rgba(255,255,255,.45);
  margin-top: 3px;
  letter-spacing: 1px;
  text-transform: uppercase;
}

/* Summary box */
.ai-summary-box {
  background: var(--card-bg);
  border: 1px solid var(--border);
  border-radius: 12px;
  padding: 18px 20px;
  margin-bottom: 20px;
}
.ai-summary-label {
  font-size: 11px;
  font-weight: 700;
  color: var(--accent);
  letter-spacing: 1.5px;
  text-transform: uppercase;
  margin-bottom: 10px;
}
.ai-summary-text {
  font-size: 14px;
  color: var(--text-1);
  line-height: 1.8;
  margin-bottom: 16px;
}
.ai-summary-stats {
  display: flex;
  border-top: 1px solid var(--border);
  padding-top: 14px;
}
.ai-sum-stat {
  flex: 1;
  text-align: center;
  border-right: 1px solid var(--border);
}
.ai-sum-stat:last-child { border-right: none; }
.ai-sum-num {
  font-family: 'Barlow Condensed', sans-serif;
  font-size: 26px;
  font-weight: 800;
  color: #fff;
  line-height: 1;
}
.ai-sum-lbl {
  font-size: 11px;
  color: var(--text-3);
  margin-top: 3px;
}

/* Strengths & Weaknesses grid */
.ai-sw-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 14px;
  margin-bottom: 20px;
}
@media (max-width: 600px) {
  .ai-sw-grid { grid-template-columns: 1fr; }
}
.ai-sw-col {
  background: var(--card-bg);
  border: 1px solid var(--border);
  border-radius: 12px;
  overflow: hidden;
}
.ai-sw-header {
  padding: 10px 16px;
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 1px;
}
.ai-sw-str {
  background: rgba(74,222,128,.1);
  color: #4ade80;
  border-bottom: 1px solid rgba(74,222,128,.18);
}
.ai-sw-wk {
  background: rgba(251,191,36,.08);
  color: #fbbf24;
  border-bottom: 1px solid rgba(251,191,36,.18);
}
.ai-sw-items { padding: 4px 0; }
.ai-sw-item {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  padding: 10px 14px;
}
.ai-sw-item + .ai-sw-item { border-top: 1px solid var(--border); }
.ai-sw-ico { font-size: 17px; flex-shrink: 0; margin-top: 1px; }
.ai-sw-title {
  font-size: 13px;
  font-weight: 600;
  color: var(--text-1);
  margin-bottom: 3px;
}
.ai-sw-desc {
  font-size: 12px;
  color: var(--text-2);
  line-height: 1.5;
}
.ai-sw-empty {
  padding: 16px;
  font-size: 12px;
  color: var(--text-3);
  text-align: center;
  font-style: italic;
}

/* Section title */
.ai-section { margin-bottom: 20px; }
.ai-section-title {
  font-family: 'Barlow Condensed', sans-serif;
  font-size: 16px;
  font-weight: 800;
  color: var(--text-1);
  letter-spacing: 1.5px;
  text-transform: uppercase;
  margin-bottom: 12px;
  padding-bottom: 8px;
  border-bottom: 1px solid var(--border);
}

/* Player cards */
.ai-players-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}
@media (max-width: 600px) {
  .ai-players-grid { grid-template-columns: 1fr; }
}
.ai-player-card {
  background: var(--card-bg);
  border: 1px solid var(--border);
  border-radius: 12px;
  padding: 14px 16px;
}
.ai-pc-top {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 10px;
}
.ai-pc-icon { font-size: 22px; flex-shrink: 0; }
.ai-pc-info { flex: 1; }
.ai-pc-name { font-size: 14px; font-weight: 700; color: var(--text-1); }
.ai-pc-role {
  font-size: 11px;
  color: var(--accent);
  font-weight: 600;
  letter-spacing: 0.5px;
  margin-top: 2px;
}
.ai-pc-stat {
  font-family: 'Barlow Condensed', sans-serif;
  font-size: 13px;
  font-weight: 700;
  color: #fbbf24;
  text-align: right;
  flex-shrink: 0;
}
.ai-pc-insight { font-size: 12px; color: var(--text-2); line-height: 1.65; }

/* Recommendations */
.ai-recs { display: flex; flex-direction: column; gap: 10px; }
.ai-rec {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  background: var(--card-bg);
  border: 1px solid var(--border);
  border-left-width: 4px;
  border-radius: 12px;
  padding: 14px 16px;
}
.ai-rec--high   { border-left-color: #f87171; }
.ai-rec--medium { border-left-color: #fbbf24; }
.ai-rec--low    { border-left-color: #60a5fa; }
.ai-rec-num {
  width: 26px;
  height: 26px;
  border-radius: 50%;
  background: rgba(255,255,255,.08);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 13px;
  font-weight: 700;
  color: var(--text-2);
  flex-shrink: 0;
}
.ai-rec-body { flex: 1; }
.ai-rec-title {
  font-size: 14px;
  font-weight: 600;
  color: var(--text-1);
  margin-bottom: 5px;
}
.ai-rec-detail { font-size: 12px; color: var(--text-2); line-height: 1.65; }
.ai-rec-badge {
  flex-shrink: 0;
  padding: 3px 9px;
  border-radius: 20px;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.5px;
  align-self: flex-start;
  margin-top: 2px;
}
.ai-badge--high   { background: rgba(248,113,113,.14); color: #f87171; }
.ai-badge--medium { background: rgba(251,191,36,.12);  color: #fbbf24; }
.ai-badge--low    { background: rgba(96,165,250,.12);  color: #60a5fa; }

/* Footer & empty */
.ai-footer-note {
  text-align: center;
  font-size: 11px;
  color: var(--text-3);
  padding: 16px 0 4px;
  font-style: italic;
}
.ai-no-data {
  text-align: center;
  padding: 40px;
  color: var(--text-3);
  font-size: 14px;
}
</style>
