import { atom, useAtomValue, useSetAtom } from 'jotai'
import { FC, useEffect, useRef } from 'react'
import { sessionAddressAtom } from './Account'
import { CharacterActionType, charactersAtom } from './Character'

export const keypressedAtom = atom('')

export const Controller: FC = () => {
  const sessionAddress = useAtomValue(sessionAddressAtom)
  const action = useSetAtom(charactersAtom(sessionAddress))
  const setKeyPressed = useSetAtom(keypressedAtom)
  const pressedKeysList = useRef<string[]>([])

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      event.preventDefault()
      switch (event.key) {
        case 'q': {
          action({ type: CharacterActionType.SWITCH_ATTACK })
          break
        }
        // to game loop
        default: {
          pressedKeysList.current = pressedKeysList.current.filter(
            (key) => key !== event.key
          )
          pressedKeysList.current.push(event.key)

          setKeyPressed(event.key)
        }
      }
    }

    const handleKeyUp = (event: KeyboardEvent) => {
      pressedKeysList.current = pressedKeysList.current.filter(
        (key) => key !== event.key
      )
      const next =
        pressedKeysList.current[pressedKeysList.current.length - 1] ?? ''
      setKeyPressed(next)
    }

    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('keyup', handleKeyUp)

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('keyup', handleKeyUp)
    }
  }, [setKeyPressed, action])

  return null
}
