# Poker GTO Trainer

A comprehensive Texas Hold'em Poker Game-Theory Optimal (GTO) training application built with React, TypeScript, and Vite. This interactive trainer helps players learn and practice optimal poker strategies through various game modes and statistical analysis.

## ✨ Features

### 🎮 Game Modes
- **Cash Games**: Traditional ring game format with customizable blinds and stacks
- **Tournaments (MTT)**: Multi-table tournament structure with escalating blinds
- **Heads-Up to 9-Player**: Support for 2-9 players at the table

### ⚙️ Comprehensive Game Settings
- **Game Type Selection**: Choose between Cash Games and Tournaments
- **Player Count**: Adjustable from 2 (heads-up) to 9 players (full ring)
- **Starting Stacks**: Customizable chip stacks for different stakes
- **Blind Structure**: Configurable small/big blinds and antes
- **Betting Display Modes**: 
  - Base Amount (chip values)
  - Big Blind notation (BB format)
- **Preset Configurations**: Quick setup for common game formats

### 📊 Advanced Analytics
- **Range Analysis**: Detailed pre-flop and post-flop range construction
- **Pot Odds Calculator**: Real-time pot odds and break-even calculations
- **GTO Statistics**: Optimal play recommendations and analysis
- **Hand History**: Track and review previous hands

### 🎯 Training Features
- **Interactive Quizzes**: Test your GTO knowledge
- **Real-time Feedback**: Get instant analysis of your decisions
- **Statistical Tracking**: Monitor your progress over time
- **AI Opponents**: Practice against different playing styles

## 🚀 Getting Started

### Prerequisites
- Node.js (version 16 or higher)
- npm or pnpm

### Installation

1. Clone the repository:
```bash
git clone https://github.com/your-username/poker-gto-trainer.git
cd poker-gto-trainer
```

2. Install dependencies:
```bash
pnpm install
# or
npm install
```

3. Start the development server:
```bash
pnpm dev
# or
npm run dev
```

4. Open your browser and navigate to `http://localhost:5173`

## 🎮 How to Play

### Setting Up a Game

1. **Access Game Settings**: Click the "⚙️ Settings" button in the header
2. **Choose Game Type**: Select between Cash Game or Tournament
3. **Configure Players**: Set the number of players (2-9)
4. **Set Stakes**: Adjust blinds and starting stack sizes
5. **Select Display Mode**: Choose between chip values or big blind notation
6. **Apply Settings**: Click "Apply Settings" to start the game

### Game Controls

- **Fold**: Give up your hand
- **Check**: Pass the action (when no bet to call)
- **Call**: Match the current bet
- **Bet/Raise**: Increase the betting amount
- **All-In**: Bet all your remaining chips

### Betting Interface

- Use preset buttons for common bet sizes (1/4 pot, 1/2 pot, etc.)
- Adjust bet amounts with the slider or input field
- View pot odds and recommended actions

## 📁 Project Structure

```
src/
├── components/          # React components
│   ├── GameSettings/    # Game configuration modal
│   ├── PokerGame/       # Main game interface
│   ├── BettingInterface/# Betting controls
│   ├── GameTabs/        # Analysis and statistics tabs
│   └── ...
├── contexts/            # React context providers
├── hooks/               # Custom React hooks
├── services/            # Game logic and services
├── types/               # TypeScript type definitions
├── utils/               # Utility functions
└── styles/              # SCSS stylesheets
```

## 🔧 Technical Stack

- **Frontend**: React 18 with TypeScript
- **Build Tool**: Vite
- **Styling**: SCSS with modular components
- **State Management**: React Context API
- **Testing**: Vitest
- **Code Quality**: ESLint + TypeScript strict mode

## 🎨 Game Settings Options

### Cash Game Presets
- **Micro Stakes**: 1/2 blinds, 200 starting stack
- **Low Stakes**: 5/10 blinds, 1000 starting stack
- **Mid Stakes**: 25/50 blinds, 5000 starting stack
- **High Stakes**: 100/200 blinds, 20000 starting stack

### Tournament Presets
- **Turbo**: Fast-paced 10-minute levels
- **Regular**: Standard 15-minute levels
- **Deep Stack**: Longer tournaments with larger stacks

### Display Modes
- **Base Amount**: Shows actual chip values ($25, $150, etc.)
- **Big Blinds**: Shows amounts relative to big blind (0.5 BB, 3 BB, etc.)

## 🧮 Betting Utils

The application includes sophisticated betting calculation utilities:

- **formatBettingAmount()**: Smart formatting based on display mode
- **formatChipStack()**: Dual display showing both chips and BB
- **getBettingStep()**: Appropriate betting increments
- **parseBettingInput()**: Convert user input to chip amounts

## 🎯 Future Enhancements

- [ ] Advanced GTO solver integration
- [ ] Multiplayer online functionality
- [ ] Hand replay system
- [ ] Export/import hand histories
- [ ] Mobile responsive design
- [ ] Custom AI personality training
- [ ] Tournament leaderboards

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request. For major changes, please open an issue first to discuss what you would like to change.

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- Game theory concepts based on modern poker strategy
- UI/UX inspired by professional poker software
- Built with modern React patterns and best practices
