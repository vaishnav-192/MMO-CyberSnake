import { CONFIG } from '@/config/game';

describe('Game Configuration', () => {
  describe('Game Settings', () => {
    it('should have valid grid size', () => {
      expect(CONFIG.GRID_SIZE).toBe(20);
      expect(typeof CONFIG.GRID_SIZE).toBe('number');
      expect(CONFIG.GRID_SIZE).toBeGreaterThan(0);
    });

    it('should have valid tile count', () => {
      expect(CONFIG.TILE_COUNT).toBe(30);
      expect(typeof CONFIG.TILE_COUNT).toBe('number');
      expect(CONFIG.TILE_COUNT).toBeGreaterThan(0);
    });

    it('should have valid game speed', () => {
      expect(CONFIG.GAME_SPEED).toBe(120);
      expect(typeof CONFIG.GAME_SPEED).toBe('number');
      expect(CONFIG.GAME_SPEED).toBeGreaterThan(0);
    });

    it('should have valid sync rate', () => {
      expect(CONFIG.SYNC_RATE).toBe(150);
      expect(typeof CONFIG.SYNC_RATE).toBe('number');
      expect(CONFIG.SYNC_RATE).toBeGreaterThan(0);
    });

    it('should have cleanup threshold', () => {
      expect(CONFIG.CLEANUP_THRESHOLD).toBe(10000);
      expect(typeof CONFIG.CLEANUP_THRESHOLD).toBe('number');
      expect(CONFIG.CLEANUP_THRESHOLD).toBeGreaterThan(0);
    });

    it('game speed should be reasonable (not too fast or slow)', () => {
      expect(CONFIG.GAME_SPEED).toBeGreaterThanOrEqual(50);
      expect(CONFIG.GAME_SPEED).toBeLessThanOrEqual(500);
    });

    it('cleanup threshold should be greater than sync rate', () => {
      expect(CONFIG.CLEANUP_THRESHOLD).toBeGreaterThan(CONFIG.SYNC_RATE);
    });
  });

  describe('Scoring', () => {
    it('should have positive food score', () => {
      expect(CONFIG.FOOD_SCORE).toBe(10);
      expect(CONFIG.FOOD_SCORE).toBeGreaterThan(0);
    });

    it('should have positive kill bonus', () => {
      expect(CONFIG.KILL_BONUS).toBe(50);
      expect(CONFIG.KILL_BONUS).toBeGreaterThan(0);
    });

    it('kill bonus should be greater than food score', () => {
      expect(CONFIG.KILL_BONUS).toBeGreaterThan(CONFIG.FOOD_SCORE);
    });
  });

  describe('Leaderboard', () => {
    it('should have max leaderboard entries', () => {
      expect(CONFIG.MAX_LEADERBOARD_ENTRIES).toBe(10);
      expect(typeof CONFIG.MAX_LEADERBOARD_ENTRIES).toBe('number');
      expect(CONFIG.MAX_LEADERBOARD_ENTRIES).toBeGreaterThan(0);
    });

    it('should have max live leaderboard', () => {
      expect(CONFIG.MAX_LIVE_LEADERBOARD).toBe(5);
      expect(typeof CONFIG.MAX_LIVE_LEADERBOARD).toBe('number');
      expect(CONFIG.MAX_LIVE_LEADERBOARD).toBeGreaterThan(0);
    });

    it('live leaderboard should not exceed total leaderboard size', () => {
      expect(CONFIG.MAX_LIVE_LEADERBOARD).toBeLessThanOrEqual(CONFIG.MAX_LEADERBOARD_ENTRIES);
    });
  });

  describe('Colors', () => {
    it('should have background color', () => {
      expect(CONFIG.COLORS.BG).toBe('#0a0a12');
      expect(typeof CONFIG.COLORS.BG).toBe('string');
    });

    it('should have grid color', () => {
      expect(CONFIG.COLORS.GRID).toBe('#111122');
      expect(typeof CONFIG.COLORS.GRID).toBe('string');
    });

    it('should have self color', () => {
      expect(CONFIG.COLORS.SELF).toBe('#39ff14');
      expect(typeof CONFIG.COLORS.SELF).toBe('string');
    });

    it('should have enemy color', () => {
      expect(CONFIG.COLORS.ENEMY).toBe('#00ffff');
      expect(typeof CONFIG.COLORS.ENEMY).toBe('string');
    });

    it('should have food color', () => {
      expect(CONFIG.COLORS.FOOD).toBe('#ff0055');
      expect(typeof CONFIG.COLORS.FOOD).toBe('string');
    });

    it('should have powerup color', () => {
      expect(CONFIG.COLORS.POWERUP).toBe('#ffff00');
      expect(typeof CONFIG.COLORS.POWERUP).toBe('string');
    });

    it('all colors should be valid hex strings', () => {
      const colors = Object.values(CONFIG.COLORS);
      const hexRegex = /^#[0-9A-F]{6}$/i;
      colors.forEach((color) => {
        expect(color).toMatch(hexRegex);
      });
    });
  });

  describe('Firebase Paths', () => {
    it('should have players path', () => {
      expect(CONFIG.PATHS.PLAYERS).toBe('players');
      expect(typeof CONFIG.PATHS.PLAYERS).toBe('string');
    });

    it('should have leaderboard path', () => {
      expect(CONFIG.PATHS.LEADERBOARD).toBe('leaderboard');
      expect(typeof CONFIG.PATHS.LEADERBOARD).toBe('string');
    });

    it('should have stats path', () => {
      expect(CONFIG.PATHS.STATS).toBe('stats');
      expect(typeof CONFIG.PATHS.STATS).toBe('string');
    });

    it('should have kill feed path', () => {
      expect(CONFIG.PATHS.KILL_FEED).toBe('killFeed');
      expect(typeof CONFIG.PATHS.KILL_FEED).toBe('string');
    });

    it('paths should be non-empty strings', () => {
      Object.values(CONFIG.PATHS).forEach((path) => {
        expect(path.length).toBeGreaterThan(0);
      });
    });
  });

  describe('App Configuration', () => {
    it('should have app ID', () => {
      expect(CONFIG.APP_ID).toBe('mmo-cybersnake');
      expect(typeof CONFIG.APP_ID).toBe('string');
    });
  });

  describe('CONFIG object structure', () => {
    it('should have all properties defined', () => {
      expect(CONFIG).toBeDefined();
      expect(typeof CONFIG).toBe('object');
      expect(Object.keys(CONFIG).length).toBeGreaterThan(0);
    });
  });

  describe('All required properties exist', () => {
    it('should have all required game settings', () => {
      expect(CONFIG).toHaveProperty('GRID_SIZE');
      expect(CONFIG).toHaveProperty('TILE_COUNT');
      expect(CONFIG).toHaveProperty('GAME_SPEED');
      expect(CONFIG).toHaveProperty('SYNC_RATE');
      expect(CONFIG).toHaveProperty('CLEANUP_THRESHOLD');
    });

    it('should have all required scoring settings', () => {
      expect(CONFIG).toHaveProperty('FOOD_SCORE');
      expect(CONFIG).toHaveProperty('KILL_BONUS');
    });

    it('should have all required leaderboard settings', () => {
      expect(CONFIG).toHaveProperty('MAX_LEADERBOARD_ENTRIES');
      expect(CONFIG).toHaveProperty('MAX_LIVE_LEADERBOARD');
    });

    it('should have all required colors', () => {
      expect(CONFIG.COLORS).toHaveProperty('BG');
      expect(CONFIG.COLORS).toHaveProperty('GRID');
      expect(CONFIG.COLORS).toHaveProperty('SELF');
      expect(CONFIG.COLORS).toHaveProperty('ENEMY');
      expect(CONFIG.COLORS).toHaveProperty('FOOD');
      expect(CONFIG.COLORS).toHaveProperty('POWERUP');
    });

    it('should have all required firebase paths', () => {
      expect(CONFIG.PATHS).toHaveProperty('PLAYERS');
      expect(CONFIG.PATHS).toHaveProperty('LEADERBOARD');
      expect(CONFIG.PATHS).toHaveProperty('STATS');
      expect(CONFIG.PATHS).toHaveProperty('KILL_FEED');
    });
  });
});
