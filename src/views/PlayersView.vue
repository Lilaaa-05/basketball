<template>
  <div class="page">
    <div class="players-toolbar">
      <div class="section-header">{{ t('players_title') }}</div>
      <div class="players-mode-switch">
        <button
          class="players-mode-btn"
          :class="{ active: statMode === 'avg' }"
          @click="statMode = 'avg'"
        >
          {{ t('players_mode_avg') }}
        </button>
        <button
          class="players-mode-btn"
          :class="{ active: statMode === 'per48' }"
          @click="statMode = 'per48'"
        >
          {{ t('players_mode_per48') }}
        </button>
      </div>
    </div>

    <div v-if="loading" class="loading">{{ t('loading') }}</div>
    <div v-else-if="!displayPlayers.length" class="empty">{{ t('no_players') }}</div>

    <div v-else class="roster-grid">
      <div
        v-for="p in displayPlayers"
        :key="p.id"
        class="rc"
        @click="$router.push('/player/' + p.id)"
      >
        <!-- hero: large bright jersey number -->
        <div class="rc-hero">
          <span class="rc-pos-chip">{{ p.position }}</span>
          <div class="rc-shadow-num">{{ p.number }}</div>
          <img v-if="p.avatar" :src="baseUrl + p.avatar" class="rc-avatar" :alt="p.name" />
          <div class="rc-jersey" :class="{ 'rc-jersey--hidden': p.avatar }">{{ p.number }}</div>
        </div>

        <!-- body: name + profile + stats -->
        <div class="rc-body">
          <div class="rc-name">{{ p.name }}</div>

          <div class="rc-profile">
            <div class="rc-pi">
              <span class="rc-pv">{{ p.height || '-' }}</span>
              <span class="rc-pl">{{ t('rc_height') }}</span>
            </div>
            <div class="rc-pi">
              <span class="rc-pv">{{ p.weight || '-' }}</span>
              <span class="rc-pl">{{ t('rc_weight') }}</span>
            </div>
            <div class="rc-pi">
              <span class="rc-pv">{{ p.games?.length ?? 0 }}</span>
              <span class="rc-pl">{{ t('rc_games') }}</span>
            </div>
          </div>

          <div class="rc-stats">
            <div class="rc-stat">
              <span class="rc-sv">{{ statValue(p, 'pts') }}</span>
              <span class="rc-sl">{{ t('rc_pts') }}</span>
            </div>
            <div class="rc-stat">
              <span class="rc-sv">{{ statValue(p, 'reb') }}</span>
              <span class="rc-sl">{{ t('rc_reb') }}</span>
            </div>
            <div class="rc-stat">
              <span class="rc-sv">{{ statValue(p, 'ast') }}</span>
              <span class="rc-sl">{{ t('rc_ast') }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref, onMounted } from 'vue'
import { t } from '../i18n.js'

const baseUrl = import.meta.env.BASE_URL
const players = ref([])
const loading = ref(true)
const statMode = ref('avg')

const displayPlayers = computed(() => {
  return [...players.value].sort((a, b) => numStat(b, 'pts') - numStat(a, 'pts'))
})

onMounted(async () => {
  const res = await fetch(import.meta.env.BASE_URL + 'data/players.json')
  players.value = await res.json()
  loading.value = false
})

function avg(player, key) {
  const gs = player.games
  if (!gs?.length) return '-'
  return (gs.reduce((a, g) => a + (g[key] ?? 0), 0) / gs.length).toFixed(1)
}

function per48(player, key) {
  const gs = player.games
  if (!gs?.length) return '-'
  const avgVal = gs.reduce((a, g) => a + (g[key] ?? 0), 0) / gs.length
  return (avgVal * 2).toFixed(1)
}

function statValue(player, key) {
  if (statMode.value === 'per48') return per48(player, key)
  return avg(player, key)
}

function numStat(player, key) {
  if (statMode.value === 'per48') {
    const gs = player.games
    if (!gs?.length) return 0
    const avgVal = gs.reduce((a, g) => a + (g[key] ?? 0), 0) / gs.length
    return avgVal * 2
  }
  const gs = player.games
  if (!gs?.length) return 0
  return gs.reduce((a, g) => a + (g[key] ?? 0), 0) / gs.length
}
</script>
