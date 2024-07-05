import { ApplySystem } from '@magicblock-labs/bolt-sdk'
import { PublicKey } from '@solana/web3.js'
import { MagicBlockEngine } from './MagicBlockEngine'
import {
  COMPONENT_CHARACTER_PROGRAM_ID,
  SYSTEM_SWITCH_ATTACK_TYPE_PROGRAM_ID,
} from './programs'

export const systemSwitchAttackType = async (
  engine: MagicBlockEngine,
  characterEntity: PublicKey,
  attackType: number
) => {
  const applySystem = await ApplySystem({
    authority: engine.getSessionPayer(),
    systemId: SYSTEM_SWITCH_ATTACK_TYPE_PROGRAM_ID,
    args: {
      attack_type: attackType,
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
  await engine.processSessionChainTransaction(
    'SystemSwitchAttackType',
    applySystem.transaction
  )
}
