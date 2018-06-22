const path = require('path')

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
    'react': {
      amd: 'react',
      commonjs: 'react',
      commonjs2: 'react',
      root: 'React'
    },
    rxjs: 'rxjs',
    'rxjs/operators': {
      amd: 'rxjs/operators',
      commonjs: 'rxjs/operators',
      commonjs2: 'rxjs/operators',
      root: ['rxjs', 'operators']
    }
  }
})
