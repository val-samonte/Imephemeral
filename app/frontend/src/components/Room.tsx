import { atom, useAtomValue, useSetAtom } from 'jotai'
import { FC, useEffect, useRef } from 'react'
import { characterEntityPdaAtom } from '../atoms/characterPdaAtom'
import { magicBlockEngineAtom } from '../engine/MagicBlockEngineWrapper'
import { DUMMY_ROOM_PDA } from '../engine/programs'
import { roomListen } from '../engine/roomListen'
import { LockIndicators } from './LockIndicators'

export const windowSizeAtom = atom(1)
export const scaleFactorAtom = atom((get) => get(windowSizeAtom) / 208)
export const roomTotalStepSizeAtom = atom(52)

export const characterListAtom = atom<string[]>([])

export const Room: FC = () => {
  const container = useRef<HTMLDivElement>(null)
  const setWindowSize = useSetAtom(windowSizeAtom)
  const scaleFactor = useAtomValue(scaleFactorAtom)
  const characterEntityPda = useAtomValue(characterEntityPdaAtom)
  const engine = useAtomValue(magicBlockEngineAtom)

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
    return roomListen(engine, DUMMY_ROOM_PDA, (roomData) => {
      console.log(roomData)
    })
  }, [engine])

  useEffect(() => {
    // todo:
    // listen to character entity's component PDA
    //   const counterPda = FindComponentPda({
    //     componentId: counterComponent.programId,
    //     entity: entityPda,
    // });
  }, [characterEntityPda])

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
      </div>
    </div>
  )
}
