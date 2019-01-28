/**
 * Copyright (C) 2019 The Trustees of Indiana University
 * SPDX-License-Identifier: BSD-3-Clause
 */

import { render } from 'react-dom'
import { App } from './App'

const app = App()
const { component: AppComponent } = app
render(<AppComponent />, document.getElementById('root'))
