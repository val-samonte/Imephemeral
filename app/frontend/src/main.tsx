import './index.css'
import './global-shim'
import React from 'react'
import ReactDOM from 'react-dom/client'
import { Controller } from './components/Controller.tsx'
import { RoomTest } from './components/RoomTest.tsx'
import { WalletAdapter } from './components/WalletAdapter.tsx'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <WalletAdapter>
      {/* <App /> */}
      <RoomTest />
      <Controller />
    </WalletAdapter>
  </React.StrictMode>
)
