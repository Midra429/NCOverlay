import React from 'react'
import ReactDOM from 'react-dom/client'

import { webext } from '@/utils/webext'
import { initializeNcoState } from '@/hooks/useNco'

import App from './App'

webext.runtime.connect({ name: 'sidepanel' })

initializeNcoState().then(() => {
  ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  )
})
