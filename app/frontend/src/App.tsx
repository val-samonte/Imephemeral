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
      <div>Connected</div>
    </MagicBlockEngineWrapper>
  )
}

export default App
