import { render } from 'react-dom'
import { App } from './App'

const app = App()
const { component: AppComponent } = app
render(<AppComponent />, document.getElementById('root'))
