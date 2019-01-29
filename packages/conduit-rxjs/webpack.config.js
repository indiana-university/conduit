const path = require('path')
const webpack = require('webpack')
const { banner } = require('../../config')
const pkg = require('./package.json')

module.exports = (env, argv) => ({
  entry: './src/index.js',
  output: {
    path: path.resolve(__dirname, 'bundles'),
    filename: `conduit-rxjs.umd${argv.mode === 'production' ? '.min' : ''}.js`,
    library: {
      amd: 'conduit-rxjs',
      commonjs: 'conduit-rxjs',
      root: 'Conduit'
    },
    libraryTarget: 'umd'
  },
  devtool: 'source-map',
  externals: {
    rxjs: 'rxjs'
  },
  plugins: [
    new webpack.BannerPlugin(banner(pkg))
  ]
})
