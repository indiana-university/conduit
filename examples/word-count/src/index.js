/**
 * Copyright (C) 2019 The Trustees of Indiana University
 * SPDX-License-Identifier: BSD-3-Clause
 */

import { render } from 'react-dom'
import { App } from './App'

//
// Initialize Word Count app
//

const app = App(window.CONFIG)
const { component: AppComponent } = app
render(<AppComponent />, document.getElementById('root'))
