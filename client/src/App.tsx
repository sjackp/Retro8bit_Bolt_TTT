import "@fontsource/inter";
import TicTacToe2D from "./components/TicTacToe2D";
import GameModeSelector from "./components/GameModeSelector";
import { useGameMode } from "./lib/stores/useGameMode";
import { useTicTacToe2D } from "./lib/stores/useTicTacToe2D";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchInterval: false,
      refetchOnWindowFocus: false,
      staleTime: Infinity,
      retry: false,
    },
    mutations: {
      retry: false,
    },
  },
});

function App() {
  const { gameMode, setGameMode, resetToMenu } = useGameMode();
  const { setAIMode, resetGame } = useTicTacToe2D();

  const handleModeSelect = (mode: 'ai' | 'multiplayer', roomCode?: string, isHost?: boolean) => {
    if (mode === 'ai') {
      setAIMode(true);
      setGameMode('ai');
    } else {
      setAIMode(false);
      setGameMode('multiplayer', roomCode, isHost);
    }
    resetGame();
  };

  return (
    <QueryClientProvider client={queryClient}>
      <div className="min-h-screen bg-gray-900 text-white">
        {gameMode === 'menu' ? (
          <GameModeSelector onModeSelect={handleModeSelect} />
        ) : (
          <TicTacToe2D onBackToMenu={resetToMenu} />
        )}
      </div>
    </QueryClientProvider>
  );
}

export default App;
