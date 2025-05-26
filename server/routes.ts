import type { Express } from "express";
import { createServer, type Server } from "http";
import { Server as SocketIOServer } from "socket.io";
import { storage } from "./storage";

// Store active game rooms
const gameRooms = new Map<string, {
  host: string;
  guest?: string;
  gameState?: any;
}>();

export async function registerRoutes(app: Express): Promise<Server> {
  const httpServer = createServer(app);
  
  // Initialize Socket.IO
  const io = new SocketIOServer(httpServer, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"]
    }
  });

  io.on('connection', (socket) => {
    console.log('User connected:', socket.id);

    // Create room
    socket.on('create-room', ({ roomCode }, callback) => {
      if (gameRooms.has(roomCode)) {
        callback({ success: false, error: 'Room already exists' });
        return;
      }

      gameRooms.set(roomCode, { host: socket.id });
      socket.join(roomCode);
      callback({ success: true });
      console.log(`Room ${roomCode} created by ${socket.id}`);
    });

    // Join room
    socket.on('join-room', ({ roomCode }, callback) => {
      const room = gameRooms.get(roomCode);
      if (!room) {
        callback({ success: false, error: 'Room not found' });
        return;
      }

      if (room.guest) {
        callback({ success: false, error: 'Room is full' });
        return;
      }

      room.guest = socket.id;
      room.gameState = {
        currentPlayer: 'X', // Host always starts
        gameStarted: false
      };
      socket.join(roomCode);
      callback({ success: true });

      // Notify host that opponent joined
      socket.to(room.host).emit('opponent-joined');
      console.log(`${socket.id} joined room ${roomCode} - both players connected`);
    });

    // Start game (host only)
    socket.on('start-game', ({ roomCode }) => {
      const room = gameRooms.get(roomCode);
      if (!room || room.host !== socket.id) return;

      room.gameState.gameStarted = true;
      console.log(`Game started in room ${roomCode}`);
      
      // Notify both players
      io.to(roomCode).emit('game-start');
      io.to(roomCode).emit('turn-change', { currentPlayer: 'X' });
    });

    // Handle player moves with proper turn validation
    socket.on('player-move', ({ row, col, roomCode }) => {
      const room = gameRooms.get(roomCode);
      if (!room || !room.gameState.gameStarted) {
        console.log(`Move rejected - room not found or game not started in ${roomCode}`);
        return;
      }

      // Determine if this player should be making this move
      const isHost = socket.id === room.host;
      const currentPlayer = room.gameState.currentPlayer;
      const canMove = (currentPlayer === 'X' && isHost) || (currentPlayer === 'O' && !isHost);

      if (!canMove) {
        console.log(`Move rejected - not ${socket.id}'s turn in room ${roomCode} (current: ${currentPlayer})`);
        socket.emit('move-rejected', { reason: 'Not your turn' });
        return;
      }

      console.log(`Valid move from ${socket.id} in room ${roomCode}: (${row}, ${col})`);
      
      // Send move to opponent
      socket.to(roomCode).emit('opponent-move', { row, col });
      
      // Switch turns
      room.gameState.currentPlayer = currentPlayer === 'X' ? 'O' : 'X';
      io.to(roomCode).emit('turn-change', { currentPlayer: room.gameState.currentPlayer });
      
      console.log(`Turn switched to ${room.gameState.currentPlayer} in room ${roomCode}`);
    });

    // Handle disconnect
    socket.on('disconnect', () => {
      console.log('User disconnected:', socket.id);
      
      // Find and clean up rooms
      for (const [roomCode, room] of gameRooms.entries()) {
        if (room.host === socket.id || room.guest === socket.id) {
          // Notify the other player
          socket.to(roomCode).emit('opponent-left');
          gameRooms.delete(roomCode);
          console.log(`Room ${roomCode} cleaned up`);
        }
      }
    });

    // Leave room
    socket.on('leave-room', ({ roomCode }) => {
      const room = gameRooms.get(roomCode);
      if (!room) return;

      socket.leave(roomCode);
      socket.to(roomCode).emit('opponent-left');
      
      if (room.host === socket.id || room.guest === socket.id) {
        gameRooms.delete(roomCode);
        console.log(`${socket.id} left room ${roomCode}`);
      }
    });
  });

  return httpServer;
}
