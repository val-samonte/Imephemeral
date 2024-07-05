import { useAtom, useAtomValue } from 'jotai'
import { useEffect, useRef, useState } from 'react'
import { characterPdaAtom } from '../atoms/characterPdaAtom'
import { createCharacter } from '../engine/createCharacter'
import { magicBlockEngineAtom } from '../engine/MagicBlockEngineWrapper'

export const FundModal = () => {
  const engine = useAtomValue(magicBlockEngineAtom)
  const sessionPayer = engine?.getSessionPayer()
  const [sessionLamports, setSessionLamports] = useState<number | null>(null)
  const [characterPda, setCharacterPda] = useAtom(characterPdaAtom)
  const [errorCreating, setErrorCreating] = useState(false)
  const isCreatingPda = useRef(false)

  useEffect(() => {
    if (!engine) return
    if (!sessionPayer) return
    return engine.subscribeToAccountInfo(sessionPayer, (accountInfo) => {
      setSessionLamports(accountInfo?.lamports ?? 0)
    })
  }, [engine, sessionPayer])

  useEffect(() => {
    if (sessionLamports === null) return
    if (!engine) return
    if (errorCreating) return
    if (!characterPda && sessionLamports >= engine.getSessionMinLamports()) {
      if (isCreatingPda.current) return
      isCreatingPda.current = true
      try {
        const create = async () => {
          const pda = await createCharacter(engine)
          console.log(pda.toBase58())
          setCharacterPda(pda)
        }
        create()
      } catch (error) {
        console.error(error)
        isCreatingPda.current = false
        setErrorCreating(true)
      }
    }
  }, [
    engine,
    characterPda,
    sessionLamports,
    errorCreating,
    setCharacterPda,
    setErrorCreating,
  ])

  if (sessionLamports === null) return null
  if (!engine) return null
  if (characterPda) return null

  if (errorCreating) {
    return (
      <div className='bg-black/80 fixed h-screen inset-x-0 top-0 flex items-center justify-center'>
        <div className='bg-black/60 flex flex-col border-2 border-amber-500/20 p-5 gap-3 max-w-md'>
          <p>There was an error creating your character.</p>
          <button
            onClick={() => {
              setErrorCreating(false)
            }}
            className='border-2 border-amber-500 bg-slate-800 hover:bg-slate-700 px-5 py-2'
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  if (
    sessionLamports !== null &&
    sessionLamports >= engine.getSessionMinLamports()
  ) {
    return (
      <div className='bg-black/80 fixed h-screen inset-x-0 top-0 flex items-center justify-center'>
        <div className='bg-black/60 flex flex-col border-2 border-amber-500/20 p-5 gap-3 max-w-md'>
          <p>
            Creating your character, this might take a while. Please do not
            close your browser.
          </p>
        </div>
      </div>
    )
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
