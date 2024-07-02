import cn from 'classnames'
import { atom, useAtomValue } from 'jotai'
import { atomFamily } from 'jotai/utils'
import { FC, useMemo } from 'react'
import { scaleFactorAtom } from './RoomTest'

export interface CharacterProps {
  x: number
  y: number
  facing: number
  // ATTACK
  attackCooldown: number
  nextAttack: number
  canAttack: boolean
  attackType: number // 0: slash, 1: stab
  // BLOCK
  blockCooldown: number
  blockDuration: number
  nextBlock: number
  canBlock: boolean
  isBlocking: boolean
  // ROLL
  rollDuration: number
  rollCooldown: number
  nextRoll: number
  isRolling: boolean
  canRoll: boolean
}

export enum CharacterActionType {
  BACKEND_UPDATE = 'BACKEND_UPDATE',
  TURN = 'TURN',
  MOVE = 'MOVE',
  SLASH = 'SLASH',
  STAB = 'STAB',
  BLOCK = 'BLOCK',
  ROLL = 'ROLL',
}

export type CharacterAction =
  | {
      type: CharacterActionType.BACKEND_UPDATE
      character: Partial<CharacterProps>
    }
  | {
      type: CharacterActionType.TURN
      facing: number
    }
  | {
      type: CharacterActionType.MOVE
      x: number
      y: number
    }
  | {
      type: CharacterActionType.SLASH
    }
  | {
      type: CharacterActionType.STAB
    }
  | {
      type: CharacterActionType.BLOCK
    }
  | {
      type: CharacterActionType.ROLL
    }

export const charactersBaseAtom = atomFamily((_id: string) => {
  const now = Date.now()
  return atom<CharacterProps>({
    x: 8,
    y: 8,
    facing: 0b0100,
    // ATTACK
    attackCooldown: 1000,
    nextAttack: now,
    canAttack: false,
    attackType: 0,
    // BLOCK
    blockCooldown: 1000,
    blockDuration: 1000,
    nextBlock: now,
    canBlock: false,
    isBlocking: false,
    // ROLL
    rollDuration: 1000,
    rollCooldown: 3000,
    nextRoll: now,
    canRoll: false,
    isRolling: false,
  })
})

export const charactersAtom = atomFamily((id: string) =>
  atom(
    (get) => {
      const character = get(charactersBaseAtom(id))
      const isBlocking =
        Date.now() < character.nextBlock - character.blockCooldown
      const isRolling = Date.now() < character.nextRoll - character.rollCooldown
      return {
        ...character,
        isBlocking,
        isRolling,
        get canAttack() {
          if (isBlocking || isRolling) return false
          return Date.now() > character.nextAttack
        },
        get canBlock() {
          return Date.now() > character.nextBlock
        },
        get canRoll() {
          return Date.now() > character.nextRoll
        },
      }
    },
    (get, set, action: CharacterAction) => {
      const character = get(charactersBaseAtom(id))
      const now = Date.now()

      switch (action.type) {
        case CharacterActionType.TURN: {
          set(charactersBaseAtom(id), { ...character, facing: action.facing })
          break
        }
        case CharacterActionType.MOVE: {
          set(charactersBaseAtom(id), {
            ...character,
            x: action.x,
            y: action.y,
          })
          break
        }
        case CharacterActionType.STAB:
        case CharacterActionType.SLASH: {
          set(charactersBaseAtom(id), {
            ...character,
            attackType: action.type === CharacterActionType.STAB ? 1 : 0,
            nextAttack: now + character.attackCooldown,
          })
          break
        }
        case CharacterActionType.BLOCK: {
          set(charactersBaseAtom(id), {
            ...character,
            nextBlock: now + character.blockDuration + character.blockCooldown,
          })
          break
        }
        case CharacterActionType.ROLL: {
          set(charactersBaseAtom(id), {
            ...character,
            nextRoll: now + character.rollDuration + character.rollCooldown,
          })
          break
        }
      }
    }
  )
)

export const Character: FC<{ id: string }> = ({ id }) => {
  const { x, y, facing, nextAttack, attackType, isBlocking } = useAtomValue(
    charactersAtom(id)
  )
  const scaleFactor = useAtomValue(scaleFactorAtom)
  const size = useMemo(() => 16 * scaleFactor, [scaleFactor])

  const facingClassname = useMemo(() => {
    if ((facing & 0b1000) === 0b1000) {
      return '-rotate-90'
    } else if ((facing & 0b0100) === 0b0100) {
      return 'rotate-0'
    } else if ((facing & 0b0010) === 0b0010) {
      return 'rotate-90'
    } else if ((facing & 0b0001) === 0b0001) {
      return 'rotate-180'
    }
  }, [facing])

  return (
    <div
      className={cn(
        'bg-blue-400 absolute flex items-center justify-center',
        isBlocking && 'border-4 border-blue-800 border-solid',
        facingClassname
      )}
      style={{
        width: `${size}px`,
        height: `${size}px`,
        top: `${(y / 4) * size}px`,
        left: `${(x / 4) * size}px`,
      }}
    >
      <div
        className='ml-10 bg-white'
        style={{
          marginLeft: `${size * 0.5}px`,
          width: `${size * 0.2}px`,
          height: `${size * 0.2}px`,
        }}
      />
      <div
        className='absolute animate-fadeOut'
        key={`attack_${nextAttack}`}
        style={
          attackType === 0
            ? {
                width: `${size * 0.5}px`,
                height: `${size * 1.5}px`,
                top: `${size * -0.25}px`,
                right: `${size * -0.5}px`,
                background: 'red',
              }
            : {
                width: `${size}px`,
                height: `${size * 0.5}px`,
                top: `${size * 0.25}px`,
                right: `${-size}px`,
                background: 'red',
              }
        }
      />
    </div>
  )
}
