import fs from 'node:fs'
import path from 'node:path'
import process from 'node:process'

const root = process.cwd()
const sourceDir = path.join(root, 'data', 'source')
const outputDir = path.join(root, 'public', 'data', 'generated')
const logDir = path.join(root, 'data', 'generated', 'logs')

const sourceFiles = {
  teams: path.join(sourceDir, 'teams.csv'),
  players: path.join(sourceDir, 'players.csv'),
  events: path.join(sourceDir, 'events.csv'),
  gameStats: path.join(sourceDir, 'game_stats.csv'),
}

const requiredHeaders = {
  teams: ['team_id', 'team_type', 'team_name_zh', 'team_name_ja', 'is_primary', 'notes'],
  players: ['player_id', 'display_name', 'nickname', 'number', 'position', 'primary_team_id', 'player_status', 'is_public', 'avatar', 'height', 'weight', 'joined', 'wingspan', 'standing_reach', 'school', 'contract', 'idol', 'mold', 'tags', 'honors', 'notes'],
  events: ['event_id', 'event_date', 'event_type', 'side_mode', 'title', 'display_group', 'team_a_id', 'team_a_score', 'team_b_id', 'team_b_score', 'win_side', 'mvp_player_id', 'video_url', 'notes'],
  gameStats: ['event_id', 'player_id', 'side', 'team_id', 'fg2m', 'fg2a', 'fg3m', 'fg3a', 'fgm', 'fga', 'pts', 'oreb', 'reb', 'ast', 'stl', 'tov', 'blk', 'min', 'win_games_count', 'lose_games_count', 'notes'],
}

const enumValues = {
  teamType: new Set(['main_club', 'opponent', 'internal_group']),
  playerStatus: new Set(['regular', 'guest', 'inactive']),
  eventType: new Set(['official_match', 'internal_fullcourt_match', 'fun_fullcourt_match', 'halfcourt_game', 'one_v_one']),
  sideMode: new Set(['two_sides', 'multi_sides', 'individual']),
  displayGroup: new Set(['latest', 'old', 'hidden']),
  winSide: new Set(['a', 'b', 'draw', '']),
  side: new Set(['a', 'b', '']),
  boolean: new Set(['true', 'false']),
}

const numberFields = {
  players: new Set(['number']),
  events: new Set(['team_a_score', 'team_b_score']),
  gameStats: new Set(['pts', 'reb', 'ast', 'stl', 'blk', 'tov', 'fgm', 'fga', 'fg2m', 'fg2a', 'fg3m', 'fg3a', 'oreb', 'min', 'win_games_count', 'lose_games_count']),
}

function toRunId(date = new Date()) {
  return date.toISOString().replace(/\.\d{3}Z$/, 'Z').replace(/[:]/g, '-')
}

function parseCsv(text) {
  const rows = []
  let field = ''
  let row = []
  let inQuotes = false

  for (let i = 0; i < text.length; i++) {
    const ch = text[i]
    const next = text[i + 1]

    if (inQuotes) {
      if (ch === '"' && next === '"') {
        field += '"'
        i++
      } else if (ch === '"') {
        inQuotes = false
      } else {
        field += ch
      }
      continue
    }

    if (ch === '"') {
      inQuotes = true
    } else if (ch === ',') {
      row.push(field)
      field = ''
    } else if (ch === '\n') {
      row.push(field)
      rows.push(row)
      row = []
      field = ''
    } else if (ch !== '\r') {
      field += ch
    }
  }

  if (field.length || row.length) {
    row.push(field)
    rows.push(row)
  }

  return rows.filter(r => r.some(v => v !== ''))
}

function readCsv(name, filePath, errors) {
  if (!fs.existsSync(filePath)) {
    errors.push({ code: 'MISSING_SOURCE_FILE', file: path.relative(root, filePath), message: 'Source CSV file does not exist.' })
    return []
  }

  const rows = parseCsv(fs.readFileSync(filePath, 'utf8').replace(/^\uFEFF/, ''))
  const header = rows[0] ?? []
  const expected = requiredHeaders[name]
  const rel = path.relative(root, filePath)

  if (header.join(',') !== expected.join(',')) {
    errors.push({
      code: 'INVALID_HEADER',
      file: rel,
      message: `Expected header "${expected.join(',')}" but found "${header.join(',')}".`,
    })
    return []
  }

  return rows.slice(1).map((values, idx) => {
    const row = { __row: idx + 2 }
    for (let i = 0; i < expected.length; i++) {
      row[expected[i]] = values[i] ?? ''
    }
    return row
  })
}

function addDuplicateIdErrors(rows, key, file, errors) {
  const seen = new Set()
  for (const row of rows) {
    const id = row[key]
    if (!id) continue
    if (seen.has(id)) {
      errors.push({ code: 'DUPLICATE_ID', file, row: row.__row, message: `${key} "${id}" is duplicated.` })
    }
    seen.add(id)
  }
}

