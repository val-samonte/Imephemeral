import { useAtomValue } from 'jotai'
import { FC } from 'react'
import {
  AddEntity,
  ApplySystem,
  createDelegateInstruction,
  InitializeComponent,
} from '@magicblock-labs/bolt-sdk'
import { useWallet } from '@solana/wallet-adapter-react'
import { useWalletModal } from '@solana/wallet-adapter-react-ui'
import { Keypair, Transaction } from '@solana/web3.js'
import { magicBlockEngineAtom } from '../engine/MagicBlockEngineWrapper'
import {
  COMPONENT_ROOM_PROGRAM_ID,
  SYSTEM_CREATE_ROOM_PROGRAM_ID,
  WORLD_PDA,
} from '../engine/programs'

// this is to create the demo room
// you do not need this

export const InitializeRoom: FC = () => {
  const { publicKey, disconnect } = useWallet()
  const { setVisible } = useWalletModal()
  const engine = useAtomValue(magicBlockEngineAtom)

  const init = async () => {
    if (!engine) return

    console.log('Creating a new entity')

    const addEntity = await AddEntity({
      connection: engine.getConnectionChain(),
      payer: engine.getSessionPayer(),
      world: WORLD_PDA,
    })
    await engine.processSessionChainTransaction(
      'AddEntity',
      addEntity.transaction,
      'confirmed'
    )

    console.log('Initializing the room component')

    const initializeComponent = await InitializeComponent({
      payer: engine.getSessionPayer(),
      entity: addEntity.entityPda,
      componentId: COMPONENT_ROOM_PROGRAM_ID,
    })
    await engine.processSessionChainTransaction(
      'InitializeComponent',
      initializeComponent.transaction,
      'confirmed'
    )

    console.log('Delegating to Ephemeral rollups')

    const delegateComponentInstruction = createDelegateInstruction({
      entity: addEntity.entityPda,
      account: initializeComponent.componentPda,
      ownerProgram: COMPONENT_ROOM_PROGRAM_ID,
      payer: engine.getSessionPayer(),
    })
    await engine.processSessionChainTransaction(
      'DelegateComponent',
      new Transaction().add(delegateComponentInstruction),
      'finalized'
    )

    const applySystem = await ApplySystem({
      authority: engine.getSessionPayer(),
      systemId: SYSTEM_CREATE_ROOM_PROGRAM_ID,
      args: {
        // todo: figure out how to pass Pubkeys
        floor: Array.from(Keypair.generate().publicKey.toBytes()),
      },
      entities: [
        {
          entity: addEntity.entityPda,
          components: [
            {
              componentId: COMPONENT_ROOM_PROGRAM_ID,
            },
          ],
        },
      ],
    })
    await engine.processSessionEphemeralTransaction(
      'SystemCreateRoom',
      applySystem.transaction
    )

    console.log('Entity PDA', addEntity.entityPda.toBase58())
  }

  return (
    <div className='fixed inset-x-0 top-0 h-screen flex flex-col items-center justify-center'>
      <div className='flex flex-col gap-2 max-w-md mx-auto my-5'>
        <h1 className='text-3xl font-bold underline'>Initialize Room</h1>
        <button
          className='px-2 py-1 bg-slate-400 hover:bg-slate-500'
          onClick={() => setVisible(true)}
        >
          Show Wallet Modal
        </button>
        {publicKey && (
          <>
            <p>Wallet public key: {publicKey.toBase58()}</p>
            {engine && (
              <p>Session Pubkey: {engine?.sessionKey.publicKey.toBase58()}</p>
            )}
            <button
              className='px-2 py-1 bg-slate-400 hover:bg-slate-500'
              onClick={() => disconnect()}
            >
              Disconnect
            </button>
            <div className='w-full my-2 border-b border-gray-300'></div>
            <button
              className='px-2 py-1 bg-slate-400 hover:bg-slate-500'
              onClick={() => {
                if (!engine) return
                engine.fundSession()
              }}
            >
              Fund Session
            </button>
            <button
              className='px-2 py-1 bg-slate-400 hover:bg-slate-500'
              onClick={init}
            >
              Initialize Demo Room
            </button>
          </>
        )}
      </div>
    </div>
  )
}
