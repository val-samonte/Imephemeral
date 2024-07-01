import './index.css'
import './global-shim'
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import { WalletAdapter } from './components/WalletAdapter.tsx'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <WalletAdapter>
      <App />
    </WalletAdapter>
  </React.StrictMode>
)
