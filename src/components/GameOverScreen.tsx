interface GameOverScreenProps {
  killer: string;
  score: number;
  length: number;
  kills: number;
  onRespawn: () => void;
  onShowLeaderboard: () => void;
}

export function GameOverScreen({
  killer,
  score,
  length,
  kills,
  onRespawn,
  onShowLeaderboard,
}: GameOverScreenProps) {
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
          <span className="stat-value">--</span>
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
