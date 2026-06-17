<template>
  <div class="page">
  
    <h1 class="section-header">{{ t('rnk_title') }}      
    <button class="rnk-pill rnk-p48" :class="{ active: per48 }" @click="per48 = !per48">{{ t('players_mode_per48') }}</button>
    </h1>

    <!-- Group selector -->
    <div class="rnk-groups">
      <button
        v-for="g in groups"
        :key="g.key"
        class="rnk-group-btn"
        :class="{ active: activeGroup === g.key }"
        @click="selectGroup(g.key)"
      >{{ t(g.labelKey) }}</button>
    </div>

    <!-- Stat pill selector -->
    <div class="rnk-pills">
      <button
        v-for="s in currentStats"
        :key="s.key"
        class="rnk-pill"
        :class="{ active: activeStat === s.key }"
        @click="activeStat = s.key"
      >{{ t(s.labelKey) }}</button>
    </div>

    <!-- Ranking list -->
    <div v-if="loading" class="rnk-loading">{{ t('loading') }}</div>
    <div v-else class="rnk-list">
      <div
        v-for="(row, i) in ranked"
        :key="row.id"
        class="rnk-row"
        :class="{ 'rnk-row--medal': i < 3 }"
        @click="$router.push('/player/' + row.id)"
      >
        <div class="rnk-pos" :class="['rnk-pos--' + (i + 1)]">{{ i + 1 }}</div>
        <div class="rnk-info">
          <span class="rnk-name">{{ row.name }}</span>
          <span class="rnk-sub">{{ t('rnk_games') }} {{ row.n }}　#{{ row.number }}　{{ row.position }}</span>
        </div>
        <div class="rnk-bar-wrap">
          <div class="rnk-bar" :style="{ width: barWidth(row.val) + '%' }"></div>
        </div>
        <div class="rnk-val">{{ formatVal(row.val) }}</div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { t, lang } from '../i18n.js'

const loading = ref(true)
const players = ref([])
const per48 = ref(false)

onMounted(async () => {
  const res = await fetch(import.meta.env.BASE_URL + 'data/players.json')
  players.value = await res.json()
  loading.value = false
})

// ── stat definitions ────────────────────────────────────────
const groups = [
  { key: 'avg',   labelKey: 'rnk_grp_avg' },
  { key: 'pct',   labelKey: 'rnk_grp_pct' },
  { key: 'total', labelKey: 'rnk_grp_total' },
]

const statsByGroup = {
  avg: [
    { key: 'ppg',  labelKey: 'rnk_ppg',  fmt: 'dec', asc: false },
    { key: 'rpg',  labelKey: 'rnk_rpg',  fmt: 'dec', asc: false },
    { key: 'apg',  labelKey: 'rnk_apg',  fmt: 'dec', asc: false },
    { key: 'spg',  labelKey: 'rnk_spg',  fmt: 'dec', asc: false },
    { key: 'bpg',  labelKey: 'rnk_bpg',  fmt: 'dec', asc: false },
    { key: 'topg', labelKey: 'rnk_topg', fmt: 'dec', asc: true  },
  ],
  pct: [
    { key: 'fgpct',  labelKey: 'rnk_fgpct',  fmt: 'pct', asc: false },
    { key: 'fg3pct', labelKey: 'rnk_fg3pct', fmt: 'pct', asc: false },
    { key: 'efgpct', labelKey: 'rnk_efgpct', fmt: 'pct', asc: false },
  ],
  total: [
    { key: 'pts', labelKey: 'rnk_pts', fmt: 'int', asc: false },
    { key: 'reb', labelKey: 'rnk_reb', fmt: 'int', asc: false },
    { key: 'ast', labelKey: 'rnk_ast', fmt: 'int', asc: false },
  ],
}

const activeGroup = ref('avg')
const activeStat  = ref('ppg')

const currentStats = computed(() => statsByGroup[activeGroup.value])
const currentStatDef = computed(() => currentStats.value.find(s => s.key === activeStat.value) || currentStats.value[0])

function selectGroup(key) {
  activeGroup.value = key
  activeStat.value = statsByGroup[key][0].key
}

// ── compute per-player stats ────────────────────────────────
function computeStats(p) {
  const g = p.games || []
  const n = g.length
  if (!n) return null
  const sum = k => g.reduce((s, x) => s + (x[k] || 0), 0)
  const fgm = sum('fgm'), fga = sum('fga')
  const fg3m = sum('fg3m'), fg3a = sum('fg3a')
  const scale = per48.value ? 2 : 1
  return {
    id:       p.id,
    name:     p.name,
    number:   p.number,
    position: p.position,
    n,
    ppg:    (sum('pts') / n) * scale,
    rpg:    (sum('reb') / n) * scale,
    apg:    (sum('ast') / n) * scale,
    spg:    (sum('stl') / n) * scale,
    bpg:    (sum('blk') / n) * scale,
    topg:   (sum('tov') / n) * scale,
    fgpct:  fga  > 0 ? fgm / fga  : 0,
    fg3pct: fg3a > 0 ? fg3m / fg3a : 0,
    efgpct: fga  > 0 ? (fgm + 0.5 * fg3m) / fga : 0,
    pts: sum('pts'),
    reb: sum('reb'),
    ast: sum('ast'),
  }
}

function isRosterMember(player) {
  return player.isRosterMember !== false
}

const allStats = computed(() => players.value.filter(isRosterMember).map(computeStats).filter(Boolean))

const ranked = computed(() => {
  const def = currentStatDef.value
  const key = def.key
  const asc = def.asc
  return [...allStats.value]
    .map(s => ({ ...s, val: s[key] ?? 0 }))
    .sort((a, b) => asc ? a.val - b.val : b.val - a.val)
})

function barWidth(val) {
  const vals = ranked.value.map(r => r.val)
  const max = Math.max(...vals)
  const min = Math.min(...vals)
  if (max === min) return 100
  const def = currentStatDef.value
  // for ascending stats (lower=better), the leader gets full bar
  return def.asc
    ? ((max - val) / (max - min)) * 85 + 15
    : max > 0 ? (val / max) * 85 + 15 : 15
}

function formatVal(v) {
  const def = currentStatDef.value
  if (def.fmt === 'pct') return (v * 100).toFixed(1) + '%'
  if (def.fmt === 'int') return v.toFixed(0)
  return v.toFixed(1)
}
</script>
