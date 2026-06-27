<template>
  <nav class="nav">
    <div class="nav-brand">🏀 Hoop<em>Stats</em></div>
    <RouterLink class="nav-link" to="/matches">{{ t('nav_matches') }}</RouterLink>
    <RouterLink class="nav-link" to="/training">{{ t('nav_training') }}</RouterLink>
    <RouterLink class="nav-link" to="/players">{{ t('nav_players') }}</RouterLink>
    <RouterLink class="nav-link" to="/team">{{ t('nav_team') }}</RouterLink>
    <RouterLink class="nav-link" to="/rankings">{{ t('nav_rankings') }}</RouterLink>
    <button class="lang-btn" @click="toggleLang">{{ lang === 'zh' ? '日本語' : '中文' }}</button>
  </nav>
  <RouterView />
</template>

<script setup>
import { RouterLink, RouterView } from 'vue-router'
import { lang, toggleLang, t } from './i18n.js'
</script>
