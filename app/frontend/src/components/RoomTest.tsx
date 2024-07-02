import { atom, useAtom, useAtomValue, useSetAtom } from 'jotai'
import { FC, useEffect, useRef } from 'react'
import { Character, CharacterActionType, charactersAtom } from './Character'

export const windowSizeAtom = atom(1)
export const scaleFactorAtom = atom((get) => get(windowSizeAtom) / 208)
export const roomTotalStepSizeAtom = atom(52)

export const RoomTest: FC = () => {
  const container = useRef<HTMLDivElement>(null)
  const setWindowSize = useSetAtom(windowSizeAtom)
  const scaleFactor = useAtomValue(scaleFactorAtom)
  const [character, action] = useAtom(charactersAtom('me'))

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

  return (
    <div
      ref={container}
      className='fixed inset-0 bg-black flex flex-col items-center justify-center pointer-events-none select-none'
    >
      <div className='landscape:h-full portrait:w-full aspect-square bg-white relative select-none'>
        <img
          src='/room_test.png'
          className='w-full h-full absolute inset-0 select-none'
        />
        <Character id='1' />
        <Character id='me' />
        <div
          className='absolute bg-black/80 flex items-center justify-center select-none'
          style={{
            width: `${scaleFactor * 16 * 3}px`,
            height: `${scaleFactor * 16}px`,
            top: `${scaleFactor * 16}px`,
            left: `${scaleFactor * 16 * 5}px`,
          }}
        >
          <img
            src='/no_entry.png'
            style={{
              width: `${scaleFactor * 16}px`,
              height: `${scaleFactor * 16}px`,
            }}
          />
        </div>
        <div
          className='absolute bg-black/80 flex items-center justify-center select-none'
          style={{
            width: `${scaleFactor * 16}px`,
            height: `${scaleFactor * 16 * 3}px`,
            right: `${scaleFactor * 16}px`,
            top: `${scaleFactor * 16 * 5}px`,
          }}
        >
          <img
            src='/no_entry.png'
            style={{
              width: `${scaleFactor * 16}px`,
              height: `${scaleFactor * 16}px`,
            }}
          />
        </div>
        <div
          className='absolute bg-black/80 flex items-center justify-center select-none'
          style={{
            width: `${scaleFactor * 16 * 3}px`,
            height: `${scaleFactor * 16}px`,
            bottom: `${scaleFactor * 16}px`,
            left: `${scaleFactor * 16 * 5}px`,
          }}
        >
          <img
            src='/no_entry.png'
            style={{
              width: `${scaleFactor * 16}px`,
              height: `${scaleFactor * 16}px`,
            }}
          />
        </div>
        <div
          className='absolute bg-black/80 flex items-center justify-center select-none'
          style={{
            width: `${scaleFactor * 16}px`,
            height: `${scaleFactor * 16 * 3}px`,
            left: `${scaleFactor * 16}px`,
            top: `${scaleFactor * 16 * 5}px`,
          }}
        >
          <img
            src='/no_entry.png'
            style={{
              width: `${scaleFactor * 16}px`,
              height: `${scaleFactor * 16}px`,
            }}
          />
        </div>
        <div
          className='w-full h-full pointer-events-auto select-none'
          onClick={() => {
            if (character.canAttack) {
              action({ type: CharacterActionType.SLASH })
            }
          }}
          onContextMenu={(e) => {
            e.preventDefault()
            if (character.canAttack) {
              action({ type: CharacterActionType.STAB })
            }
          }}
        ></div>
      </div>
    </div>
  )
}
