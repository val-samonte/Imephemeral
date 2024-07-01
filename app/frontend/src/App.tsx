import { Buffer } from 'buffer'
import { useWallet } from '@solana/wallet-adapter-react'
import { useWalletModal } from '@solana/wallet-adapter-react-ui'
import { MazeGenerator } from './components/MazeGenerator'

function App() {
  const { publicKey, disconnect, signMessage } = useWallet()
  const { setVisible } = useWalletModal()

  return (
    <div className='flex flex-col gap-2 max-w-md mx-auto my-5'>
      <h1 className='text-3xl font-bold underline'>Imephemeral Test!</h1>
      <button
        className='px-2 py-1 bg-slate-400 hover:bg-slate-500'
        onClick={() => setVisible(true)}
      >
        Show Wallet Modal
      </button>
      {publicKey && (
        <>
          <p>Wallet public key: {publicKey.toBase58()}</p>
          <button
            className='px-2 py-1 bg-slate-400 hover:bg-slate-500'
            onClick={() => disconnect()}
          >
            Disconnect
          </button>
          {signMessage && (
            <button
              className='px-2 py-1 bg-slate-400 hover:bg-slate-500'
              onClick={async () => {
                const message = 'Hello, world!'
                const signature = await signMessage(Buffer.from(message))
                console.log('Message:', message)
                console.log('Signature:', signature)
              }}
            >
              Sign Message
            </button>
          )}
        </>
      )}
      <div className='w-full my-2 border-b border-gray-300'></div>
      <MazeGenerator />
    </div>
  )
}

export default App
