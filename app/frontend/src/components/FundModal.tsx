import { useAtom, useAtomValue, useSetAtom } from 'jotai'
import { useEffect, useRef, useState } from 'react'
import {
  characterEntityPdaAtom,
  myCharacterComponentAtom,
} from '../atoms/characterPdaAtom'
import { createCharacter } from '../engine/createCharacter'
import { magicBlockEngineAtom } from '../engine/MagicBlockEngineWrapper'
import { systemSpawn } from '../engine/systemSpawn'
import cn from 'classnames'

export const FundModal = () => {
  const engine = useAtomValue(magicBlockEngineAtom)
  const sessionPayer = engine?.getSessionPayer()
  const [sessionLamports, setSessionLamports] = useState<number | null>(null)
  const [characterEntityPda, setCharacterEntityPda] = useAtom(
    characterEntityPdaAtom
  )
  const setMyCharacterComponent = useSetAtom(myCharacterComponentAtom)
  const [errorCreating, setErrorCreating] = useState('')
  const isCreatingPda = useRef(false)
  const [funding, setFunding] = useState(false)

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
    if (
      !characterEntityPda &&
      sessionLamports >= engine.getSessionMinLamports()
    ) {
      if (isCreatingPda.current) return
      isCreatingPda.current = true
      const create = async () => {
        try {
          const { componentPda, entityPda } = await createCharacter(engine)
          await systemSpawn(engine, entityPda)
          setCharacterEntityPda(entityPda)
          setMyCharacterComponent(componentPda)
        } catch (error) {
          console.error(error)
          isCreatingPda.current = false
          setErrorCreating((error + '').replace('Error:', '').trim())
        }
      }
      create()
    }
  }, [
    engine,
    characterEntityPda,
    sessionLamports,
    errorCreating,
    setCharacterEntityPda,
    setErrorCreating,
    setMyCharacterComponent,
  ])

  // if (sessionLamports === null) return null
  if (!engine) return null
  if (characterEntityPda) return null

  if (errorCreating) {
    return (
      <div className='bg-black/80 fixed h-screen inset-x-0 top-0 flex items-center justify-center'>
        <div className='bg-black/60 flex flex-col border-2 border-amber-500/20 p-5 gap-3 max-w-md'>
          <p>
            There was an{' '}
            <a
              className='underline'
              href={`https://solana.fm/tx/${errorCreating}?cluster=testnet-solana`}
              target='_blank'
              rel='noopener noreferrer'
            >
              error
            </a>{' '}
            creating your character.
          </p>
          <button
            onClick={() => {
              setErrorCreating('')
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
        <p>Let's start by funding your session wallet first.</p>
        <button
          disabled={funding}
          onClick={async () => {
            setFunding(true)
            try {
              await engine.fundSession()
            } catch (e) {}
            setFunding(false)
          }}
          className={cn(
            'border-2 border-amber-500 bg-slate-800 hover:bg-slate-700 px-5 py-2',
            funding && 'opacity-50'
          )}
        >
          {funding ? 'Please Wait' : 'Fund Session Wallet'}
        </button>
      </div>
    </div>
  )
}
