import * as uuid from 'uuid'

export enum GameEvent {
  /** 单帧计算完成后触发 */
  Frame = 'Frame',
  /** 游戏结束后触发，有蛇死亡 */
  Over = 'Over'
}

export enum SnakeDirection {
  Left = 'Left',
  Right = 'Right',
  Top = 'Top',
  Bottom = 'Bottom'
}

export class Position {
  x: number
  y: number

  constructor(x: number, y: number) {
    this.x = x
    this.y = y
  }
}

export class Config {
  /** 横向的方格数，min 20 */
  public row = 20
  /** 纵向的方格数，min 20 */
  public col = 20
  /** 每秒帧数，每秒计算的次数，max 30 */
  public framePerSecond = 5
}

export class Snake {
  public id = uuid.v4()
  /** 蛇身坐标组，下标为 0 的坐标为蛇头 */
  public bodys: Position[] = []
  /** 蛇当前的方向 */
  public direction = SnakeDirection.Right
  /** 蛇下一帧的方向 */
  public nextDirection: SnakeDirection = null
}

export class Food {
  public position: Position = new Position(0, 0)
}

export class Utils {
  /** 判定某一坐标是否在坐标组中 */
  public static isPositionIn(position: Position, positions: Position[]) {
    const { x, y } = position
    return !!positions.find(({ x: px, y: py }) => x === px && y === py)
  }

  /** 随机整数 */
  public static randomInt(max: number) {
    return Math.floor(Math.random() * max)
  }

  public static Food = class {
    /** 生成一个食物 */
    public static createFood(maxX: number, maxY: number, skips: Position[]) {
      const food = new Food()
      while (true) {
        const position = new Position(Utils.randomInt(maxX + 1), Utils.randomInt(maxY + 1))
        const isExist = Utils.isPositionIn(position, skips)
        if (isExist) continue
        food.position = position
        return food
      }
    }
  }

  public static Snake = class {
    /** 生成一条蛇 */
    public static createSnake(position: 'top' | 'bottom', maxX: number, maxY: number) {
      const snake = new Snake()
      switch (position) {
        case 'bottom':
          snake.direction = SnakeDirection.Left
          snake.bodys = [
            new Position(maxX - 4, maxY),
            new Position(maxX - 3, maxY),
            new Position(maxX - 2, maxY),
            new Position(maxX - 1, maxY),
            new Position(maxX - 0, maxY)
          ]
          break
        case 'top':
          snake.direction = SnakeDirection.Right
          snake.bodys = [
            new Position(4, 0),
            new Position(3, 0),
            new Position(2, 0),
            new Position(1, 0),
            new Position(0, 0)
          ]
          break
      }
      return snake
    }

    /** 根据蛇的方向移动一帧 */
    public static moveSnake(snake: Snake) {
      const { Left, Right, Top, Bottom } = SnakeDirection
      snake.direction = snake.nextDirection || snake.direction
      const head: Position = { ...snake.bodys[0] }
      switch (snake.direction) {
        case Left:
          head.x -= 1
          break
        case Right:
          head.x += 1
          break
        case Top:
          head.y -= 1
          break
        case Bottom:
          head.y += 1
          break
      }
      snake.bodys.pop()
      snake.bodys.unshift(head)
    }

    /** 使蛇增长一格 */
    public static lengthenSnake(snake: Snake) {
      const { x, y } = snake.bodys[snake.bodys.length - 1]
      snake.bodys.push({ x, y })
    }

    /** 检查蛇是否已死 */
    public static isSnakeDead(snake: Snake, blocks: Position[], maxX: number, maxY: number) {
      return !!snake.bodys.find(({ x, y }) => {
        const stacked = Utils.isPositionIn({ x, y }, blocks)
        const overflowed = x < 0 || x > maxX || y < 0 || y > maxY
        if (stacked || overflowed) return true
      })
    }

    /** 检查蛇是否吃到食物，返回被吃到的食物 */
    public static isSnakeAte(snake: Snake, foods: Food[]) {
      return foods.filter(food => Utils.isPositionIn(food.position, snake.bodys))
    }
  }
}

export class Game {
  public config: Config = new Config()
  public snakes: Snake[] = []
  public foods: Food[] = []
  public timer = null

  public listener = (event: GameEvent) => {
    console.log('on:' + event)
  }

  constructor(data: { config: Config; listener: Game['listener'] }) {
    this.config = data.config
    this.listener = data.listener
  }

  public start() {
    this.initTimer()
  }

  /** 添加蛇 */
  public addSnake() {
    const maxX = this.config.row - 1
    const maxY = this.config.col - 1
    const snake = Utils.Snake.createSnake(this.snakes.length ? 'bottom' : 'top', maxX, maxY)
    this.snakes.push(snake)

    return snake
  }

  /** 添加食物 */
  public addFood() {
    const maxX = this.config.row - 1
    const maxY = this.config.col - 1
    const snakeBodys = []
    const foodPositions = this.foods.map(food => food.position)
    this.snakes.forEach(snake => snakeBodys.concat(snake.bodys))
    const food = Utils.Food.createFood(maxX, maxY, [...snakeBodys, ...foodPositions])
    this.foods.push(food)
  }

  /** 初始化计时器 */
  public initTimer() {
    this.timer = setInterval(() => this.frame(), 1000 / this.config.framePerSecond)
  }

  /** 清理计时器 */
  public clearTimer() {
    clearInterval(this.timer)
    this.timer = null
  }

  /** 单帧计算 */
  public frame() {
    const eatenFoods: Food[] = []

    /** 移动蛇 */
    this.snakes.forEach(snake => Utils.Snake.moveSnake(snake))

    /** 记录被吃的食物并增长对应的蛇 */
    this.snakes.forEach(snake => {
      const eatenFoodPositions = eatenFoods.map(food => food.position)
      const foods = Utils.Snake.isSnakeAte(snake, this.foods)
      if (!foods.length) return
      Utils.Snake.lengthenSnake(snake)
      foods.forEach(food => {
        const isFoodIn = Utils.isPositionIn(food.position, eatenFoodPositions)
        if (!isFoodIn) eatenFoods.push(food)
      })
    })

    /** 移除被吃食物 */
    const eatenFoodPositions = eatenFoods.map(food => food.position)
    this.foods = this.foods.filter(food => !Utils.isPositionIn(food.position, eatenFoodPositions))

    /** 创建食物 */
    for (let i = this.foods.length; i < this.snakes.length; i++) {
      this.addFood()
    }

    /** 检查是否游戏结束 */
    const isGameOver = !!this.getDeadSnakes().length

    if (isGameOver) {
      this.clearTimer()
      this.listener(GameEvent.Over)
    } else {
      this.listener(GameEvent.Frame)
    }
  }

  public getSnake(id: string) {
    return this.snakes.find(snake => snake.id === id)
  }

  public getDeadSnakes() {
    const maxX = this.config.row - 1
    const maxY = this.config.col - 1

    return this.snakes.filter(snake => {
      const blocks = []
      this.snakes
        .filter(({ id }) => id !== snake.id)
        .forEach(({ bodys }) => {
          bodys.forEach(position => blocks.push(position))
        })
      return Utils.Snake.isSnakeDead(snake, blocks, maxX, maxY)
    })
  }
}
