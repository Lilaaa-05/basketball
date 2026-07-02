const DATASET_URL = import.meta.env.BASE_URL + 'data/generated/dataset.json'

let datasetPromise = null

export async function loadDataset() {
  if (!datasetPromise) {
    datasetPromise = fetch(DATASET_URL).then(res => {
      if (!res.ok) throw new Error(`Failed to load generated dataset: ${res.status}`)
      return res.json()
    })
  }
  return datasetPromise
}

function toLegacyGameStat(stat) {
  return {
    match_id: stat.eventId,
    eventId: stat.eventId,
    side: stat.side,
    teamId: stat.teamId,
    min: stat.min,
    pts: stat.pts,
    reb: stat.reb,
    ast: stat.ast,
    stl: stat.stl,
    blk: stat.blk,
    tov: stat.tov,
    fgm: stat.fgm,
    fga: stat.fga,
    fg2m: stat.fg2m,
    fg2a: stat.fg2a,
    fg3m: stat.fg3m,
    fg3a: stat.fg3a,
    oreb: stat.oreb,
  }
}

function isPublicKeepbPlayer(player) {
  return player.primaryTeamId === 'keepb' && player.isPublic && player.playerStatus !== 'inactive'
}

function toLegacyPlayer(player, games) {
  return {
    id: player.playerId,
    name: player.displayName,
    nickname: player.nickname,
    number: player.number,
    position: player.position,
    primaryTeamId: player.primaryTeamId,
    playerStatus: player.playerStatus,
    isPublic: player.isPublic,
    avatar: player.avatar,
    height: player.height,
    weight: player.weight,
    joined: player.joined,
    wingspan: player.wingspan,
    standing_reach: player.standingReach,
    school: player.school,
    contract: player.contract,
    idol: player.idol,
    mold: player.mold,
    tags: player.tags ?? [],
    honors: player.honors ?? [],
    games,
  }
}

function officialEventsById(dataset) {
  return Object.fromEntries(
    Object.values(dataset.eventsById ?? {})
      .filter(event => event.eventType === 'official_match')
      .map(event => [event.eventId, event])
  )
}

function officialStatsByPlayer(dataset, officialEventIds) {
  const gamesByPlayer = new Map()
  for (const stat of dataset.gameStats ?? []) {
    if (!officialEventIds.has(stat.eventId)) continue
    if (!gamesByPlayer.has(stat.playerId)) gamesByPlayer.set(stat.playerId, [])
    gamesByPlayer.get(stat.playerId).push(toLegacyGameStat(stat))
  }
  return gamesByPlayer
}

export async function getMatchesViewData() {
  const dataset = await loadDataset()
  const events = Object.values(dataset.eventsById ?? {})
    .filter(event => event.eventType === 'official_match' && event.displayGroup !== 'hidden')
    .sort((a, b) => {
      const dateCmp = String(b.eventDate).localeCompare(String(a.eventDate))
      return dateCmp || String(b.eventId).localeCompare(String(a.eventId), undefined, { numeric: true })
    })

  const statsByEvent = new Map()
  for (const stat of dataset.gameStats ?? []) {
    if (!statsByEvent.has(stat.eventId)) statsByEvent.set(stat.eventId, [])
    statsByEvent.get(stat.eventId).push(stat)
  }

  const matches = events.map(event => {
    const eventStats = statsByEvent.get(event.eventId) ?? []
    const teamA = dataset.teamsById?.[event.teamAId]
    const teamB = dataset.teamsById?.[event.teamBId]
    const teamAPlayers = eventStats.filter(stat => stat.side === 'a').map(stat => stat.playerId)
    const teamBPlayers = eventStats.filter(stat => stat.side === 'b').map(stat => stat.playerId)

    return {
      id: event.eventId,
      date: event.eventDate,
      label: event.title,
      displayGroup: event.displayGroup,
      hasBoxScore: eventStats.length > 0,
      team_a: {
        name: teamA?.teamNameZh ?? event.teamAId,
        score: event.teamAScore,
        players: teamAPlayers,
      },
      team_b: {
        name: teamB?.teamNameZh ?? event.teamBId,
        score: event.teamBScore,
        players: teamBPlayers,
      },
      result: event.winSide === 'a' ? 'team_a' : event.winSide === 'b' ? 'team_b' : 'draw',
      mvp: event.mvpPlayerId,
      videoUrl: event.videoUrl,
    }
  })

  const gamesByPlayer = new Map()
  for (const stat of dataset.gameStats ?? []) {
    if (!gamesByPlayer.has(stat.playerId)) gamesByPlayer.set(stat.playerId, [])
    gamesByPlayer.get(stat.playerId).push(toLegacyGameStat(stat))
  }

  const players = Object.values(dataset.playersById ?? {}).map(player => ({
    id: player.playerId,
    name: player.displayName,
    nickname: player.nickname,
    number: player.number,
    position: player.position,
    avatar: player.avatar,
    isRosterMember: player.primaryTeamId === 'keepb',
    playerType: player.primaryTeamId === 'keepb' ? 'keepb' : player.primaryTeamId === 'gbc' ? 'g.b.c.' : '',
    games: gamesByPlayer.get(player.playerId) ?? [],
  }))

  return { matches, players }
}

