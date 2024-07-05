import { useAtomValue } from 'jotai'
import { useEffect, useState } from 'react'
import { magicBlockEngineAtom } from '../engine/MagicBlockEngineWrapper'

export const FundModal = () => {
  const engine = useAtomValue(magicBlockEngineAtom)
  const sessionPayer = engine?.getSessionPayer()

  const [sessionLamports, setSessionLamports] = useState<number | null>(null)

  useEffect(() => {
    if (!engine) return
    if (!sessionPayer) return
    return engine.subscribeToAccountInfo(sessionPayer, (accountInfo) => {
      setSessionLamports(accountInfo?.lamports ?? 0)
    })
  }, [engine, sessionPayer])

  if (sessionLamports === null) return null
  if (!engine) return null

  const needsFunding =
    sessionLamports !== undefined
      ? sessionLamports < engine.getSessionMinLamports()
      : true

  if (!needsFunding) {
    // check character PDA of the current session
    // should be stored in localstorage as well
    return null
  }

  return (
    <div className='bg-black/80 fixed h-screen inset-x-0 top-0 flex items-center justify-center'>
      <div className='bg-black/60 flex flex-col border-2 border-amber-500/20 p-5 gap-3 max-w-md'>
        <h2 className='text-2xl'>Welcome to Imephemerals</h2>
        <p>Let's start by funding your session wallet first</p>
        <button
          onClick={() => {
            engine.fundSession()
          }}
          className='border-2 border-amber-500 bg-slate-800 hover:bg-slate-700 px-5 py-2'
        >
          Fund Session Wallet
        </button>
      </div>
    </div>
  )
}
