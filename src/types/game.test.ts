import {
  DEFAULT_STATS,
  type Position,
  type PlayerData,
  type RemotePlayer,
  type LeaderboardEntry,
  type KillFeedEntry,
  type GameState,
  type GameOverData,
  type Direction,
  type ScreenType,
  type GameMode,
  type PlayerStats,
  type PersonalBest,
} from './game';

describe('Game Types', () => {
  describe('Position', () => {
    it('should create a valid position object', () => {
      const position: Position = { x: 5, y: 10 };
      expect(position.x).toBe(5);
      expect(position.y).toBe(10);
    });

    it('should support zero coordinates', () => {
      const position: Position = { x: 0, y: 0 };
      expect(position.x).toBe(0);
      expect(position.y).toBe(0);
    });

    it('should support negative coordinates', () => {
      const position: Position = { x: -5, y: -10 };
      expect(position.x).toBe(-5);
      expect(position.y).toBe(-10);
    });
  });

  describe('PlayerData', () => {
    it('should create valid player data', () => {
      const player: PlayerData = {
        name: 'TestSnake',
        snake: [{ x: 5, y: 5 }],
        score: 100,
        color: '#39ff14',
      };
      expect(player.name).toBe('TestSnake');
      expect(player.score).toBe(100);
      expect(player.snake).toHaveLength(1);
    });

    it('should support optional updatedAt field', () => {
      const now = new Date();
      const player: PlayerData = {
        name: 'TestSnake',
        snake: [],
        score: 0,
        color: '#39ff14',
        updatedAt: now,
      };
      expect(player.updatedAt).toBe(now);
    });

    it('should support multiple snake segments', () => {
      const segments: Position[] = [
        { x: 5, y: 5 },
        { x: 4, y: 5 },
        { x: 3, y: 5 },
      ];
      const player: PlayerData = {
        name: 'LongSnake',
        snake: segments,
        score: 300,
        color: '#00ffff',
      };
      expect(player.snake).toHaveLength(3);
      expect(player.snake).toEqual(segments);
    });
  });

  describe('RemotePlayer', () => {
    it('should extend PlayerData with lastSeen', () => {
      const remotePlayer: RemotePlayer = {
        name: 'Remote',
        snake: [{ x: 1, y: 1 }],
        score: 50,
        color: '#00ffff',
        lastSeen: Date.now(),
      };
      expect(remotePlayer.lastSeen).toBeDefined();
      expect(typeof remotePlayer.lastSeen).toBe('number');
    });
  });

  describe('LeaderboardEntry', () => {
    it('should create valid leaderboard entry', () => {
      const entry: LeaderboardEntry = {
        id: 'player-123',
        name: 'Winner',
        score: 1000,
        kills: 5,
        maxLength: 20,
      };
      expect(entry.id).toBe('player-123');
      expect(entry.score).toBe(1000);
      expect(entry.kills).toBe(5);
    });

    it('should support optional date fields', () => {
      const entry: LeaderboardEntry = {
        id: 'player-123',
        name: 'Winner',
        score: 1000,
        kills: 5,
        maxLength: 20,
        date: '2024-01-01',
        updatedAt: new Date(),
      };
      expect(entry.date).toBe('2024-01-01');
      expect(entry.updatedAt).toBeInstanceOf(Date);
    });
  });

  describe('KillFeedEntry', () => {
    it('should create kill feed entry', () => {
      const entry: KillFeedEntry = {
        killer: 'Player1',
        victim: 'Player2',
      };
      expect(entry.killer).toBe('Player1');
      expect(entry.victim).toBe('Player2');
    });

    it('should support optional timestamp', () => {
      const now = new Date();
      const entry: KillFeedEntry = {
        killer: 'Player1',
        victim: 'Player2',
        timestamp: now,
      };
      expect(entry.timestamp).toBe(now);
    });
  });

  describe('GameState', () => {
    it('should track game state correctly', () => {
      const state: GameState = {
        isPlaying: true,
        isDead: false,
        score: 250,
        kills: 3,
        maxLength: 15,
      };
      expect(state.isPlaying).toBe(true);
      expect(state.isDead).toBe(false);
      expect(state.kills).toBe(3);
    });

    it('should reflect dead state', () => {
      const state: GameState = {
        isPlaying: false,
        isDead: true,
        score: 500,
        kills: 2,
        maxLength: 25,
      };
      expect(state.isDead).toBe(true);
      expect(state.isPlaying).toBe(false);
    });
  });

  describe('GameOverData', () => {
    it('should create game over data', () => {
      const data: GameOverData = {
        killer: 'Enemy',
        score: 500,
        kills: 2,
        maxLength: 20,
      };
      expect(data.killer).toBe('Enemy');
      expect(data.score).toBe(500);
    });

    it('should support wall as killer', () => {
      const data: GameOverData = {
        killer: 'WALL',
        score: 300,
        kills: 1,
        maxLength: 15,
      };
      expect(data.killer).toBe('WALL');
    });
  });

  describe('Direction', () => {
    it('should create direction vectors', () => {
      const upDirection: Direction = { dx: 0, dy: -1 };
      const downDirection: Direction = { dx: 0, dy: 1 };
      const leftDirection: Direction = { dx: -1, dy: 0 };
      const rightDirection: Direction = { dx: 1, dy: 0 };

      expect(upDirection.dy).toBe(-1);
      expect(downDirection.dy).toBe(1);
      expect(leftDirection.dx).toBe(-1);
      expect(rightDirection.dx).toBe(1);
    });
  });

  describe('Screen Types', () => {
    it('should accept valid screen types', () => {
      const validScreens: ScreenType[] = [
        'loading',
        'start',
        'playing',
        'gameOver',
        'leaderboard',
      ];
      expect(validScreens).toHaveLength(5);
    });
  });

  describe('GameMode', () => {
    it('should support singleplayer mode', () => {
      const mode: GameMode = 'singleplayer';
      expect(mode).toBe('singleplayer');
    });

    it('should support multiplayer mode', () => {
      const mode: GameMode = 'multiplayer';
      expect(mode).toBe('multiplayer');
    });
  });

  describe('PlayerStats', () => {
    it('should create player stats', () => {
      const stats: PlayerStats = {
        highScore: 5000,
        maxLength: 50,
        totalGames: 25,
        kills: 10,
      };
      expect(stats.highScore).toBe(5000);
      expect(stats.totalGames).toBe(25);
    });
  });

  describe('PersonalBest', () => {
    it('should track both game modes', () => {
      const personalBest: PersonalBest = {
        singleplayer: {
          highScore: 3000,
          maxLength: 30,
          totalGames: 15,
          kills: 0,
        },
        multiplayer: {
          highScore: 5000,
          maxLength: 50,
          totalGames: 25,
          kills: 10,
        },
      };
      expect(personalBest.singleplayer.highScore).toBe(3000);
      expect(personalBest.multiplayer.highScore).toBe(5000);
    });
  });

  describe('DEFAULT_STATS', () => {
    it('should have all zero values', () => {
      expect(DEFAULT_STATS.highScore).toBe(0);
      expect(DEFAULT_STATS.maxLength).toBe(0);
      expect(DEFAULT_STATS.totalGames).toBe(0);
      expect(DEFAULT_STATS.kills).toBe(0);
    });

    it('should be a valid PlayerStats object', () => {
      const stats: PlayerStats = DEFAULT_STATS;
      expect(stats.highScore).toBeDefined();
      expect(stats.maxLength).toBeDefined();
      expect(stats.totalGames).toBeDefined();
      expect(stats.kills).toBeDefined();
    });
  });
});
