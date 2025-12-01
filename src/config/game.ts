// Game Configuration
export const CONFIG = {
  // Game Settings
  GRID_SIZE: 20,
  GAME_SPEED: 120, // ms per tick
  SYNC_RATE: 150, // ms per network sync
  CLEANUP_THRESHOLD: 10000, // 10s timeout for ghost players

  // Scoring
  FOOD_SCORE: 10,
  KILL_BONUS: 50,

  // Leaderboard
  MAX_LEADERBOARD_ENTRIES: 10,
  MAX_LIVE_LEADERBOARD: 5,

  // Colors
  COLORS: {
    BG: '#0a0a12',
    GRID: '#111122',
    SELF: '#39ff14',
    ENEMY: '#00ffff',
    FOOD: '#ff0055',
    POWERUP: '#ffff00',
  },

  // Firebase paths
  PATHS: {
    PLAYERS: 'players',
    LEADERBOARD: 'leaderboard',
    STATS: 'stats',
    KILL_FEED: 'killFeed',
  },

  // App ID for Firebase path
  APP_ID: 'mmo-cybersnake',
} as const;

export type GameConfig = typeof CONFIG;
