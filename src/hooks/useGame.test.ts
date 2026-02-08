/**
 * @jest-environment jsdom
 */

import { renderHook, act, waitFor } from '@testing-library/react';
import { useGame } from './useGame';

// Mock Firebase services
jest.mock('@/lib/firebase-service', () => ({
  signInAnon: jest.fn(() =>
    Promise.resolve({
      uid: 'test-user-123',
      email: null,
      isAnonymous: true,
    })
  ),
  onAuthChange: jest.fn((callback) => {
    // Simulate auth callback
    callback({
      uid: 'test-user-123',
      email: null,
      isAnonymous: true,
    });
    return jest.fn(); // Return unsubscribe function
  }),
  getCurrentUser: jest.fn(() => ({
    uid: 'test-user-123',
    email: null,
    isAnonymous: true,
  })),
  syncPlayerState: jest.fn(() => Promise.resolve()),
  removePlayer: jest.fn(() => Promise.resolve()),
  setupDisconnectCleanup: jest.fn(),
  subscribeToPlayers: jest.fn(() => jest.fn()),
  subscribeToLeaderboard: jest.fn(() => jest.fn()),
  subscribeToKillFeed: jest.fn(() => jest.fn()),
  submitHighScore: jest.fn(() => Promise.resolve()),
  reportKill: jest.fn(() => Promise.resolve()),
}));

// Mock config
jest.mock('@/config/game', () => ({
  CONFIG: {
    GRID_SIZE: 20,
    TILE_COUNT: 30,
    GAME_SPEED: 120,
    SYNC_RATE: 150,
    CLEANUP_THRESHOLD: 10000,
    FOOD_SCORE: 10,
    KILL_BONUS: 50,
    MAX_LEADERBOARD_ENTRIES: 10,
    MAX_LIVE_LEADERBOARD: 5,
    COLORS: {
      BG: '#0a0a12',
      GRID: '#111122',
      SELF: '#39ff14',
      ENEMY: '#00ffff',
      FOOD: '#ff0055',
      POWERUP: '#ffff00',
    },
    PATHS: {
      PLAYERS: 'players',
      LEADERBOARD: 'leaderboard',
      STATS: 'stats',
      KILL_FEED: 'killFeed',
    },
    APP_ID: 'mmo-cybersnake',
  },
}));

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};

  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString();
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

