import * as anchor from '@coral-xyz/anchor'
import { PublicKey } from '@solana/web3.js'

describe('Imephemeral', () => {
  // Configure the client to use the local cluster.
  const provider = anchor.AnchorProvider.env()
  anchor.setProvider(provider)

  // Constants used to test the program.
  let worldPda: PublicKey
})
