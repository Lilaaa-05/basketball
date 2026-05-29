<template>
  <div class="page">
    <RouterLink class="back-link" to="/players">← 球员列表</RouterLink>

    <div v-if="loading" class="loading">Loading...</div>
    <div v-else-if="!player" class="empty">球员不存在</div>

    <template v-else>
      <!-- NBA-style hero -->
      <div class="player-hero">
        <div class="ph-top">
          <!-- left: name + tags -->
          <div class="ph-left">
            <div class="ph-team-line">HoopStats · 球员档案</div>
            <div class="ph-name">{{ player.name }}</div>
            <div class="ph-tags">
              <span class="ph-tag pos">{{ player.position }}</span>
              <span v-if="player.height" class="ph-tag">{{ player.height }}</span>
              <span v-if="player.weight" class="ph-tag">{{ player.weight }}</span>
              <span class="ph-tag">{{ player.games.length }} 场出场</span>
              <span v-for="tag in player.tags" :key="tag" class="ph-tag player-tag">{{ tag }}</span>
            </div>
          </div>
          <!-- right: jersey number panel -->
          <div class="ph-right">
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
              <div class="phs-label">场均得分</div>
            </div>
          </div>
          <div class="phs">
            <div class="phs-num">{{ avg('reb') }}</div>
            <div class="phs-meta">
              <div class="phs-abbr">RPG</div>
              <div class="phs-label">场均篮板</div>
            </div>
          </div>
          <div class="phs">
            <div class="phs-num">{{ avg('ast') }}</div>
            <div class="phs-meta">
              <div class="phs-abbr">APG</div>
              <div class="phs-label">场均助攻</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Tabs -->
      <div class="tabs">
        <button class="tab" :class="{ active: tab === 'avg' }"   @click="tab = 'avg'">总体平均</button>
        <button class="tab" :class="{ active: tab === 'games' }" @click="tab = 'games'">比赛数据</button>
        <button class="tab" :class="{ active: tab === 'info' }"  @click="tab = 'info'">资料</button>
      </div>

      <!-- 总体平均 -->
      <div v-if="tab === 'avg'">
        <div class="stats-section-label">基础数据</div>
        <div class="avg-grid">
          <div class="avg-item"><div class="ag-abbr">PTS</div><div class="ag-num">{{ avg('pts') }}</div><div class="ag-desc">得分</div></div>
          <div class="avg-item"><div class="ag-abbr">REB</div><div class="ag-num">{{ avg('reb') }}</div><div class="ag-desc">篮板</div></div>
          <div class="avg-item"><div class="ag-abbr">AST</div><div class="ag-num">{{ avg('ast') }}</div><div class="ag-desc">助攻</div></div>
          <div class="avg-item"><div class="ag-abbr">STL</div><div class="ag-num">{{ avg('stl') }}</div><div class="ag-desc">抢断</div></div>
          <div class="avg-item"><div class="ag-abbr">BLK</div><div class="ag-num">{{ avg('blk') }}</div><div class="ag-desc">盖帽</div></div>
          <div class="avg-item"><div class="ag-abbr">TOV</div><div class="ag-num">{{ avg('tov') }}</div><div class="ag-desc">失误</div></div>
          <div class="avg-item"><div class="ag-abbr">OREB</div><div class="ag-num">{{ avg('oreb') }}</div><div class="ag-desc">进攻篮板</div></div>
          <div class="avg-item"><div class="ag-abbr">DREB</div><div class="ag-num">{{ avgDreb() }}</div><div class="ag-desc">防守篮板</div></div>
        </div>
        <div class="stats-section-label" style="margin-top:24px">高阶数据</div>
        <div class="avg-grid">
          <div class="avg-item"><div class="ag-abbr">FG%</div><div class="ag-num">{{ avgFgPct() }}</div><div class="ag-desc">投篮命中率</div></div>
          <div class="avg-item"><div class="ag-abbr">2P%</div><div class="ag-num">{{ avgFg2Pct() }}</div><div class="ag-desc">两分命中率</div></div>
          <div class="avg-item"><div class="ag-abbr">3P%</div><div class="ag-num">{{ avgFg3Pct() }}</div><div class="ag-desc">三分命中率</div></div>
          <div class="avg-item"><div class="ag-abbr">eFG%</div><div class="ag-num">{{ avgEfgPct() }}</div><div class="ag-desc">有效命中率</div></div>
          <div class="avg-item"><div class="ag-abbr">FGM</div><div class="ag-num">{{ avg('fgm') }}</div><div class="ag-desc">投篮命中</div></div>
          <div class="avg-item"><div class="ag-abbr">FGA</div><div class="ag-num">{{ avg('fga') }}</div><div class="ag-desc">投篮出手</div></div>
          <div class="avg-item"><div class="ag-abbr">3PM</div><div class="ag-num">{{ avg('fg3m') }}</div><div class="ag-desc">三分命中</div></div>
          <div class="avg-item"><div class="ag-abbr">3PA</div><div class="ag-num">{{ avg('fg3a') }}</div><div class="ag-desc">三分出手</div></div>
        </div>

        <!-- 进阶数据 panel -->
        <div class="gc-adv" style="margin-top:24px">
          <div class="gc-adv-header">
            <span class="gc-adv-title">进阶数据</span>
            <a class="gc-adv-link" href="https://www.basketball-reference.com/about/glossary.html" target="_blank" rel="noopener noreferrer">指标说明 &nearr;</a>
          </div>
          <div class="gc-adv-row" style="grid-template-columns:repeat(3,1fr)">
            <div v-for="s in playerAdvStats()" :key="s.abbr" class="gc-adv-stat">
              <div class="gc-adv-abbr" :title="s.tip">{{ s.abbr }} <span class="gc-adv-q">ⓘ</span></div>
              <div class="gc-adv-val">{{ s.val }}</div>
              <div class="gc-adv-desc">{{ s.label }}</div>
            </div>
          </div>
        </div>

        <!-- 总数据 -->
        <div class="stats-section-label" style="margin-top:24px">生涯总数据</div>
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

        <div class="sub-note">场均数据 · {{ player.games.length }} 场出场</div>
      </div>

      <!-- 比赛数据 -->
      <div v-if="tab === 'games'">
        <div class="table-wrap">
          <table class="g-table">
            <thead>
              <tr>
                <th>比赛</th>
                <th>PTS</th><th>REB</th><th>OREB</th><th>AST</th>
                <th>STL</th><th>BLK</th><th>TOV</th>
                <th>FGM</th><th>FGA</th><th>FG%</th>
                <th>3PM</th><th>3PA</th><th>3P%</th><th>eFG%</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="g in [...player.games].reverse()" :key="g.match_id">
                <td>{{ matchLabel(g.match_id) }}</td>
                <td class="g-pts">{{ g.pts }}</td>
                <td>{{ g.reb }}</td>
                <td>{{ g.oreb ?? '-' }}</td>
                <td>{{ g.ast }}</td>
                <td>{{ g.stl }}</td><td>{{ g.blk }}</td><td>{{ g.tov }}</td>
                <td>{{ g.fgm }}</td><td>{{ g.fga }}</td>
                <td>{{ g.fga ? (g.fgm / g.fga * 100).toFixed(0) + '%' : '-' }}</td>
                <td>{{ g.fg3m }}</td><td>{{ g.fg3a }}</td>
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
          <div class="ig-item"><span class="ig-key">姓名</span><span class="ig-val">{{ player.name }}</span></div>
          <div class="ig-item"><span class="ig-key">球衣号码</span><span class="ig-val">#{{ player.number }}</span></div>
          <div class="ig-item"><span class="ig-key">位置</span><span class="ig-val">{{ player.position }}</span></div>
          <div class="ig-item"><span class="ig-key">出场场次</span><span class="ig-val">{{ player.games.length }} 场</span></div>
          <div class="ig-item"><span class="ig-key">身高</span><span class="ig-val">{{ player.height || '—' }}</span></div>
          <div class="ig-item"><span class="ig-key">体重</span><span class="ig-val">{{ player.weight || '—' }}</span></div>
          <div class="ig-item"><span class="ig-key">臂展</span><span class="ig-val">{{ player.wingspan || '—' }}</span></div>
          <div class="ig-item"><span class="ig-key">站立摸高</span><span class="ig-val">{{ player.standing_reach || '—' }}</span></div>
          <div class="ig-item"><span class="ig-key">加入时间</span><span class="ig-val">{{ player.joined || '—' }}</span></div>
          <div class="ig-item"><span class="ig-key">母校</span><span class="ig-val">{{ player.school || '—' }}</span></div>
          <div class="ig-item"><span class="ig-key">偶像</span><span class="ig-val">{{ player.idol || '—' }}</span></div>
        </div>
        <template v-if="player.mold">
          <div class="stats-section-label" style="margin-top:24px">模版</div>
          <div class="mold-card">
            <span class="mold-icon">🏀</span>
            <span class="mold-name">{{ player.mold }}</span>
          </div>
        </template>
        <template v-if="player.contract">
          <div class="stats-section-label" style="margin-top:24px">合同</div>
          <div class="contract-card">
            <span class="contract-icon">📋</span>
            <span class="contract-text">{{ player.contract }}</span>
          </div>
        </template>
        <template v-if="player.honors?.length">
          <div class="stats-section-label" style="margin-top:24px">荣誉</div>
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

