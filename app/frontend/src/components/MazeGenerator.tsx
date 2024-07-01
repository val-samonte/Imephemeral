import cn from 'classnames'
import { FC, useEffect, useMemo, useState } from 'react'
import { findLongestPath, generateMaze, Room } from '../functions/procgen'

export const MazeGenerator: FC = () => {
  const [seed, setSeed] = useState('')
  const [rooms, setRooms] = useState<Room[]>([])

  useEffect(() => {
    const fetchMaze = async () => {
      const generatedRooms = await generateMaze(5, seed)
      setRooms(generatedRooms)
    }

    fetchMaze()
  }, [seed])

  const portals = useMemo(() => {
    return rooms.length === 25 ? findLongestPath(rooms, 5) : ''
  }, [rooms])

  return (
    <>
      <div className='mx-auto'>
        <input
          placeholder='Seed'
          className='border-2 border-slate-600 px-3 py-2'
          type='text'
          value={seed}
          onChange={(e) => setSeed(e.target.value)}
        />
      </div>
      <div
        className='relative border border-slate-600 mx-auto'
        style={{ width: '250px', height: '250px' }}
      >
        {rooms.map((room, i) => (
          <div
            key={`room_${i}`}
            className={cn(
              'absolute border border-slate-600 border-',
              room.doors.includes('N') && 'border-t-transparent',
              room.doors.includes('E') && 'border-r-transparent',
              room.doors.includes('S') && 'border-b-transparent',
              room.doors.includes('W') && 'border-l-transparent'
            )}
            style={{
              width: '50px',
              height: '50px',
              top: `${room.y * 50}px`,
              left: `${room.x * 50}px`,
            }}
          ></div>
        ))}
      </div>
      <pre>{JSON.stringify(portals, null, 2)}</pre>
    </>
  )
}
