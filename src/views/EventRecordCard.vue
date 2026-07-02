<template>
  <div class="gc">
    <div v-if="!hasBoxScore(event)" class="gc-video-only-header">
      <div class="gc-video-only-title">
        <span class="gc-round">{{ event.label }}</span>
        <span class="gc-date">{{ event.date }}</span>
      </div>
      <button
        v-if="hasVideo(event)"
        class="gc-expand-btn"
        :class="{ active: videoExpanded }"
        @click="$emit('toggle-video', event.id)"
      >
        {{ t('match_watch_video') }} <span class="gc-expand-arrow">▾</span>
      </button>
    </div>

    <template v-else>
    <div class="gc-header">
      <div>
        <span class="gc-round">{{ event.label }}</span>
        <span class="gc-date" style="margin-left:8px">{{ event.date }}</span>
      </div>
      <span class="gc-status final">FINAL</span>
    </div>

    <div class="gc-main">
      <div class="gc-score-panel">
        <div class="gc-score-area">
          <div class="gc-row" :class="{ winner: event.team_a.score > event.team_b.score }">
            <div class="gc-dot black">黑</div>
            <div class="gc-tname">{{ teamName(event.team_a.name) }}</div>
            <div class="gc-tscore">{{ event.team_a.score }}</div>
            <span class="gc-win-mark">▶</span>
          </div>
          <div class="gc-row" :class="{ winner: event.team_b.score > event.team_a.score }">
            <div class="gc-dot white">白</div>
            <div class="gc-tname">{{ teamName(event.team_b.name) }}</div>
            <div class="gc-tscore">{{ event.team_b.score }}</div>
            <span class="gc-win-mark">▶</span>
          </div>
        </div>
        <div class="gc-footer">
          <div class="gc-mvp" v-if="event.mvp">
            <span class="gc-mvp-star">★</span>
            <span>MVP</span>
            <span class="gc-mvp-name">{{ playerName(event.mvp) }}</span>
          </div>
          <div v-else></div>
          <div class="gc-footer-actions">
            <button
              v-if="hasVideo(event)"
              class="gc-expand-btn"
              :class="{ active: videoExpanded }"
              @click="$emit('toggle-video', event.id)"
            >
              {{ t('match_watch_video') }} <span class="gc-expand-arrow">▾</span>
            </button>
            <button
              class="gc-expand-btn"
              :class="{ active: expanded }"
              @click="$emit('toggle', event.id)"
            >
              Box Score <span class="gc-expand-arrow">▾</span>
            </button>
          </div>
        </div>
      </div>

      <div class="gc-leaders">
        <div class="gc-leaders-title">Game Leaders</div>
        <div v-for="leader in topScorers(event)" :key="leader.pid" class="gc-leader">
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
    </template>

    <Transition name="slide">
      <div v-if="videoExpanded && hasVideo(event)" class="gc-video">
        <div class="gc-video-wrap">
          <iframe
            :src="'https://www.youtube.com/embed/' + youtubeId(event.videoUrl)"
            :title="event.label + ' video'"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowfullscreen
            referrerpolicy="strict-origin-when-cross-origin"
          />
        </div>
      </div>
    </Transition>

    <Transition name="slide">
      <div v-if="expanded && hasBoxScore(event)" class="gc-box">
        <div class="gc-box-team-label">{{ teamName(event.team_a.name) }}</div>
        <div class="gc-table-scroll">
        <table class="gc-box-table">
          <thead>
            <tr>
              <th>{{ t('match_th_player') }}</th>
              <th>MIN</th><th>PTS</th>
              <th>FGM</th><th>FGA</th><th>FG%</th>
              <th>3PM</th><th>3PA</th><th>3P%</th>
              <th>REB</th><th>AST</th><th>BLK</th><th>STL</th><th>TOV</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="pid in event.team_a.players" :key="pid">
              <td><div class="gc-box-player"><span class="gc-box-num">#{{ playerNum(pid) }}</span><RouterLink :to="'/player/' + pid">{{ playerName(pid) }}</RouterLink></div></td>
              <td>{{ gs(pid, event.id, 'min') }}</td>
              <td class="gc-box-pts">{{ gs(pid, event.id, 'pts') }}</td>
              <td>{{ gs(pid, event.id, 'fgm') }}</td>
              <td>{{ gs(pid, event.id, 'fga') }}</td>
              <td>{{ fgp(pid, event.id) }}</td>
              <td>{{ gs(pid, event.id, 'fg3m') }}</td>
              <td>{{ gs(pid, event.id, 'fg3a') }}</td>
              <td>{{ fg3(pid, event.id) }}</td>
              <td>{{ gs(pid, event.id, 'reb') }}</td>
              <td>{{ gs(pid, event.id, 'ast') }}</td>
              <td>{{ gs(pid, event.id, 'blk') }}</td>
              <td>{{ gs(pid, event.id, 'stl') }}</td>
              <td>{{ gs(pid, event.id, 'tov') }}</td>
            </tr>
            <tr class="gc-total-row">
              <td>{{ t('rnk_grp_total') }}</td>
              <td>-</td>
              <td class="gc-box-pts">{{ teamTotals(event, 'team_a').pts }}</td>
              <td>{{ teamTotals(event, 'team_a').fgm }}</td>
              <td>{{ teamTotals(event, 'team_a').fga }}</td>
              <td>{{ teamTotals(event, 'team_a').fgPct }}</td>
              <td>{{ teamTotals(event, 'team_a').fg3m }}</td>
              <td>{{ teamTotals(event, 'team_a').fg3a }}</td>
              <td>{{ teamTotals(event, 'team_a').fg3Pct }}</td>
              <td>{{ teamTotals(event, 'team_a').reb }}</td>
              <td>{{ teamTotals(event, 'team_a').ast }}</td>
              <td>{{ teamTotals(event, 'team_a').blk }}</td>
              <td>{{ teamTotals(event, 'team_a').stl }}</td>
              <td>{{ teamTotals(event, 'team_a').tov }}</td>
            </tr>
          </tbody>
        </table>
        </div>

        <div class="gc-box-team-label" style="margin-top:4px">{{ teamName(event.team_b.name) }}</div>
        <div class="gc-table-scroll">
        <table class="gc-box-table">
          <thead>
            <tr>
              <th>{{ t('match_th_player') }}</th>
              <th>MIN</th><th>PTS</th>
              <th>FGM</th><th>FGA</th><th>FG%</th>
              <th>3PM</th><th>3PA</th><th>3P%</th>
              <th>REB</th><th>AST</th><th>BLK</th><th>STL</th><th>TOV</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="pid in event.team_b.players" :key="pid">
              <td><div class="gc-box-player"><span class="gc-box-num">#{{ playerNum(pid) }}</span><RouterLink :to="'/player/' + pid">{{ playerName(pid) }}</RouterLink></div></td>
              <td>{{ gs(pid, event.id, 'min') }}</td>
              <td class="gc-box-pts">{{ gs(pid, event.id, 'pts') }}</td>
              <td>{{ gs(pid, event.id, 'fgm') }}</td>
              <td>{{ gs(pid, event.id, 'fga') }}</td>
              <td>{{ fgp(pid, event.id) }}</td>
              <td>{{ gs(pid, event.id, 'fg3m') }}</td>
              <td>{{ gs(pid, event.id, 'fg3a') }}</td>
              <td>{{ fg3(pid, event.id) }}</td>
              <td>{{ gs(pid, event.id, 'reb') }}</td>
              <td>{{ gs(pid, event.id, 'ast') }}</td>
              <td>{{ gs(pid, event.id, 'blk') }}</td>
              <td>{{ gs(pid, event.id, 'stl') }}</td>
              <td>{{ gs(pid, event.id, 'tov') }}</td>
            </tr>
            <tr class="gc-total-row">
              <td>{{ t('rnk_grp_total') }}</td>
              <td>-</td>
              <td class="gc-box-pts">{{ teamTotals(event, 'team_b').pts }}</td>
              <td>{{ teamTotals(event, 'team_b').fgm }}</td>
              <td>{{ teamTotals(event, 'team_b').fga }}</td>
              <td>{{ teamTotals(event, 'team_b').fgPct }}</td>
              <td>{{ teamTotals(event, 'team_b').fg3m }}</td>
              <td>{{ teamTotals(event, 'team_b').fg3a }}</td>
              <td>{{ teamTotals(event, 'team_b').fg3Pct }}</td>
              <td>{{ teamTotals(event, 'team_b').reb }}</td>
              <td>{{ teamTotals(event, 'team_b').ast }}</td>
              <td>{{ teamTotals(event, 'team_b').blk }}</td>
              <td>{{ teamTotals(event, 'team_b').stl }}</td>
              <td>{{ teamTotals(event, 'team_b').tov }}</td>
            </tr>
          </tbody>
        </table>
        </div>

        <div class="gc-adv">
          <div class="gc-adv-header">
            <span class="gc-adv-title">{{ t('adv_section') }}</span>
            <a class="gc-adv-link" href="https://www.basketball-reference.com/about/glossary.html" target="_blank" rel="noopener noreferrer">{{ t('glossary_link') }} &nearr;</a>
          </div>
          <table class="gc-compare-table">
            <thead>
              <tr>
                <th>{{ t('match_stat_metric') }}</th>
                <th>{{ teamName(event.team_a.name) }}</th>
                <th>{{ teamName(event.team_b.name) }}</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="row in teamAdvancedRows(event)" :key="row.abbr">
                <td><span class="gc-compare-abbr" :title="row.tip">{{ row.abbr }} <span class="gc-adv-q">ⓘ</span></span><span class="gc-compare-label">{{ row.label }}</span></td>
                <td :class="row.aCls">{{ row.a }}</td>
                <td :class="row.bCls">{{ row.b }}</td>
              </tr>
            </tbody>
          </table>
          <div class="gc-adv-note">★ {{ t('adv_note') }}</div>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup>
