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
      socket.join(roomCode);
      callback({ success: true });

      // Notify host that opponent joined
      socket.to(room.host).emit('opponent-joined');
      console.log(`${socket.id} joined room ${roomCode}`);
    });

    // Handle player moves
    socket.on('player-move', ({ row, col, roomCode }) => {
      const room = gameRooms.get(roomCode);
      if (!room) return;

      // Send move to opponent
      socket.to(roomCode).emit('opponent-move', { row, col });
      console.log(`Move sent in room ${roomCode}: ${row}, ${col}`);
    });

    // Sync game state
    socket.on('sync-game', ({ gameState, roomCode }) => {
      const room = gameRooms.get(roomCode);
      if (!room) return;

      room.gameState = gameState;
      socket.to(roomCode).emit('game-sync', gameState);
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
