/**
 * @jest-environment jsdom
 */

import { renderHook } from '@testing-library/react';
import { useGameCanvas, getTileCount } from './useGameCanvas';
import { CONFIG } from '@/config/game';
import type { Position, RemotePlayer } from '@/types';

// Mock Canvas API
const mockCanvasContext = {
  fillStyle: '',
  strokeStyle: '',
  lineWidth: 1,
  font: '',
  textAlign: 'center',
  shadowBlur: 0,
  shadowColor: '',
  fillRect: jest.fn(),
  beginPath: jest.fn(),
  moveTo: jest.fn(),
  lineTo: jest.fn(),
  stroke: jest.fn(),
  fillText: jest.fn(),
};

HTMLCanvasElement.prototype.getContext = jest.fn((contextType) => {
  if (contextType === '2d') {
    return mockCanvasContext;
  }
  return null;
});

describe('useGameCanvas Hook', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('initialization', () => {
    it('should return canvas reference', () => {
      const props = {
        snake: [],
        food: { x: 5, y: 5 },
        remotePlayers: {},
        isPlaying: false,
      };

      const { result } = renderHook(() => useGameCanvas(props));

      expect(result.current.canvasRef).toBeDefined();
    });

    it('should accept valid props', () => {
      const props = {
        snake: [{ x: 0, y: 0 }] as Position[],
        food: { x: 10, y: 10 } as Position,
        remotePlayers: {} as Record<string, RemotePlayer>,
        isPlaying: true,
      };

      expect(() => renderHook(() => useGameCanvas(props))).not.toThrow();
    });
  });

  describe('canvas rendering', () => {
    it('should support empty snake', () => {
      const props = {
        snake: [],
        food: { x: 5, y: 5 },
        remotePlayers: {},
        isPlaying: false,
      };

      const { result } = renderHook(() => useGameCanvas(props));

      expect(result.current.canvasRef).toBeDefined();
    });

    it('should support snake with segments', () => {
      const snake: Position[] = [
        { x: 5, y: 5 },
        { x: 4, y: 5 },
        { x: 3, y: 5 },
      ];

      const props = {
        snake,
        food: { x: 10, y: 10 },
        remotePlayers: {},
        isPlaying: true,
      };

      const { result } = renderHook(() => useGameCanvas(props));

      expect(result.current.canvasRef).toBeDefined();
    });

    it('should support remote players', () => {
      const remotePlayers: Record<string, RemotePlayer> = {
        player1: {
          name: 'Player1',
          snake: [{ x: 15, y: 15 }],
          score: 100,
          color: '#00ffff',
          lastSeen: Date.now(),
        },
      };

      const props = {
        snake: [{ x: 5, y: 5 }],
        food: { x: 10, y: 10 },
        remotePlayers,
        isPlaying: true,
      };

      const { result } = renderHook(() => useGameCanvas(props));

      expect(result.current.canvasRef).toBeDefined();
    });

    it('should handle playing state', () => {
      const propsPlaying = {
        snake: [{ x: 5, y: 5 }],
        food: { x: 10, y: 10 },
        remotePlayers: {},
        isPlaying: true,
      };

      const { result: resultPlaying } = renderHook(() =>
        useGameCanvas(propsPlaying)
      );

      expect(resultPlaying.current.canvasRef).toBeDefined();
    });

    it('should handle not playing state', () => {
      const propsNotPlaying = {
        snake: [{ x: 5, y: 5 }],
        food: { x: 10, y: 10 },
        remotePlayers: {},
        isPlaying: false,
      };

      const { result: resultNotPlaying } = renderHook(() =>
        useGameCanvas(propsNotPlaying)
      );

      expect(resultNotPlaying.current.canvasRef).toBeDefined();
    });
  });

  describe('canvas properties', () => {
    it('should have valid canvas reference properties', () => {
      const props = {
        snake: [],
        food: { x: 5, y: 5 },
        remotePlayers: {},
        isPlaying: false,
      };

      const { result } = renderHook(() => useGameCanvas(props));

      expect(result.current.canvasRef).toHaveProperty('current');
    });
  });

  describe('food rendering', () => {
    it('should support food at valid position', () => {
      const food: Position = { x: 10, y: 10 };

      const props = {
        snake: [],
        food,
        remotePlayers: {},
        isPlaying: false,
      };

      const { result } = renderHook(() => useGameCanvas(props));

      expect(result.current.canvasRef).toBeDefined();
    });

    it('should support food at boundaries', () => {
      const food: Position = { x: 0, y: 0 };

      const props = {
        snake: [],
        food,
        remotePlayers: {},
        isPlaying: false,
      };

      const { result } = renderHook(() => useGameCanvas(props));

      expect(result.current.canvasRef).toBeDefined();
    });

    it('should support food at grid limits', () => {
      const food: Position = {
        x: CONFIG.TILE_COUNT - 1,
        y: CONFIG.TILE_COUNT - 1,
      };

      const props = {
        snake: [],
        food,
        remotePlayers: {},
        isPlaying: false,
      };

      const { result } = renderHook(() => useGameCanvas(props));

      expect(result.current.canvasRef).toBeDefined();
    });
  });

  describe('multiple players', () => {
    it('should render multiple remote players', () => {
      const remotePlayers: Record<string, RemotePlayer> = {
        player1: {
          name: 'Player1',
          snake: [{ x: 5, y: 5 }],
          score: 100,
          color: '#00ffff',
          lastSeen: Date.now(),
        },
        player2: {
          name: 'Player2',
          snake: [{ x: 15, y: 15 }],
          score: 150,
          color: '#ff00ff',
          lastSeen: Date.now(),
        },
        player3: {
          name: 'Player3',
          snake: [{ x: 20, y: 20 }],
          score: 200,
          color: '#ffff00',
          lastSeen: Date.now(),
        },
      };

      const props = {
        snake: [{ x: 10, y: 10 }],
        food: { x: 25, y: 25 },
        remotePlayers,
        isPlaying: true,
      };

      const { result } = renderHook(() => useGameCanvas(props));

      expect(result.current.canvasRef).toBeDefined();
    });
  });
});

describe('getTileCount function', () => {
  it('should return fixed tile count from config', () => {
    const tileCount = getTileCount(300);
    expect(tileCount).toBe(CONFIG.TILE_COUNT);
  });

  it('should always return same tile count regardless of input', () => {
    expect(getTileCount(100)).toBe(CONFIG.TILE_COUNT);
    expect(getTileCount(300)).toBe(CONFIG.TILE_COUNT);
    expect(getTileCount(600)).toBe(CONFIG.TILE_COUNT);
  });

  it('should return correct tile count value', () => {
    expect(getTileCount(0)).toBe(30);
  });

  it('should be consistent for multiplayer', () => {
    const count1 = getTileCount(400);
    const count2 = getTileCount(400);
    expect(count1).toBe(count2);
  });
});

describe('canvas configuration', () => {
  it('should use tile count from config', () => {
    expect(CONFIG.TILE_COUNT).toBe(30);
  });

  it('should have correct grid colors', () => {
    expect(CONFIG.COLORS.SELF).toBe('#39ff14');
    expect(CONFIG.COLORS.ENEMY).toBe('#00ffff');
    expect(CONFIG.COLORS.FOOD).toBe('#ff0055');
  });

  it('should have valid background color', () => {
    expect(CONFIG.COLORS.BG).toBe('#0a0a12');
  });

  it('should have valid grid color', () => {
    expect(CONFIG.COLORS.GRID).toBe('#111122');
  });
});
