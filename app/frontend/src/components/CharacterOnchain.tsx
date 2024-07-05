import cn from 'classnames'
import { useAtomValue } from 'jotai'
import { FC, useEffect, useMemo, useRef, useState } from 'react'
import { CharacterType, scaleFactorAtom } from './Room'

export const CharacterOnchain: FC<{
  character: CharacterType
  me?: boolean
}> = ({ character, me }) => {
  const scaleFactor = useAtomValue(scaleFactorAtom)
  const size = useMemo(() => 16 * scaleFactor, [scaleFactor])
  const [isBlocking, setIsBlocking] = useState(false)

  const facingClassname = useMemo(() => {
    if (!character) return ''
    if ((character.facing & 0b1000) === 0b1000) {
      return '-rotate-90'
    } else if ((character.facing & 0b0100) === 0b0100) {
      return 'rotate-0'
    } else if ((character.facing & 0b0010) === 0b0010) {
      return 'rotate-90'
    } else if ((character.facing & 0b0001) === 0b0001) {
      return 'rotate-180'
    }
  }, [character?.facing])

  const blockingTimeoutId = useRef(-1)
  useEffect(() => {
    if (!character) return
    if (
      Date.now() <
      character.nextBlock.toNumber() - character.blockCooldown.toNumber()
    ) {
      setIsBlocking(true)
      blockingTimeoutId.current = window.setTimeout(() => {
        setIsBlocking(false)
      }, character.blockCooldown.toNumber())
    }
    return () => {
      window.clearTimeout(blockingTimeoutId.current)
    }
  }, [character?.nextBlock, character?.blockCooldown, setIsBlocking])

  if (!character) return null

  const spriteFace =
    { [0b1000]: 0, [0b0100]: 1, [0b0010]: 2, [0b0001]: 3 }[character.facing] ??
    0
  const spriteFeet =
    (character.facing & 0b1010 ? character.y % 2 : character.x % 2) -
    1 -
    (me ? 0 : 2)

  return (
    <div
      className={cn(
        'absolute flex items-center justify-center transition-all duration-100 ease-linear',
        'pointer-events-none'
      )}
      style={{
        width: `${size}px`,
        height: `${size}px`,
        top: `${(character.y / 4) * size}px`,
        left: `${(character.x / 4) * size}px`,
      }}
    >
      <div
        className='overflow-hidden relative'
        style={{
          width: `${size.toFixed(1)}px`,
          height: `${size.toFixed(1)}px`,
        }}
      >
        <div
          className='absolute'
          style={{
            width: `${size * 4}px`,
            height: `${size * 4}px`,
          }}
        >
          <img
            className='absolute'
            src='/character.png'
            style={{
              top: `${size * -spriteFace}px`,
              left: `${size * spriteFeet}px`,
            }}
          />
        </div>
      </div>
      <div
        className={cn(
          'absolute inset-0 flex items-center justify-center',
          isBlocking && 'border-4 border-blue-800 border-solid',
          facingClassname
        )}
      >
        <div
          className='absolute animate-fadeOut'
          key={`attack_${character.nextAttack}`}
          style={
            character.attackType === 0
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
      <div
        className='absolute bg-green-950'
        style={{
          width: `${size}px`,
          height: `${size / 10}px`,
          bottom: `${size * -0.125}px`,
        }}
      >
        <div
          className='bg-green-500'
          style={{
            width: `${(character.hp / character.maxHp) * size}px`,
            height: '100%',
          }}
        />
      </div>
    </div>
  )
}
