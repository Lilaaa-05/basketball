const allowed = [
  'chai', 'Feng', 'G', 'Harada', 'Hashimoto', '胖虎', 'Zuan', 'T-mac', 'aoki', 'seki'
]

function normalize(s) {
  if (!s) return ''
  return String(s).toLowerCase().replace(/[^a-z0-9\u4e00-\u9fff]/g, '')
}

export function isAllowed(player) {
  if (!player) return false
  const name = normalize(player.name || player.id || '')
  return allowed.some(a => normalize(a) === name || normalize(a) === normalize(player.id))
}

export const allowedList = allowed.slice()

export default isAllowed
