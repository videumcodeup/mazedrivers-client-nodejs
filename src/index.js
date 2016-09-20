import ws from 'nodejs-websocket'

const nickname = process.env.NICKNAME || 'Demo'

const token = process.argv[2] ? process.argv[2].trim() : undefined

const conn = ws.connect('ws://localhost:8001', {})

const sendAction = (type, payload) =>
  conn.sendText(JSON.stringify({ type, payload }))

conn.on('connect', () => {
  console.log('Connected')

  if (token) {
    sendAction('REJOIN_REQUEST', { token })
  } else {
    sendAction('JOIN_REQUEST', { nickname })
  }
})

const state = {
  playing: false
}

conn.on('text', data => {
  console.log(data)
  const action = JSON.parse(data)

  switch (action.type) {
    case 'JOIN_SUCCESS':
    case 'RESUME_SUCCESS':
      state.playing = true
      break
  }
})
