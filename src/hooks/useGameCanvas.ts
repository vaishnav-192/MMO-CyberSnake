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
    ctx.strokeStyle = CONFIG.COLORS.GRID;
    ctx.lineWidth = 1;
    ctx.beginPath();

    for (let x = 0; x <= width; x += CONFIG.GRID_SIZE) {
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
    }

    for (let y = 0; y <= height; y += CONFIG.GRID_SIZE) {
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
    }

    ctx.stroke();
  }, []);

  const drawFood = useCallback((ctx: CanvasRenderingContext2D, foodPos: Position) => {
    ctx.shadowBlur = 15;
    ctx.shadowColor = CONFIG.COLORS.FOOD;
    ctx.fillStyle = CONFIG.COLORS.FOOD;

    const x = foodPos.x * CONFIG.GRID_SIZE + 2;
    const y = foodPos.y * CONFIG.GRID_SIZE + 2;
    const size = CONFIG.GRID_SIZE - 4;

    // Pulsing effect
    const pulse = Math.sin(Date.now() / 200) * 2;
    ctx.fillRect(x - pulse / 2, y - pulse / 2, size + pulse, size + pulse);

    ctx.shadowBlur = 0;
  }, []);

  const drawSnake = useCallback(
    (
      ctx: CanvasRenderingContext2D,
      snakeBody: Position[],
      color: string,
      labelName?: string
    ) => {
      if (!snakeBody || snakeBody.length === 0) return;

      ctx.fillStyle = color;
      ctx.shadowBlur = 10;
      ctx.shadowColor = color;

      snakeBody.forEach((seg, i) => {
        const size = i === 0 ? CONFIG.GRID_SIZE - 2 : CONFIG.GRID_SIZE - 4;
        const offset = i === 0 ? 1 : 2;
        ctx.fillRect(
          seg.x * CONFIG.GRID_SIZE + offset,
          seg.y * CONFIG.GRID_SIZE + offset,
          size,
          size
        );
      });

      ctx.shadowBlur = 0;

      // Draw name tag
      if (labelName && snakeBody[0]) {
        const head = snakeBody[0];
        ctx.fillStyle = '#fff';
        ctx.font = '12px VT323, monospace';
        ctx.textAlign = 'center';
        ctx.fillText(
          labelName,
          head.x * CONFIG.GRID_SIZE + CONFIG.GRID_SIZE / 2,
          head.y * CONFIG.GRID_SIZE - 5
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
    drawFood(ctx, food);

    // Draw remote players
    Object.values(remotePlayers).forEach((player) => {
      drawSnake(ctx, player.snake, player.color || CONFIG.COLORS.ENEMY, player.name);
    });

    // Draw self
    if (isPlaying) {
      drawSnake(ctx, snake, CONFIG.COLORS.SELF);
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

  // Resize handler
  useEffect(() => {
    const handleResize = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      let size = Math.min(window.innerWidth - 20, window.innerHeight - 150, 800);
      size = Math.floor(size / CONFIG.GRID_SIZE) * CONFIG.GRID_SIZE;
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
  return canvasSize / CONFIG.GRID_SIZE;
}
