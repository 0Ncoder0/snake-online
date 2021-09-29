import { io } from 'socket.io-client'
import { Config, Game, GameEvent, SnakeDirection } from '../../core'

class Client {
  public socket = io('http://192.168.1.174:8008')
  public code: string = null
  public roomId: string = null
  public clientId: string = null
  public game: Pick<Game, 'foods' | 'snakes' | 'config'> = new Game({ config: new Config(), listener: console.log })

  public onGameChange: Function = null

  public on(event: string, listener: Function) {
    this.socket.on(event, (...args) => {
      console.log('on:', { event, args })
      listener(...args)
    })
  }

  public emit(event: string, data: unknown) {
    console.log('emit:', { event, data })
    this.socket.emit(event, data)
  }

  constructor() {
    this.on('connect', () => {
      console.log('connected')
    })
    this.on('client', (data: { roomId: string; clientId: string }) => {
      this.clientId = data.clientId
      this.roomId = data.roomId
    })
    this.on(GameEvent.Over, (message: string) => {
      window.alert(message)
    })
    this.on(GameEvent.Frame, (data: Pick<Game, 'snakes' | 'foods' | 'config'>) => {
      Object.assign(this.game, data)
      this.onGameChange?.call(null)
    })
  }

  public turn(dir: SnakeDirection) {
    this.emit('turn', {
      roomId: this.roomId,
      clientId: this.clientId,
      direction: dir
    })
  }

  public start() {
    this.emit('start', this.roomId)
  }

  public join(code: string) {
    this.code = code
    this.emit('room', code)
  }
}

export const client = new Client()

window.addEventListener('keypress', event => {
  const code2dir = new Map([
    ['KeyA', SnakeDirection.Left],
    ['KeyD', SnakeDirection.Right],
    ['KeyW', SnakeDirection.Top],
    ['KeyS', SnakeDirection.Bottom]
  ])

  const dir = code2dir.get(event.code)
  if (dir) client.turn(dir)
  console.log(event.code, dir)
})
