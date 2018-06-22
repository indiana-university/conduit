const path = require('path')

module.exports = {
  devServer: {
    contentBase: [
      path.resolve(__dirname),
      path.resolve(__dirname, '../../packages/')
    ]
  },
  externals: {
    'conduit-rxjs': 'Conduit',
    'conduit-rxjs-react': 'ConduitReact',
    'react': 'React',
    'react-dom': 'ReactDOM',
    'router': 'Router',
    'rxjs': 'rxjs',
    'rxjs/operators': 'rxjs.operators'
  }
}
