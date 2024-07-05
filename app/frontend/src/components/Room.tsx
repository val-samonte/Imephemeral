import { atom, useAtom, useAtomValue, useSetAtom } from 'jotai'
import { FC, useEffect, useRef, useState } from 'react'
import { IdlAccounts } from '@coral-xyz/anchor'
import { FindComponentPda } from '@magicblock-labs/bolt-sdk'
import { myCharacterComponentAtom } from '../atoms/characterPdaAtom'
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
  id: string
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
    console.log(roomData?.characterCount)
    // get all characters
    const component = getComponentCharacterOnEphemeral(engine)
    // // TODO: use filter when calling all, check for rooms
    component.account.character.all().then((characters) => {
      const list: CharacterType[] = []
      characters.forEach((character) => {
        list.push({
          ...character.account,
          id: character.publicKey.toBase58(),
        } as unknown as CharacterType)
      })
      setCharacters(list)
    })
  }, [engine, roomData?.characterCount, setCharacters])

  // listen to all characters
  useEffect(() => {
    console.log(characters)
  }, [characters])

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

        {characters.map((character) => (
          <CharacterOnchain
            character={character}
            key={`character_${character.id}`}
            me={character.id === myCharacter}
          />
        ))}
      </div>
    </div>
  )
}
