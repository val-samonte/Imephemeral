import { atom, useAtom, useAtomValue, useSetAtom } from 'jotai'
import { FC, useEffect, useRef, useState } from 'react'
import { IdlAccounts } from '@coral-xyz/anchor'
import { FindComponentPda } from '@magicblock-labs/bolt-sdk'
import { PublicKey } from '@solana/web3.js'
import { myCharacterComponentAtom } from '../atoms/characterPdaAtom'
import { characterListen } from '../engine/characterListen'
import { magicBlockEngineAtom } from '../engine/MagicBlockEngineWrapper'
import {
  COMPONENT_ROOM_PROGRAM_ID,
  DUMMY_ROOM_PDA,
  getComponentCharacterOnEphemeral,
} from '../engine/programs'
import { roomListen } from '../engine/roomListen'
import { Character } from '../types/character'
import { Room as RoomType } from '../types/room'
import { CharacterOnchain } from './CharacterOnchain'
import { LockIndicators } from './LockIndicators'

export const windowSizeAtom = atom(1)
export const scaleFactorAtom = atom((get) => get(windowSizeAtom) / 208)
export const roomTotalStepSizeAtom = atom(52)
export const roomAtom = atom<IdlAccounts<RoomType>['room'] | null>(null)

export type CharacterType = IdlAccounts<Character>['character'] & {
  id: PublicKey
}

export const Room: FC = () => {
  const container = useRef<HTMLDivElement>(null)
  const setWindowSize = useSetAtom(windowSizeAtom)
  const scaleFactor = useAtomValue(scaleFactorAtom)
  const myCharacter = useAtomValue(myCharacterComponentAtom)
  const engine = useAtomValue(magicBlockEngineAtom)
  const [roomData, setRoomData] = useAtom(roomAtom)
  const [characters, setCharacters] = useState<CharacterType[]>([])

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
    const roomComponent = FindComponentPda({
      componentId: COMPONENT_ROOM_PROGRAM_ID,
      entity: DUMMY_ROOM_PDA,
    })
    return roomListen(
      engine,
      roomComponent,
      (roomData: IdlAccounts<RoomType>['room'] | null) => {
        setRoomData(roomData)
      }
    )
  }, [engine, setRoomData])

  useEffect(() => {
    if (!engine || !roomData?.characterCount) return
    // get all characters
    const component = getComponentCharacterOnEphemeral(engine)
    // // TODO: use filter when calling all, check for rooms
    component.account.character.all().then((characters) => {
      const list: CharacterType[] = []
      characters.forEach((character) => {
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
              me={id === myCharacter}
            />
          )
        })}
      </div>
    </div>
  )
}
