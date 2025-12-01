import { LeaderboardEntry } from '@/types';

interface StartScreenProps {
  username: string;
  onUsernameChange: (name: string) => void;
  onStart: () => void;
  onShowLeaderboard: () => void;
  leaderboard: LeaderboardEntry[];
}

export function StartScreen({
  username,
  onUsernameChange,
  onStart,
  onShowLeaderboard,
  leaderboard,
}: StartScreenProps) {
  return (
    <div className="screen">
      <h1>🐍 MMO SNAKE</h1>
      <p style={{ color: 'var(--color-secondary)', marginBottom: '20px' }}>
        Enter the Neon Arena
      </p>

      <input
        type="text"
        value={username}
        onChange={(e) => onUsernameChange(e.target.value.toUpperCase())}
        maxLength={12}
        placeholder="YOUR NAME"
        autoComplete="off"
        onKeyDown={(e) => e.key === 'Enter' && onStart()}
      />
      <br />
      <button className="btn" onClick={onStart}>
        ▶ JOIN SERVER
      </button>
      <button
        className="btn btn-secondary"
        onClick={onShowLeaderboard}
        style={{ marginLeft: '10px' }}
      >
        🏆 LEADERBOARD
      </button>

      <div className="instructions">
        <span>↑</span><span>↓</span><span>←</span><span>→</span> or{' '}
        <span>W</span><span>A</span><span>S</span><span>D</span> to Move
      </div>

      <h2 style={{ marginTop: '25px' }}>🏆 TOP PLAYERS</h2>
      <table className="highscores-table">
        <thead>
          <tr>
            <th className="rank-col">#</th>
            <th>NAME</th>
            <th className="kills-col">☠</th>
            <th className="score-col">SCORE</th>
          </tr>
        </thead>
        <tbody>
          {leaderboard.length === 0 ? (
            <tr>
              <td colSpan={4} style={{ textAlign: 'center', color: '#666' }}>
                No scores yet - be the first!
              </td>
            </tr>
          ) : (
            leaderboard.slice(0, 5).map((entry, index) => (
              <tr key={entry.id}>
                <td className="rank-col">{index + 1}</td>
                <td>{entry.name}</td>
                <td className="kills-col">{entry.kills || 0}</td>
                <td className="score-col">{entry.score}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
