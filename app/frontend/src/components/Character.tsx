import cn from 'classnames'
import { atom, useAtomValue } from 'jotai'
import { atomFamily } from 'jotai/utils'
import { FC, useEffect, useMemo, useRef, useState } from 'react'
import { wsAtom } from './Account'
import { scaleFactorAtom } from './RoomTest'

export interface CharacterProps {
  hp: number
  maxHp: number
  kills: number
  // MOVE
  x: number
  y: number
  facing: number
  nextMove: number
  canMove: boolean
  moveCooldown: number
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
  // ROLL
  rollDuration: number
  rollCooldown: number
  nextRoll: number
  canRoll: boolean
}

export interface Character extends CharacterProps {
  id: string
}

export enum CharacterActionType {
  BACKEND_UPDATE = 'BACKEND_UPDATE',
  MOVE = 'MOVE',
  SWITCH_ATTACK = 'SWITCH_ATTACK',
  ATTACK = 'ATTACK',
  BLOCK = 'BLOCK',
  ROLL = 'ROLL',
}

export type CharacterAction =
  | {
      type: CharacterActionType.BACKEND_UPDATE
      character: Partial<CharacterProps>
    }
  | {
      type: CharacterActionType.MOVE
      x: number
      y: number
      facing: number
    }
  | {
      type: CharacterActionType.SWITCH_ATTACK
    }
  | {
      type: CharacterActionType.ATTACK
    }
  | {
      type: CharacterActionType.BLOCK
    }
  | {
      type: CharacterActionType.ROLL
    }

export const charactersListAtom = atom<string[]>([])

export const charactersBaseAtom = atomFamily((_id: string) => {
  const now = Date.now()
  return atom<CharacterProps>({
    hp: 100,
    maxHp: 100,
    kills: 0,
    // MOVE
    x: 24,
    y: 24,
    facing: 0b0100,
    nextMove: now,
    canMove: true,
    moveCooldown: 100,
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
    // isBlocking: false,
    // ROLL
    rollDuration: 1000,
    rollCooldown: 3000,
    nextRoll: now,
    canRoll: false,
    // isRolling: false,
  })
})

export const charactersAtom = atomFamily((id: string) =>
  atom(
    (get) => {
      const character = get(charactersBaseAtom(id))
      return {
        ...character,
        get canMove() {
          if (character.hp <= 0) return false
          return Date.now() > character.nextMove
        },
        get canAttack() {
          if (character.hp <= 0) return false
          const isBlocking =
            Date.now() < character.nextBlock - character.blockCooldown
          const isRolling =
            Date.now() < character.nextRoll - character.rollCooldown
          if (isBlocking || isRolling) return false
          return Date.now() > character.nextAttack
        },
        get canBlock() {
          if (character.hp <= 0) return false
          return Date.now() > character.nextBlock
        },
        get canRoll() {
          if (character.hp <= 0) return false
          return Date.now() > character.nextRoll
        },
      }
    },
    (get, set, action: CharacterAction) => {
      const ws = get(wsAtom)
      const characterAtom = charactersBaseAtom(id)
      const character = get(characterAtom)

      switch (action.type) {
        case CharacterActionType.BACKEND_UPDATE: {
          set(characterAtom, {
            ...character,
            ...action.character,
          })
          break
        }
        case CharacterActionType.MOVE: {
          // set(characterAtom, {
          //   ...character,
          //   x: action.x,
          //   y: action.y,
          //   facing: action.facing,
          //   nextMove: now + character.moveCooldown,
          // })
          character.canMove && ws?.send(JSON.stringify(action))
          break
        }
        case CharacterActionType.SWITCH_ATTACK: {
          // set(characterAtom, {
          //   ...character,
          //   attackType: character.attackType === 0 ? 1 : 0,
          // })
          ws?.send(JSON.stringify(action))
          break
        }
        case CharacterActionType.ATTACK: {
          // set(characterAtom, {
          //   ...character,
          //   // attackType: action.type === CharacterActionType.ATTACK ? 1 : 0,
          //   nextAttack: now + character.attackCooldown,
          // })
          ws?.send(JSON.stringify(action))
          break
        }
        case CharacterActionType.BLOCK: {
          // set(characterAtom, {
          //   ...character,
          //   nextBlock: now + character.blockDuration + character.blockCooldown,
          // })
          ws?.send(JSON.stringify(action))
          break
        }
        case CharacterActionType.ROLL: {
          // set(characterAtom, {
          //   ...character,
          //   nextRoll: now + character.rollDuration + character.rollCooldown,
          // })
          ws?.send(JSON.stringify(action))
          break
        }
      }
    }
  )
)

export const Character: FC<{ id: string; me?: boolean }> = ({ id, me }) => {
  const { x, y, facing, nextAttack, attackType, nextBlock, blockCooldown, hp } =
    useAtomValue(charactersAtom(id))
  const scaleFactor = useAtomValue(scaleFactorAtom)
  const size = useMemo(() => 16 * scaleFactor, [scaleFactor])
  const [isBlocking, setIsBlocking] = useState(false)

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

  const blockingTimeoutId = useRef(-1)
  useEffect(() => {
    if (Date.now() < nextBlock - blockCooldown) {
      setIsBlocking(true)
      blockingTimeoutId.current = window.setTimeout(() => {
        setIsBlocking(false)
      }, blockCooldown)
    }
    return () => {
      window.clearTimeout(blockingTimeoutId.current)
    }
  }, [nextBlock, blockCooldown, setIsBlocking])

  if (hp <= 0) return null

  return (
    <div
      className={cn(
        'absolute flex items-center justify-center transition-all duration-100 linear',
        'pointer-events-none'
      )}
      style={{
        width: `${size}px`,
        height: `${size}px`,
        top: `${(y / 4) * size}px`,
        left: `${(x / 4) * size}px`,
      }}
    >
      <div
        className={cn(
          me ? 'bg-blue-400' : 'bg-pink-400',
          ' absolute inset-0 flex items-center justify-center',
          isBlocking && 'border-4 border-blue-800 border-solid',
          facingClassname
        )}
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
      <div className='font-mono font-bold relative'>{hp}</div>
    </div>
  )
}
