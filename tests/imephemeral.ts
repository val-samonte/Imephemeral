import { assert, expect } from 'chai'
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
import { Attack } from '../target/types/attack'
import { BlockAttack } from '../target/types/block_attack'
import { Character } from '../target/types/character'
import { CreateRoom } from '../target/types/create_room'
import { MoveCharacter } from '../target/types/move_character'
import { Room } from '../target/types/room'
import { Spawn } from '../target/types/spawn'
import { SwitchAttackType } from '../target/types/switch_attack_type'

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
  const floorPda = Keypair.generate().publicKey

  let roomEntity: PublicKey
  let roomPda: PublicKey

  let entityPda1: PublicKey
  let characterPda1: PublicKey

  let entityPda2: PublicKey
  let characterPda2: PublicKey

  const roomComponent = workspace.Room as Program<Room>
  const characterComponent = workspace.Character as Program<Character>
  const systemCreateRoom = workspace.CreateRoom as Program<CreateRoom>
  const systemSpawn = workspace.Spawn as Program<Spawn>
  const systemMove = workspace.MoveCharacter as Program<MoveCharacter>
  const systemSwitchAttackType =
    workspace.SwitchAttackType as Program<SwitchAttackType>
  const systemBlockAttack = workspace.BlockAttack as Program<BlockAttack>
  const systemAttack = workspace.Attack as Program<Attack>

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

  it('Add Room Entity', async () => {
    const addEntity = await AddEntity({
      payer: provider.wallet.publicKey,
      world: worldPda,
      connection: provider.connection,
    })
    const signature = await provider.sendAndConfirm(addEntity.transaction)
    roomEntity = addEntity.entityPda
    console.log(
      `Initialized Room Entity (ID=${addEntity.entityPda}). Initialization signature: ${signature}`
    )
  })

  it('Initialize the room component', async () => {
    const initializeComponent = await InitializeComponent({
      payer: provider.wallet.publicKey,
      entity: roomEntity,
      componentId: roomComponent.programId,
    })
    const signature = await provider.sendAndConfirm(
      initializeComponent.transaction
    )

    roomPda = initializeComponent.componentPda
    console.log(
      `Initialized the room component ${roomPda}. Initialization signature: ${signature}`
    )
  })

  it('Create a room', async () => {
    await tryApplySystem({
      systemId: systemCreateRoom.programId,
      args: {
        // todo: figure out how to pass Pubkeys
        floor: Array.from(floorPda.toBytes()),
      },
      entities: [
        {
          entity: roomEntity,
          components: [
            {
              componentId: roomComponent.programId,
            },
          ],
        },
      ],
    })
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

  it('Initialize the first characterPda', async () => {
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
      `Initialized the character component 1 ${characterPda1}. Initialization signature: ${signature}`
    )
  })

  it('Spawn the 1st character to the room', async () => {
    await tryApplySystem({
      systemId: systemSpawn.programId,
      args: {},
      entities: [
        {
          entity: entityPda1,
          components: [
            {
              componentId: characterComponent.programId,
            },
          ],
        },
        {
          entity: roomEntity,
          components: [
            {
              componentId: roomComponent.programId,
            },
          ],
        },
      ],
    })

    const character1Data = await characterComponent.account.character.fetch(
      characterPda1
    )

    assert(
      character1Data.authority.equals(provider.wallet.publicKey),
      'Authority is invalid'
    )
    assert(character1Data.room.equals(roomPda), 'Room is invalid')
    expect(character1Data.x).to.equal(24, 'Default x position is invalid')
    expect(character1Data.y).to.equal(24, 'Default y position is invalid')
  })

  it('Move the character', async () => {
    await tryApplySystem({
      systemId: systemMove.programId,
      args: {
        direction: 0b0001,
      },
      entities: [
        {
          entity: entityPda1,
          components: [
            {
              componentId: characterComponent.programId,
            },
          ],
        },
      ],
    })
    const character1Data = await characterComponent.account.character.fetch(
      characterPda1
    )
    expect(character1Data.x).to.equal(23, 'New x position is invalid')
  })

  it('Switch attack type the character', async () => {
    await tryApplySystem({
      systemId: systemSwitchAttackType.programId,
      args: {
        attack_type: 1,
      },
      entities: [
        {
          entity: entityPda1,
          components: [
            {
              componentId: characterComponent.programId,
            },
          ],
        },
      ],
    })
    const character1Data = await characterComponent.account.character.fetch(
      characterPda1
    )
    expect(character1Data.attackType).to.equal(1, 'Attack type is invalid')
  })

  it('Block attack', async () => {
    const previousData = await characterComponent.account.character.fetch(
      characterPda1
    )
    await tryApplySystem({
      systemId: systemBlockAttack.programId,
      args: {},
      entities: [
        {
          entity: entityPda1,
          components: [
            {
              componentId: characterComponent.programId,
            },
          ],
        },
      ],
    })

    const character1Data = await characterComponent.account.character.fetch(
      characterPda1
    )
    expect(character1Data.nextBlock).to.not.equal(
      previousData.nextBlock,
      'Attack type is invalid'
    )
  })

  it('Create and Spawn another character', async () => {
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

    const initializeComponent = await InitializeComponent({
      payer: provider.wallet.publicKey,
      entity: entityPda2,
      componentId: characterComponent.programId,
    })
    const signature2 = await provider.sendAndConfirm(
      initializeComponent.transaction
    )

    characterPda2 = initializeComponent.componentPda
    console.log(
      `Initialized the character component 2 ${characterPda2}. Initialization signature: ${signature2}`
    )

    await tryApplySystem({
      systemId: systemSpawn.programId,
      args: {},
      entities: [
        {
          entity: entityPda2,
          components: [
            {
              componentId: characterComponent.programId,
            },
          ],
        },
        {
          entity: roomEntity,
          components: [
            {
              componentId: roomComponent.programId,
            },
          ],
        },
      ],
    })

    const roomData = await roomComponent.account.room.fetch(roomPda)
    expect(roomData.characterCount).to.equal(2, 'Character count is invalid')
  })

  it('Move character 1 to prepare an attack', async () => {
    await tryApplySystem({
      systemId: systemMove.programId,
      args: {
        direction: 0b0001,
      },
      entities: [
        {
          entity: entityPda1,
          components: [
            {
              componentId: characterComponent.programId,
            },
          ],
        },
      ],
    })
    await tryApplySystem({
      systemId: systemMove.programId,
      args: {
        direction: 0b0001,
      },
      entities: [
        {
          entity: entityPda1,
          components: [
            {
              componentId: characterComponent.programId,
            },
          ],
        },
      ],
    })
    await tryApplySystem({
      systemId: systemMove.programId,
      args: {
        direction: 0b0100,
      },
      entities: [
        {
          entity: entityPda1,
          components: [
            {
              componentId: characterComponent.programId,
            },
          ],
        },
      ],
    })

    // check position
    const character1Data = await characterComponent.account.character.fetch(
      characterPda1
    )

    expect(character1Data.x).to.equal(22, 'New x position is invalid')
    expect(character1Data.facing).to.equal(
      0b0100,
      'Character is not facing to the correct direction'
    )
  })

  it('Attack character 2', async () => {
    await tryApplySystem({
      systemId: systemAttack.programId,
      args: {},
      entities: [
        {
          entity: entityPda1,
          components: [
            {
              componentId: characterComponent.programId,
            },
          ],
        },
        {
          entity: entityPda2,
          components: [
            {
              componentId: characterComponent.programId,
            },
          ],
        },
        {
          entity: roomEntity,
          components: [
            {
              componentId: roomComponent.programId,
            },
          ],
        },
      ],
    })

    // check health
    const character2Data = await characterComponent.account.character.fetch(
      characterPda2
    )

    expect(character2Data.hp).to.equal(76, 'Health is invalid')
  })

  function sleep(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms))
  }

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
      args,
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
