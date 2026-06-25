<template>
  <div class="page">
    <div class="section-header">{{ t('matches_title') }}</div>

    <!-- latest match photo banner -->
    <div class="mpb-carousel-wrap">
      <div class="mpb-carousel" ref="carousel" @scroll.passive="onScroll">

        <!-- slide 1 -->
        <div class="mpb-slide">
          <div class="mpb-photo-wrap">
            <img :src="baseUrl + 'pic/match/game3.png'" class="mpb-photo-img" alt="Game 3" />
            <!-- score overlay -->
            <div class="mpb-score-overlay" v-if="bannerMatch">
              <div class="mpb-so-team">
                <span class="mpb-so-name">{{ teamName(bannerMatch.team_a.name) }}</span>
                <span class="mpb-so-score" :class="{ winner: bannerMatch.team_a.score > bannerMatch.team_b.score }">{{ bannerMatch.team_a.score }}</span>
              </div>
              <span class="mpb-so-sep">—</span>
              <div class="mpb-so-team mpb-so-team--b">
                <span class="mpb-so-score" :class="{ winner: bannerMatch.team_b.score > bannerMatch.team_a.score }">{{ bannerMatch.team_b.score }}</span>
                <span class="mpb-so-name">{{ teamName(bannerMatch.team_b.name) }}</span>
              </div>
              <span class="mpb-so-final">FINAL</span>
            </div>
            <div class="mpb-photo-caption">
              <span class="mpb-label">{{ t('latest_label') }}</span>
              <div class="mpb-title">{{ t('latest_title') }}</div>
              <span class="mpb-sub">{{ t('latest_sub') }}</span>
            </div>
          </div>
        </div>

        <!-- slide 2: localized fan discussion -->
        <div class="mpb-slide">
          <div class="mpb-photo-wrap mpb-photo-wrap--news">
            <div class="mpb-news-emoji">🗣️</div>
            <div class="mpb-photo-caption">
              <span class="mpb-label mpb-label--gold">{{ t('news_label') }}</span>
              <div class="mpb-title mpb-title--gold">{{ t('news_title') }}</div>
              <span class="mpb-sub">{{ t('news_sub') }}</span>
            </div>
          </div>
        </div>

      </div>

      <!-- dot indicators -->
      <div class="mpb-dots">
        <span v-for="i in SLIDE_COUNT" :key="i" class="mpb-dot" :class="{ active: activeSlide === (i-1) }"></span>
      </div>
    </div>

    <div v-if="loading" class="loading">{{ t('loading') }}</div>
    <div v-else-if="!matches.length" class="empty">{{ t('no_data') }}</div>

    <div v-else class="gc-wrap">
      <div v-for="m in recentMatches" :key="m.id" class="gc">

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
                <div class="gc-tname">{{ teamName(m.team_a.name) }}</div>
                <div class="gc-tscore">{{ m.team_a.score }}</div>
                <span class="gc-win-mark">▶</span>
              </div>
              <div class="gc-row" :class="{ winner: m.team_b.score > m.team_a.score }">
                <div class="gc-dot white">白</div>
                <div class="gc-tname">{{ teamName(m.team_b.name) }}</div>
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
              <div class="gc-footer-actions">
                <button
                  v-if="hasVideo(m)"
                  class="gc-expand-btn"
                  :class="{ active: videoExpanded.has(m.id) }"
                  @click="toggleVideo(m.id)"
                >
                  {{ t('match_watch_video') }} <span class="gc-expand-arrow">▾</span>
                </button>
                <button
                  class="gc-expand-btn"
                  :class="{ active: expanded.has(m.id) }"
                  @click="toggle(m.id)"
                >
                  Box Score <span class="gc-expand-arrow">▾</span>
                </button>
              </div>
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

        <!-- match video -->
        <Transition name="slide">
          <div v-if="videoExpanded.has(m.id) && hasVideo(m)" class="gc-video">
            <div class="gc-video-wrap">
              <iframe
                :src="'https://www.youtube.com/embed/' + youtubeId(m.videoUrl)"
                :title="m.label + ' video'"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowfullscreen
                referrerpolicy="strict-origin-when-cross-origin"
              />
            </div>
          </div>
        </Transition>

        <!-- box score: full width -->
        <Transition name="slide">
          <div v-if="expanded.has(m.id)" class="gc-box">

            <!-- team A -->
            <div class="gc-box-team-label">{{ teamName(m.team_a.name) }}</div>
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
                <tr v-for="pid in m.team_a.players" :key="pid">
                  <td><div class="gc-box-player"><span class="gc-box-num">#{{ playerNum(pid) }}</span><RouterLink :to="'/player/' + pid">{{ playerName(pid) }}</RouterLink></div></td>
                  <td>{{ gs(pid, m.id, 'min') }}</td>
                  <td class="gc-box-pts">{{ gs(pid, m.id, 'pts') }}</td>
                  <td>{{ gs(pid, m.id, 'fgm') }}</td>
                  <td>{{ gs(pid, m.id, 'fga') }}</td>
                  <td>{{ fgp(pid, m.id) }}</td>
                  <td>{{ gs(pid, m.id, 'fg3m') }}</td>
                  <td>{{ gs(pid, m.id, 'fg3a') }}</td>
                  <td>{{ fg3(pid, m.id) }}</td>
                  <td>{{ gs(pid, m.id, 'reb') }}</td>
                  <td>{{ gs(pid, m.id, 'ast') }}</td>
                  <td>{{ gs(pid, m.id, 'blk') }}</td>
                  <td>{{ gs(pid, m.id, 'stl') }}</td>
                  <td>{{ gs(pid, m.id, 'tov') }}</td>
                </tr>
                <tr class="gc-total-row">
                  <td>{{ t('rnk_grp_total') }}</td>
                  <td>-</td>
                  <td class="gc-box-pts">{{ teamTotals(m, 'team_a').pts }}</td>
                  <td>{{ teamTotals(m, 'team_a').fgm }}</td>
                  <td>{{ teamTotals(m, 'team_a').fga }}</td>
                  <td>{{ teamTotals(m, 'team_a').fgPct }}</td>
                  <td>{{ teamTotals(m, 'team_a').fg3m }}</td>
                  <td>{{ teamTotals(m, 'team_a').fg3a }}</td>
                  <td>{{ teamTotals(m, 'team_a').fg3Pct }}</td>
                  <td>{{ teamTotals(m, 'team_a').reb }}</td>
                  <td>{{ teamTotals(m, 'team_a').ast }}</td>
                  <td>{{ teamTotals(m, 'team_a').blk }}</td>
                  <td>{{ teamTotals(m, 'team_a').stl }}</td>
                  <td>{{ teamTotals(m, 'team_a').tov }}</td>
                </tr>
              </tbody>
            </table>
            <!-- team B -->
            <div class="gc-box-team-label" style="margin-top:4px">{{ teamName(m.team_b.name) }}</div>
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
                <tr v-for="pid in m.team_b.players" :key="pid">
                  <td><div class="gc-box-player"><span class="gc-box-num">#{{ playerNum(pid) }}</span><RouterLink :to="'/player/' + pid">{{ playerName(pid) }}</RouterLink></div></td>
                  <td>{{ gs(pid, m.id, 'min') }}</td>
                  <td class="gc-box-pts">{{ gs(pid, m.id, 'pts') }}</td>
                  <td>{{ gs(pid, m.id, 'fgm') }}</td>
                  <td>{{ gs(pid, m.id, 'fga') }}</td>
                  <td>{{ fgp(pid, m.id) }}</td>
                  <td>{{ gs(pid, m.id, 'fg3m') }}</td>
                  <td>{{ gs(pid, m.id, 'fg3a') }}</td>
                  <td>{{ fg3(pid, m.id) }}</td>
                  <td>{{ gs(pid, m.id, 'reb') }}</td>
                  <td>{{ gs(pid, m.id, 'ast') }}</td>
                  <td>{{ gs(pid, m.id, 'blk') }}</td>
                  <td>{{ gs(pid, m.id, 'stl') }}</td>
                  <td>{{ gs(pid, m.id, 'tov') }}</td>
                </tr>
                <tr class="gc-total-row">
                  <td>{{ t('rnk_grp_total') }}</td>
                  <td>-</td>
                  <td class="gc-box-pts">{{ teamTotals(m, 'team_b').pts }}</td>
                  <td>{{ teamTotals(m, 'team_b').fgm }}</td>
                  <td>{{ teamTotals(m, 'team_b').fga }}</td>
                  <td>{{ teamTotals(m, 'team_b').fgPct }}</td>
                  <td>{{ teamTotals(m, 'team_b').fg3m }}</td>
                  <td>{{ teamTotals(m, 'team_b').fg3a }}</td>
                  <td>{{ teamTotals(m, 'team_b').fg3Pct }}</td>
                  <td>{{ teamTotals(m, 'team_b').reb }}</td>
                  <td>{{ teamTotals(m, 'team_b').ast }}</td>
                  <td>{{ teamTotals(m, 'team_b').blk }}</td>
                  <td>{{ teamTotals(m, 'team_b').stl }}</td>
                  <td>{{ teamTotals(m, 'team_b').tov }}</td>
                </tr>
              </tbody>
            </table>
            <!-- advanced stats -->
            <div class="gc-adv">
              <div class="gc-adv-header">
                <span class="gc-adv-title">{{ t('adv_section') }}</span>
                <a class="gc-adv-link" href="https://www.basketball-reference.com/about/glossary.html" target="_blank" rel="noopener noreferrer">{{ t('glossary_link') }} &nearr;</a>
              </div>
              <table class="gc-compare-table">
                <thead>
                  <tr>
                    <th>{{ t('match_stat_metric') }}</th>
                    <th>{{ teamName(m.team_a.name) }}</th>
                    <th>{{ teamName(m.team_b.name) }}</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="row in teamAdvancedRows(m)" :key="row.abbr">
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

      <!-- old games collapsible -->
      <div v-if="oldMatches.length" class="old-games-section">
        <button class="old-games-toggle" @click="showOldGames = !showOldGames">
          往期比赛 ({{ oldMatches.length }}场)
          <span class="old-games-arrow">{{ showOldGames ? '▴' : '▾' }}</span>
        </button>
        <Transition name="slide">
          <div v-if="showOldGames">
            <div v-for="m in oldMatches" :key="m.id" class="gc">

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
                    <div class="gc-footer-actions">
                      <button
                        v-if="hasVideo(m)"
                        class="gc-expand-btn"
                        :class="{ active: videoExpanded.has(m.id) }"
                        @click="toggleVideo(m.id)"
                      >
                        {{ t('match_watch_video') }} <span class="gc-expand-arrow">▾</span>
                      </button>
                      <button
                        class="gc-expand-btn"
                        :class="{ active: expanded.has(m.id) }"
                        @click="toggle(m.id)"
                      >
                        Box Score <span class="gc-expand-arrow">▾</span>
                      </button>
                    </div>
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

              <!-- match video -->
              <Transition name="slide">
                <div v-if="videoExpanded.has(m.id) && hasVideo(m)" class="gc-video">
                  <div class="gc-video-wrap">
                    <iframe
                      :src="'https://www.youtube.com/embed/' + youtubeId(m.videoUrl)"
                      :title="m.label + ' video'"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                      allowfullscreen
                      referrerpolicy="strict-origin-when-cross-origin"
                    />
                  </div>
                </div>
              </Transition>

              <!-- box score -->
              <Transition name="slide">
                <div v-if="expanded.has(m.id)" class="gc-box">
                  <div class="gc-box-team-label">{{ teamName(m.team_a.name) }}</div>
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
                      <tr v-for="pid in m.team_a.players" :key="pid">
                        <td><div class="gc-box-player"><span class="gc-box-num">#{{ playerNum(pid) }}</span><RouterLink :to="'/player/' + pid">{{ playerName(pid) }}</RouterLink></div></td>
                        <td>{{ gs(pid, m.id, 'min') }}</td>
                        <td class="gc-box-pts">{{ gs(pid, m.id, 'pts') }}</td>
                        <td>{{ gs(pid, m.id, 'fgm') }}</td>
                        <td>{{ gs(pid, m.id, 'fga') }}</td>
                        <td>{{ fgp(pid, m.id) }}</td>
                        <td>{{ gs(pid, m.id, 'fg3m') }}</td>
                        <td>{{ gs(pid, m.id, 'fg3a') }}</td>
                        <td>{{ fg3(pid, m.id) }}</td>
                        <td>{{ gs(pid, m.id, 'reb') }}</td>
                        <td>{{ gs(pid, m.id, 'ast') }}</td>
                        <td>{{ gs(pid, m.id, 'blk') }}</td>
                        <td>{{ gs(pid, m.id, 'stl') }}</td>
                        <td>{{ gs(pid, m.id, 'tov') }}</td>
                      </tr>
                      <tr class="gc-total-row">
                        <td>{{ t('rnk_grp_total') }}</td>
                        <td>-</td>
                        <td class="gc-box-pts">{{ teamTotals(m, 'team_a').pts }}</td>
                        <td>{{ teamTotals(m, 'team_a').fgm }}</td>
                        <td>{{ teamTotals(m, 'team_a').fga }}</td>
                        <td>{{ teamTotals(m, 'team_a').fgPct }}</td>
                        <td>{{ teamTotals(m, 'team_a').fg3m }}</td>
                        <td>{{ teamTotals(m, 'team_a').fg3a }}</td>
                        <td>{{ teamTotals(m, 'team_a').fg3Pct }}</td>
                        <td>{{ teamTotals(m, 'team_a').reb }}</td>
                        <td>{{ teamTotals(m, 'team_a').ast }}</td>
                        <td>{{ teamTotals(m, 'team_a').blk }}</td>
                        <td>{{ teamTotals(m, 'team_a').stl }}</td>
                        <td>{{ teamTotals(m, 'team_a').tov }}</td>
                      </tr>
                    </tbody>
                  </table>
                  <div class="gc-box-team-label" style="margin-top:4px">{{ teamName(m.team_b.name) }}</div>
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
                      <tr v-for="pid in m.team_b.players" :key="pid">
                        <td><div class="gc-box-player"><span class="gc-box-num">#{{ playerNum(pid) }}</span><RouterLink :to="'/player/' + pid">{{ playerName(pid) }}</RouterLink></div></td>
                        <td>{{ gs(pid, m.id, 'min') }}</td>
                        <td class="gc-box-pts">{{ gs(pid, m.id, 'pts') }}</td>
                        <td>{{ gs(pid, m.id, 'fgm') }}</td>
                        <td>{{ gs(pid, m.id, 'fga') }}</td>
                        <td>{{ fgp(pid, m.id) }}</td>
                        <td>{{ gs(pid, m.id, 'fg3m') }}</td>
                        <td>{{ gs(pid, m.id, 'fg3a') }}</td>
                        <td>{{ fg3(pid, m.id) }}</td>
                        <td>{{ gs(pid, m.id, 'reb') }}</td>
                        <td>{{ gs(pid, m.id, 'ast') }}</td>
                        <td>{{ gs(pid, m.id, 'blk') }}</td>
                        <td>{{ gs(pid, m.id, 'stl') }}</td>
                        <td>{{ gs(pid, m.id, 'tov') }}</td>
                      </tr>
                      <tr class="gc-total-row">
                        <td>{{ t('rnk_grp_total') }}</td>
                        <td>-</td>
                        <td class="gc-box-pts">{{ teamTotals(m, 'team_b').pts }}</td>
                        <td>{{ teamTotals(m, 'team_b').fgm }}</td>
                        <td>{{ teamTotals(m, 'team_b').fga }}</td>
                        <td>{{ teamTotals(m, 'team_b').fgPct }}</td>
                        <td>{{ teamTotals(m, 'team_b').fg3m }}</td>
                        <td>{{ teamTotals(m, 'team_b').fg3a }}</td>
                        <td>{{ teamTotals(m, 'team_b').fg3Pct }}</td>
                        <td>{{ teamTotals(m, 'team_b').reb }}</td>
                        <td>{{ teamTotals(m, 'team_b').ast }}</td>
                        <td>{{ teamTotals(m, 'team_b').blk }}</td>
                        <td>{{ teamTotals(m, 'team_b').stl }}</td>
                        <td>{{ teamTotals(m, 'team_b').tov }}</td>
                      </tr>
                    </tbody>
                  </table>
                  <div class="gc-adv">
                    <div class="gc-adv-header">
                      <span class="gc-adv-title">{{ t('adv_section') }}</span>
                      <a class="gc-adv-link" href="https://www.basketball-reference.com/about/glossary.html" target="_blank" rel="noopener noreferrer">{{ t('glossary_link') }} &nearr;</a>
                    </div>
                    <table class="gc-compare-table">
                      <thead>
                        <tr>
                          <th>{{ t('match_stat_metric') }}</th>
                          <th>{{ teamName(m.team_a.name) }}</th>
                          <th>{{ teamName(m.team_b.name) }}</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr v-for="row in teamAdvancedRows(m)" :key="row.abbr">
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
          </div>
        </Transition>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { RouterLink } from 'vue-router'
