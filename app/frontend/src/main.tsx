import './index.css'
import './global-shim'
import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom'
import App from './App.tsx'
import { PartykitVersion } from './components/PartykitVersion.tsx'
import { WalletAdapter } from './components/WalletAdapter.tsx'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <WalletAdapter>
      <Router>
        <Routes>
          <Route path='/' element={<PartykitVersion />} />
          <Route path='/on-chain' element={<App />} />
        </Routes>
      </Router>
    </WalletAdapter>
  </React.StrictMode>
)
