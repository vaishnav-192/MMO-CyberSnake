import { CONFIG } from '@/config/game';

/**
 * Game Utility Functions
 * Helper functions for game logic
 */

/**
 * Check if a position collides with any segment in the snake
 */
export function checkSnakeCollision(head: { x: number; y: number }, snake: Array<{ x: number; y: number }>): boolean {
  return snake.some((seg) => head.x === seg.x && head.y === seg.y);
}

/**
 * Check if a position is the same as food
 */
export function checkFoodCollision(head: { x: number; y: number }, food: { x: number; y: number }): boolean {
  return head.x === food.x && head.y === food.y;
}

/**
 * Validate player name
 */
export function validatePlayerName(name: string): { valid: boolean; message: string } {
  const trimmed = name.trim();

  if (trimmed.length === 0) {
    return { valid: false, message: 'Name cannot be empty' };
  }

  if (trimmed.length > 20) {
    return { valid: false, message: 'Name must be 20 characters or less' };
  }

  if (!/^[a-zA-Z0-9_\s-]+$/.test(trimmed)) {
    return { valid: false, message: 'Name can only contain letters, numbers, spaces, underscores, and hyphens' };
  }

  return { valid: true, message: '' };
}

/**
 * Calculate total distance of snake
 */
export function calculateSnakeLength(snake: Array<{ x: number; y: number }>): number {
  return snake.length;
}

/**
 * Normalize player name for database key
 */
export function normalizePlayerName(name: string): string {
  return name.toLowerCase().replace(/\s+/g, '_');
}

/**
 * Generate a random player name if not provided
 */
export function generateRandomPlayerName(): string {
  return `PLAYER${Math.floor(Math.random() * 10000)
    .toString()
    .padStart(4, '0')}`;
}

/**
 * Check if direction is opposite to current direction
 */
export function isOppositeDirection(
  current: { dx: number; dy: number },
  next: { dx: number; dy: number }
): boolean {
  return current.dx === -next.dx && current.dy === -next.dy;
}

/**
 * Format score for display
 */
export function formatScore(score: number): string {
  if (score >= 1000000) {
    return (score / 1000000).toFixed(1) + 'M';
  }
  if (score >= 1000) {
    return (score / 1000).toFixed(1) + 'K';
  }
  return score.toString();
}

/**
 * Get time remaining for ghost player cleanup
 */
export function getGhostCleanupTime(lastSeen: number): number {
  const now = Date.now();
  return Math.max(0, CONFIG.CLEANUP_THRESHOLD - (now - lastSeen));
}

/**
 * Check if elapsed time is greater than threshold
 */
export function shouldCleanupGhost(lastSeen: number): boolean {
  const now = Date.now();
  return now - lastSeen > CONFIG.CLEANUP_THRESHOLD;
}
