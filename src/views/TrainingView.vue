<template>
  <div class="page">
    <div class="section-header">{{ t('training_title') }}</div>

    <div v-if="loading" class="loading">{{ t('loading') }}</div>
    <div v-else-if="!trainings.length" class="empty">{{ t('training_no_data') }}</div>

    <div v-else class="gc-wrap">
      <EventRecordCard
        v-for="event in recentTrainings"
        :key="event.id"
        :event="event"
        :players="players"
        :expanded="expanded.has(event.id)"
        :video-expanded="videoExpanded.has(event.id)"
        @toggle="toggle"
        @toggle-video="toggleVideo"
      />

      <div v-if="oldTrainings.length" class="old-games-section">
        <button class="old-games-toggle" @click="showOldTrainings = !showOldTrainings">
          {{ t('training_old_title') }} ({{ oldTrainings.length }}{{ t('games_suffix') }})
          <span class="old-games-arrow">{{ showOldTrainings ? '▴' : '▾' }}</span>
        </button>
        <Transition name="slide">
          <div v-if="showOldTrainings">
            <EventRecordCard
              v-for="event in oldTrainings"
              :key="event.id"
              :event="event"
              :players="players"
              :expanded="expanded.has(event.id)"
              :video-expanded="videoExpanded.has(event.id)"
              @toggle="toggle"
              @toggle-video="toggleVideo"
            />
          </div>
        </Transition>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { t } from '../i18n.js'
import { getTrainingViewData } from '../dataService.js'
import EventRecordCard from './EventRecordCard.vue'

const trainings = ref([])
const players = ref([])
const loading = ref(true)
const expanded = ref(new Set())
const videoExpanded = ref(new Set())
const showOldTrainings = ref(false)

const recentTrainings = computed(() => trainings.value.filter(event => event.displayGroup === 'latest'))
const oldTrainings = computed(() => trainings.value.filter(event => event.displayGroup === 'old'))

onMounted(async () => {
  const data = await getTrainingViewData()
  trainings.value = data.trainings
  players.value = data.players
  loading.value = false
})

function toggle(id) {
  const s = new Set(expanded.value)
  s.has(id) ? s.delete(id) : s.add(id)
  expanded.value = s
}

function toggleVideo(id) {
  const s = new Set(videoExpanded.value)
  s.has(id) ? s.delete(id) : s.add(id)
  videoExpanded.value = s
}
</script>

<style scoped>
.slide-enter-active, .slide-leave-active { transition: max-height .22s ease, opacity .2s ease; overflow: hidden; }
.slide-enter-from, .slide-leave-to { max-height: 0; opacity: 0; }
.slide-enter-to, .slide-leave-from { max-height: 1200px; opacity: 1; }
</style>
