import { create } from "zustand";

export type GameMode = 'menu' | 'ai' | 'multiplayer';

interface GameModeState {
  gameMode: GameMode;
  roomCode: string | null;
  isHost: boolean;
  
  // Actions
  setGameMode: (mode: GameMode, roomCode?: string, isHost?: boolean) => void;
  resetToMenu: () => void;
}

export const useGameMode = create<GameModeState>((set) => ({
  gameMode: 'menu',
  roomCode: null,
  isHost: false,
  
  setGameMode: (mode: GameMode, roomCode?: string, isHost = false) => {
    set({
      gameMode: mode,
      roomCode: roomCode || null,
      isHost
    });
  },
  
  resetToMenu: () => {
    set({
      gameMode: 'menu',
      roomCode: null,
      isHost: false
    });
  }
}));