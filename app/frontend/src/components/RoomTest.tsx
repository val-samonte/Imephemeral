import { atom, useAtom, useAtomValue, useSetAtom } from 'jotai'
import { FC, useEffect, useMemo, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSessionKeypair } from '../hooks/useSessionKeypair'
import { Account } from './Account'
import {
  Character,
  CharacterActionType,
  charactersAtom,
  charactersListAtom,
} from './Character'
import CooldownTimer from './CooldownTimer'
import { LockIndicators } from './LockIndicators'

export const windowSizeAtom = atom(1)
export const scaleFactorAtom = atom((get) => get(windowSizeAtom) / 208)
export const roomTotalStepSizeAtom = atom(52)

export const RoomTest: FC = () => {
  const container = useRef<HTMLDivElement>(null)
  const setWindowSize = useSetAtom(windowSizeAtom)
  const scaleFactor = useAtomValue(scaleFactorAtom)
  const [session] = useSessionKeypair()
  const characterId = useMemo(() => session?.publicKey.toBase58(), [session])

  const [character, action] = useAtom(charactersAtom(characterId))
  const charactersList = useAtomValue(charactersListAtom)
  const navigate = useNavigate()

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
      className='fixed inset-0 bg-black flex flex-col items-center justify-center select-none'
    >
      <div className='landscape:h-full portrait:w-full aspect-square bg-white relative select-none'>
        <img
          src='/room_test.png'
          className='w-full h-full absolute inset-0 select-none pointer-events-none'
        />

        {charactersList.map((id) => (
          <Character id={id} key={`character_${id}`} me={id === characterId} />
        ))}

        <LockIndicators scaleFactor={scaleFactor} />

        <div
          className='w-full h-full select-none'
          onClick={() => {
            if (character.canAttack) {
              action({ type: CharacterActionType.ATTACK })
            }
          }}
          onContextMenu={(e) => {
            e.preventDefault()
            if (character.canBlock) {
              action({ type: CharacterActionType.BLOCK })
            }
          }}
        />
      </div>
      <div className='text-white font-mono font-bold absolute top-0 left-0 p-5 pointer-events-none'>
        <p>Attack: left click</p>
        <p>Block: right click</p>
        <p>Switch Attack Mode: q</p>
        <p>Move: WASD keys</p>
        <hr className='my-2' />
        <p>Kills: {character.kills}</p>
        <p>Attack Mode: {character.attackType === 0 ? 'Slash' : 'Stab'}</p>
        <p>
          <CooldownTimer
            dateTo={character.nextAttack}
            format='[Attack Cooldown:] sSSS[ms]'
          />
        </p>
        <p>
          <CooldownTimer
            dateTo={character.nextBlock}
            format='[Block Cooldown:] sSSS[ms]'
          />
        </p>
        <p>
          Checkout the{' '}
          <button
            className='underline pointer-events-auto'
            onClick={() => {
              navigate('/on-chain')
            }}
          >
            Magicblock Version
          </button>{' '}
          <br />
        </p>
      </div>

      <Account />
    </div>
  )
}
