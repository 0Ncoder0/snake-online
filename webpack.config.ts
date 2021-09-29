import { Configuration } from 'webpack'
import HtmlWebpackPlugin from 'html-webpack-plugin'
import path from 'path'

const config: Configuration = {
  mode: 'production',
  entry: path.join(__dirname, 'dist', 'client', 'index.js'),
  output: {
    path: path.resolve(__dirname, 'dist', 'client'),
    filename: 'index.js'
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: path.resolve(__dirname, 'src', 'client', 'index.html')
    })
  ]
}

export default config