const route  = useRoute()
const player = ref(null)
const loading = ref(true)
const tab = ref('avg')

async function load() {
  loading.value = true
  const res = await fetch('./data/players.json')
  const all = await res.json()
  player.value = all.find(p => p.id === route.params.id) ?? null
  loading.value = false
}
onMounted(load)
watch(() => route.params.id, load)

function avg(key) {
  const gs = player.value?.games
  if (!gs?.length) return '-'
  return (gs.reduce((a, g) => a + (g[key] ?? 0), 0) / gs.length).toFixed(1)
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
  return (gs.reduce((a, g) => a + ((g.reb ?? 0) - (g.oreb ?? 0)), 0) / gs.length).toFixed(1)
}

function playerAdvStats() {
  const gs = player.value?.games
  if (!gs?.length) return []
  const sum = k => gs.reduce((a, g) => a + (g[k] ?? 0), 0)
  const fgm = sum('fgm'), fga = sum('fga'), fg3m = sum('fg3m')
  const ast  = sum('ast'), tov = sum('tov'), oreb = sum('oreb')
  const miss = fga - fgm
  const efg  = fga  ? ((fgm + 0.5 * fg3m) / fga * 100).toFixed(1) + '%' : '-'
  const atr  = tov  ? (ast / tov).toFixed(2) : ast > 0 ? '∞' : '-'
  const r3   = fga  ? (sum('fg3a') / fga * 100).toFixed(1) + '%' : '-'
  const pefa = fga  ? (sum('pts')  / fga).toFixed(2) : '-'
  const orbp = miss ? (oreb / miss * 100).toFixed(1) + '%' : '-'
  const def  = (sum('stl') + sum('blk')) / gs.length
  return [
    { abbr: 'eFG%',  val: efg,              label: '有效投篮率',   tip: 'eFG% — 修正三分球价值：(FGM+0.5×FG3M)/FGA' },
    { abbr: 'AST/TOV', val: atr,            label: '助攻失误比',   tip: 'AST/TOV — 助攻与失误的比值，越高越好' },
    { abbr: '3P Rate', val: r3,             label: '三分出手率',   tip: '三分出手占总投篮比例 = 3PA / FGA' },
    { abbr: 'Pts/FGA', val: pefa,           label: '得分效率',     tip: '每次出手得分 = PTS / FGA' },
    { abbr: 'OREB%', val: orbp,             label: '进攻篮板率',   tip: 'OREB% = 进攻篮板 / 自身投篮未中次数' },
    { abbr: 'Def',   val: def.toFixed(1),   label: '综合防守/场',  tip: '场均抢断 + 盖帽合计' },
  ]
}

function total(key) {
  const gs = player.value?.games
  if (!gs?.length) return 0
  return gs.reduce((a, g) => a + (g[key] ?? 0), 0)
}
const matchLabels = {}
onMounted(async () => {
  const mr = await fetch('./data/matches.json')
  const ms = await mr.json()
  ms.forEach(m => { matchLabels[m.id] = m.label || m.id })
})
function matchLabel(id) { return matchLabels[id] || id }
</script>
