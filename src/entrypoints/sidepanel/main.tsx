import React from 'react'
import ReactDOM from 'react-dom/client'

import { webext } from '@/utils/webext'

import App from './App'

webext.runtime.connect({ name: 'sidepanel' })

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)
