<template>
  <div class="page">
    <RouterLink class="back-link" to="/players">{{ t('back_link') }}</RouterLink>

    <div v-if="loading" class="loading">{{ t('loading') }}</div>
    <div v-else-if="!player" class="empty">{{ t('no_player') }}</div>

    <template v-else>
      <!-- NBA-style hero -->
      <div class="player-hero">
        <div class="ph-top">
          <!-- left: name + tags -->
          <div class="ph-left">
            <div class="ph-team-line">{{ t('ph_subtitle') }}</div>
            <div class="ph-name">{{ player.name }}</div>
            <div class="ph-tags">
              <span class="ph-tag pos">{{ player.position }}</span>
              <span v-if="player.height" class="ph-tag">{{ player.height }}</span>
              <span v-if="player.weight" class="ph-tag">{{ player.weight }}</span>
              <span class="ph-tag">{{ player.games.length }} {{ t('stat_appearances') }}</span>
              <span v-for="tag in player.tags" :key="tag" class="ph-tag player-tag">{{ tag }}</span>
            </div>
          </div>
          <!-- right: jersey number panel -->
          <div class="ph-right">
            <img v-if="player.avatar" :src="baseUrl + player.avatar" class="ph-avatar" :alt="player.name" />
            <div class="ph-jersey-num">{{ player.number }}</div>
            <div class="ph-num-display">{{ player.number }}</div>
          </div>
        </div>
        <!-- stats bar: PPG / RPG / APG -->
        <div class="ph-stats">
          <div class="phs">
            <div class="phs-num">{{ avg('pts') }}</div>
            <div class="phs-meta">
              <div class="phs-abbr">PPG</div>
              <div class="phs-label">{{ t('phs_ppg') }}</div>
            </div>
          </div>
          <div class="phs">
            <div class="phs-num">{{ avg('reb') }}</div>
            <div class="phs-meta">
              <div class="phs-abbr">RPG</div>
              <div class="phs-label">{{ t('phs_rpg') }}</div>
            </div>
          </div>
          <div class="phs">
            <div class="phs-num">{{ avg('ast') }}</div>
            <div class="phs-meta">
              <div class="phs-abbr">APG</div>
              <div class="phs-label">{{ t('phs_apg') }}</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Tabs -->
      <div class="tabs">
        <button class="tab" :class="{ active: tab === 'avg' }"   @click="tab = 'avg'">{{ t('tab_avg') }}</button>
        <button class="tab" :class="{ active: tab === 'games' }" @click="tab = 'games'">{{ t('tab_games') }}</button>
        <button class="tab" :class="{ active: tab === 'info' }"  @click="tab = 'info'">{{ t('tab_info') }}</button>
        <button class="tab tab-p48" :class="{ active: per48 }" @click="per48 = !per48">P/48</button>
      </div>

      <!-- 总体平均 -->
      <!-- 六边形雷达图：仅在总体平均时显示 -->
      <div v-if="tab === 'avg'" class="hex-chart-wrap" style="margin-top:16px">
        <svg v-if="hexReady" :width="hexSize" :height="hexSize" viewBox="0 0 240 240" role="img" aria-label="六项基础数据对比雷达图">
          <g transform="translate(120,120)">
            <!-- grid polygons -->
            <template v-for="level in [0.25,0.5,0.75,1]" :key="level">
              <polygon :points="polygonPoints(level)" fill="none" stroke="#c0c8d8" stroke-width="1" />
            </template>
            <!-- overall avg (blue) -->
            <polygon :points="polygonPointsForValues(overallNorm)" fill="none" stroke="#2b7be4" stroke-width="2" />
            <!-- player (red) -->
            <polygon :points="polygonPointsForValues(playerNorm)" fill="none" stroke="#e43b3b" stroke-width="2" />
            <!-- axes and labels -->
            <g v-for="(lab, i) in hexLabels" :key="lab">
              <line :x1="0" :y1="0" :x2="axisPos(i).x" :y2="axisPos(i).y" stroke="#c8d0dc" />
              <text :x="labelPos(i).x" :y="labelPos(i).y" font-size="10" text-anchor="middle" fill="#333">{{ lab }}</text>
            </g>
          </g>
        </svg>
        <div style="margin-top:8px; font-size:13px;">
          <span style="display:inline-block;width:12px;height:8px;background:#2b7be4;margin-right:6px"></span> 总体平均
          <span style="display:inline-block;width:12px;height:8px;background:#e43b3b;margin:0 6px 0 12px"></span> 个人
        </div>
      </div>
      <div v-if="tab === 'avg'">
        <div class="stats-section-label">{{ t('basic_data') }}</div>
        <div class="avg-grid">
          <div class="avg-item"><div class="ag-abbr">PTS</div><div class="ag-num">{{ avg('pts') }}</div><div class="ag-desc">{{ t('d_pts') }}</div><div class="ag-rank">{{ statRank('pts') }}</div></div>
          <div class="avg-item"><div class="ag-abbr">REB</div><div class="ag-num">{{ avg('reb') }}</div><div class="ag-desc">{{ t('d_reb') }}</div><div class="ag-rank">{{ statRank('reb') }}</div></div>
          <div class="avg-item"><div class="ag-abbr">AST</div><div class="ag-num">{{ avg('ast') }}</div><div class="ag-desc">{{ t('d_ast') }}</div><div class="ag-rank">{{ statRank('ast') }}</div></div>
          <div class="avg-item"><div class="ag-abbr">STL</div><div class="ag-num">{{ avg('stl') }}</div><div class="ag-desc">{{ t('d_stl') }}</div><div class="ag-rank">{{ statRank('stl') }}</div></div>
          <div class="avg-item"><div class="ag-abbr">BLK</div><div class="ag-num">{{ avg('blk') }}</div><div class="ag-desc">{{ t('d_blk') }}</div><div class="ag-rank">{{ statRank('blk') }}</div></div>
          <div class="avg-item"><div class="ag-abbr">TOV</div><div class="ag-num">{{ avg('tov') }}</div><div class="ag-desc">{{ t('d_tov') }}</div><div class="ag-rank">{{ statRank('tov') }}</div></div>
          <div class="avg-item"><div class="ag-abbr">OREB</div><div class="ag-num">{{ avg('oreb') }}</div><div class="ag-desc">{{ t('d_oreb') }}</div><div class="ag-rank">{{ statRank('oreb') }}</div></div>
          <div class="avg-item"><div class="ag-abbr">DREB</div><div class="ag-num">{{ avgDreb() }}</div><div class="ag-desc">{{ t('d_dreb') }}</div><div class="ag-rank">{{ statRank('dreb') }}</div></div>
        </div>
        <div class="stats-section-label" style="margin-top:24px">{{ t('adv_shooting') }}</div>
        <div class="avg-grid">
          <div class="avg-item"><div class="ag-abbr">FG%</div><div class="ag-num">{{ avgFgPct() }}</div><div class="ag-desc">{{ t('d_fgpct') }}</div><div class="ag-rank">{{ statRank('fgpct') }}</div></div>
          <div class="avg-item"><div class="ag-abbr">2P%</div><div class="ag-num">{{ avgFg2Pct() }}</div><div class="ag-desc">{{ t('d_fg2pct') }}</div><div class="ag-rank">{{ statRank('fg2pct') }}</div></div>
          <div class="avg-item"><div class="ag-abbr">3P%</div><div class="ag-num">{{ avgFg3Pct() }}</div><div class="ag-desc">{{ t('d_fg3pct') }}</div><div class="ag-rank">{{ statRank('fg3pct') }}</div></div>
          <div class="avg-item"><div class="ag-abbr">eFG%</div><div class="ag-num">{{ avgEfgPct() }}</div><div class="ag-desc">{{ t('d_efgpct') }}</div><div class="ag-rank">{{ statRank('efgpct') }}</div></div>
          <div class="avg-item"><div class="ag-abbr">FGM</div><div class="ag-num">{{ avg('fgm') }}</div><div class="ag-desc">{{ t('d_fgm') }}</div><div class="ag-rank">{{ statRank('fgm') }}</div></div>
          <div class="avg-item"><div class="ag-abbr">FGA</div><div class="ag-num">{{ avg('fga') }}</div><div class="ag-desc">{{ t('d_fga') }}</div><div class="ag-rank">{{ statRank('fga') }}</div></div>
          <div class="avg-item"><div class="ag-abbr">3PM</div><div class="ag-num">{{ avg('fg3m') }}</div><div class="ag-desc">{{ t('d_3pm') }}</div><div class="ag-rank">{{ statRank('fg3m') }}</div></div>
          <div class="avg-item"><div class="ag-abbr">3PA</div><div class="ag-num">{{ avg('fg3a') }}</div><div class="ag-desc">{{ t('d_3pa') }}</div><div class="ag-rank">{{ statRank('fg3a') }}</div></div>
        </div>

        <!-- 进阶数据 panel -->
        <div class="gc-adv" style="margin-top:24px">
          <div class="gc-adv-header">
            <span class="gc-adv-title">{{ t('adv_section') }}</span>
            <a class="gc-adv-link" href="https://www.basketball-reference.com/about/glossary.html" target="_blank" rel="noopener noreferrer">{{ t('glossary_link') }} &nearr;</a>
          </div>
          <div class="gc-adv-row" style="grid-template-columns:repeat(3,1fr)">
            <div v-for="s in playerAdvStats()" :key="s.abbr" class="gc-adv-stat">
              <div class="gc-adv-abbr" :title="s.tip">{{ s.abbr }} <span class="gc-adv-q">ⓘ</span></div>
              <div class="gc-adv-val">{{ s.val }}</div>
              <div class="gc-adv-desc">{{ s.label }}</div>
              <div class="ag-rank">{{ statRank(s.metricKey) }}</div>
            </div>
          </div>
        </div>

        <!-- 总数据 -->
        <div class="stats-section-label" style="margin-top:24px">{{ t('career_totals') }}</div>
        <div class="totals-table-wrap">
          <table class="totals-table">
            <thead>
              <tr>
                <th>GP</th><th>PTS</th><th>REB</th><th>AST</th>
                <th>STL</th><th>BLK</th><th>TOV</th><th>OREB</th>
                <th>FGM</th><th>FGA</th><th>3PM</th><th>3PA</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>{{ player.games.length }}</td>
                <td class="tot-pts">{{ total('pts') }}</td>
                <td>{{ total('reb') }}</td>
                <td>{{ total('ast') }}</td>
                <td>{{ total('stl') }}</td>
                <td>{{ total('blk') }}</td>
                <td>{{ total('tov') }}</td>
                <td>{{ total('oreb') }}</td>
                <td>{{ total('fgm') }}</td>
                <td>{{ total('fga') }}</td>
                <td>{{ total('fg3m') }}</td>
                <td>{{ total('fg3a') }}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div class="sub-note">{{ t('sub_note_pre') }} {{ player.games.length }} {{ t('sub_note_suf') }}</div>
      </div>

      <!-- 比赛数据 -->
      <div v-if="tab === 'games'">
        <div class="table-wrap">
          <table class="g-table">
            <thead>
              <tr>
                <th>{{ t('g_th_match') }}</th>
                <th>PTS</th><th>REB</th><th>OREB</th><th>AST</th>
                <th>STL</th><th>BLK</th><th>TOV</th>
                <th>FGM</th><th>FGA</th><th>FG%</th>
                <th>3PM</th><th>3PA</th><th>3P%</th><th>eFG%</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="g in [...player.games].reverse()" :key="g.match_id">
              <td>{{ matchLabel(g.match_id) }}</td>
                <td class="g-pts">{{ p48(g.pts) }}</td>
                <td>{{ p48(g.reb) }}</td>
                <td>{{ g.oreb != null ? p48(g.oreb) : '-' }}</td>
                <td>{{ p48(g.ast) }}</td>
                <td>{{ p48(g.stl) }}</td><td>{{ p48(g.blk) }}</td><td>{{ p48(g.tov) }}</td>
                <td>{{ p48(g.fgm) }}</td><td>{{ p48(g.fga) }}</td>
                <td>{{ g.fga ? (g.fgm / g.fga * 100).toFixed(0) + '%' : '-' }}</td>
                <td>{{ p48(g.fg3m) }}</td><td>{{ p48(g.fg3a) }}</td>
                <td>{{ g.fg3a ? (g.fg3m / g.fg3a * 100).toFixed(0) + '%' : '-' }}</td>
                <td>{{ g.fga ? ((g.fgm + 0.5 * g.fg3m) / g.fga * 100).toFixed(0) + '%' : '-' }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- 资料 -->
      <div v-if="tab === 'info'">
        <div class="info-grid">
          <div class="ig-item"><span class="ig-key">{{ t('info_name') }}</span><span class="ig-val">{{ player.name }}</span></div>
          <div class="ig-item"><span class="ig-key">{{ t('info_number') }}</span><span class="ig-val">#{{ player.number }}</span></div>
          <div class="ig-item"><span class="ig-key">{{ t('info_pos') }}</span><span class="ig-val">{{ player.position }}</span></div>
          <div class="ig-item"><span class="ig-key">{{ t('info_games') }}</span><span class="ig-val">{{ player.games.length }} {{ t('games_suffix') }}</span></div>
          <div class="ig-item"><span class="ig-key">{{ t('info_height') }}</span><span class="ig-val">{{ player.height || '—' }}</span></div>
          <div class="ig-item"><span class="ig-key">{{ t('info_weight') }}</span><span class="ig-val">{{ player.weight || '—' }}</span></div>
          <div class="ig-item"><span class="ig-key">{{ t('info_wingspan') }}</span><span class="ig-val">{{ player.wingspan || '—' }}</span></div>
          <div class="ig-item"><span class="ig-key">{{ t('info_reach') }}</span><span class="ig-val">{{ player.standing_reach || '—' }}</span></div>
          <div class="ig-item"><span class="ig-key">{{ t('info_joined') }}</span><span class="ig-val">{{ player.joined || '—' }}</span></div>
          <div class="ig-item"><span class="ig-key">{{ t('info_school') }}</span><span class="ig-val">{{ player.school || '—' }}</span></div>
          <div class="ig-item"><span class="ig-key">{{ t('info_idol') }}</span><span class="ig-val">{{ player.idol || '—' }}</span></div>
        </div>
        <template v-if="player.mold">
          <div class="stats-section-label" style="margin-top:24px">{{ t('sec_mold') }}</div>
          <div class="mold-card">
            <span class="mold-icon">🏀</span>
            <span class="mold-name">{{ player.mold }}</span>
          </div>
        </template>
        <template v-if="player.contract">
          <div class="stats-section-label" style="margin-top:24px">{{ t('sec_contract') }}</div>
          <div class="contract-card">
            <span class="contract-icon">📋</span>
            <span class="contract-text">{{ player.contract }}</span>
          </div>
        </template>
        <template v-if="player.honors?.length">
          <div class="stats-section-label" style="margin-top:24px">{{ t('sec_honors') }}</div>
          <div class="honors-list">
            <div v-for="(h, i) in player.honors" :key="i" class="honor-item">
              <span class="honor-star">🏆</span> {{ h }}
            </div>
          </div>
        </template>
      </div>
    </template>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import { useRoute, RouterLink } from 'vue-router'
import { t } from '../i18n.js'
import { getPlayerViewData } from '../dataService.js'

const baseUrl = import.meta.env.BASE_URL
const route  = useRoute()

// 雷达图相关（改为五边形，去掉失误）
const hexMetrics = ['pts', 'reb', 'ast', 'stl', 'blk']
const hexLabels = ['PTS','REB','AST','STL','BLK']
const hexSize = 240

function numAvgForPlayer(p, key) {
  const gs = p?.games
  if (!gs?.length) return 0
  const base = gs.reduce((a, g) => a + (g[key] ?? 0), 0) / gs.length
  return base * (per48.value ? 2 : 1)
}

const hexReady = ref(false)
const overallNorm = ref([])
const playerNorm = ref([])

function computeHex() {
  const playersList = allPlayers.value.filter(isRankEligible)
  if (!playersList.length) {
    overallNorm.value = hexMetrics.map(() => 0)
    playerNorm.value = hexMetrics.map(() => 0)
    hexReady.value = true
    return
  }

  // per-metric max for normalization
  const maxes = hexMetrics.map(k => {
    const vals = playersList.map(p => numAvgForPlayer(p, k))
    return Math.max(...vals, 1)
  })

  const overall = hexMetrics.map((k, i) => {
    const vals = playersList.map(p => numAvgForPlayer(p, k))
    const valid = vals.filter(v => v != null)
    const avg = valid.length ? valid.reduce((a,b)=>a+b,0)/valid.length : 0
    return avg
  })

  const pvals = hexMetrics.map(k => numAvgForPlayer(player.value, k))

  // normalize (0..1)
  overallNorm.value = overall.map((v, i) => {
    const m = maxes[i] || 1
    return (v / m)
  })
  playerNorm.value = pvals.map((v, i) => {
    const m = maxes[i] || 1
    return (v / m)
  })
  hexReady.value = true
}

function polygonPointsForValues(vals) {
  const r = 90
  const pts = vals.map((v, i) => {
    const angle = -Math.PI / 2 + (i * 2 * Math.PI) / vals.length
    const x = Math.cos(angle) * v * r
    const y = Math.sin(angle) * v * r
    return `${x},${y}`
  })
  return pts.join(' ')
}

function polygonPoints(level) {
  const r = 90 * level
  const pts = hexMetrics.map((_, i) => {
    const angle = -Math.PI / 2 + (i * 2 * Math.PI) / hexMetrics.length
    const x = Math.cos(angle) * r
    const y = Math.sin(angle) * r
    return `${x},${y}`
  })
  return pts.join(' ')
}

function axisPos(i) {
  const r = 100
  const angle = -Math.PI / 2 + (i * 2 * Math.PI) / hexMetrics.length
  return { x: Math.cos(angle) * r, y: Math.sin(angle) * r }
}

function labelPos(i) {
  const r = 115
  const angle = -Math.PI / 2 + (i * 2 * Math.PI) / hexMetrics.length
  return { x: Math.cos(angle) * r, y: Math.sin(angle) * r + 4 }
}

// recompute when player or allPlayers load / per48 changes
// (watch is attached after player/allPlayers are defined)
const player = ref(null)
const allPlayers = ref([])
const eventsById = ref({})
const allGameStats = ref([])
const loading = ref(true)
const tab = ref('avg')
const per48 = ref(false)
const matchLabels = ref({})

function p48(val) {
  if (val == null) return '-'
  return per48.value ? val * 2 : val
}

async function load() {
  loading.value = true
  const data = await getPlayerViewData(route.params.id)
  allPlayers.value = data.allPlayers
  player.value = data.player
  eventsById.value = data.eventsById
  allGameStats.value = data.gameStats
  matchLabels.value = data.matchLabels
  loading.value = false
}
onMounted(load)
watch(() => route.params.id, load)

// recompute hex when player or allPlayers load / per48 changes
watch([player, allPlayers, per48], () => {
  if (player.value && allPlayers.value.length) computeHex()
})

function avg(key) {
  const gs = player.value?.games
  if (!gs?.length) return '-'
  const base = gs.reduce((a, g) => a + (g[key] ?? 0), 0) / gs.length
  return (base * (per48.value ? 2 : 1)).toFixed(1)
}
function avgFgPct() {
  const gs = player.value?.games
  if (!gs?.length) return '-'
  const fgm = gs.reduce((a, g) => a + g.fgm, 0)
  const fga = gs.reduce((a, g) => a + g.fga, 0)
  return fga ? (fgm / fga * 100).toFixed(1) + '%' : '-'
}
function avgFg3Pct() {
  const gs = player.value?.games
  if (!gs?.length) return '-'
  const m = gs.reduce((a, g) => a + (g.fg3m ?? 0), 0)
  const a = gs.reduce((a, g) => a + (g.fg3a ?? 0), 0)
  return a ? (m / a * 100).toFixed(1) + '%' : '-'
}
function avgFg2Pct() {
  const gs = player.value?.games
  if (!gs?.length) return '-'
  const m = gs.reduce((a, g) => a + (g.fg2m ?? 0), 0)
  const a = gs.reduce((a, g) => a + (g.fg2a ?? 0), 0)
  return a ? (m / a * 100).toFixed(1) + '%' : '-'
}
function avgEfgPct() {
  const gs = player.value?.games
  if (!gs?.length) return '-'
  const fgm  = gs.reduce((a, g) => a + (g.fgm  ?? 0), 0)
  const fg3m = gs.reduce((a, g) => a + (g.fg3m ?? 0), 0)
  const fga  = gs.reduce((a, g) => a + (g.fga  ?? 0), 0)
  return fga ? ((fgm + 0.5 * fg3m) / fga * 100).toFixed(1) + '%' : '-'
}
function avgDreb() {
  const gs = player.value?.games
  if (!gs?.length) return '-'
  const base = gs.reduce((a, g) => a + ((g.reb ?? 0) - (g.oreb ?? 0)), 0) / gs.length
  return (base * (per48.value ? 2 : 1)).toFixed(1)
}

function isRankEligible(p) {
  return p?.primaryTeamId === 'keepb' && p?.isPublic && p?.playerStatus !== 'inactive'
}

function sameTeamStats(eventId, teamId) {
  return allGameStats.value.filter(s => s.eventId === eventId && s.teamId === teamId)
}

function statValueForPlayer(p, metric) {
  const gs = p?.games
  if (!gs?.length) return null

  const sum = k => gs.reduce((a, g) => a + (g[k] ?? 0), 0)
  const avgCount = k => {
    const base = sum(k) / gs.length
    return base * (per48.value ? 2 : 1)
  }

  if (metric === 'dreb') {
    const base = gs.reduce((a, g) => a + ((g.reb ?? 0) - (g.oreb ?? 0)), 0) / gs.length
    return base * (per48.value ? 2 : 1)
  }
  if (metric === 'fgpct') {
    const fga = sum('fga')
    return fga ? (sum('fgm') / fga * 100) : null
  }
  if (metric === 'fg2pct') {
    const a = sum('fg2a')
    return a ? (sum('fg2m') / a * 100) : null
  }
  if (metric === 'fg3pct') {
    const a = sum('fg3a')
    return a ? (sum('fg3m') / a * 100) : null
  }
  if (metric === 'efgpct') {
    const fga = sum('fga')
    return fga ? ((sum('fgm') + 0.5 * sum('fg3m')) / fga * 100) : null
  }

  if (metric === 'asttov') {
    const a = sum('ast')
    const t = sum('tov')
    if (t > 0) return a / t
    if (a > 0) return Number.POSITIVE_INFINITY
    return null
  }
  if (metric === 'p3rate') {
    const fga = sum('fga')
    return fga > 0 ? (sum('fg3a') / fga * 100) : null
  }
  if (metric === 'ptsfga') {
    const fga = sum('fga')
    return fga > 0 ? (sum('pts') / fga) : null
  }
  if (metric === 'orebp') {
    let teamMiss = 0
    for (const g of gs) {
      const teamStats = sameTeamStats(g.match_id, g.teamId)
      if (!teamStats.length) { teamMiss += (g.fga ?? 0) - (g.fgm ?? 0); continue }
      for (const tg of teamStats) {
        teamMiss += (tg.fga ?? 0) - (tg.fgm ?? 0)
      }
    }
    return teamMiss > 0 ? (sum('oreb') / teamMiss * 100) : null
  }
  if (metric === 'def') {
    return ((sum('stl') + sum('blk')) / gs.length) * (per48.value ? 2 : 1)
  }

  // 使用率（USG%）和 PIE 的估算
  // USG%: 分母只算己方球队进攻事件；PIE: 分母用全场所有球员（双方）
  if (metric === 'usg' || metric === 'pie') {
    const matchIds = Array.from(new Set(gs.map(g => g.match_id)))
    let myTeamOffEvents = 0  // 己方球队只 (USG%)
    let gameImpact = 0       // 全场双方 (PIE)
    for (const mid of matchIds) {
      const myGame = gs.find(g => g.match_id === mid)
      const myTeamId = myGame?.teamId ?? null
      const eventStats = allGameStats.value.filter(s => s.eventId === mid)
      for (const pg of eventStats) {
        const pFga = pg.fga ?? 0, pFta = pg.fta ?? 0, pTov = pg.tov ?? 0
        const pPts = pg.pts ?? 0
        if (!myTeamId || pg.teamId === myTeamId) {
          myTeamOffEvents += (pFga + 0.44 * pFta + pTov)
        }
        const pImpact = pPts + (pg.fgm ?? 0) + (pg.fg3m ?? 0) + (pg.ftm ?? 0) + (pg.oreb ?? 0) + (pg.stl ?? 0) + (pg.blk ?? 0) + (pg.ast ?? 0) - ((pg.fga ?? 0) - (pg.fgm ?? 0)) - pTov
        gameImpact += Math.max(0, pImpact)
      }
    }

    const playerOffEvents = gs.reduce((a, g) => a + ((g.fga ?? 0) + 0.44 * (g.fta ?? 0) + (g.tov ?? 0)), 0)
    const playerImpact = gs.reduce((a, g) => a + ((g.pts ?? 0) + (g.fgm ?? 0) + (g.fg3m ?? 0) + (g.ftm ?? 0) + (g.oreb ?? 0) + (g.stl ?? 0) + (g.blk ?? 0) + (g.ast ?? 0) - ((g.fga ?? 0) - (g.fgm ?? 0)) - (g.tov ?? 0)), 0)

    if (metric === 'usg') {
      return myTeamOffEvents ? (playerOffEvents / myTeamOffEvents * 100) : null
    }
    if (metric === 'pie') {
      return gameImpact ? (playerImpact / gameImpact * 100) : null
    }
  }

  return avgCount(metric)
}

function statRank(metric) {
  if (!player.value) return '-'
  const targetVal = statValueForPlayer(player.value, metric)
  if (targetVal == null) return '-'

  const entries = allPlayers.value
    .filter(isRankEligible)
    .map(p => ({ id: p.id, val: statValueForPlayer(p, metric) }))
    .filter(x => x.val != null)
    .sort((a, b) => b.val - a.val)

  let rank = 0
  let prevVal = null
  for (let i = 0; i < entries.length; i++) {
    if (prevVal === null || Math.abs(entries[i].val - prevVal) > 1e-9) rank = i + 1
    if (entries[i].id === player.value.id) return `${t('rnk_rank')} #${rank}`
    prevVal = entries[i].val
  }
  return '-'
}

function playerAdvStats() {
  const gs = player.value?.games
  if (!gs?.length) return []
  const sum = k => gs.reduce((a, g) => a + (g[k] ?? 0), 0)
  const fgm = sum('fgm'), fga = sum('fga'), fg3m = sum('fg3m')
  const ast  = sum('ast'), tov = sum('tov'), oreb = sum('oreb')
  const efgNum = fga  ? ((fgm + 0.5 * fg3m) / fga * 100) : null
  const asttovNum = tov ? (ast / tov) : (ast > 0 ? Number.POSITIVE_INFINITY : null)
  const p3rateNum = fga ? (sum('fg3a') / fga * 100) : null
  const ptsfgaNum = fga ? (sum('pts') / fga) : null
  let teamMissOreb = 0
  for (const g of gs) {
    const teamStats = sameTeamStats(g.match_id, g.teamId)
    if (!teamStats.length) { teamMissOreb += (g.fga ?? 0) - (g.fgm ?? 0); continue }
    for (const tg of teamStats) {
      teamMissOreb += (tg.fga ?? 0) - (tg.fgm ?? 0)
    }
  }
  const orbpNum = teamMissOreb > 0 ? (oreb / teamMissOreb * 100) : null
  const defNum = ((sum('stl') + sum('blk')) / gs.length) * (per48.value ? 2 : 1)
  const fmtPct = v => v == null ? '-' : v.toFixed(1) + '%'
  const fmtDec = v => v == null ? '-' : (v === Number.POSITIVE_INFINITY ? '∞' : v.toFixed(2))
  const fmtOne = v => v == null ? '-' : v.toFixed(1)
  // TS% (真实命中率)
  const fta = sum('fta')
  const tsNum = (fga + 0.44 * fta) ? (sum('pts') / (2 * (fga + 0.44 * fta)) * 100) : null

  // Helper: USG% 只用己方球队；PIE 用全场双方
  const matchIds = Array.from(new Set(gs.map(g => g.match_id)))
  let myTeamOffEvents = 0  // 己方球队 (USG%)
  let gameImpact = 0       // 全场双方 (PIE)
  for (const mid of matchIds) {
    const myGame = gs.find(g => g.match_id === mid)
    const myTeamId = myGame?.teamId ?? null
    const eventStats = allGameStats.value.filter(s => s.eventId === mid)
    for (const pg of eventStats) {
      const pFga = pg.fga ?? 0, pFta = pg.fta ?? 0, pTov = pg.tov ?? 0
      const pPts = pg.pts ?? 0
      if (!myTeamId || pg.teamId === myTeamId) {
        myTeamOffEvents += (pFga + 0.44 * pFta + pTov)
      }
      const pImpact = pPts + (pg.fgm ?? 0) + (pg.fg3m ?? 0) + (pg.ftm ?? 0) + (pg.oreb ?? 0) + (pg.stl ?? 0) + (pg.blk ?? 0) + (pg.ast ?? 0) - ((pFga - (pg.fgm ?? 0)) || 0) - pTov
      gameImpact += Math.max(0, pImpact)
    }
  }

  // Player totals for those matches
  const playerOffEvents = gs.reduce((a, g) => a + ((g.fga ?? 0) + 0.44 * (g.fta ?? 0) + (g.tov ?? 0)), 0)
  const playerImpact = gs.reduce((a, g) => a + ((g.pts ?? 0) + (g.fgm ?? 0) + (g.fg3m ?? 0) + (g.ftm ?? 0) + (g.oreb ?? 0) + (g.stl ?? 0) + (g.blk ?? 0) + (g.ast ?? 0) - ((g.fga ?? 0) - (g.fgm ?? 0)) - (g.tov ?? 0)), 0)

  const usgNum = myTeamOffEvents ? (playerOffEvents / myTeamOffEvents * 100) : null
  const pieNum = gameImpact ? (playerImpact / gameImpact * 100) : null

  // Use precomputed values if present on player object
  const perNum = player.value?.per ?? null
  const wsNum = player.value?.ws ?? null
  const bpmNum = player.value?.bpm ?? null
  const vorpNum = player.value?.vorp ?? null

  return [
    { abbr: 'eFG%',    val: efgNum == null ? '-' : fmtPct(efgNum),    label: t('pa_efg'),    tip: t('pa_efg_tip'),    metricKey: 'efgpct' },
    { abbr: 'AST/TOV', val: fmtDec(asttovNum),                       label: t('pa_asttov'), tip: t('pa_asttov_tip'), metricKey: 'asttov' },
    { abbr: '3P Rate', val: p3rateNum == null ? '-' : fmtPct(p3rateNum), label: t('pa_3prate'), tip: t('pa_3prate_tip'), metricKey: 'p3rate' },
    { abbr: 'Pts/FGA', val: ptsfgaNum == null ? '-' : ptsfgaNum.toFixed(2), label: t('pa_ptsfga'), tip: t('pa_ptsfga_tip'), metricKey: 'ptsfga' },
    { abbr: 'OREB%',   val: orbpNum == null ? '-' : fmtPct(orbpNum),   label: t('pa_orebp'),  tip: t('pa_orebp_tip'),  metricKey: 'orebp' },
    { abbr: 'Def',     val: fmtOne(defNum),                          label: t('pa_def'),    tip: t('pa_def_tip'),    metricKey: 'def' },
    { abbr: 'USG%',    val: usgNum == null ? '-' : fmtPct(usgNum),    label: t('adv_usg'),   tip: t('adv_usg_tip'),   metricKey: 'usg' },
    { abbr: 'PIE',     val: pieNum == null ? '-' : fmtPct(pieNum),    label: t('adv_pie'),   tip: t('adv_pie_tip'),   metricKey: 'pie' },
  ]
}

function total(key) {
  const gs = player.value?.games
  if (!gs?.length) return 0
  return gs.reduce((a, g) => a + (g[key] ?? 0), 0)
}
function matchLabel(id) { return matchLabels.value[id] || id }
</script>
