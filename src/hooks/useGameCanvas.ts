'use client';

import { useEffect, useRef, useCallback } from 'react';
import { CONFIG } from '@/config/game';
import { Position, RemotePlayer, Direction } from '@/types';

interface UseGameCanvasProps {
  snake: Position[];
  food: Position;
  remotePlayers: Record<string, RemotePlayer>;
  isPlaying: boolean;
}

export function useGameCanvas({
  snake,
  food,
  remotePlayers,
  isPlaying,
}: UseGameCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameRef = useRef<number>();

  const drawGrid = useCallback((ctx: CanvasRenderingContext2D, width: number, height: number) => {
    const cellSize = width / CONFIG.TILE_COUNT;
    ctx.strokeStyle = CONFIG.COLORS.GRID;
    ctx.lineWidth = 1;
    ctx.beginPath();

    for (let i = 0; i <= CONFIG.TILE_COUNT; i++) {
      const pos = i * cellSize;
      ctx.moveTo(pos, 0);
      ctx.lineTo(pos, height);
      ctx.moveTo(0, pos);
      ctx.lineTo(width, pos);
    }

    ctx.stroke();
  }, []);

  const drawFood = useCallback((ctx: CanvasRenderingContext2D, foodPos: Position, canvasWidth: number) => {
    const cellSize = canvasWidth / CONFIG.TILE_COUNT;
    ctx.shadowBlur = 15;
    ctx.shadowColor = CONFIG.COLORS.FOOD;
    ctx.fillStyle = CONFIG.COLORS.FOOD;

    const padding = cellSize * 0.1;
    const x = foodPos.x * cellSize + padding;
    const y = foodPos.y * cellSize + padding;
    const size = cellSize - padding * 2;

    // Pulsing effect
    const pulse = Math.sin(Date.now() / 200) * (cellSize * 0.1);
    ctx.fillRect(x - pulse / 2, y - pulse / 2, size + pulse, size + pulse);

    ctx.shadowBlur = 0;
  }, []);

  const drawSnake = useCallback(
    (
      ctx: CanvasRenderingContext2D,
      snakeBody: Position[],
      color: string,
      canvasWidth: number,
      labelName?: string
    ) => {
      if (!snakeBody || snakeBody.length === 0) return;

      const cellSize = canvasWidth / CONFIG.TILE_COUNT;
      ctx.fillStyle = color;
      ctx.shadowBlur = 10;
      ctx.shadowColor = color;

      snakeBody.forEach((seg, i) => {
        const padding = i === 0 ? cellSize * 0.05 : cellSize * 0.1;
        const size = cellSize - padding * 2;
        ctx.fillRect(
          seg.x * cellSize + padding,
          seg.y * cellSize + padding,
          size,
          size
        );
      });

      ctx.shadowBlur = 0;

      // Draw name tag
      if (labelName && snakeBody[0]) {
        const head = snakeBody[0];
        ctx.fillStyle = '#fff';
        const fontSize = Math.max(12, cellSize * 0.6);
        ctx.font = `${fontSize}px VT323, monospace`;
        ctx.textAlign = 'center';
        ctx.fillText(
          labelName,
          head.x * cellSize + cellSize / 2,
          head.y * cellSize - 5
        );
      }
    },
    []
  );

  const render = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear
    ctx.fillStyle = CONFIG.COLORS.BG;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    drawGrid(ctx, canvas.width, canvas.height);
    drawFood(ctx, food, canvas.width);

    // Draw remote players
    Object.values(remotePlayers).forEach((player) => {
      drawSnake(ctx, player.snake, player.color || CONFIG.COLORS.ENEMY, canvas.width, player.name);
    });

    // Draw self
    if (isPlaying) {
      drawSnake(ctx, snake, CONFIG.COLORS.SELF, canvas.width);
    }

    animationFrameRef.current = requestAnimationFrame(render);
  }, [snake, food, remotePlayers, isPlaying, drawGrid, drawFood, drawSnake]);

  useEffect(() => {
    animationFrameRef.current = requestAnimationFrame(render);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [render]);

  // Resize handler - canvas size adapts to screen but game logic uses fixed TILE_COUNT
  useEffect(() => {
    const handleResize = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      // Calculate max size based on viewport
      const maxWidth = window.innerWidth - 40;
      const maxHeight = window.innerHeight - 100;
      
      // Use the smaller dimension to keep it square
      let size = Math.min(maxWidth, maxHeight, 1000);
      
      // Ensure it's a multiple of TILE_COUNT for clean grid rendering
      // Canvas size varies, but game grid is always TILE_COUNT x TILE_COUNT
      const gridPixelSize = Math.floor(size / CONFIG.TILE_COUNT);
      size = gridPixelSize * CONFIG.TILE_COUNT;
      
      // Minimum size
      size = Math.max(size, CONFIG.TILE_COUNT * 10);
      
      canvas.width = size;
      canvas.height = size;
    };

    handleResize();
    window.addEventListener('resize', handleResize);

    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return { canvasRef };
}

export function getTileCount(canvasSize: number): number {
  // Always return fixed tile count for consistent multiplayer
  return CONFIG.TILE_COUNT;
}
