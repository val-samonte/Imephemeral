import { FC } from 'react'

export const LockIndicators: FC<{ scaleFactor: number }> = ({
  scaleFactor,
}) => {
  return (
    <>
      <div
        className='absolute bg-black/80 flex items-center justify-center select-none pointer-events-none '
        style={{
          width: `${scaleFactor * 16 * 3}px`,
          height: `${scaleFactor * 16}px`,
          top: `${scaleFactor * 16}px`,
          left: `${scaleFactor * 16 * 5}px`,
        }}
      >
        <img
          src='/no_entry.png'
          style={{
            width: `${scaleFactor * 16}px`,
            height: `${scaleFactor * 16}px`,
          }}
        />
      </div>
      <div
        className='absolute bg-black/80 flex items-center justify-center select-none pointer-events-none '
        style={{
          width: `${scaleFactor * 16}px`,
          height: `${scaleFactor * 16 * 3}px`,
          right: `${scaleFactor * 16}px`,
          top: `${scaleFactor * 16 * 5}px`,
        }}
      >
        <img
          src='/no_entry.png'
          style={{
            width: `${scaleFactor * 16}px`,
            height: `${scaleFactor * 16}px`,
          }}
        />
      </div>
      <div
        className='absolute bg-black/80 flex items-center justify-center select-none pointer-events-none '
        style={{
          width: `${scaleFactor * 16 * 3}px`,
          height: `${scaleFactor * 16}px`,
          bottom: `${scaleFactor * 16}px`,
          left: `${scaleFactor * 16 * 5}px`,
        }}
      >
        <img
          src='/no_entry.png'
          style={{
            width: `${scaleFactor * 16}px`,
            height: `${scaleFactor * 16}px`,
          }}
        />
      </div>
      <div
        className='absolute bg-black/80 flex items-center justify-center select-none pointer-events-none '
        style={{
          width: `${scaleFactor * 16}px`,
          height: `${scaleFactor * 16 * 3}px`,
          left: `${scaleFactor * 16}px`,
          top: `${scaleFactor * 16 * 5}px`,
        }}
      >
        <img
          src='/no_entry.png'
          style={{
            width: `${scaleFactor * 16}px`,
            height: `${scaleFactor * 16}px`,
          }}
        />
      </div>
    </>
  )
}
