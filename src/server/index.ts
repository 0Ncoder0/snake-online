/* eslint-disable @typescript-eslint/no-var-requires */
import { Server, Socket } from 'socket.io'
import { GameEvent, SnakeDirection } from '../core'
import Room from './room'

const io = new Server(8008, { cors: { origin: '*' } })

let clients: Socket[] = []

let rooms: Room[] = []

io.on('connection', socket => {
  clients.push(socket)

  const on = (event: string, listener: Function) => {
    socket.on(event, (...args) => {
      console.log('on:', { event, args })
      listener(...args)
    })
  }

  const emit = (event: string, data: unknown) => {
    console.log('emit:', { event, data })
    socket.emit(event, data)
  }

  on('room', (code: string) => {
    let room: Room = rooms.find(room => room.code === code)
    if (!room) {
      room = new Room({ code })
      rooms.push(room)
    }
    const client = room.addClient(socket)
    emit('client', { roomId: room.id, clientId: client.id })
    room.listener(GameEvent.Frame)
  })

  on('start', (roomId: string) => {
    rooms.find(({ id }) => roomId === id)?.start()
  })

  on('turn', (data: { roomId: string; clientId: string; direction: SnakeDirection }) => {
    const room = rooms.find(({ id }) => id === data.roomId)
    room.turn(data.clientId, data.direction)
  })
})
