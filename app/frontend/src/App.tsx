import { ControllerOnchain } from './components/ControllerOnchain'
import { FundModal } from './components/FundModal'
import { GameLoopOnchain } from './components/GameLoopOnchain'
import { Room } from './components/Room'
import { MagicBlockEngineWrapper } from './engine/MagicBlockEngineWrapper'

function App() {
  return (
    <MagicBlockEngineWrapper
      splash={
        <div className='fixed h-screen inset-x-0 top-0 flex flex-col items-center justify-center'>
          Loading
        </div>
      }
    >
      <ControllerOnchain />
      <GameLoopOnchain />
      <Room />
      <FundModal />
      {/* <InitializeRoom /> */}
    </MagicBlockEngineWrapper>
  )
}

export default App
