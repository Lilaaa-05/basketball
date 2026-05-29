<template>
  <nav class="nav">
    <div class="nav-brand">🏀 Hoop<em>Stats</em></div>
    <RouterLink class="nav-link" to="/matches">比赛</RouterLink>
    <RouterLink class="nav-link" to="/players">球员</RouterLink>
  </nav>
  <RouterView />
</template>

<script setup>
import { RouterLink, RouterView } from 'vue-router'
</script>
