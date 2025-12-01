import { GameMode } from '@/types';

interface GameOverScreenProps {
  killer: string;
  score: number;
  length: number;
  kills: number;
  rank: number | null;
  gameMode: GameMode;
  onRespawn: () => void;
  onShowLeaderboard: () => void;
}

export function GameOverScreen({
  killer,
  score,
  length,
  kills,
  rank,
  gameMode,
  onRespawn,
  onShowLeaderboard,
}: GameOverScreenProps) {
  // Format rank display
  const getRankDisplay = () => {
    if (gameMode === 'singleplayer') return 'N/A';
    if (rank === null || rank === 0) return '--';
    if (rank === 1) return '🥇 #1';
    if (rank === 2) return '🥈 #2';
    if (rank === 3) return '🥉 #3';
    return `#${rank}`;
  };

  return (
    <div className="screen">
      <h1 className="glitch">SIGNAL LOST</h1>
      <p>
        Terminated by:{' '}
        <span style={{ color: 'var(--color-food)' }}>{killer}</span>
      </p>

      <div className="stats-panel">
        <div className="stat-item">
          <span className="stat-label">SCORE</span>
          <span className="stat-value">{score}</span>
        </div>
        <div className="stat-item">
          <span className="stat-label">LENGTH</span>
          <span className="stat-value">{length}</span>
        </div>
        <div className="stat-item">
          <span className="stat-label">KILLS</span>
          <span className="stat-value">{kills}</span>
        </div>
        <div className="stat-item">
          <span className="stat-label">RANK</span>
          <span className="stat-value" style={rank && rank <= 3 ? { color: 'gold' } : undefined}>
            {getRankDisplay()}
          </span>
        </div>
      </div>

      <button className="btn" onClick={onRespawn}>
        ⟳ RESPAWN
      </button>
      <button
        className="btn btn-secondary"
        onClick={onShowLeaderboard}
        style={{ marginLeft: '10px' }}
      >
        🏆 SCORES
      </button>
    </div>
  );
}