export async function getTrainingViewData() {
  const dataset = await loadDataset()
  const events = Object.values(dataset.eventsById ?? {})
    .filter(event => event.eventType !== 'official_match' && event.displayGroup !== 'hidden')
    .sort((a, b) => {
      const dateCmp = String(b.eventDate).localeCompare(String(a.eventDate))
      return dateCmp || String(b.eventId).localeCompare(String(a.eventId), undefined, { numeric: true })
    })

  const statsByEvent = new Map()
  for (const stat of dataset.gameStats ?? []) {
    if (!statsByEvent.has(stat.eventId)) statsByEvent.set(stat.eventId, [])
    statsByEvent.get(stat.eventId).push(stat)
  }

  const trainings = events.map(event => {
    const eventStats = statsByEvent.get(event.eventId) ?? []
    const teamA = dataset.teamsById?.[event.teamAId]
    const teamB = dataset.teamsById?.[event.teamBId]
    const teamAPlayers = eventStats.filter(stat => stat.side === 'a').map(stat => stat.playerId)
    const teamBPlayers = eventStats.filter(stat => stat.side === 'b').map(stat => stat.playerId)

    return {
      id: event.eventId,
      date: event.eventDate,
      label: event.title,
      displayGroup: event.displayGroup,
      hasBoxScore: eventStats.length > 0,
      team_a: {
        name: teamA?.teamNameZh ?? event.teamAId,
        score: event.teamAScore,
        players: teamAPlayers,
      },
      team_b: {
        name: teamB?.teamNameZh ?? event.teamBId,
        score: event.teamBScore,
        players: teamBPlayers,
      },
      result: event.winSide === 'a' ? 'team_a' : event.winSide === 'b' ? 'team_b' : 'draw',
      mvp: event.mvpPlayerId,
      videoUrl: event.videoUrl,
    }
  })

  const gamesByPlayer = new Map()
  for (const stat of dataset.gameStats ?? []) {
    if (!gamesByPlayer.has(stat.playerId)) gamesByPlayer.set(stat.playerId, [])
    gamesByPlayer.get(stat.playerId).push(toLegacyGameStat(stat))
  }

  const players = Object.values(dataset.playersById ?? {}).map(player => ({
    id: player.playerId,
    name: player.displayName,
    nickname: player.nickname,
    number: player.number,
    position: player.position,
    avatar: player.avatar,
    isRosterMember: player.primaryTeamId === 'keepb',
    playerType: player.primaryTeamId === 'keepb' ? 'keepb' : player.primaryTeamId === 'gbc' ? 'g.b.c.' : '',
    games: gamesByPlayer.get(player.playerId) ?? [],
  }))

  return { trainings, players }
}

export async function getPlayersViewData() {
  const dataset = await loadDataset()
  const officialEventIds = new Set(
    Object.values(dataset.eventsById ?? {})
      .filter(event => event.eventType === 'official_match')
      .map(event => event.eventId)
  )

  const gamesByPlayer = new Map()
  for (const stat of dataset.gameStats ?? []) {
    if (!officialEventIds.has(stat.eventId)) continue
    if (!gamesByPlayer.has(stat.playerId)) gamesByPlayer.set(stat.playerId, [])
    gamesByPlayer.get(stat.playerId).push(toLegacyGameStat(stat))
  }

  return Object.values(dataset.playersById ?? {})
    .filter(isPublicKeepbPlayer)
    .map(player => toLegacyPlayer(player, gamesByPlayer.get(player.playerId) ?? []))
}

