'use client';

import { useGameCanvas } from '@/hooks/useGameCanvas';
import { Position, RemotePlayer } from '@/types';

interface GameCanvasProps {
  snake: Position[];
  food: Position;
  remotePlayers: Record<string, RemotePlayer>;
  isPlaying: boolean;
}

export function GameCanvas({
  snake,
  food,
  remotePlayers,
  isPlaying,
}: GameCanvasProps) {
  const { canvasRef } = useGameCanvas({
    snake,
    food,
    remotePlayers,
    isPlaying,
  });

  return (
    <canvas
      ref={canvasRef}
      id="gameCanvas"
      width={600}
      height={600}
    />
  );
}
