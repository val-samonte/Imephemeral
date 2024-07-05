import { FC } from 'react'
import { useNavigate } from 'react-router-dom'
import { useWallet } from '@solana/wallet-adapter-react'
import { useWalletModal } from '@solana/wallet-adapter-react-ui'

export const Splash: FC = () => {
  const { publicKey, disconnect } = useWallet()
  const { setVisible } = useWalletModal()
  const navigate = useNavigate()

  return (
    <div
      className='fixed h-screen inset-x-0 top-0 flex flex-col items-center bg-cover bg-center bg-no-repeat'
      style={{ backgroundImage: 'url("/bg.png")' }}
    >
      <div className='flex flex-col items-center mt-[30vh] h-full gap-5'>
        <img src='/title_with_drop.png' alt='Imephemerals' />
        {publicKey ? (
          <>
            <div className='flex gap-5'>
              <button
                className='border-2 border-amber-500 bg-slate-800 hover:bg-slate-700 px-5 py-2'
                onClick={() => {
                  navigate('/partykit')
                }}
              >
                Partykit Version
              </button>
              <button
                className='border-2 border-amber-500 bg-slate-800 hover:bg-slate-700 px-5 py-2'
                onClick={() => {
                  navigate('/on-chain')
                }}
              >
                MagicBlock Engine
              </button>
            </div>
            <button
              className='px-5 py-2'
              onClick={() => {
                disconnect()
              }}
            >
              Disconnect Wallet
            </button>
          </>
        ) : (
          <>
            <button
              className='border-2 border-amber-500 bg-slate-800 hover:bg-slate-700 px-5 py-2'
              onClick={() => {
                setVisible(true)
              }}
            >
              Connect Wallet
            </button>
          </>
        )}
      </div>
    </div>
  )
}