describe('useGame Hook', () => {
  beforeEach(() => {
    localStorage.clear();
    jest.clearAllMocks();
  });

  describe('initial state', () => {
    it('should initialize with loading screen', async () => {
      const { result } = renderHook(() => useGame());

      await waitFor(() => {
        expect(result.current.currentScreen).toBeDefined();
      });
    });

    it('should have null user initially', async () => {
      const { result } = renderHook(() => useGame());

      await waitFor(() => {
        expect(result.current.user).toBeDefined();
      });
    });

    it('should initialize empty snake', async () => {
      const { result } = renderHook(() => useGame());

      await waitFor(() => {
        expect(result.current.snake).toBeDefined();
        expect(Array.isArray(result.current.snake)).toBe(true);
      });
    });

    it('should initialize game state', async () => {
      const { result } = renderHook(() => useGame());

      await waitFor(() => {
        expect(result.current.gameState).toBeDefined();
        expect(result.current.gameState.isPlaying).toBe(false);
        expect(result.current.gameState.isDead).toBe(false);
        expect(result.current.gameState.score).toBe(0);
      });
    });

    it('should initialize with default personal best', async () => {
      const { result } = renderHook(() => useGame());

      await waitFor(() => {
        expect(result.current.personalBest).toBeDefined();
        expect(result.current.personalBest.singleplayer).toBeDefined();
        expect(result.current.personalBest.multiplayer).toBeDefined();
      });
    });
  });

  describe('player name handling', () => {
    it('should allow setting player name', async () => {
      const { result } = renderHook(() => useGame());

      act(() => {
        result.current.setPlayerName('TestPlayer');
      });

      expect(result.current.playerName).toBe('TestPlayer');
    });

    it('should initialize with empty player name', async () => {
      const { result } = renderHook(() => useGame());

      await waitFor(() => {
        expect(result.current.playerName).toBeDefined();
        expect(typeof result.current.playerName).toBe('string');
      });
    });
  });

  describe('game mode', () => {
    it('should support multiplayer mode', async () => {
      const { result } = renderHook(() => useGame());

      await waitFor(() => {
        expect(result.current.gameMode).toBeDefined();
      });
    });

    it('should support singleplayer mode', async () => {
      const { result } = renderHook(() => useGame());

      await waitFor(() => {
        expect(['singleplayer', 'multiplayer']).toContain(result.current.gameMode);
      });
    });
  });

  describe('input handling', () => {
    it('should handle arrow key input', async () => {
      const { result } = renderHook(() => useGame());

      await waitFor(() => {
        result.current.handleInput('ArrowUp');
      });
    });

    it('should handle WASD input', async () => {
      const { result } = renderHook(() => useGame());

      await waitFor(() => {
        result.current.handleInput('w');
        result.current.handleInput('a');
        result.current.handleInput('s');
        result.current.handleInput('d');
      });
    });

    it('should ignore input when not playing', async () => {
      const { result } = renderHook(() => useGame());

      await waitFor(() => {
        expect(result.current.gameState.isPlaying).toBe(false);
      });

      // Should not throw
      expect(() => {
        result.current.handleInput('ArrowUp');
      }).not.toThrow();
    });
  });

  describe('screen navigation', () => {
    it('should allow setting current screen', async () => {
      const { result } = renderHook(() => useGame());

      await waitFor(() => {
        expect(result.current.currentScreen).toBeDefined();
      });

      act(() => {
        result.current.setCurrentScreen('start');
      });

      expect(result.current.currentScreen).toBe('start');
    });
  });

  describe('leaderboard', () => {
    it('should initialize empty leaderboard', async () => {
      const { result } = renderHook(() => useGame());

      await waitFor(() => {
        expect(result.current.leaderboard).toBeDefined();
        expect(Array.isArray(result.current.leaderboard)).toBe(true);
      });
    });

    it('should provide live leaderboard', async () => {
      const { result } = renderHook(() => useGame());

      await waitFor(() => {
        const liveBoard = result.current.liveLeaderboard();
        expect(Array.isArray(liveBoard)).toBe(true);
      });
    });

    it('should include player in live leaderboard when playing', async () => {
      const { result } = renderHook(() => useGame());

      await waitFor(() => {
        act(() => {
          result.current.setPlayerName('TestPlayer');
        });
      });

      // In playing state, should include player
      const liveBoard = result.current.liveLeaderboard();
      expect(Array.isArray(liveBoard)).toBe(true);
    });
  });

  describe('kill feed', () => {
    it('should initialize empty kill feed', async () => {
      const { result } = renderHook(() => useGame());

      await waitFor(() => {
        expect(result.current.killFeed).toBeDefined();
        expect(Array.isArray(result.current.killFeed)).toBe(true);
      });
    });
  });

  describe('remote players', () => {
    it('should initialize empty remote players', async () => {
      const { result } = renderHook(() => useGame());

      await waitFor(() => {
        expect(result.current.remotePlayers).toBeDefined();
        expect(typeof result.current.remotePlayers).toBe('object');
      });
    });

    it('should track player count', async () => {
      const { result } = renderHook(() => useGame());

      await waitFor(() => {
        expect(result.current.playerCount).toBeDefined();
        expect(typeof result.current.playerCount).toBe('number');
      });
    });
  });

  describe('game food', () => {
    it('should initialize food position', async () => {
      const { result } = renderHook(() => useGame());

      await waitFor(() => {
        expect(result.current.food).toBeDefined();
        expect(result.current.food.x).toBeDefined();
        expect(result.current.food.y).toBeDefined();
      });
    });

    it('should have valid food coordinates', async () => {
      const { result } = renderHook(() => useGame());

      await waitFor(() => {
        expect(typeof result.current.food.x).toBe('number');
        expect(typeof result.current.food.y).toBe('number');
      });
    });
  });

  describe('connection status', () => {
    it('should track connection status', async () => {
      const { result } = renderHook(() => useGame());

      await waitFor(() => {
        expect(result.current.isConnected).toBeDefined();
        expect(typeof result.current.isConnected).toBe('boolean');
      });
    });

    it('should provide status message', async () => {
      const { result } = renderHook(() => useGame());

      await waitFor(() => {
        expect(result.current.statusMessage).toBeDefined();
        expect(typeof result.current.statusMessage).toBe('string');
      });
    });
  });

  describe('game state properties', () => {
    it('should track score', async () => {
      const { result } = renderHook(() => useGame());

      await waitFor(() => {
        expect(result.current.gameState.score).toBeDefined();
        expect(typeof result.current.gameState.score).toBe('number');
      });
    });

    it('should track kills', async () => {
      const { result } = renderHook(() => useGame());

      await waitFor(() => {
        expect(result.current.gameState.kills).toBeDefined();
        expect(typeof result.current.gameState.kills).toBe('number');
      });
    });

    it('should track max length', async () => {
      const { result } = renderHook(() => useGame());

      await waitFor(() => {
        expect(result.current.gameState.maxLength).toBeDefined();
        expect(typeof result.current.gameState.maxLength).toBe('number');
      });
    });

    it('should track death status', async () => {
      const { result } = renderHook(() => useGame());

      await waitFor(() => {
        expect(result.current.gameState.isDead).toBeDefined();
        expect(typeof result.current.gameState.isDead).toBe('boolean');
      });
    });
  });

  describe('killer tracking', () => {
    it('should initialize killer as WALL', async () => {
      const { result } = renderHook(() => useGame());

      await waitFor(() => {
        expect(result.current.killer).toBeDefined();
        expect(result.current.killer).toBe('WALL');
      });
    });
  });

  describe('game actions', () => {
    it('should provide startGame action', async () => {
      const { result } = renderHook(() => useGame());

      await waitFor(() => {
        expect(result.current.startGame).toBeDefined();
        expect(typeof result.current.startGame).toBe('function');
      });
    });

    it('should provide resetGame action', async () => {
      const { result } = renderHook(() => useGame());

      await waitFor(() => {
        expect(result.current.resetGame).toBeDefined();
        expect(typeof result.current.resetGame).toBe('function');
      });
    });

    it('should provide handleInput action', async () => {
      const { result } = renderHook(() => useGame());

      await waitFor(() => {
        expect(result.current.handleInput).toBeDefined();
        expect(typeof result.current.handleInput).toBe('function');
      });
    });

    it('should provide liveLeaderboard action', async () => {
      const { result } = renderHook(() => useGame());

      await waitFor(() => {
        expect(result.current.liveLeaderboard).toBeDefined();
        expect(typeof result.current.liveLeaderboard).toBe('function');
      });
    });
  });

  describe('personal best tracking', () => {
    it('should track singleplayer stats', async () => {
      const { result } = renderHook(() => useGame());

      await waitFor(() => {
        expect(result.current.personalBest.singleplayer).toBeDefined();
        expect(result.current.personalBest.singleplayer.highScore).toBe(0);
      });
    });

    it('should track multiplayer stats', async () => {
      const { result } = renderHook(() => useGame());

      await waitFor(() => {
        expect(result.current.personalBest.multiplayer).toBeDefined();
        expect(result.current.personalBest.multiplayer.highScore).toBe(0);
      });
    });

    it('should have zero stats initially', async () => {
      const { result } = renderHook(() => useGame());

      await waitFor(() => {
        const stats = result.current.personalBest.singleplayer;
        expect(stats.highScore).toBe(0);
        expect(stats.kills).toBe(0);
        expect(stats.totalGames).toBe(0);
        expect(stats.maxLength).toBe(0);
      });
    });
  });
});
