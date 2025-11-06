export function ensureSessionId() {
  const key = 'chezjules_session_id'
  let id = localStorage.getItem(key)
  if (!id) {
    id = crypto.randomUUID?.() || Math.random().toString(36).slice(2)
    localStorage.setItem(key, id)
  }
  return id
}

export function loadMessages() {
  try {
    const raw = localStorage.getItem('chezjules_messages')
    return raw ? JSON.parse(raw) : []
  } catch { return [] }
}

export function saveMessages(messages) {
  localStorage.setItem('chezjules_messages', JSON.stringify(messages))
}
