import { io, Socket } from 'socket.io-client';

export interface MultiplayerState {
  socket: Socket | null;
  roomCode: string | null;
  isHost: boolean;
  opponentConnected: boolean;
  isMyTurn: boolean;
}

export class MultiplayerManager {
  private socket: Socket | null = null;
  private callbacks: {
    onOpponentJoined?: () => void;
    onOpponentLeft?: () => void;
    onOpponentMove?: (row: number, col: number) => void;
    onGameSync?: (gameState: any) => void;
    onTurnChange?: (isMyTurn: boolean) => void;
  } = {};

  constructor() {
    // Connect to the server's WebSocket
    this.socket = io();
  }

  setCallbacks(callbacks: typeof this.callbacks) {
    this.callbacks = callbacks;
    this.setupEventListeners();
  }

  private setupEventListeners() {
    if (!this.socket) return;

    this.socket.on('opponent-joined', () => {
      this.callbacks.onOpponentJoined?.();
    });

    this.socket.on('opponent-left', () => {
      this.callbacks.onOpponentLeft?.();
    });

    this.socket.on('opponent-move', (data: { row: number; col: number }) => {
      this.callbacks.onOpponentMove?.(data.row, data.col);
    });

    this.socket.on('game-sync', (gameState: any) => {
      this.callbacks.onGameSync?.(gameState);
    });

    this.socket.on('turn-change', (data: { isMyTurn: boolean }) => {
      this.callbacks.onTurnChange?.(data.isMyTurn);
    });
  }

  createRoom(roomCode: string): Promise<boolean> {
    return new Promise((resolve) => {
      if (!this.socket) {
        resolve(false);
        return;
      }

      this.socket.emit('create-room', { roomCode }, (response: { success: boolean }) => {
        resolve(response.success);
      });
    });
  }

  joinRoom(roomCode: string): Promise<boolean> {
    return new Promise((resolve) => {
      if (!this.socket) {
        resolve(false);
        return;
      }

      this.socket.emit('join-room', { roomCode }, (response: { success: boolean }) => {
        resolve(response.success);
      });
    });
  }

  sendMove(row: number, col: number, roomCode: string) {
    if (!this.socket) return;
    this.socket.emit('player-move', { row, col, roomCode });
  }

  syncGameState(gameState: any, roomCode: string) {
    if (!this.socket) return;
    this.socket.emit('sync-game', { gameState, roomCode });
  }

  leaveRoom(roomCode: string) {
    if (!this.socket) return;
    this.socket.emit('leave-room', { roomCode });
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }
}

export const multiplayerManager = new MultiplayerManager();