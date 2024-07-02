import { atom, useAtom, useSetAtom } from 'jotai'
import { FC, useEffect, useRef } from 'react'
import { Character, CharacterActionType, charactersAtom } from './Character'

export const windowSizeAtom = atom(1)
export const scaleFactorAtom = atom((get) => get(windowSizeAtom) / 208)
export const roomTotalStepSizeAtom = atom(52)

export const RoomTest: FC = () => {
  const container = useRef<HTMLDivElement>(null)
  const setWindowSize = useSetAtom(windowSizeAtom)
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
      className='fixed inset-0 bg-black flex flex-col items-center justify-center'
    >
      <div
        className='landscape:h-full portrait:w-full aspect-square bg-white relative'
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
      >
        <img
          src='/room_test.png'
          className='w-full h-full absolute inset-0 select-none pointer-events-none'
        />
        <Character id='me' />
      </div>
    </div>
  )
}
