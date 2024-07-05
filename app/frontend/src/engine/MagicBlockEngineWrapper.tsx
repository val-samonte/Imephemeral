import { atom, useAtom } from 'jotai'
import { FC, ReactNode, useEffect } from 'react'
import { useWallet } from '@solana/wallet-adapter-react'
import { useSessionKeypair } from '../hooks/useSessionKeypair'
import { MagicBlockEngine, SESSION_MAX_LAMPORTS, SESSION_MIN_LAMPORTS } from './MagicBlockEngine'

export const magicBlockEngineAtom = atom<MagicBlockEngine | null>(null)

export const MagicBlockEngineWrapper: FC<{
  children?: ReactNode
  splash?: ReactNode
}> = ({ splash, children }) => {
  const walletContext = useWallet()
  const [session] = useSessionKeypair()
  const [magicBlockEngine, setMagicBlockEngine] = useAtom(magicBlockEngineAtom)

  useEffect(() => {
    if (session) {
      setMagicBlockEngine(
        new MagicBlockEngine(walletContext, session, {
          minLamports: SESSION_MIN_LAMPORTS,
          maxLamports: SESSION_MAX_LAMPORTS,
        })
      )
    } else {
      setMagicBlockEngine(null)
    }
  }, [walletContext, session, setMagicBlockEngine])

  if (!magicBlockEngine) return <>{splash}</>

  return <>{children}</>
}
