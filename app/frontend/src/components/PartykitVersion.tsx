import { Controller } from './Controller'
import { GameLoop } from './GameLoop'
import { RoomTest } from './RoomTest'

export const PartykitVersion = () => {
  return (
    <>
      <RoomTest />
      <Controller />
      <GameLoop />
    </>
  )
}
