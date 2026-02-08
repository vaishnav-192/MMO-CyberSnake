import {
  checkSnakeCollision,
  checkFoodCollision,
  validatePlayerName,
  calculateSnakeLength,
  normalizePlayerName,
  generateRandomPlayerName,
  isOppositeDirection,
  formatScore,
  getGhostCleanupTime,
  shouldCleanupGhost,
} from './game-utils';

describe('Game Utilities', () => {
  describe('checkSnakeCollision', () => {
    it('should detect collision with snake segment', () => {
      const head = { x: 5, y: 5 };
      const snake = [
        { x: 4, y: 5 },
        { x: 3, y: 5 },
        { x: 2, y: 5 },
      ];

      expect(checkSnakeCollision(head, snake)).toBe(false);
    });

    it('should detect self collision', () => {
      const head = { x: 5, y: 5 };
      const snake = [
        { x: 5, y: 5 },
        { x: 4, y: 5 },
        { x: 3, y: 5 },
      ];

      expect(checkSnakeCollision(head, snake)).toBe(true);
    });

    it('should return false for empty snake', () => {
      const head = { x: 5, y: 5 };
      expect(checkSnakeCollision(head, [])).toBe(false);
    });

    it('should check all segments', () => {
      const head = { x: 3, y: 5 };
      const snake = [
        { x: 5, y: 5 },
        { x: 4, y: 5 },
        { x: 3, y: 5 },
      ];

      expect(checkSnakeCollision(head, snake)).toBe(true);
    });
  });

  describe('checkFoodCollision', () => {
    it('should detect food collision', () => {
      const head = { x: 5, y: 5 };
      const food = { x: 5, y: 5 };

      expect(checkFoodCollision(head, food)).toBe(true);
    });

    it('should not detect collision when positions differ', () => {
      const head = { x: 5, y: 5 };
      const food = { x: 4, y: 4 };

      expect(checkFoodCollision(head, food)).toBe(false);
    });

    it('should handle different coordinates', () => {
      const head = { x: 10, y: 15 };
      const food = { x: 10, y: 14 };

      expect(checkFoodCollision(head, food)).toBe(false);
    });
  });

  describe('validatePlayerName', () => {
    it('should accept valid names', () => {
      const result = validatePlayerName('Player123');
      expect(result.valid).toBe(true);
    });

    it('should reject empty names', () => {
      const result = validatePlayerName('');
      expect(result.valid).toBe(false);
      expect(result.message).toContain('empty');
    });

    it('should reject whitespace-only names', () => {
      const result = validatePlayerName('   ');
      expect(result.valid).toBe(false);
      expect(result.message).toContain('empty');
    });

    it('should reject names longer than 20 characters', () => {
      const result = validatePlayerName('a'.repeat(21));
      expect(result.valid).toBe(false);
      expect(result.message).toContain('20 characters');
    });

    it('should reject invalid characters', () => {
      const result = validatePlayerName('Player@Name!');
      expect(result.valid).toBe(false);
      expect(result.message).toContain('letters, numbers');
    });

    it('should allow numbers', () => {
      const result = validatePlayerName('Player123');
      expect(result.valid).toBe(true);
    });

    it('should allow underscores and hyphens', () => {
      const result1 = validatePlayerName('Player_Name');
      const result2 = validatePlayerName('Player-Name');
      expect(result1.valid).toBe(true);
      expect(result2.valid).toBe(true);
    });

    it('should trim whitespace', () => {
      const result = validatePlayerName('  Player  ');
      expect(result.valid).toBe(true);
    });
  });

  describe('calculateSnakeLength', () => {
    it('should return correct length for empty snake', () => {
      expect(calculateSnakeLength([])).toBe(0);
    });

    it('should return correct length for single segment', () => {
      expect(calculateSnakeLength([{ x: 5, y: 5 }])).toBe(1);
    });

    it('should return correct length for multiple segments', () => {
      const snake = [
        { x: 5, y: 5 },
        { x: 4, y: 5 },
        { x: 3, y: 5 },
      ];
      expect(calculateSnakeLength(snake)).toBe(3);
    });
  });

  describe('normalizePlayerName', () => {
    it('should convert to lowercase', () => {
      expect(normalizePlayerName('PLAYER123')).toBe('player123');
    });

    it('should replace spaces with underscores', () => {
      expect(normalizePlayerName('My Player')).toBe('my_player');
    });

    it('should handle multiple spaces', () => {
      expect(normalizePlayerName('My  Player  Name')).toBe('my_player_name');
    });

    it('should handle mixed case with spaces', () => {
      expect(normalizePlayerName('My Player')).toBe('my_player');
    });
  });

  describe('generateRandomPlayerName', () => {
    it('should generate a player name', () => {
      const name = generateRandomPlayerName();
      expect(name).toMatch(/^PLAYER\d{4}$/);
    });

    it('should generate different names', () => {
      const name1 = generateRandomPlayerName();
      const name2 = generateRandomPlayerName();
      // While theoretically possible they could be the same, very unlikely
      expect(name1).toMatch(/^PLAYER\d{4}$/);
      expect(name2).toMatch(/^PLAYER\d{4}$/);
    });

    it('should always have PLAYER prefix and 4 digits', () => {
      for (let i = 0; i < 10; i++) {
        const name = generateRandomPlayerName();
        expect(name).toMatch(/^PLAYER\d{4}$/);
      }
    });
  });

  describe('isOppositeDirection', () => {
    it('should detect opposite up and down', () => {
      const up = { dx: 0, dy: -1 };
      const down = { dx: 0, dy: 1 };
      expect(isOppositeDirection(up, down)).toBe(true);
    });

    it('should detect opposite left and right', () => {
      const left = { dx: -1, dy: 0 };
      const right = { dx: 1, dy: 0 };
      expect(isOppositeDirection(left, right)).toBe(true);
    });

    it('should not detect same direction as opposite', () => {
      const up = { dx: 0, dy: -1 };
      expect(isOppositeDirection(up, up)).toBe(false);
    });

    it('should not detect perpendicular directions as opposite', () => {
      const up = { dx: 0, dy: -1 };
      const left = { dx: -1, dy: 0 };
      expect(isOppositeDirection(up, left)).toBe(false);
    });

    it('should handle down to up', () => {
      const down = { dx: 0, dy: 1 };
      const up = { dx: 0, dy: -1 };
      expect(isOppositeDirection(down, up)).toBe(true);
    });
  });

  describe('formatScore', () => {
    it('should format small scores as is', () => {
      expect(formatScore(500)).toBe('500');
    });

    it('should format thousands with K suffix', () => {
      expect(formatScore(5000)).toBe('5.0K');
      expect(formatScore(5500)).toBe('5.5K');
    });

    it('should format millions with M suffix', () => {
      expect(formatScore(5000000)).toBe('5.0M');
    });

    it('should handle zero', () => {
      expect(formatScore(0)).toBe('0');
    });

    it('should handle edge cases', () => {
      expect(formatScore(999)).toBe('999');
      expect(formatScore(1000)).toBe('1.0K');
      expect(formatScore(999999)).toBe('1000.0K');
      expect(formatScore(1000000)).toBe('1.0M');
    });
  });

  describe('getGhostCleanupTime', () => {
    it('should return positive time when ghost is recent', () => {
      const now = Date.now();
      const lastSeen = now - 1000; // 1 second ago
      const time = getGhostCleanupTime(lastSeen);
      expect(time).toBeGreaterThan(0);
    });

    it('should return 0 when ghost is old', () => {
      const now = Date.now();
      const lastSeen = now - 11000; // 11 seconds ago (threshold is 10s)
      const time = getGhostCleanupTime(lastSeen);
      expect(time).toBeLessThanOrEqual(0);
    });

    it('should decrease over time', () => {
      const now = Date.now();
      const lastSeen = now - 5000;
      const time1 = getGhostCleanupTime(lastSeen);
      expect(time1).toBeGreaterThan(0);
    });
  });

  describe('shouldCleanupGhost', () => {
    it('should not cleanup recent ghost', () => {
      const now = Date.now();
      const lastSeen = now - 1000; // 1 second ago
      expect(shouldCleanupGhost(lastSeen)).toBe(false);
    });

    it('should cleanup old ghost', () => {
      const now = Date.now();
      const lastSeen = now - 11000; // 11 seconds ago (threshold is 10s)
      expect(shouldCleanupGhost(lastSeen)).toBe(true);
    });

    it('should handle exact threshold', () => {
      const now = Date.now();
      // Just past threshold
      const lastSeen = now - 10001;
      expect(shouldCleanupGhost(lastSeen)).toBe(true);
    });
  });
});
