const path = require('path')

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
  }
})
