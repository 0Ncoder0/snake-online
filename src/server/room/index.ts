/* eslint-disable @typescript-eslint/no-var-requires */
import { Socket } from 'socket.io'
import { Config, Game, GameEvent, SnakeDirection } from '../../core/index'
import * as uuid from 'uuid'

export class Client {
  id = uuid.v4()
  snakeId = null
  socket: Socket = null
}

export default class Room {
  public id = uuid.v4()
  public code: string = null
  public clients: Client[] = []
  public game: Game = null

  constructor(data?: { code?: string }) {
    this.code = data?.code || null
    this.game = new Game({ config: new Config(), listener: event => this.listener(event) })
  }

  public start() {
    this.game.start()
    this.listener(GameEvent.Frame)
  }

  /** 修改玩家控制的蛇的方向 */
  public turn(clientId: string, dir: SnakeDirection) {
    const client = this.clients.find(({ id }) => clientId === id)
    const snake = this.game.getSnake(client.snakeId)
    snake.nextDirection = dir
  }

  /** 监听游戏事件 */
  public listener(event: GameEvent) {
    this.clients.forEach(client => {
      const { config, snakes, foods } = this.game
      console.log('emit:', { event, data: { config, snakes, foods } })
      client.socket.emit(event, { config, snakes, foods })
    })
  }

  /** 新增玩家 */
  public addClient(socket: Socket) {
    const snake = this.game.addSnake()
    const client = new Client()
    client.socket = socket
    client.snakeId = snake.id
    this.clients.push(client)
    return client
  }
}
