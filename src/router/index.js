import { createRouter, createWebHashHistory } from 'vue-router'
import MatchesView from '../views/MatchesView.vue'
import PlayersView from '../views/PlayersView.vue'
import PlayerView from '../views/PlayerView.vue'
import RankingsView from '../views/RankingsView.vue'
import TeamView from '../views/TeamView.vue'

const routes = [
  { path: '/', redirect: '/matches' },
  { path: '/matches', component: MatchesView },
  { path: '/players', component: PlayersView },
  { path: '/player/:id', component: PlayerView },
  { path: '/rankings', component: RankingsView },
  { path: '/team', component: TeamView },
]

export default createRouter({
  history: createWebHashHistory(),
  routes,
  scrollBehavior: () => ({ top: 0 }),
})
