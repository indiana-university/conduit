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
    rxjs: 'rxjs',
    'rxjs/operators': {
      commonjs: 'rxjs/operators',
      commonjs2: 'rxjs/operators',
      amd: 'rxjs/operators',
      root: ['rxjs', 'operators']
    }
  }
})
