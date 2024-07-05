// Migrations are an early feature. Currently, they're nothing more than this
// single deploy script that's invoked from the CLI, injecting a provider
// configured from the workspace's Anchor.toml.

import { Program } from '@coral-xyz/anchor'
import {
  AddEntity,
  ApplySystem,
  InitializeComponent,
} from '@magicblock-labs/bolt-sdk'
import { Keypair, PublicKey } from '@solana/web3.js'
import { CreateRoom } from '../target/types/create_room'
import { Room } from '../target/types/room'

const anchor = require('@coral-xyz/anchor')

module.exports = async function (provider) {
  // Configure client to use the provider.
  anchor.setProvider(provider)

  const worldPda = new PublicKey('JBupPMmv4zaXa5c8EdubsCPvoHZwCK7mwnDfmfs8dC5Y')
  const roomComponent = anchor.workspace.Room as Program<Room>
  const systemCreateRoom = anchor.workspace.CreateRoom as Program<CreateRoom>

  const addEntity = await AddEntity({
    payer: provider.wallet.publicKey,
    world: worldPda,
    connection: provider.connection,
  })
  const addEntitySignature = await provider.sendAndConfirm(
    addEntity.transaction
  )
  const roomEntity = addEntity.entityPda

  console.log(
    `Initialized Room Entity (ID=${addEntity.entityPda}). Initialization signature: ${addEntitySignature}`
  )

  const initializeComponent = await InitializeComponent({
    payer: provider.wallet.publicKey,
    entity: roomEntity,
    componentId: roomComponent.programId,
  })
  const initializeRoomComponentsignature = await provider.sendAndConfirm(
    initializeComponent.transaction
  )

  const roomPda = initializeComponent.componentPda
  console.log(
    `Initialized the room component ${roomPda}. Initialization signature: ${initializeRoomComponentsignature}`
  )

  const applyCreateRoomSystem = await ApplySystem({
    authority: provider.wallet.publicKey,
    systemId: systemCreateRoom.programId,
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
    args: {
      // todo: figure out how to pass Pubkeys
      floor: Array.from(Keypair.generate().publicKey.toBytes()),
    },
  })

  const createRoomSignature = await provider.sendAndConfirm(
    applyCreateRoomSystem.transaction
  )
  console.log(`Applied a create room system. Signature: ${createRoomSignature}`)
}
