import React from 'react'
import ReactDOM from 'react-dom/client'

import { initializeNcoState } from '@/hooks/useNco'

import App from './App'

initializeNcoState().then(() => {
  ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  )
})
