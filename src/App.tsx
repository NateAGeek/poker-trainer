import { GameProvider } from './contexts/GameContext'
import { PokerGame } from './components/PokerGame/PokerGame'
import './styles/app.scss'

function App() {
  return (
    <GameProvider>
      <PokerGame />
    </GameProvider>
  )
}

export default App
