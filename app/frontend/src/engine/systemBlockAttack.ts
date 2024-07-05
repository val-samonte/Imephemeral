import { ApplySystem } from '@magicblock-labs/bolt-sdk'
import { PublicKey } from '@solana/web3.js'
import { MagicBlockEngine } from './MagicBlockEngine'
import {
  COMPONENT_CHARACTER_PROGRAM_ID,
  SYSTEM_BLOCK_ATTACK_PROGRAM_ID,
} from './programs'

export const systemBlockAttack = async (
  engine: MagicBlockEngine,
  characterEntity: PublicKey
) => {
  const applySystem = await ApplySystem({
    authority: engine.getSessionPayer(),
    systemId: SYSTEM_BLOCK_ATTACK_PROGRAM_ID,
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
    'SystemBlockAttack',
    applySystem.transaction
  )
}