function requireField(row, key, file, errors) {
  if (!row[key]) {
    errors.push({ code: 'MISSING_REQUIRED_FIELD', file, row: row.__row, message: `${key} is required.` })
  }
}

function parseBoolean(value, file, rowNum, key, errors) {
  if (!enumValues.boolean.has(value)) {
    errors.push({ code: 'INVALID_BOOLEAN', file, row: rowNum, message: `${key} must be true or false.` })
    return false
  }
  return value === 'true'
}

function parseNullableNumber(value, file, rowNum, key, errors) {
  if (value === '') return null
  const n = Number(value)
  if (!Number.isFinite(n)) {
    errors.push({ code: 'INVALID_NUMBER', file, row: rowNum, message: `${key} must be a number or empty.` })
    return null
  }
  return n
}

function camelize(key) {
  return key.replace(/_([a-z])/g, (_, ch) => ch.toUpperCase())
}

function normalizeRow(row, table, file, errors) {
  const out = {}
  for (const [key, value] of Object.entries(row)) {
    if (key === '__row') continue
    const outKey = camelize(key)
    if (key === 'is_primary' || key === 'is_public') {
      out[outKey] = parseBoolean(value, file, row.__row, key, errors)
    } else if (numberFields[table]?.has(key)) {
      out[outKey] = parseNullableNumber(value, file, row.__row, key, errors)
    } else if (table === 'players' && (key === 'tags' || key === 'honors')) {
      out[outKey] = value ? value.split('|').map(v => v.trim()).filter(Boolean) : []
    } else {
      out[outKey] = value
    }
  }
  return out
}

function buildIndexes(gameStats) {
  const gameStatsByEventId = {}
  const gameStatsByPlayerId = {}

  for (let i = 0; i < gameStats.length; i++) {
    const stat = gameStats[i]
    ;(gameStatsByEventId[stat.eventId] ??= []).push(i)
    ;(gameStatsByPlayerId[stat.playerId] ??= []).push(i)
  }

  return { gameStatsByEventId, gameStatsByPlayerId }
}

