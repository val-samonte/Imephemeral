import './index.css'
import './global-shim'
import React from 'react'
import ReactDOM from 'react-dom/client'
import { Controller } from './components/Controller.tsx'
import { GameLoop } from './components/GameLoop.tsx'
import { RoomTest } from './components/RoomTest.tsx'
import { WalletAdapter } from './components/WalletAdapter.tsx'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <WalletAdapter>
      {/* <App /> */}
      <RoomTest />
      <Controller />
      <GameLoop />
    </WalletAdapter>
  </React.StrictMode>
)
