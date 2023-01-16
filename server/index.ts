import { Server, Socket } from 'socket.io'
import { createServer } from 'http'
import express from 'express'
import Match from './Match'
import { ROUND_COUNT, ROUND_DURATION, SERVER_PORT } from './config'
import { Move } from './gameLogic'
import { isMove } from './validateInput'

const app = express()
const server = createServer(app)
const io = new Server(server)

const connections: Socket[] = []

const match = new Match(ROUND_COUNT, ROUND_DURATION)

io.on('connection', socket => {
  connections.push(socket)

  if (connections.length > 2) {
    throw new Error('Too many players')
  }

  if (connections.length === 2) {
    startMatch()
  }
  socket.on('disconnect', () => {
    connections.splice(connections.indexOf(socket), 1)
  })

  console.log("Connections: ", connections.length)
})

server.listen(SERVER_PORT)


function socketToPromiseRepeater(socket: Socket): () => Promise<Move> {
  let resolvePromise: ((move: Move) => void) | null = null

  socket.on('move', args => {
    if (!isMove(args)) return // Ignore invalid moves
    resolvePromise?.(args)
    console.log("Move: ", args)
  })

  return () => {
    return new Promise(resolve => {
      resolvePromise = resolve
    })
  }
}

async function startMatch() {
  const left = connections[0]
  const right = connections[1]
  const waitForLeftMove = socketToPromiseRepeater(left)
  const waitForRightMove = socketToPromiseRepeater(right)
  
  match.run(() => {
    left.emit('round')
    return waitForLeftMove()
  }, () => {
    right.emit('round')
    return waitForRightMove()
  })

  const result = await match.result
  console.log("Match result: ", result)
}