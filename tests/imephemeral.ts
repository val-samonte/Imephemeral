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
import { BlockAttack } from '../target/types/block_attack'
import { Character } from '../target/types/character'
import { MoveCharacter } from '../target/types/move_character'
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
  const roomPda = Keypair.generate().publicKey

  let entityPda1: PublicKey
  let characterPda1: PublicKey

  const characterComponent = workspace.Character as Program<Character>
  const systemSpawn = workspace.Spawn as Program<Spawn>
  const systemMove = workspace.MoveCharacter as Program<MoveCharacter>
  const systemSwitchAttackType =
    workspace.SwitchAttackType as Program<SwitchAttackType>
  const systemBlockAttack = workspace.BlockAttack as Program<BlockAttack>

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
      args: {
        // todo: figure out how to pass Pubkeys
        room: Array.from(roomPda.toBytes()),
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

  // | {
  //     type: CharacterActionType.ATTACK
  //   }

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