import { t, lang } from '../i18n.js'
import { getMatchesViewData } from '../dataService.js'

const baseUrl = import.meta.env.BASE_URL
const matches = ref([])
const players = ref([])
const loading = ref(true)
const expanded = ref(new Set())
const videoExpanded = ref(new Set())

const showOldGames = ref(false)

const recentMatches = computed(() => matches.value.filter(m => m.displayGroup === 'latest'))
const oldMatches = computed(() => matches.value.filter(m => m.displayGroup === 'old'))

// Choose a match to show in the banner: prefer Game 6 if present, otherwise the most recent
const bannerMatch = computed(() => {
  const g6 = matches.value.find(m => (m.label || '').toString().toLowerCase().includes('game 6') || m.id === 'game6')
  return g6 || recentMatches.value[0] || null
})

const carousel = ref(null)
const activeSlide = ref(0)
const SLIDE_COUNT = 2
let autoTimer = null

function onScroll() {
  if (!carousel.value) return
  const idx = Math.round(carousel.value.scrollLeft / carousel.value.offsetWidth)
  activeSlide.value = idx
}

function goToSlide(idx) {
  if (!carousel.value) return
  carousel.value.scrollTo({ left: idx * carousel.value.offsetWidth, behavior: 'smooth' })
}

function startAuto() {
  autoTimer = setInterval(() => {
    const next = (activeSlide.value + 1) % SLIDE_COUNT
    goToSlide(next)
  }, 10000)
}

