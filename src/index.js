import ws from 'nodejs-websocket'
import keypress from 'keypress'

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

conn.on('close', () => {
  console.log('Disconnected')
  process.exit()
})

const state = {
  playing: false
}

conn.on('text', data => {
  console.log(data.replace(/maze":\[\[.*\]\]/, 'maze":[["..."]]'))
  const action = JSON.parse(data)

  switch (action.type) {
    case 'JOIN_SUCCESS':
    case 'REJOIN_SUCCESS':
      state.playing = true
      break
  }
})

const getDirection = key => {
  console.log(key)
  switch (key) {
    case 'left':
      return 'WEST'
    case 'right':
      return 'EAST'
    case 'up':
      return 'NORTH'
    case 'down':
      return 'SOUTH'
  }
}

const keypressCallback = (key) => {
  const direction = getDirection(key.name)
  if (direction) {
    sendAction('DRIVE_REQUEST', direction)
  } else if (key.name === 'space') {
    sendAction('BREAK_REQUEST')
  }
}

// make `process.stdin` begin emitting "keypress" events
keypress(process.stdin)

// listen for the "keypress" event
process.stdin.on('keypress', function (ch, key) {
  if (key && key.ctrl && key.name === 'c') {
    process.exit()
  }
  if (state.playing) {
    keypressCallback(key)
  }
  console.log('got "keypress"', key)
})

process.stdin.setRawMode(true)
process.stdin.resume()
