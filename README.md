# 🎮 Retro8bit Tic-Tac-Toe

A modern web-based Tic-Tac-Toe game with a retro 8-bit aesthetic, featuring unique gameplay mechanics, AI opponents, and real-time multiplayer capabilities.

![Game Preview](https://img.shields.io/badge/Status-Live-brightgreen) ![Version](https://img.shields.io/badge/Version-1.0.0-orange) ![License](https://img.shields.io/badge/License-MIT-blue)

## ✨ Features

### 🎯 Unique Gameplay
- **3-Piece Limit**: Each player has exactly 3 pieces maximum
- **No Draws**: Games continue until someone wins - no ties allowed!
- **Piece Management**: When placing a 4th piece, your oldest piece disappears with a fade animation
- **Real-time Scoring**: Track wins across multiple rounds

### 🎨 Retro 8-bit Aesthetic
- **Pixel-perfect design** with "Press Start 2P" font
- **Circuit board background** with scanline effects
- **Orange/purple color scheme** with glowing animations
- **Animated borders** and hover effects
- **8-bit sound effects** and background music

### 🤖 Smart AI Opponent
- **Strategic gameplay**: AI tries to win and block your moves
- **Difficulty levels**: Easy, Medium, Hard (currently set to Medium)
- **Visual feedback**: "CPU THINKING..." indicator
- **Realistic timing**: 800ms thinking delay

### 🌐 Real-time Multiplayer
- **Room-based system** with 6-character room codes
- **Host/Guest roles**: Host is always X and goes first
- **Real-time synchronization** using Socket.io
- **Connection status** indicators
- **Seamless gameplay** across devices

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd Retro8bit_Bolt_TTT
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm run dev
   ```

4. **Open your browser**
   Navigate to `http://localhost:5000`

## 🎮 How to Play

### Game Modes

#### Single Player vs AI
1. Click **"PLAY VS CPU"** on the main menu
2. You play as X (orange), AI plays as O (purple)
3. Click empty cells to place your pieces
4. Get 3 in a row to win!

#### Multiplayer
1. Click **"MULTIPLAYER"** on the main menu
2. **Create Room**: Click "CREATE NEW ROOM" to generate a room code
3. **Join Room**: Enter a 6-character room code to join
4. Share the room code with friends
5. Host clicks "START GAME" when both players are ready

### Game Rules
- Each player has exactly **3 pieces maximum**
- Place pieces by clicking empty cells
- Get **3 in a row** (horizontal, vertical, or diagonal) to win
- When you place a 4th piece, your **oldest piece disappears**
- Games continue until someone wins - **no draws allowed!**

## 🛠️ Technical Stack

### Frontend
- **React 18** with TypeScript
- **Zustand** for state management
- **Tailwind CSS** with custom 8-bit animations
- **Socket.io Client** for real-time communication
- **Vite** for development and building

### Backend
- **Node.js** with Express.js
- **Socket.io** for WebSocket communication
- **TypeScript** for type safety

### Key Dependencies
- `@react-three/fiber` - 3D graphics support
- `@radix-ui/*` - Accessible UI components
- `framer-motion` - Animations
- `howler` - Audio management
- `zustand` - State management

## 📁 Project Structure

```
Retro8bit_Bolt_TTT/
├── client/                 # Frontend React app
│   ├── src/
│   │   ├── components/     # React components
│   │   │   ├── TicTacToe2D.tsx
│   │   │   ├── GameModeSelector.tsx
│   │   │   └── ui/         # Reusable UI components
│   │   ├── lib/            # Utilities and stores
│   │   │   ├── stores/     # Zustand state stores
│   │   │   ├── aiLogic.ts  # AI opponent logic
│   │   │   └── multiplayer.ts
│   │   └── pages/
│   └── public/             # Static assets
│       ├── sounds/         # Audio files
│       └── textures/       # Game textures
├── server/                 # Backend Express server
│   ├── index.ts           # Server entry point
│   ├── routes.ts          # API routes
│   └── storage.ts         # Data storage
├── shared/                # Shared types and schemas
└── package.json
```

## 🎵 Audio Features

- **Sound effects** for piece placement and wins
- **Background music** support
- **Mute/unmute** functionality
- **Audio files** located in `client/public/sounds/`

## 🔧 Development

### Available Scripts

```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run start    # Start production server
npm run check    # TypeScript type checking
```

### Development Features
- **Hot reload** - Changes automatically refresh
- **TypeScript** - Full type safety
- **Debug console** - Detailed logging for multiplayer
- **Error handling** - Comprehensive error management

## 🎯 Game Strategy

### AI Difficulty Levels
- **Easy**: 70% random moves, 30% strategic
- **Medium**: Prioritizes winning, then blocking, then strategic positioning
- **Hard**: Always tries to win or block, then strategic positioning

### Strategic Tips
1. **Control the center** - Most valuable position
2. **Block opponent wins** - Always check for 3-in-a-row threats
3. **Create multiple threats** - Force opponent to block one while you win with another
4. **Manage your pieces** - Remember you only have 3 pieces total!

## 🌟 Unique Features

- **No Draws Policy** - Every game must have a winner
- **Piece Limitation** - Strategic depth with only 3 pieces per player
- **Fade Animations** - Smooth visual feedback when pieces disappear
- **Real-time Multiplayer** - Seamless online play with friends
- **Retro Aesthetic** - Complete 8-bit arcade experience
- **Smart AI** - Challenging computer opponent with strategic thinking

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Press Start 2P** font by Cody "CodeMan38" Boisclair
- **Radix UI** for accessible component primitives
- **Socket.io** for real-time communication
- **React Three Fiber** for 3D graphics capabilities

---

**Enjoy the retro gaming experience!** 🎮✨

*Built with ❤️ using React, TypeScript, and lots of 8-bit nostalgia*
