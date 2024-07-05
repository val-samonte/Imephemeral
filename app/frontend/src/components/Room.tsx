import { atom, useAtom, useAtomValue, useSetAtom } from 'jotai'
import { FC, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { IdlAccounts, ProgramAccount } from '@coral-xyz/anchor'
import { PublicKey } from '@solana/web3.js'
import {
  characterEntityPdaAtom,
  myCharacterComponentAtom,
} from '../atoms/characterPdaAtom'
import { characterListen } from '../engine/characterListen'
import { magicBlockEngineAtom } from '../engine/MagicBlockEngineWrapper'
import {
  DUMMY_ROOM_COMPONENT,
  getComponentCharacterOnEphemeral,
} from '../engine/programs'
import { roomListen } from '../engine/roomListen'
import { Character } from '../types/character'
import { Room as RoomType } from '../types/room'
import { CharacterOnchain } from './CharacterOnchain'
import { LockIndicators } from './LockIndicators'
import { MagicBlockEngine } from '../engine/MagicBlockEngine'
import { systemBlockAttack } from '../engine/systemBlockAttack'

export const windowSizeAtom = atom(1)
export const scaleFactorAtom = atom((get) => get(windowSizeAtom) / 208)
export const roomTotalStepSizeAtom = atom(52)
export const roomAtom = atom<IdlAccounts<RoomType>['room'] | null>(null)

export type CharacterType = IdlAccounts<Character>['character'] & {
  id: PublicKey
}

export const charactersAtom = atom<CharacterType[]>([])

export const myCharacterAtom = atom((get) => {
  const characters = get(charactersAtom)
  const myCharacter = get(myCharacterComponentAtom)
  return characters.find((c) => myCharacter?.equals(c.id) ?? null)
})

export const inRangeAtom = atom((get) => {
  const myCharacter = get(myCharacterAtom)
  const characters = get(charactersAtom)

  if (!myCharacter) return []

  // compute the distance between my character and all other characters
  // return the characters that are around 16 tiles in range
  return characters.filter((c) => {
    if (c.id.equals(myCharacter.id)) return false
    return (
      Math.abs(c.x - myCharacter.x) <= 12 && Math.abs(c.y - myCharacter.y) <= 12
    )
  })
})

export const Room: FC = () => {
  const container = useRef<HTMLDivElement>(null)
  const setWindowSize = useSetAtom(windowSizeAtom)
  const scaleFactor = useAtomValue(scaleFactorAtom)
  const myCharacter = useAtomValue(myCharacterComponentAtom)
  const myEntity = useAtomValue(characterEntityPdaAtom)
  const engine = useAtomValue(magicBlockEngineAtom)
  const [roomData, setRoomData] = useAtom(roomAtom)
  const [characters, setCharacters] = useAtom(charactersAtom)
  const navigate = useNavigate()
  const inRange = useAtomValue(inRangeAtom)

  useEffect(() => {
    const resize = () => {
      if (container.current) {
        const { width, height } = container.current.getBoundingClientRect()
        setWindowSize(Math.min(width, height))
      }
    }

    window.addEventListener('resize', resize)
    resize()

    return () => {
      window.removeEventListener('resize', resize)
    }
  }, [setWindowSize])

  useEffect(() => {
    if (!engine) return
    // const roomComponent = FindComponentPda({
    //   componentId: COMPONENT_ROOM_PROGRAM_ID,
    //   entity: DUMMY_ROOM_PDA,
    // })
    return roomListen(
      engine,
      DUMMY_ROOM_COMPONENT,
      (roomData: IdlAccounts<RoomType>['room'] | null) => {
        setRoomData(roomData)
      }
    )
  }, [engine, setRoomData])

  useEffect(() => {
    if (!engine || !roomData?.characterCount) return
    // const roomComponent = FindComponentPda({
    //   componentId: COMPONENT_ROOM_PROGRAM_ID,
    //   entity: DUMMY_ROOM_PDA,
    // })
    // get all characters
    // const component = getComponentCharacterOnEphemeral(engine)
    //TODO: use filter when calling all, check for rooms
    // component.account.character.all()
    all(engine).then((characters) => {
      const list: CharacterType[] = []
      characters.forEach((character) => {
        if (!character.account.room.equals(DUMMY_ROOM_COMPONENT)) return
        list.push({
          ...character.account,
          id: character.publicKey,
        } as unknown as CharacterType)
      })

      setCharacters(list)
    })
  }, [engine, roomData?.characterCount, setCharacters])

  // listen to all characters
  const listenList = useRef<{ id: string; unsubscribe: any }[]>([])
  useEffect(() => {
    if (!engine) return
    characters.forEach((character) => {
      if (
        !listenList.current.find((item) => item.id === character.id.toBase58())
      ) {
        listenList.current.push({
          id: character.id.toBase58(),
          unsubscribe: characterListen(engine, character.id, (update) => {
            setCharacters((characters) => {
              const index = characters.findIndex(
                (item) => item.id.toBase58() === character.id.toBase58()
              )
              if (index === -1) return characters
              characters[index] = {
                ...characters[index],
                ...update,
              }
              return [...characters]
            })
          }),
        })
      }
    })

    // pluck out the characters that are no longer in the room
    listenList.current = listenList.current.filter((item) => {
      if (!characters.find((c) => c.id.toBase58() === item.id)) {
        item.unsubscribe()
        return false
      }
      return true
    })

    return () => {
      listenList.current.forEach((item) => {
        item.unsubscribe()
      })
    }
  }, [engine, characters, setCharacters])

  // todo: show respawn button
  useEffect(() => {
    if (!engine || !myCharacter) return
    // where am i right now? am i in the room?
    // const roomComponent = FindComponentPda({
    //   componentId: COMPONENT_ROOM_PROGRAM_ID,
    //   entity: DUMMY_ROOM_PDA,
    // })
    const component = getComponentCharacterOnEphemeral(engine)
    component.account.character.fetch(myCharacter).then((_character) => {
      // console.log(character.room.toBase58(), roomComponent.toBase58())
    })
  }, [myCharacter])

  return (
    <div
      ref={container}
      className='fixed inset-0 bg-black flex flex-col items-center justify-center select-none'
    >
      <div className='landscape:h-full portrait:w-full aspect-square bg-white relative select-none'>
        <img
          src='/room_test.png'
          className='w-full h-full absolute inset-0 select-none pointer-events-none'
        />

        <LockIndicators scaleFactor={scaleFactor} />

        {characters.map((character) => {
          const id = character.id.toBase58()
          return (
            <CharacterOnchain
              character={character}
              key={`character_${id}`}
              me={myCharacter?.equals(character.id) ?? false}
            />
          )
        })}

        <div
          className='w-full h-full select-none'
          onClick={() => {
            if (inRange.length === 0) return
            if (!engine) return
            if (!myEntity) return
            // todo, problem: we also need to get the entities of the characters
            // systemAttack(engine, myEntity, inRange[0])
          }}
          onContextMenu={(e) => {
            e.preventDefault()
            if (!engine) return
            if (!myEntity) return
            systemBlockAttack(engine, myEntity)
          }}
        />
      </div>
      <div className='text-white font-mono font-bold absolute top-0 left-0 p-5 pointer-events-none'>
        <p>Move: WASD keys</p>
        <hr className='my-2' />
        <h3 className='text-2xl text-yellow-500'>TESTNET</h3>
        <p>This version is still WIP</p>
        <p>
          Checkout the{' '}
          <button
            className='underline pointer-events-auto'
            onClick={() => {
              navigate('/partykit')
            }}
          >
            partykit version
          </button>{' '}
          <br />
          to see what would be the goal
        </p>
      </div>
    </div>
  )
}

async function all(
  engine: MagicBlockEngine
): Promise<ProgramAccount<CharacterType>[]> {
  console.log('all')
  const p = getComponentCharacterOnEphemeral(engine)
  let resp = await p.provider.connection.getProgramAccounts(p.programId, {
    commitment: p.provider.connection.commitment,
    filters: [],
  })

  return resp.map(({ pubkey, account }) => {
    return {
      publicKey: pubkey,
      account: p.coder.accounts.decode('character', account.data),
    }
  })
}
