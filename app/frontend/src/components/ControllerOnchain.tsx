import { atom, useAtomValue, useSetAtom } from 'jotai'
import { FC, useEffect, useRef } from 'react'
import { magicBlockEngineAtom } from '../engine/MagicBlockEngineWrapper'
import { systemSwitchAttackType } from '../engine/systemSwitchAttackType'
import { myCharacterAtom } from './Room'

export const keypressedAtom = atom('')

export const ControllerOnchain: FC = () => {
  const setKeyPressed = useSetAtom(keypressedAtom)
  const pressedKeysList = useRef<string[]>([])
  const engine = useAtomValue(magicBlockEngineAtom)
  const myCharacter = useAtomValue(myCharacterAtom)

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      event.preventDefault()
      switch (event.key) {
        case 'q': {
          if (!engine || !myCharacter) return
          systemSwitchAttackType(
            engine,
            myCharacter.id,
            myCharacter.attackType === 0 ? 1 : 0
          )
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
  }, [engine, myCharacter, setKeyPressed])

  return null
}
