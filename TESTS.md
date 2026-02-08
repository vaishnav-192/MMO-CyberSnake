# Unit Tests Documentation

This document outlines the comprehensive unit test suite for the MMO-CyberSnake project.

## Overview

The test suite uses **Jest** as the testing framework with **React Testing Library** for component and hook testing. All tests are organized following the project structure.

## Setup and Installation

### Dependencies Added

```json
{
  "@testing-library/jest-dom": "^6.1.5",
  "@testing-library/react": "^14.1.2",
  "@types/jest": "^29.5.10",
  "identity-obj-proxy": "^3.0.0",
  "jest": "^29.7.0",
  "jest-environment-jsdom": "^29.7.0",
  "ts-jest": "^29.1.1"
}
```

### NPM Scripts

```bash
npm test                # Run all tests once
npm run test:watch     # Run tests in watch mode
npm run test:coverage  # Generate coverage report
```

### Configuration Files

- **jest.config.js** - Jest configuration with Next.js support
- **jest.setup.js** - Test environment setup with React Testing Library

## Test Structure

### 1. Type Tests (`src/types/game.test.ts`)

Tests for TypeScript type definitions and interfaces:

- **Position Interface**
  - Valid coordinate creation
  - Zero and negative coordinates
  
- **PlayerData Interface**
  - Player info structure validation
  - Snake segments storage
  - Optional timestamp field

- **RemotePlayer Interface**
  - Extends PlayerData correctly
  - Tracks lastSeen timestamp

- **LeaderboardEntry Interface**
  - Score tracking
  - Kill counts and max length
  - Date field handling

- **KillFeedEntry Interface**
  - Killer-victim relationships
  - Timestamp tracking

- **GameState Interface**
  - Playing/dead state
  - Score management
  - Kill and length tracking

- **GameMode Type**
  - Singleplayer support
  - Multiplayer support

- **PersonalBest Interface**
  - Per-mode stats tracking
  - High scores and max lengths

- **DEFAULT_STATS Constant**
  - Zero initialization
  - Valid PlayerStats structure

### 2. Configuration Tests (`src/config/game.test.ts`)

Tests for game configuration constants:

- **Game Settings**
  - Grid and tile count validation
  - Game speed and sync rate
  - Cleanup threshold values
  - Reasonable value ranges

- **Scoring Configuration**
  - Food score value (10)
  - Kill bonus value (50)
  - Bonus > food score validation

- **Leaderboard Settings**
  - Max entries (10)
  - Live leaderboard limit (5)
  - Live ≤ total validation

- **Color Configuration**
  - All 6 colors defined
  - Valid hex color format
  - Color consistency

- **Firebase Paths**
  - Players path
  - Leaderboard path
  - Stats path
  - Kill feed path

- **Configuration Immutability**
  - Const object protection
  - Type safety

### 3. Game Utility Tests (`src/lib/game-utils.test.ts`)

Tests for pure game logic utility functions:

#### Collision Detection
- `checkSnakeCollision()` - Snake self-collision
- `checkFoodCollision()` - Food consumption

#### Player Management
- `validatePlayerName()` - Name validation (max 20 chars, valid characters)
- `normalizePlayerName()` - Database key generation
- `generateRandomPlayerName()` - Fallback name generation

#### Game Calculations
- `calculateSnakeLength()` - Snake segment counting
- `isOppositeDirection()` - Invalid move detection
- `formatScore()` - Score display formatting (K/M notation)

#### Ghost Player Management
- `getGhostCleanupTime()` - Timeout calculation
- `shouldCleanupGhost()` - Stale player detection

### 4. Firebase Service Tests (`src/lib/firebase-service.test.ts`)

Tests for Firebase integration layer (with mocks):

- **Authentication Functions**
  - `signInAnon()` - Anonymous login
  - `onAuthChange()` - Auth state listening
  - `getCurrentUser()` - User retrieval

- **Player Operations**
  - `syncPlayerState()` - Player data synchronization
  - `removePlayer()` - Cleanup on disconnect
  - `setupDisconnectCleanup()` - Auto-cleanup setup

- **Leaderboard Operations**
  - `submitHighScore()` - Score submission
  - Score comparison logic (only update if higher)
  - Zero score handling

- **Kill Feed Operations**
  - `reportKill()` - Kill event logging
  - Timestamp tracking

- **Data Type Validation**
  - PlayerData structure
  - RemotePlayer structure
  - LeaderboardEntry structure
  - KillFeedEntry structure

- **Error Handling**
  - Missing database graceful handling
  - Null user handling

### 5. Custom Hook Tests

#### useGame Hook (`src/hooks/useGame.test.ts`)