import { RouterLink } from 'vue-router'
import { t, lang } from '../i18n.js'

const props = defineProps({
  event: { type: Object, required: true },
  players: { type: Array, required: true },
  expanded: { type: Boolean, default: false },
  videoExpanded: { type: Boolean, default: false },
})

defineEmits(['toggle', 'toggle-video'])

function youtubeId(url) {
  if (!url || typeof url !== 'string') return null
  const u = url.trim()
  try {
    const parsed = new URL(u)
    const host = parsed.hostname.replace(/^www\./, '')
    if (host === 'youtu.be') {
      const id = parsed.pathname.slice(1).split('/')[0]
      return id || null
    }
    if (host === 'youtube.com' || host === 'm.youtube.com') {
      if (parsed.pathname.startsWith('/embed/')) {
        const id = parsed.pathname.slice(7).split('/')[0]
        return id || null
      }
      const v = parsed.searchParams.get('v')
      return v || null
    }
  } catch {
    return null
  }
  return null
}

function hasVideo(event) {
  return !!youtubeId(event?.videoUrl)
}

function hasBoxScore(event) {
  return event?.hasBoxScore !== false
}

const fp = id => props.players.find(p => p.id === id)
const playerName = id => fp(id)?.name ?? id
const playerNum = id => fp(id)?.number ?? '?'

