import bs58 from 'bs58'
import { atom, useAtom, useSetAtom } from 'jotai'
import { useAtomCallback } from 'jotai/utils'
import PartySocket from 'partysocket'
import usePartySocket from 'partysocket/react'
import { useEffect, useMemo, useState } from 'react'
import { sign } from 'tweetnacl'
import { useSessionKeypair } from '../hooks/useSessionKeypair'
import {
  Character,
  CharacterActionType,
  charactersAtom,
  charactersListAtom,
} from './Character'

// apply attack hitbox
// apply damage, damage values (stab, slash)

// remove killed (other server action like "update")

// kill count++

// respawn

// dungeon room assets

// floor generation

export const wsAtom = atom<PartySocket | null>(null)

export type PartykitMessage = {
  type: 'update'
  characters: Character[]
}

export const Account = () => {
  const [session] = useSessionKeypair()
  const setPartySocket = useSetAtom(wsAtom)
  const [charactersList, setCharactersList] = useAtom(charactersListAtom)
  const [connected, setConnected] = useState(false)

  const joined = useMemo(
    () => charactersList.includes(session?.publicKey.toBase58() ?? ''),
    [charactersList, session]
  )

  const handleUpdate = useAtomCallback((_, action, character: Character) => {
    const { id, ...rest } = character
    action(charactersAtom(id), {
      type: CharacterActionType.BACKEND_UPDATE,
      character: rest,
    })
  })
  // connect to lobby

  const ws = usePartySocket({
    host: 'localhost:1999',
    room: 'imephemerals-test-lobby',
    query: async () => {
      if (!session) return {}

      const signature = bs58.encode(
        sign.detached(session.publicKey.toBuffer(), session.secretKey)
      )
      return {
        token: session.publicKey.toBase58() + '.' + signature,
      }
    },
    onOpen() {
      console.log('connected')
      setConnected(true)
    },
    onMessage(e) {
      const message = JSON.parse(e.data) as PartykitMessage
      console.log(message)
      switch (message.type) {
        case 'update': {
          const ids = message.characters.map((c) => {
            handleUpdate(c)
            return c.id
          })

          setCharactersList((list) => {
            const newList = new Set(list)
            ids.forEach((id) => newList.add(id))
            return Array.from(newList)
          })
        }
      }
    },
    onClose(e) {
      console.log('closed', e.code)
      setConnected(false)
    },
    onError(e) {
      console.log('error', e)
    },
  })

  useEffect(() => {
    if (ws) {
      setPartySocket(ws)
    }
    return () => {
      ws?.close()
      setPartySocket(null)
    }
  }, [ws, setPartySocket])

  if (!connected)
    return <div className='text-white font-mono font-bold'>Connecting...</div>

  if (!joined) {
    return (
      <button
        className='absolute inset-0 p-5 bg-black/50 flex items-center justify-center pointer-events-auto'
        onClick={() => {
          ws.send(
            JSON.stringify({
              type: 'JOIN',
            })
          )
        }}
      >
        <div className='px-3 py-2 text-white bg-slate-600 font-mono font-bold'>
          Respawn
        </div>
      </button>
    )
  }

  return null
}
