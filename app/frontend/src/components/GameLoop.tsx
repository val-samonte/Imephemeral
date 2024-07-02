import { useAtom, useAtomValue } from 'jotai'
import { FC, useEffect, useRef } from 'react'
import { CharacterActionType, charactersAtom } from './Character'
import { keypressedAtom } from './Controller'
import { roomTotalStepSizeAtom } from './RoomTest'

export const GameLoop: FC = () => {
  const totalSteps = useAtomValue(roomTotalStepSizeAtom)
  const [character, action] = useAtom(charactersAtom('me'))
  const keypressed = useAtomValue(keypressedAtom)
  const borderTop = 8
  const borderRight = totalSteps - 8 - 4
  const borderBottom = totalSteps - 8 - 4
  const borderLeft = 8

  const frameId = useRef(0)

  useEffect(() => {
    cancelAnimationFrame(frameId.current)

    const gameLoop = () => {
      if (!keypressed) return
      // todo: replace Date.now with time from the requestAnimationFrame
      if (character.canMove) {
        switch (keypressed) {
          case 'ArrowUp':
          case 'w': {
            if (character.y > borderTop) {
              action({
                type: CharacterActionType.MOVE,
                x: character.x,
                y: character.y - 1,
                facing: 0b1000,
              })
            }
            break
          }
          case 'ArrowRight':
          case 'd': {
            if (character.x < borderRight) {
              action({
                type: CharacterActionType.MOVE,
                x: character.x + 1,
                y: character.y,
                facing: 0b0100,
              })
            }
            break
          }
          case 'ArrowDown':
          case 's': {
            if (character.y < borderBottom) {
              action({
                type: CharacterActionType.MOVE,
                x: character.x,
                y: character.y + 1,
                facing: 0b0010,
              })
            }
            break
          }
          case 'ArrowLeft':
          case 'a': {
            if (character.x > borderLeft) {
              action({
                type: CharacterActionType.MOVE,
                x: character.x - 1,
                y: character.y,
                facing: 0b0001,
              })
            }
            break
          }
        }
      }
      frameId.current = requestAnimationFrame(gameLoop)
    }
    gameLoop()

    return () => {
      cancelAnimationFrame(frameId.current)
    }
  }, [keypressed, character, action])

  return null
}
