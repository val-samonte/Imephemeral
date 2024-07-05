import { useAtomValue } from 'jotai'
import { FC, useEffect, useRef } from 'react'
import { magicBlockEngineAtom } from '../engine/MagicBlockEngineWrapper'
import { systemMove } from '../engine/systemMove'
import { keypressedAtom } from './ControllerOnchain'
import { myCharacterAtom } from './Room'

export const GameLoopOnchain: FC = () => {
  const engine = useAtomValue(magicBlockEngineAtom)
  const keypressed = useAtomValue(keypressedAtom)
  const frameId = useRef(0)
  const myCharacter = useAtomValue(myCharacterAtom)

  useEffect(() => {
    cancelAnimationFrame(frameId.current)

    const gameLoop = () => {
      if (!keypressed) return
      // todo: replace Date.now with time from the requestAnimationFrame
      if (!engine) return
      if (!myCharacter) return

      switch (keypressed) {
        case 'ArrowUp':
        case 'w': {
          systemMove(engine, myCharacter.id, 0b1000)
          break
        }
        case 'ArrowRight':
        case 'd': {
          systemMove(engine, myCharacter.id, 0b0100)
          break
        }
        case 'ArrowDown':
        case 's': {
          systemMove(engine, myCharacter.id, 0b0010)
          break
        }
        case 'ArrowLeft':
        case 'a': {
          systemMove(engine, myCharacter.id, 0b0001)
          break
        }
      }

      frameId.current = requestAnimationFrame(gameLoop)
    }
    gameLoop()

    return () => {
      cancelAnimationFrame(frameId.current)
    }
  }, [engine, myCharacter, keypressed])

  return null
}
