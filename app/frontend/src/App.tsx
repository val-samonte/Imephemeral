import { InitializeRoom } from './components/InitializeRoom'
import { MagicBlockEngineWrapper } from './engine/MagicBlockEngineWrapper'

function App() {
  return (
    <MagicBlockEngineWrapper
      splash={
        <div>
          <div>Connecting...</div>
        </div>
      }
    >
      <InitializeRoom />
    </MagicBlockEngineWrapper>
  )
}

export default App
