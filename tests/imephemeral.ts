import { expect } from 'chai'
import {
  AnchorProvider,
  Program,
  setProvider,
  workspace,
} from '@coral-xyz/anchor'
import {
  AddEntity,
  ApplySystem,
  InitializeComponent,
  InitializeNewWorld,
} from '@magicblock-labs/bolt-sdk'
import { Keypair, PublicKey } from '@solana/web3.js'
import { Character } from '../target/types/character'
import { Spawn } from '../target/types/spawn'

interface ApplySystemComponent {
  componentId: PublicKey
  seed?: string
}

interface ApplySystemEntity {
  entity: PublicKey
  components: ApplySystemComponent[]
}

describe('Imephemeral', () => {
  // Configure the client to use the local cluster.
  const provider = AnchorProvider.env()
  setProvider(provider)

  // Constants used to test the program.
  let worldPda: PublicKey
  const roomPda = Keypair.generate().publicKey

  let entityPda1: PublicKey
  let characterPda1: PublicKey

  let entityPda2: PublicKey
  let characterPda2: PublicKey

  const characterComponent = workspace.Character as Program<Character>
  const systemSpawn = workspace.Spawn as Program<Spawn>

  it('InitializeNewWorld', async () => {
    const initializeNewWorld = await InitializeNewWorld({
      payer: provider.wallet.publicKey,
      connection: provider.connection,
    })
    const signature = await provider.sendAndConfirm(
      initializeNewWorld.transaction
    )
    worldPda = initializeNewWorld.worldPda
    console.log(
      `Initialized a new world (ID=${worldPda}). Initialization signature: ${signature}`
    )
  })

  it('Add Entity 1', async () => {
    const addEntity = await AddEntity({
      payer: provider.wallet.publicKey,
      world: worldPda,
      connection: provider.connection,
    })
    const signature = await provider.sendAndConfirm(addEntity.transaction)
    entityPda1 = addEntity.entityPda
    console.log(
      `Initialized Entity 1 (ID=${addEntity.entityPda}). Initialization signature: ${signature}`
    )
  })

  it('Add Entity 2', async () => {
    const addEntity = await AddEntity({
      payer: provider.wallet.publicKey,
      world: worldPda,
      connection: provider.connection,
    })
    const signature = await provider.sendAndConfirm(addEntity.transaction)
    entityPda2 = addEntity.entityPda
    console.log(
      `Initialized Entity 2 (ID=${addEntity.entityPda}). Initialization signature: ${signature}`
    )
  })

  it('Spawn the first character', async () => {
    const initializeComponent = await InitializeComponent({
      payer: provider.wallet.publicKey,
      entity: entityPda1,
      componentId: characterComponent.programId,
    })
    const signature = await provider.sendAndConfirm(
      initializeComponent.transaction
    )

    characterPda1 = initializeComponent.componentPda
    console.log(
      `Initialized the character component 1. Initialization signature: ${signature}`
    )

    // Todo - account not initialized
    await tryApplySystem({
      systemId: systemSpawn.programId,
      args: {
        room: roomPda,
      },
      entities: [
        {
          entity: entityPda1,
          components: [
            {
              componentId: characterPda1,
            },
          ],
        },
      ],
    })

    const character1Data = await characterComponent.account.character.fetch(
      characterPda1
    )

    expect(
      character1Data.authority.equals(provider.wallet.publicKey)
    ).to.be.true('Authority is invalid')
    expect(character1Data.room.equals(roomPda)).to.be.true('Invalid room')
    expect(character1Data.x).to.equal(24, 'Default x position is invalid')
    expect(character1Data.y).to.equal(24, 'Default y position is invalid')

    console.log(`Character 1 data: ${JSON.stringify(character1Data)}`)
  })

  it('Spawn the second character', async () => {
    const initializeComponent = await InitializeComponent({
      payer: provider.wallet.publicKey,
      entity: entityPda1,
      componentId: characterComponent.programId,
    })
    const signature = await provider.sendAndConfirm(
      initializeComponent.transaction
    )

    characterPda1 = initializeComponent.componentPda
    console.log(
      `Initialized the character component 2. Initialization signature: ${signature}`
    )
  })

  async function tryApplySystem({
    systemId,
    args,
    entities,
    expectedError,
  }: {
    systemId: PublicKey
    args: {}
    entities: ApplySystemEntity[]
    expectedError?: string
  }) {
    const applySystem = await ApplySystem({
      authority: provider.wallet.publicKey,
      systemId,
      entities,
      args: args,
    })
    let success = true
    try {
      const signature = await provider.sendAndConfirm(applySystem.transaction)
      console.log(`Applied a system. Signature: ${signature}`)
    } catch (error) {
      success = false
      if (expectedError) {
        expect(error.toString()).to.include(expectedError)
      } else {
        console.log('unexpected error:', error)
      }
    }
    expect(success).to.equal(!expectedError)
  }
})
