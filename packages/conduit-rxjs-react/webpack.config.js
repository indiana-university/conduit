const path = require('path')
const webpack = require('webpack')
const { banner } = require('../../config')
const pkg = require('./package.json')

module.exports = (env, argv) => ({
  entry: './src/index.js',
  output: {
    path: path.resolve(__dirname, 'bundles'),
    filename: `conduit-rxjs-react.umd${argv.mode === 'production' ? '.min' : ''}.js`,
    library: {
      amd: 'conduit-rxjs-react',
      commonjs: 'conduit-rxjs-react',
      root: 'ConduitReact'
    },
    libraryTarget: 'umd'
  },
  devtool: 'source-map',
  externals: {
    'conduit-rxjs': {
      amd: 'conduit-rxjs',
      commonjs: 'conduit-rxjs',
      commonjs2: 'conduit-rxjs',
      root: 'Conduit'
    },
    react: {
      amd: 'react',
      commonjs: 'react',
      commonjs2: 'react',
      root: 'React'
    },
    rxjs: 'rxjs'
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
  },
  plugins: [
    new webpack.BannerPlugin(banner(pkg))
  ]
})