function teamName(name) {
  if (lang.value === 'ja') {
    const map = {
      '雪谷火箭': '雪谷ロケット',
      '爸爸': 'パパチーム',
    }
    return map[name] ?? name
  }
  return name
}

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

function topScorers(event, n = 5) {
  const pids = [...(event.team_a?.players ?? []), ...(event.team_b?.players ?? [])]
  return pids
    .map(pid => {
      const p = fp(pid)
      const g = p?.games?.find(g => g.match_id === event.id)
      if (!g) return null
      return { pid, name: p?.name ?? pid, num: p?.number ?? '?', pts: g.pts ?? 0, reb: g.reb ?? 0, ast: g.ast ?? 0 }
    })
    .filter(Boolean)
    .sort((a, b) => b.pts - a.pts)
    .slice(0, n)
}

function teamTotals(event, sideKey) {
  const pids = event[sideKey]?.players ?? []
  let pts = 0, reb = 0, ast = 0, stl = 0, blk = 0, tov = 0, fgm = 0, fga = 0, fg3m = 0, fg3a = 0, oreb = 0
  for (const pid of pids) {
    const g = fp(pid)?.games?.find(g => g.match_id === event.id)
    if (!g) continue
    pts  += g.pts  ?? 0
    reb  += g.reb  ?? 0
    ast  += g.ast  ?? 0
    stl  += g.stl  ?? 0
    blk  += g.blk  ?? 0
    tov  += g.tov  ?? 0
    fgm  += g.fgm  ?? 0
    fga  += g.fga  ?? 0
    fg3m += g.fg3m ?? 0
    fg3a += g.fg3a ?? 0
    oreb += g.oreb ?? 0
  }

  pts = event[sideKey]?.score ?? pts

  return {
    pts,
    reb,
    ast,
    stl,
    blk,
    tov,
    fgm,
    fga,
    fg3m,
    fg3a,
    oreb,
    fgPct: percent(fgm, fga, 1),
    fg3Pct: percent(fg3m, fg3a, 1),
  }
}