export async function getRankingsViewData() {
  const dataset = await loadDataset()
  const eventsById = officialEventsById(dataset)
  const officialEventIds = new Set(Object.keys(eventsById))
  const officialGameStats = (dataset.gameStats ?? []).filter(stat => officialEventIds.has(stat.eventId))

  const gamesByPlayer = new Map()
  for (const stat of officialGameStats) {
    if (!gamesByPlayer.has(stat.playerId)) gamesByPlayer.set(stat.playerId, [])
    gamesByPlayer.get(stat.playerId).push(toLegacyGameStat(stat))
  }

  const players = Object.values(dataset.playersById ?? {})
    .filter(isPublicKeepbPlayer)
    .map(player => ({
      id: player.playerId,
      name: player.displayName,
      number: player.number,
      position: player.position,
      primaryTeamId: player.primaryTeamId,
      playerStatus: player.playerStatus,
      isPublic: player.isPublic,
      games: gamesByPlayer.get(player.playerId) ?? [],
    }))

  return {
    players,
    eventsById,
    gameStats: officialGameStats,
  }
}

export async function getPlayerViewData(playerId) {
  const dataset = await loadDataset()
  const eventsById = officialEventsById(dataset)
  const officialEventIds = new Set(Object.keys(eventsById))
  const officialGameStats = (dataset.gameStats ?? []).filter(stat => officialEventIds.has(stat.eventId))
  const gamesByPlayer = officialStatsByPlayer(dataset, officialEventIds)
  const allPlayers = Object.values(dataset.playersById ?? {})
    .map(player => toLegacyPlayer(player, gamesByPlayer.get(player.playerId) ?? []))

  const player = allPlayers.find(p => p.id === playerId) ?? null
  const matchLabels = Object.fromEntries(
    Object.values(eventsById).map(event => [event.eventId, event.title || event.eventId])
  )

  return {
    player,
    allPlayers,
    eventsById,
    gameStats: officialGameStats,
    matchLabels,
  }
}

export async function getTeamViewData(teamId = 'keepb') {
  const dataset = await loadDataset()
  const eventsById = officialEventsById(dataset)
  const officialEventIds = new Set(Object.keys(eventsById))
  const officialGameStats = (dataset.gameStats ?? []).filter(stat => officialEventIds.has(stat.eventId))
  const gamesByPlayer = officialStatsByPlayer(dataset, officialEventIds)

  const players = Object.values(dataset.playersById ?? {})
    .map(player => toLegacyPlayer(player, gamesByPlayer.get(player.playerId) ?? []))

  const statsByEvent = new Map()
  for (const stat of officialGameStats) {
    if (!statsByEvent.has(stat.eventId)) statsByEvent.set(stat.eventId, [])
    statsByEvent.get(stat.eventId).push(stat)
  }

  const matches = Object.values(eventsById)
    .filter(event => event.teamAId === teamId || event.teamBId === teamId)
    .sort((a, b) => {
      const dateCmp = String(b.eventDate).localeCompare(String(a.eventDate))
      return dateCmp || String(b.eventId).localeCompare(String(a.eventId), undefined, { numeric: true })
    })
    .map(event => {
      const targetIsA = event.teamAId === teamId
      const targetSide = targetIsA ? 'a' : 'b'
      const opponentSide = targetIsA ? 'b' : 'a'
      const opponentTeamId = targetIsA ? event.teamBId : event.teamAId
      const targetScore = targetIsA ? event.teamAScore : event.teamBScore
      const opponentScore = targetIsA ? event.teamBScore : event.teamAScore
      const targetTeam = dataset.teamsById?.[teamId]
      const opponentTeam = dataset.teamsById?.[opponentTeamId]
      const eventStats = statsByEvent.get(event.eventId) ?? []

      return {
        id: event.eventId,
        eventId: event.eventId,
        date: event.eventDate,
        label: event.title,
        teamId,
        opponentTeamId,
        sourceSide: targetSide,
        team_a: {
          name: targetTeam?.teamNameZh ?? teamId,
          score: targetScore,
          players: eventStats
            .filter(stat => stat.teamId === teamId && stat.side === targetSide)
            .map(stat => stat.playerId),
        },
        team_b: {
          name: opponentTeam?.teamNameZh ?? opponentTeamId,
          score: opponentScore,
          players: eventStats
            .filter(stat => stat.teamId === opponentTeamId && stat.side === opponentSide)
            .map(stat => stat.playerId),
        },
        result: event.winSide === targetSide ? 'team_a' : event.winSide === 'draw' ? 'draw' : 'team_b',
        mvp: event.mvpPlayerId,
        videoUrl: event.videoUrl,
      }
    })

  return {
    team: dataset.teamsById?.[teamId] ?? null,
    matches,
    players,
  }
}
