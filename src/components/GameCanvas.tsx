'use client';

import { useEffect } from 'react';
import { useGameCanvas, getTileCount } from '@/hooks/useGameCanvas';
import { Position, RemotePlayer } from '@/types';
import { CONFIG } from '@/config/game';

interface GameCanvasProps {
  snake: Position[];
  food: Position;
  remotePlayers: Record<string, RemotePlayer>;
  isPlaying: boolean;
  onResize?: (tileCount: number) => void;
}

export function GameCanvas({
  snake,
  food,
  remotePlayers,
  isPlaying,
  onResize,
}: GameCanvasProps) {
  const { canvasRef } = useGameCanvas({
    snake,
    food,
    remotePlayers,
    isPlaying,
  });

  useEffect(() => {
    const handleResize = () => {
      if (canvasRef.current && onResize) {
        onResize(getTileCount(canvasRef.current.width));
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [canvasRef, onResize]);

  return (
    <canvas
      ref={canvasRef}
      id="gameCanvas"
      width={600}
      height={600}
    />
  );
}
