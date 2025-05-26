import { io, Socket } from 'socket.io-client';

export interface MultiplayerState {
  socket: Socket | null;
  roomCode: string | null;
  isHost: boolean;
  opponentConnected: boolean;
  isMyTurn: boolean;
  myPlayer: 'X' | 'O';
}

export class MultiplayerManager {
  private socket: Socket | null = null;
  private state: MultiplayerState = {
    socket: null,
    roomCode: null,
    isHost: false,
    opponentConnected: false,
    isMyTurn: false,
    myPlayer: 'X'
  };
  
  private callbacks: {
    onOpponentJoined?: () => void;
    onOpponentLeft?: () => void;
    onOpponentMove?: (row: number, col: number) => void;
    onGameSync?: (gameState: any) => void;
    onTurnChange?: (isMyTurn: boolean) => void;
    onGameStart?: () => void;
  } = {};

  constructor() {
    // Connect to the server's WebSocket
    this.socket = io();
    console.log('🔌 Initializing Socket.io connection');
  }

  setCallbacks(callbacks: typeof this.callbacks) {
    this.callbacks = callbacks;
    this.setupEventListeners();
  }

  private setupEventListeners() {
    if (!this.socket) return;

    console.log('📡 Setting up Socket.io event listeners');

    this.socket.on('opponent-joined', () => {
      console.log('🎯 MULTIPLAYER: Opponent joined the room');
      this.state.opponentConnected = true;
      this.callbacks.onOpponentJoined?.();
    });

    this.socket.on('opponent-left', () => {
      console.log('👋 MULTIPLAYER: Opponent left the room');
      this.state.opponentConnected = false;
      this.callbacks.onOpponentLeft?.();
    });

    this.socket.on('opponent-move', (data: { row: number; col: number }) => {
      console.log(`🎲 MULTIPLAYER: Received opponent move at (${data.row}, ${data.col})`);
      this.callbacks.onOpponentMove?.(data.row, data.col);
    });

    this.socket.on('game-sync', (gameState: any) => {
      console.log('🔄 MULTIPLAYER: Received game state sync');
      this.callbacks.onGameSync?.(gameState);
    });

    this.socket.on('game-start', () => {
      console.log('🚀 MULTIPLAYER: Game starting!');
      this.callbacks.onGameStart?.();
    });

    this.socket.on('turn-change', (data: { currentPlayer: 'X' | 'O' }) => {
      const isMyTurn = data.currentPlayer === this.state.myPlayer;
      console.log(`🔄 MULTIPLAYER: Turn changed to ${data.currentPlayer}, my turn: ${isMyTurn}`);
      this.state.isMyTurn = isMyTurn;
      this.callbacks.onTurnChange?.(isMyTurn);
    });
  }

  createRoom(roomCode: string): Promise<{ success: boolean; error?: string }> {
    return new Promise((resolve) => {
      if (!this.socket) {
        resolve({ success: false, error: 'Failed to connect to server' });
        return;
      }

      console.log(`🎯 MULTIPLAYER: Creating room ${roomCode}`);
      this.socket.emit('create-room', { roomCode }, (response: { success: boolean; error?: string }) => {
        if (response.success) {
          console.log(`✅ MULTIPLAYER: Room ${roomCode} created successfully`);
          this.state.roomCode = roomCode;
          this.state.isHost = true;
          this.state.myPlayer = 'X'; // Host is always X
          this.state.isMyTurn = true; // Host goes first
        } else {
          console.log(`❌ MULTIPLAYER: Failed to create room: ${response.error}`);
        }
        resolve(response);
      });
    });
  }

  joinRoom(roomCode: string): Promise<{ success: boolean; error?: string }> {
    return new Promise((resolve) => {
      if (!this.socket) {
        resolve({ success: false, error: 'Failed to connect to server' });
        return;
      }

      console.log(`🎯 MULTIPLAYER: Joining room ${roomCode}`);
      this.socket.emit('join-room', { roomCode }, (response: { success: boolean; error?: string }) => {
        if (response.success) {
          console.log(`✅ MULTIPLAYER: Joined room ${roomCode} successfully`);
          this.state.roomCode = roomCode;
          this.state.isHost = false;
          this.state.myPlayer = 'O'; // Guest is always O
          this.state.isMyTurn = false; // Host goes first
        } else {
          console.log(`❌ MULTIPLAYER: Failed to join room: ${response.error}`);
        }
        resolve(response);
      });
    });
  }

  sendMove(row: number, col: number) {
    if (!this.socket || !this.state.roomCode) {
      console.log('❌ MULTIPLAYER: Cannot send move - no socket or room');
      return;
    }
    
    console.log(`📤 MULTIPLAYER: Sending move (${row}, ${col}) to room ${this.state.roomCode}`);
    this.socket.emit('player-move', { row, col, roomCode: this.state.roomCode });
  }

  startGame() {
    if (!this.socket || !this.state.roomCode || !this.state.isHost) {
      console.log('❌ MULTIPLAYER: Cannot start game - not host or no room');
      return;
    }
    
    console.log(`🚀 MULTIPLAYER: Starting game in room ${this.state.roomCode}`);
    this.socket.emit('start-game', { roomCode: this.state.roomCode });
  }

  leaveRoom() {
    if (!this.socket || !this.state.roomCode) return;
    
    console.log(`👋 MULTIPLAYER: Leaving room ${this.state.roomCode}`);
    this.socket.emit('leave-room', { roomCode: this.state.roomCode });
    this.resetState();
  }

  getState(): MultiplayerState {
    return { ...this.state };
  }

  private resetState() {
    this.state = {
      socket: this.socket,
      roomCode: null,
      isHost: false,
      opponentConnected: false,
      isMyTurn: false,
      myPlayer: 'X'
    };
  }

  disconnect() {
    if (this.socket) {
      console.log('🔌 MULTIPLAYER: Disconnecting socket');
      this.socket.disconnect();
      this.socket = null;
    }
    this.resetState();
  }
}

export const multiplayerManager = new MultiplayerManager();