onMounted(async () => {
  const data = await getMatchesViewData()
  matches.value = data.matches
  players.value = data.players
  loading.value = false
  startAuto()
})

onUnmounted(() => {
  clearInterval(autoTimer)
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

function hasVideo(m) {
  return !!youtubeId(m?.videoUrl)
}

const fp = id => players.value.find(p => p.id === id)
const playerName = id => fp(id)?.name ?? id
const playerNum  = id => fp(id)?.number ?? '?'

function teamName(name) {
  if (lang.value === 'ja') {
    const map = {
      '雪谷火箭': '雪谷ロケット',
      '爸爸': 'パパチーム'
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

function teamTotals(match, sideKey) {
  const pids = match[sideKey]?.players ?? []
  let pts = 0, reb = 0, ast = 0, stl = 0, blk = 0, tov = 0, fgm = 0, fga = 0, fg3m = 0, fg3a = 0, oreb = 0
  for (const pid of pids) {
    const g = fp(pid)?.games?.find(g => g.match_id === match.id)
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

  pts = match[sideKey]?.score ?? pts

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

function teamAdvancedStats(match, sideKey) {
  const totals = teamTotals(match, sideKey)
  const opponentKey = sideKey === 'team_a' ? 'team_b' : 'team_a'
  const opp = teamTotals(match, opponentKey)
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

function teamAdvancedRows(match) {
  const a = teamAdvancedStats(match, 'team_a')
  const b = teamAdvancedStats(match, 'team_b')
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
