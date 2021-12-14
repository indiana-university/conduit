const path = require('path')

module.exports = {
  devServer: {
    static: [
      path.resolve(__dirname),
      path.resolve(__dirname, '../../packages/')
    ]
  },
  externals: {
    'conduit-rxjs': 'Conduit',
    'conduit-rxjs-react': 'ConduitReact',
    react: 'React',
    'react-dom': 'ReactDOM',
    rxjs: 'rxjs',
    'rxjs/operators': 'rxjs.operators'
  },
  module: {
    rules: [
      {
        test: /\.m?js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: [
              ['@babel/preset-env', { targets: 'defaults' }]
            ]
          }
        }
      }
    ]
  }
}
