// Snake segment position
export interface Position {
  x: number;
  y: number;
}

// Player data stored in Firebase
export interface PlayerData {
  name: string;
  snake: Position[];
  score: number;
  color: string;
  updatedAt?: Date;
}

// Remote player with additional local tracking
export interface RemotePlayer extends PlayerData {
  lastSeen: number;
}

// Leaderboard entry
export interface LeaderboardEntry {
  id: string;
  name: string;
  score: number;
  kills: number;
  maxLength: number;
  date?: string;
  updatedAt?: Date;
}

// Kill feed entry
export interface KillFeedEntry {
  killer: string;
  victim: string;
  timestamp?: Date;
}

// Game state
export interface GameState {
  isPlaying: boolean;
  isDead: boolean;
  score: number;
  kills: number;
  maxLength: number;
}

// Game over data
export interface GameOverData {
  killer: string;
  score: number;
  kills: number;
  maxLength: number;
}

// Direction
export type Direction = {
  dx: number;
  dy: number;
};

// Screen types
export type ScreenType = 'loading' | 'start' | 'playing' | 'gameOver' | 'leaderboard';
