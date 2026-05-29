<template>
  <div class="page">
    <div class="section-header">比赛记录</div>

    <div v-if="loading" class="loading">Loading...</div>
    <div v-else-if="!matches.length" class="empty">暂无比赛记录</div>

    <div v-else class="gc-wrap">
      <div v-for="m in matches" :key="m.id" class="gc">

        <!-- header strip -->
        <div class="gc-header">
          <div>
            <span class="gc-round">{{ m.label }}</span>
            <span class="gc-date" style="margin-left:8px">{{ m.date }}</span>
          </div>
          <span class="gc-status final">FINAL</span>
        </div>

        <!-- main row: score (left) + leaders (right) -->
        <div class="gc-main">
          <!-- score -->
          <div class="gc-score-panel">
            <div class="gc-score-area">
              <div class="gc-row" :class="{ winner: m.team_a.score > m.team_b.score }">
                <div class="gc-dot black">黑</div>
                <div class="gc-tname">{{ m.team_a.name }}</div>
                <div class="gc-tscore">{{ m.team_a.score }}</div>
                <span class="gc-win-mark">▶</span>
              </div>
              <div class="gc-row" :class="{ winner: m.team_b.score > m.team_a.score }">
                <div class="gc-dot white">白</div>
                <div class="gc-tname">{{ m.team_b.name }}</div>
                <div class="gc-tscore">{{ m.team_b.score }}</div>
                <span class="gc-win-mark">▶</span>
              </div>
            </div>
            <div class="gc-footer">
              <div class="gc-mvp" v-if="m.mvp">
                <span class="gc-mvp-star">★</span>
                <span>MVP</span>
                <span class="gc-mvp-name">{{ playerName(m.mvp) }}</span>
              </div>
              <div v-else></div>
              <button
                class="gc-expand-btn"
                :class="{ active: expanded.has(m.id) }"
                @click="toggle(m.id)"
              >
                Box Score <span class="gc-expand-arrow">▾</span>
              </button>
            </div>
          </div>

          <!-- leaders -->
          <div class="gc-leaders">
            <div class="gc-leaders-title">Game Leaders</div>
            <div v-for="leader in topScorers(m)" :key="leader.pid" class="gc-leader">
              <span class="gc-leader-num">#{{ leader.num }}</span>
              <span class="gc-leader-name">
                <RouterLink :to="'/player/' + leader.pid">{{ leader.name }}</RouterLink>
              </span>
              <div class="gc-leader-stats">
                <div class="gc-stat"><span class="gc-stat-v">{{ leader.pts }}</span><span class="gc-stat-l">PTS</span></div>
                <div class="gc-stat"><span class="gc-stat-v">{{ leader.reb }}</span><span class="gc-stat-l">REB</span></div>
                <div class="gc-stat"><span class="gc-stat-v">{{ leader.ast }}</span><span class="gc-stat-l">AST</span></div>
              </div>
            </div>
          </div>
        </div>

        <!-- box score: full width -->
        <Transition name="slide">
          <div v-if="expanded.has(m.id)" class="gc-box">

            <!-- advanced stats -->
            <div class="gc-adv">
              <div class="gc-adv-header">
                <span class="gc-adv-title">进阶数据 &middot; {{ m.team_a.name }}</span>
                <a class="gc-adv-link" href="https://www.basketball-reference.com/about/glossary.html" target="_blank" rel="noopener noreferrer">指标说明 &nearr;</a>
              </div>
              <div class="gc-adv-row">
                <div v-for="s in advStats(m)" :key="s.abbr" class="gc-adv-stat">
                  <div class="gc-adv-abbr" :title="s.tip">{{ s.abbr }} <span class="gc-adv-q">ⓘ</span></div>
                  <div class="gc-adv-val" :class="s.cls">{{ s.val }}</div>
                  <div class="gc-adv-desc">{{ s.label }}</div>
                </div>
              </div>
              <div class="gc-adv-note">★ 回合数估算公式：出手数 &minus; 进攻篮板 + 失误（未计罚球）</div>
            </div>
            <!-- team A -->
            <div class="gc-box-team-label">{{ m.team_a.name }}</div>
            <table class="gc-box-table">
              <thead>
                <tr>
                  <th>球员</th>
                  <th>MIN</th><th>PTS</th><th>REB</th><th>AST</th>
                  <th>BLK</th><th>STL</th><th>TOV</th>
                  <th>FGM</th><th>FGA</th><th>FG%</th>
                  <th>3PM</th><th>3PA</th><th>3P%</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="pid in m.team_a.players" :key="pid">
                  <td><div class="gc-box-player"><span class="gc-box-num">#{{ playerNum(pid) }}</span><RouterLink :to="'/player/' + pid">{{ playerName(pid) }}</RouterLink></div></td>
                  <td>{{ gs(pid, m.id, 'min') }}</td>
                  <td class="gc-box-pts">{{ gs(pid, m.id, 'pts') }}</td>
                  <td>{{ gs(pid, m.id, 'reb') }}</td>
                  <td>{{ gs(pid, m.id, 'ast') }}</td>
                  <td>{{ gs(pid, m.id, 'blk') }}</td>
                  <td>{{ gs(pid, m.id, 'stl') }}</td>
                  <td>{{ gs(pid, m.id, 'tov') }}</td>
                  <td>{{ gs(pid, m.id, 'fgm') }}</td>
                  <td>{{ gs(pid, m.id, 'fga') }}</td>
                  <td>{{ fgp(pid, m.id) }}</td>
                  <td>{{ gs(pid, m.id, 'fg3m') }}</td>
                  <td>{{ gs(pid, m.id, 'fg3a') }}</td>
                  <td>{{ fg3(pid, m.id) }}</td>
                </tr>
              </tbody>
            </table>
            <!-- team B -->
            <div class="gc-box-team-label" style="margin-top:4px">{{ m.team_b.name }}</div>
            <table class="gc-box-table">
              <thead>
                <tr>
                  <th>球员</th>
                  <th>MIN</th><th>PTS</th><th>REB</th><th>AST</th>
                  <th>BLK</th><th>STL</th><th>TOV</th>
                  <th>FGM</th><th>FGA</th><th>FG%</th>
                  <th>3PM</th><th>3PA</th><th>3P%</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="pid in m.team_b.players" :key="pid">
                  <td><div class="gc-box-player"><span class="gc-box-num">#{{ playerNum(pid) }}</span><RouterLink :to="'/player/' + pid">{{ playerName(pid) }}</RouterLink></div></td>
                  <td>{{ gs(pid, m.id, 'min') }}</td>
                  <td class="gc-box-pts">{{ gs(pid, m.id, 'pts') }}</td>
                  <td>{{ gs(pid, m.id, 'reb') }}</td>
                  <td>{{ gs(pid, m.id, 'ast') }}</td>
                  <td>{{ gs(pid, m.id, 'blk') }}</td>
                  <td>{{ gs(pid, m.id, 'stl') }}</td>
                  <td>{{ gs(pid, m.id, 'tov') }}</td>
                  <td>{{ gs(pid, m.id, 'fgm') }}</td>
                  <td>{{ gs(pid, m.id, 'fga') }}</td>
                  <td>{{ fgp(pid, m.id) }}</td>
                  <td>{{ gs(pid, m.id, 'fg3m') }}</td>
                  <td>{{ gs(pid, m.id, 'fg3a') }}</td>
                  <td>{{ fg3(pid, m.id) }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </Transition>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { RouterLink } from 'vue-router'

const matches = ref([])
const players = ref([])
const loading = ref(true)
const expanded = ref(new Set())

onMounted(async () => {
  const [mr, pr] = await Promise.all([fetch('./data/matches.json'), fetch('./data/players.json')])
  matches.value = await mr.json()
  players.value = await pr.json()
  loading.value = false
})

function toggle(id) {
  const s = new Set(expanded.value)
  s.has(id) ? s.delete(id) : s.add(id)
  expanded.value = s
}

const fp = id => players.value.find(p => p.id === id)
const playerName = id => fp(id)?.name ?? id
const playerNum  = id => fp(id)?.number ?? '?'

function gs(pid, mid, key) {
  const g = fp(pid)?.games?.find(g => g.match_id === mid)
  return g ? (g[key] ?? '-') : '-'
}
function fgp(pid, mid) {
  const g = fp(pid)?.games?.find(g => g.match_id === mid)
  return g?.fga ? (g.fgm / g.fga * 100).toFixed(0) + '%' : '-'
}
function fg3(pid, mid) {
  const g = fp(pid)?.games?.find(g => g.match_id === mid)
  return g?.fg3a ? (g.fg3m / g.fg3a * 100).toFixed(0) + '%' : '-'
}
function topScorers(match, n = 5) {
  const pids = [...(match.team_a?.players ?? []), ...(match.team_b?.players ?? [])]
  return pids
    .map(pid => {
      const p = fp(pid)
      const g = p?.games?.find(g => g.match_id === match.id)
      if (!g) return null
      return { pid, name: p?.name ?? pid, num: p?.number ?? '?', pts: g.pts ?? 0, reb: g.reb ?? 0, ast: g.ast ?? 0 }
    })
    .filter(Boolean)
    .sort((a, b) => b.pts - a.pts)
    .slice(0, n)
}

function advStats(match) {
  const pids = match.team_a?.players ?? []
  let fgm = 0, fga = 0, fg3m = 0, oreb = 0, tov = 0
  for (const pid of pids) {
    const g = fp(pid)?.games?.find(g => g.match_id === match.id)
    if (!g) continue
    fgm  += g.fgm  ?? 0
    fga  += g.fga  ?? 0
    fg3m += g.fg3m ?? 0
    oreb += g.oreb ?? 0
    tov  += g.tov  ?? 0
  }
  const pts  = match.team_a.score
  const opp  = match.team_b.score
  const poss = Math.max(fga - oreb + tov, 1)
  const ort  = +(pts  / poss * 100).toFixed(1)
  const drt  = +(opp  / poss * 100).toFixed(1)
  const net  = +(ort - drt).toFixed(1)
  const efg  = fga  ? +((fgm + 0.5 * fg3m) / fga * 100).toFixed(1) : 0
  const tovp = +(tov / poss * 100).toFixed(1)
  const miss = fga - fgm
  const orbp = miss ? +(oreb / miss * 100).toFixed(1) : 0
  return [
    { abbr: 'ORtg',  val: ort,                         label: '进攻效率',   cls: '',                             tip: '进攻效率 — 每100回合得分，衡量进攻端产出效率' },
    { abbr: 'DRtg',  val: drt,                         label: '防守效率',   cls: '',                             tip: '防守效率 — 每100回合失分，数字越低越好' },
    { abbr: 'Net',   val: (net >= 0 ? '+' : '') + net, label: '净效率',     cls: net > 0 ? 'adv-pos' : net < 0 ? 'adv-neg' : '', tip: '净效率 — 进攻效率−防守效率，正数代表优势' },
    { abbr: 'eFG%',  val: efg + '%',                   label: '有效投篮率', cls: '',                             tip: 'eFG% — 修正三分球更高价值：(FGM+0.5×FG3M)/FGA' },
    { abbr: 'TOV%',  val: tovp + '%',                  label: '失误率',     cls: '',                             tip: 'TOV% — 失误占估算回合数的百分比' },
    { abbr: 'OREB%', val: orbp + '%',                  label: '进攻篮板率', cls: '',                             tip: 'OREB% — 进攻篮板 / 投篮未中次数，衡量二次进攻能力' },
  ]
}
</script>

<style scoped>
.slide-enter-active, .slide-leave-active { transition: max-height .22s ease, opacity .2s ease; overflow: hidden; }
.slide-enter-from, .slide-leave-to { max-height: 0; opacity: 0; }
.slide-enter-to, .slide-leave-from { max-height: 1200px; opacity: 1; }
</style>
