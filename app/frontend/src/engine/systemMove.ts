import { ApplySystem } from '@magicblock-labs/bolt-sdk'
import { PublicKey } from '@solana/web3.js'
import { MagicBlockEngine } from './MagicBlockEngine'
import {
  COMPONENT_CHARACTER_PROGRAM_ID,
  SYSTEM_MOVE_CHARACTER_PROGRAM_ID,
} from './programs'

export const systemMove = async (
  engine: MagicBlockEngine,
  characterEntity: PublicKey,
  direction: number
) => {
  const applySystem = await ApplySystem({
    authority: engine.getSessionPayer(),
    systemId: SYSTEM_MOVE_CHARACTER_PROGRAM_ID,
    args: {
      direction,
    },
    entities: [
      {
        entity: characterEntity,
        components: [
          {
            componentId: COMPONENT_CHARACTER_PROGRAM_ID,
          },
        ],
      },
    ],
  })
  await engine.processSessionEphemeralTransaction(
    'SystemMove',
    applySystem.transaction
  )
}