function validate({ teams, players, events, gameStats }, errors, warnings) {
  const teamFile = 'data/source/teams.csv'
  const playerFile = 'data/source/players.csv'
  const eventFile = 'data/source/events.csv'
  const statFile = 'data/source/game_stats.csv'

  for (const row of teams) {
    requireField(row, 'team_id', teamFile, errors)
    if (row.team_type && !enumValues.teamType.has(row.team_type)) {
      errors.push({ code: 'INVALID_ENUM', file: teamFile, row: row.__row, message: `team_type "${row.team_type}" is invalid.` })
    }
    if (row.is_primary && !enumValues.boolean.has(row.is_primary)) {
      errors.push({ code: 'INVALID_BOOLEAN', file: teamFile, row: row.__row, message: 'is_primary must be true or false.' })
    }
  }
  addDuplicateIdErrors(teams, 'team_id', teamFile, errors)

  const primaryTeams = teams.filter(t => t.is_primary === 'true')
  if (primaryTeams.length > 1) {
    warnings.push({ code: 'MULTIPLE_PRIMARY_TEAMS', file: teamFile, message: 'More than one team has is_primary=true.' })
  }

  const teamIds = new Set(teams.map(t => t.team_id).filter(Boolean))

  for (const row of players) {
    requireField(row, 'player_id', playerFile, errors)
    if (row.primary_team_id && !teamIds.has(row.primary_team_id)) {
      errors.push({ code: 'MISSING_TEAM', file: playerFile, row: row.__row, message: `primary_team_id "${row.primary_team_id}" does not exist.` })
    }
    if (row.player_status && !enumValues.playerStatus.has(row.player_status)) {
      errors.push({ code: 'INVALID_ENUM', file: playerFile, row: row.__row, message: `player_status "${row.player_status}" is invalid.` })
    }
    if (row.is_public && !enumValues.boolean.has(row.is_public)) {
      errors.push({ code: 'INVALID_BOOLEAN', file: playerFile, row: row.__row, message: 'is_public must be true or false.' })
    }
  }
  addDuplicateIdErrors(players, 'player_id', playerFile, errors)

  const playerIds = new Set(players.map(p => p.player_id).filter(Boolean))

  for (const row of events) {
    requireField(row, 'event_id', eventFile, errors)
    requireField(row, 'event_date', eventFile, errors)
    if (row.event_date && !/^\d{4}-\d{2}-\d{2}$/.test(row.event_date)) {
      errors.push({ code: 'INVALID_DATE', file: eventFile, row: row.__row, message: 'event_date must use YYYY-MM-DD.' })
    }
    if (row.event_type && !enumValues.eventType.has(row.event_type)) {
      errors.push({ code: 'INVALID_ENUM', file: eventFile, row: row.__row, message: `event_type "${row.event_type}" is invalid.` })
    }
    if (row.side_mode && !enumValues.sideMode.has(row.side_mode)) {
      errors.push({ code: 'INVALID_ENUM', file: eventFile, row: row.__row, message: `side_mode "${row.side_mode}" is invalid.` })
    }
    if (row.display_group && !enumValues.displayGroup.has(row.display_group)) {
      errors.push({ code: 'INVALID_ENUM', file: eventFile, row: row.__row, message: `display_group "${row.display_group}" is invalid.` })
    }
    if (!enumValues.winSide.has(row.win_side)) {
      errors.push({ code: 'INVALID_ENUM', file: eventFile, row: row.__row, message: `win_side "${row.win_side}" is invalid.` })
    }
    for (const key of ['team_a_id', 'team_b_id']) {
      if (row[key] && !teamIds.has(row[key])) {
        errors.push({ code: 'MISSING_TEAM', file: eventFile, row: row.__row, message: `${key} "${row[key]}" does not exist.` })
      }
    }
    if (row.mvp_player_id && !playerIds.has(row.mvp_player_id)) {
      errors.push({ code: 'MISSING_PLAYER', file: eventFile, row: row.__row, message: `mvp_player_id "${row.mvp_player_id}" does not exist.` })
    }
    if (row.side_mode === 'two_sides') {
      for (const key of ['team_a_id', 'team_a_score', 'team_b_id', 'team_b_score']) {
        requireField(row, key, eventFile, errors)
      }
    }
    if (row.event_type === 'official_match' && row.side_mode !== 'two_sides') {
      errors.push({ code: 'INVALID_OFFICIAL_MATCH', file: eventFile, row: row.__row, message: 'official_match must use side_mode=two_sides.' })
    }
  }
  addDuplicateIdErrors(events, 'event_id', eventFile, errors)

  const eventIds = new Set(events.map(e => e.event_id).filter(Boolean))
  const eventsById = new Map(events.map(e => [e.event_id, e]))
  const statKeys = new Set()

  for (const row of gameStats) {
    requireField(row, 'event_id', statFile, errors)
    requireField(row, 'player_id', statFile, errors)
    if (row.event_id && !eventIds.has(row.event_id)) {
      errors.push({ code: 'MISSING_EVENT', file: statFile, row: row.__row, message: `event_id "${row.event_id}" does not exist.` })
    }
    if (row.player_id && !playerIds.has(row.player_id)) {
      errors.push({ code: 'MISSING_PLAYER', file: statFile, row: row.__row, message: `player_id "${row.player_id}" does not exist.` })
    }
    if (row.team_id && !teamIds.has(row.team_id)) {
      errors.push({ code: 'MISSING_TEAM', file: statFile, row: row.__row, message: `team_id "${row.team_id}" does not exist.` })
    }
    if (!enumValues.side.has(row.side)) {
      errors.push({ code: 'INVALID_ENUM', file: statFile, row: row.__row, message: `side "${row.side}" is invalid.` })
    }

    const event = eventsById.get(row.event_id)
    if (event?.side_mode === 'two_sides') {
      requireField(row, 'side', statFile, errors)
      requireField(row, 'team_id', statFile, errors)
      if (row.side === 'a' && row.team_id !== event.team_a_id) {
        errors.push({ code: 'SIDE_TEAM_MISMATCH', file: statFile, row: row.__row, message: 'side=a must use the event team_a_id.' })
      }
      if (row.side === 'b' && row.team_id !== event.team_b_id) {
        errors.push({ code: 'SIDE_TEAM_MISMATCH', file: statFile, row: row.__row, message: 'side=b must use the event team_b_id.' })
      }
    }

    const statKey = `${row.event_id}:${row.player_id}`
    if (statKeys.has(statKey)) {
      errors.push({ code: 'DUPLICATE_GAME_STAT', file: statFile, row: row.__row, message: `Duplicate game stat for ${statKey}.` })
    }
    statKeys.add(statKey)

    for (const [made, attempts] of [['fgm', 'fga'], ['fg2m', 'fg2a'], ['fg3m', 'fg3a']]) {
      if (row[made] !== '' && row[attempts] !== '' && Number(row[made]) > Number(row[attempts])) {
        errors.push({ code: 'INVALID_SHOOTING_TOTAL', file: statFile, row: row.__row, message: `${made} cannot be greater than ${attempts}.` })
      }
    }
    if (row.fgm !== '' && row.fg2m !== '' && row.fg3m !== '' && Number(row.fgm) !== Number(row.fg2m) + Number(row.fg3m)) {
      errors.push({ code: 'INVALID_FGM_SPLIT', file: statFile, row: row.__row, message: 'fgm must equal fg2m + fg3m.' })
    }
    if (row.fga !== '' && row.fg2a !== '' && row.fg3a !== '' && Number(row.fga) !== Number(row.fg2a) + Number(row.fg3a)) {
      errors.push({ code: 'INVALID_FGA_SPLIT', file: statFile, row: row.__row, message: 'fga must equal fg2a + fg3a.' })
    }
  }

  for (const event of events) {
    if (event.side_mode !== 'two_sides') continue
    const aSum = gameStats
      .filter(s => s.event_id === event.event_id && s.side === 'a')
      .reduce((sum, s) => sum + Number(s.pts || 0), 0)
    const bSum = gameStats
      .filter(s => s.event_id === event.event_id && s.side === 'b')
      .reduce((sum, s) => sum + Number(s.pts || 0), 0)
    if (event.team_a_score !== '' && aSum !== Number(event.team_a_score)) {
      warnings.push({ code: 'SCORE_MISMATCH', file: statFile, message: `${event.event_id} side a pts sum ${aSum} does not match team_a_score ${event.team_a_score}.` })
    }
    if (event.team_b_score !== '' && bSum !== Number(event.team_b_score)) {
      warnings.push({ code: 'SCORE_MISMATCH', file: statFile, message: `${event.event_id} side b pts sum ${bSum} does not match team_b_score ${event.team_b_score}.` })
    }
  }
}

