import { PublicKey } from '@solana/web3.js'
import { MagicBlockEngine } from './MagicBlockEngine'
import { getComponentRoomOnEphemeral } from './programs'

export const roomListen = (
  engine: MagicBlockEngine,
  roomPda: PublicKey,
  setRoom: (game: any) => void
) => {
  const component = getComponentRoomOnEphemeral(engine)

  let cancelled = false
  component.account.room
    .fetchNullable(roomPda)
    .catch(console.error)
    .then((game) => {
      if (!cancelled) {
        setRoom(game)
      }
    })

  const roomWatcher = component.account.room.subscribe(roomPda)
  roomWatcher.addListener('change', setRoom)

  return () => {
    cancelled = true
    roomWatcher.removeListener(setRoom as any)
  }
}