Tests for the main game logic hook:

**Initial State**
- Screen initialization (loading)
- Empty snake
- Game state defaults
- Personal best loading

**Player Management**
- Name setting and persistence
- localStorage integration

**Game Modes**
- Multiplayer mode support
- Singleplayer mode support

**Input Handling**
- Arrow key input (↑↓←→)
- WASD key input
- Input validation (no input when not playing)

**Screen Navigation**
- Screen state transitions
- Valid screen types

**Leaderboard Management**
- Leaderboard initialization
- Live leaderboard calculation
- Player inclusion when playing

**Remote Players**
- Remote player tracking
- Player count tracking

**Game Food**
- Food position initialization
- Valid coordinates

**Connection Status**
- Connection state tracking
- Status message display

**Game State Properties**
- Score tracking
- Kill tracking
- Max length tracking
- Death state tracking

**Game Actions**
- startGame function
- resetGame function
- handleInput function
- liveLeaderboard function

**Personal Best Stats**
- Singleplayer stats
- Multiplayer stats
- Zero initialization

#### useGameCanvas Hook (`src/hooks/useGameCanvas.test.ts`)

Tests for canvas rendering hook:

**Initialization**
- Canvas reference setup
- Valid props acceptance

**Rendering**
- Empty snake support
- Multi-segment snake
- Remote player rendering
- Playing/not-playing states

**Canvas Features**
- Food rendering at valid positions
- Boundary food positions
- Grid limit positions

**Multi-Player Rendering**
- Multiple remote players
- Color/name distinction

**getTileCount Function**
- Fixed tile count (30)
- Consistency across calls
- Multiplayer compatibility

**Canvas Configuration**
- Color schemes validation
- Grid properties

## Test Coverage

The test suite provides comprehensive coverage of:

- ✅ Type definitions and interfaces
- ✅ Configuration constants
- ✅ Utility functions
- ✅ Firebase service layer
- ✅ Custom React hooks
- ✅ Game logic
- ✅ Data validation
- ✅ Error handling
- ✅ State management

## Running Tests

### Run All Tests
```bash
npm test
```

### Watch Mode (for development)
```bash
npm run test:watch
```

### Generate Coverage Report
```bash
npm run test:coverage
```

### Run Specific Test File
```bash
npm test -- src/types/game.test.ts
```

### Run Tests Matching Pattern
```bash
npm test -- --testNamePattern="Player"
```

## Test Isolation

All tests are properly isolated:
- Jest mocks are cleared before each test
- localStorage is mocked and cleared
- Firebase services are fully mocked
- No external API calls

## Mocking Strategy

### Firebase Mocking
Firebase authentication and database calls are fully mocked to:
- Avoid external dependencies
- Provide consistent test behavior
- Enable fast test execution
- Support offline testing

### localStorage Mocking
localStorage operations are mocked to:
- Test persistence logic
- Avoid disk I/O
- Provide test isolation

## Writing New Tests

When adding new features, follow these patterns:

### For Utility Functions
```typescript
describe('functionName', () => {
  it('should handle normal case', () => {
    expect(functionName(input)).toBe(expected);
  });

  it('should handle edge case', () => {
    expect(functionName(edgeCase)).toBe(expectedEdge);
  });
});
```

### For Hooks
```typescript
describe('useHookName', () => {
  it('should initialize with correct state', async () => {
    const { result } = renderHook(() => useHookName());
    await waitFor(() => {
      expect(result.current.property).toBeDefined();
    });
  });
});
```

### For Types
```typescript
describe('TypeName', () => {
  it('should create valid instance', () => {
    const instance: TypeName = { prop: value };
    expect(instance.prop).toBe(value);
  });
});
```

## Continuous Integration

Tests are designed to:
- Run quickly (no external dependencies)
- Run reliably (deterministic behavior)
- Provide clear failure messages
- Be maintainable and readable

## Future Test Expansion

Potential areas for expansion:
- Component integration tests
- Canvas rendering pixel tests
- Network latency simulations
- Game logic edge cases
- Firebase integration tests with emulator
- E2E tests with Cypress or Playwright

## Troubleshooting

### Tests failing locally
1. Ensure all dependencies are installed: `npm install`
2. Clear Jest cache: `npm test -- --clearCache`
3. Check Node version (requires >=18)

### localStorage errors
- Tests mock localStorage automatically
- If issues persist, check jest.setup.js

### Timeout issues
- Some async tests use waitFor with default 1000ms timeout
- Increase timeout if running on slow hardware

## Resources

- [Jest Documentation](https://jestjs.io/)
- [React Testing Library](https://testing-library.com/react)
- [Next.js Testing](https://nextjs.org/docs/testing)
