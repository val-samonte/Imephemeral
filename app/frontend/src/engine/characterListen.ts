import { PublicKey } from '@solana/web3.js'
import { MagicBlockEngine } from './MagicBlockEngine'
import { getComponentCharacterOnEphemeral } from './programs'

export const characterListen = (
  engine: MagicBlockEngine,
  characterPda: PublicKey,
  setCharacter: (character: any) => void
) => {
  const component = getComponentCharacterOnEphemeral(engine)

  let cancelled = false
  component.account.character
    .fetchNullable(characterPda)
    .catch(console.error)
    .then((character) => {
      if (!cancelled) {
        setCharacter(character)
      }
    })

  const roomWatcher = component.account.character.subscribe(characterPda)
  roomWatcher.addListener('change', setCharacter)

  return () => {
    cancelled = true
    roomWatcher.removeListener(setCharacter as any)
  }
}