function teamAdvancedStats(event, sideKey) {
  const totals = teamTotals(event, sideKey)
  const opponentKey = sideKey === 'team_a' ? 'team_b' : 'team_a'
  const opp = teamTotals(event, opponentKey)
  const poss = Math.max(totals.fga - totals.oreb + totals.tov, 1)
  const ort = +(totals.pts / poss * 100).toFixed(1)
  const drt = +(opp.pts / poss * 100).toFixed(1)
  const net = +(ort - drt).toFixed(1)
  const efg = totals.fga ? +((totals.fgm + 0.5 * totals.fg3m) / totals.fga * 100).toFixed(1) : 0
  const tovp = +(totals.tov / poss * 100).toFixed(1)
  const miss = totals.fga - totals.fgm
  const orbp = miss ? +(totals.oreb / miss * 100).toFixed(1) : 0

  return { ort, drt, net, efg, tovp, orbp }
}

function teamAdvancedRows(event) {
  const a = teamAdvancedStats(event, 'team_a')
  const b = teamAdvancedStats(event, 'team_b')
  return [
    { abbr: 'ORtg', label: t('adv_ort'), tip: t('adv_ort_tip'), a: a.ort, b: b.ort },
    { abbr: 'DRtg', label: t('adv_drt'), tip: t('adv_drt_tip'), a: a.drt, b: b.drt },
    { abbr: 'Net', label: t('adv_net'), tip: t('adv_net_tip'), a: signed(a.net), b: signed(b.net), aCls: valueClass(a.net), bCls: valueClass(b.net) },
    { abbr: 'eFG%', label: t('adv_efg'), tip: t('adv_efg_tip'), a: a.efg + '%', b: b.efg + '%' },
    { abbr: 'TOV%', label: t('adv_tov'), tip: t('adv_tov_tip'), a: a.tovp + '%', b: b.tovp + '%' },
    { abbr: 'OREB%', label: t('adv_oreb'), tip: t('adv_oreb_tip'), a: a.orbp + '%', b: b.orbp + '%' },
  ]
}

function percent(made, attempts, digits = 0) {
  return attempts ? (made / attempts * 100).toFixed(digits) + '%' : '-'
}

function signed(value) {
  return (value >= 0 ? '+' : '') + value
}

function valueClass(value) {
  return value > 0 ? 'adv-pos' : value < 0 ? 'adv-neg' : ''
}
</script>

<style scoped>
.slide-enter-active, .slide-leave-active { transition: max-height .22s ease, opacity .2s ease; overflow: hidden; }
.slide-enter-from, .slide-leave-to { max-height: 0; opacity: 0; }
.slide-enter-to, .slide-leave-from { max-height: 1200px; opacity: 1; }
</style>
