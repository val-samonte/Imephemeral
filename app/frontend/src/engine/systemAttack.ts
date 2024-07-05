import { ApplySystem } from '@magicblock-labs/bolt-sdk'
import { PublicKey } from '@solana/web3.js'
import { MagicBlockEngine } from './MagicBlockEngine'
import {
  COMPONENT_CHARACTER_PROGRAM_ID,
  COMPONENT_ROOM_PROGRAM_ID,
  DUMMY_ROOM_PDA,
  SYSTEM_ATTACK_PROGRAM_ID,
} from './programs'

export const systemAttack = async (
  engine: MagicBlockEngine,
  characterEntity: PublicKey,
  targetEntity: PublicKey
) => {
  const applySystem = await ApplySystem({
    authority: engine.getSessionPayer(),
    systemId: SYSTEM_ATTACK_PROGRAM_ID,
    entities: [
      {
        entity: characterEntity,
        components: [
          {
            componentId: COMPONENT_CHARACTER_PROGRAM_ID,
          },
        ],
      },
      {
        entity: targetEntity,
        components: [
          {
            componentId: COMPONENT_CHARACTER_PROGRAM_ID,
          },
        ],
      },
      {
        entity: DUMMY_ROOM_PDA,
        components: [
          {
            componentId: COMPONENT_ROOM_PROGRAM_ID,
          },
        ],
      },
    ],
  })
  await engine.processSessionChainTransaction(
    'SystemAttack',
    applySystem.transaction
  )
}
