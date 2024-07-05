import {
  AddEntity,
  createDelegateInstruction,
  InitializeComponent,
} from '@magicblock-labs/bolt-sdk'
import { Transaction } from '@solana/web3.js'
import { MagicBlockEngine } from './MagicBlockEngine'
import { COMPONENT_CHARACTER_PROGRAM_ID, WORLD_PDA } from './programs'

export const createCharacter = async (engine: MagicBlockEngine) => {
  const payer = engine.getSessionPayer()

  const addEntity = await AddEntity({
    payer,
    world: WORLD_PDA,
    connection: engine.getConnectionChain(),
  })

  await engine.processSessionChainTransaction(
    'AddEntity',
    addEntity.transaction,
    'confirmed'
  )

  const entityPda = addEntity.entityPda

  console.log(`Initialized Entity (ID=${addEntity.entityPda}).`)

  const initializeComponent = await InitializeComponent({
    payer,
    entity: entityPda,
    componentId: COMPONENT_CHARACTER_PROGRAM_ID,
  })

  await engine.processSessionChainTransaction(
    'InitializeComponent',
    initializeComponent.transaction,
    'confirmed'
  )

  const characterPda = initializeComponent.componentPda

  console.log(`Initialized the character component ${characterPda}.`)

  console.log('Delegating the Character')

  const delegateComponentInstruction = createDelegateInstruction({
    entity: addEntity.entityPda,
    account: initializeComponent.componentPda,
    ownerProgram: COMPONENT_CHARACTER_PROGRAM_ID,
    payer: engine.getSessionPayer(),
  })

  const delegateSignature = await engine.processSessionChainTransaction(
    'DelegateComponent',
    new Transaction().add(delegateComponentInstruction),
    'finalized'
  )

  console.log('Character is now delegated. Signature: ', delegateSignature)

  return entityPda
}
