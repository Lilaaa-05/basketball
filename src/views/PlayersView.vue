<template>
  <div class="page">
    <div class="section-header">球员名单</div>

    <div v-if="loading" class="loading">Loading...</div>
    <div v-else-if="!players.length" class="empty">暂无球员数据</div>

    <div v-else class="roster-grid">
      <div
        v-for="p in players"
        :key="p.id"
        class="rc"
        @click="$router.push('/player/' + p.id)"
      >
        <!-- hero: large bright jersey number -->
        <div class="rc-hero">
          <span class="rc-pos-chip">{{ p.position }}</span>
          <div class="rc-shadow-num">{{ p.number }}</div>
          <div class="rc-jersey">{{ p.number }}</div>
        </div>

        <!-- body: name + profile + stats -->
        <div class="rc-body">
          <div class="rc-name">{{ p.name }}</div>

          <div class="rc-profile">
            <div class="rc-pi">
              <span class="rc-pv">{{ p.height || '-' }}</span>
              <span class="rc-pl">身高</span>
            </div>
            <div class="rc-pi">
              <span class="rc-pv">{{ p.weight || '-' }}</span>
              <span class="rc-pl">体重</span>
            </div>
            <div class="rc-pi">
              <span class="rc-pv">{{ p.games?.length ?? 0 }}</span>
              <span class="rc-pl">出场</span>
            </div>
          </div>

          <div class="rc-stats">
            <div class="rc-stat">
              <span class="rc-sv">{{ avg(p, 'pts') }}</span>
              <span class="rc-sl">得分</span>
            </div>
            <div class="rc-stat">
              <span class="rc-sv">{{ avg(p, 'reb') }}</span>
              <span class="rc-sl">篮板</span>
            </div>
            <div class="rc-stat">
              <span class="rc-sv">{{ avg(p, 'ast') }}</span>
              <span class="rc-sl">助攻</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'

const players = ref([])
const loading = ref(true)

onMounted(async () => {
  const res = await fetch('./data/players.json')
  const all = await res.json()
  players.value = all.sort((a, b) => {
    const pa = a.games?.reduce((s, g) => s + (g.pts ?? 0), 0) / (a.games?.length || 1)
    const pb = b.games?.reduce((s, g) => s + (g.pts ?? 0), 0) / (b.games?.length || 1)
    return pb - pa
  })
  loading.value = false
})

function avg(player, key) {
  const gs = player.games
  if (!gs?.length) return '-'
  return (gs.reduce((a, g) => a + (g[key] ?? 0), 0) / gs.length).toFixed(1)
}
</script>
