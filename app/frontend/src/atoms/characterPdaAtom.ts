import bs58 from 'bs58'
import { atom } from 'jotai'
import { atomFamily, atomWithStorage } from 'jotai/utils'
import { FindComponentPda } from '@magicblock-labs/bolt-sdk'
import { Keypair, PublicKey } from '@solana/web3.js'
import { COMPONENT_CHARACTER_PROGRAM_ID } from '../engine/programs'
import { sessionBaseAtom } from '../hooks/useSessionKeypair'

export const characterEntityPdaBaseAtom = atomFamily((sessionPubkey: string) =>
  atomWithStorage<string>(`characterPdaBase_${sessionPubkey}`, '')
)

export const characterEntityPdaAtom = atom(
  (get) => {
    const sessionString = get(sessionBaseAtom)
    if (!sessionString) return null

    const keypair = Keypair.fromSecretKey(bs58.decode(sessionString))

    const base = get(characterEntityPdaBaseAtom(keypair.publicKey.toBase58()))
    return base ? new PublicKey(base) : null
  },
  (get, set, newValue: PublicKey | null) => {
    const sessionString = get(sessionBaseAtom)
    if (!sessionString) return null

    const keypair = Keypair.fromSecretKey(bs58.decode(sessionString))

    set(
      characterEntityPdaBaseAtom(keypair.publicKey.toBase58()),
      newValue?.toBase58() ?? ''
    )
  }
)

export const myCharacterComponentAtom = atom((get) => {
  const entity = get(characterEntityPdaAtom)
  if (!entity) return null

  const component = FindComponentPda({
    componentId: COMPONENT_CHARACTER_PROGRAM_ID,
    entity,
  })

  return component.toBase58()
})
