import React = require('react')
import * as ReactDOM from 'react-dom'
import { Game } from '../core'
import { client } from './socket'

enum BlockType {
  Empty = 'Empty',
  Food = 'Food',
  Snake = 'Snake'
}

const Block = (type: BlockType) => {
  const type2color = new Map([
    [BlockType.Empty, 'gray'],
    [BlockType.Food, 'red'],
    [BlockType.Snake, 'blue']
  ])
  return (
    <div
      style={{
        height: '24px',
        width: '24px',
        backgroundColor: type2color.get(type)
      }}
    ></div>
  )
}

const Blocks = (game: Partial<Game>) => {
  const { snakes, foods, config } = game
  const blocks: BlockType[][] = []

  /** 生成空矩阵 */
  for (let r = 0; r < config.row; r++) {
    const row: BlockType[] = []
    for (let c = 0; c < config.col; c++) {
      row.push(BlockType.Empty)
    }
    blocks.push(row)
  }

  /** 生成食物 */
  foods.map(({ position: { x, y } }) => (blocks[y][x] = BlockType.Food))

  /** 生成蛇身 */
  snakes.map(snake => snake.bodys.map(({ x, y }) => (blocks[y][x] = BlockType.Snake)))

  return blocks
}

const Board = () => {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        paddingTop: '200px'
      }}
    >
      {Blocks(client.game)?.map(row => (
        <div style={{ display: 'flex' }}>{row.map(Block)}</div>
      ))}
    </div>
  )
}

client.onGameChange = () => ReactDOM.render(Board(), document.getElementById('app'))
;(window as any).client = client
