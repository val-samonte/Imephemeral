import bs58 from 'bs58'
import { useAtom } from 'jotai'
import { atomWithStorage } from 'jotai/utils'
import { useCallback, useMemo } from 'react'
import { Keypair } from '@solana/web3.js'

export const sessionBaseAtom = atomWithStorage<string | null>(
  'session_address',
  null
)

export const useSessionKeypair = () => {
  const [sessionString, setSessionString] = useAtom(sessionBaseAtom)

  const session = useMemo(() => {
    let keypair
    const sessionString = JSON.parse(
      window.localStorage.getItem('session_address') ?? 'null'
    )
    if (!sessionString) {
      keypair = Keypair.generate()
      setSessionString(bs58.encode(Keypair.generate().secretKey))
      console.log('setting new session')
    } else {
      keypair = Keypair.fromSecretKey(bs58.decode(sessionString))
    }
    return keypair
  }, [sessionString, setSessionString])

  const setSession = useCallback(
    (keypair: Keypair) => {
      setSessionString(bs58.encode(keypair.secretKey))
    },
    [setSessionString]
  )

  return [session, setSession] as const
}
