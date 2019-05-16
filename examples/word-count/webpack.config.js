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
    'lighterhtml': 'lighterhtml',
    'rxjs': 'rxjs',
    'rxjs/operators': 'rxjs.operators',
    'when-elements': 'WhenElements'
  }
}