function main() {
  const startedAt = new Date()
  const runId = toRunId(startedAt)
  const errors = []
  const warnings = []

  const raw = {
    teams: readCsv('teams', sourceFiles.teams, errors),
    players: readCsv('players', sourceFiles.players, errors),
    events: readCsv('events', sourceFiles.events, errors),
    gameStats: readCsv('gameStats', sourceFiles.gameStats, errors),
  }

  validate(raw, errors, warnings)

  const teams = raw.teams.map(row => normalizeRow(row, 'teams', 'data/source/teams.csv', errors))
  const players = raw.players.map(row => normalizeRow(row, 'players', 'data/source/players.csv', errors))
  const events = raw.events.map(row => normalizeRow(row, 'events', 'data/source/events.csv', errors))
  const gameStats = raw.gameStats.map(row => normalizeRow(row, 'gameStats', 'data/source/game_stats.csv', errors))

  const teamsById = Object.fromEntries(teams.map(t => [t.teamId, t]))
  const playersById = Object.fromEntries(players.map(p => [p.playerId, p]))
  const eventsById = Object.fromEntries(events.map(e => [e.eventId, e]))
  const indexes = {
    teamIds: teams.map(t => t.teamId),
    playerIds: players.map(p => p.playerId),
    eventIds: events.map(e => e.eventId),
    ...buildIndexes(gameStats),
  }

  const dataset = {
    meta: {
      schemaVersion: 1,
      generatedAt: new Date().toISOString(),
      source: {
        teams: 'data/source/teams.csv',
        players: 'data/source/players.csv',
        events: 'data/source/events.csv',
        gameStats: 'data/source/game_stats.csv',
      },
      recordCounts: {
        teams: teams.length,
        players: players.length,
        events: events.length,
        gameStats: gameStats.length,
      },
    },
    teamsById,
    playersById,
    eventsById,
    gameStats,
    indexes,
  }

  fs.mkdirSync(outputDir, { recursive: true })
  fs.mkdirSync(logDir, { recursive: true })

  const outputFile = path.join(outputDir, 'dataset.json')
  if (!errors.length) {
    fs.writeFileSync(outputFile, `${JSON.stringify(dataset, null, 2)}\n`)
  }

  const finishedAt = new Date()
  const log = {
    runId,
    startedAt: startedAt.toISOString(),
    finishedAt: finishedAt.toISOString(),
    ok: errors.length === 0,
    sourceFiles: {
      'teams.csv': { rows: raw.teams.length },
      'players.csv': { rows: raw.players.length },
      'events.csv': { rows: raw.events.length },
      'game_stats.csv': { rows: raw.gameStats.length },
    },
    outputFiles: errors.length ? [] : ['public/data/generated/dataset.json'],
    recordCounts: dataset.meta.recordCounts,
    errors,
    warnings,
  }

  const logFile = path.join(logDir, `${runId}-conversion.json`)
  fs.writeFileSync(logFile, `${JSON.stringify(log, null, 2)}\n`)

  console.log(JSON.stringify({
    ok: log.ok,
    output: errors.length ? null : path.relative(root, outputFile),
    log: path.relative(root, logFile),
    recordCounts: log.recordCounts,
    errors: errors.length,
    warnings: warnings.length,
  }, null, 2))

  if (errors.length) process.exit(1)
}

main()
