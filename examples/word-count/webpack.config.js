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
    'lighterhtml': 'lighterhtml',
    'react': 'React',
    'react-dom': 'ReactDOM',
    'rxjs': 'rxjs',
    'rxjs/operators': 'rxjs.operators',
    'when-elements': 'WhenElements'
  }
}
