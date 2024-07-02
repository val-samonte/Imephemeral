import { useAtom, useAtomValue } from 'jotai'
import { FC, useEffect } from 'react'
import { CharacterActionType, charactersAtom } from './Character'
import { roomTotalStepSizeAtom } from './RoomTest'

export const Controller: FC = () => {
  const totalSteps = useAtomValue(roomTotalStepSizeAtom)
  const [character, action] = useAtom(charactersAtom('me'))

  const borderTop = 8
  const borderRight = totalSteps - 8 - 4
  const borderBottom = totalSteps - 8 - 4
  const borderLeft = 8

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      event.preventDefault()
      switch (event.key) {
        case 'ArrowUp':
        case 'w': {
          if (character.facing !== 0b1000) {
            action({ type: CharacterActionType.TURN, facing: 0b1000 })
          } else if (character.y > borderTop) {
            action({
              type: CharacterActionType.MOVE,
              x: character.x,
              y: character.y - 1,
            })
          }
          break
        }
        case 'ArrowRight':
        case 'd': {
          if (character.facing !== 0b0100) {
            action({ type: CharacterActionType.TURN, facing: 0b0100 })
          } else if (character.x < borderRight) {
            action({
              type: CharacterActionType.MOVE,
              x: character.x + 1,
              y: character.y,
            })
          }
          break
        }
        case 'ArrowDown':
        case 's': {
          if (character.facing !== 0b0010) {
            action({ type: CharacterActionType.TURN, facing: 0b0010 })
          } else if (character.y < borderBottom) {
            action({
              type: CharacterActionType.MOVE,
              x: character.x,
              y: character.y + 1,
            })
          }
          break
        }
        case 'ArrowLeft':
        case 'a': {
          if (character.facing !== 0b0001) {
            action({ type: CharacterActionType.TURN, facing: 0b0001 })
          } else if (character.x > borderLeft) {
            action({
              type: CharacterActionType.MOVE,
              x: character.x - 1,
              y: character.y,
            })
          }
          break
        }
        case 'q': {
          if (character.canBlock) {
            action({ type: CharacterActionType.BLOCK })
          }
          break
        }
      }
    }

    const handleKeyUp = (event: KeyboardEvent) => {
      console.log('Key up:', event.key)
    }

    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('keyup', handleKeyUp)

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('keyup', handleKeyUp)
    }
  }, [roomTotalStepSizeAtom, character, action])

  return null
}
