import { LeaderboardEntry, PersonalBest, GameMode } from '@/types';

interface StartScreenProps {
  username: string;
  onUsernameChange: (name: string) => void;
  onStart: (mode: GameMode) => void;
  onShowLeaderboard: () => void;
  leaderboard: LeaderboardEntry[];
  personalBest: PersonalBest;
}

function StatRow({ label, value, highlight }: { label: string; value: number; highlight?: boolean }) {
  return (
    <div className="stat-row">
      <span className="stat-label">{label}</span>
      <span className={`stat-value ${highlight ? 'highlight' : ''}`}>{value}</span>
    </div>
  );
}

export function StartScreen({
  username,
  onUsernameChange,
  onStart,
  onShowLeaderboard,
  leaderboard,
  personalBest,
}: StartScreenProps) {
  return (
    <div className="screen start-screen">
      {/* Header */}
      <div className="start-header">
        <h1>🐍 MMO CYBERSNAKE</h1>
        <p className="subtitle">Enter the Neon Arena</p>
      </div>

      {/* Three-column layout */}
      <div className="start-screen-layout">
        {/* LEFT: My Stats / Highscores */}
        <div className="panel stats-panel-left">
          <h2>📊 MY STATS</h2>
          
          <div className="stats-section">
            <h3>🎮 SOLO</h3>
            <StatRow label="HIGH SCORE" value={personalBest.singleplayer.highScore} highlight />
            <StatRow label="BEST LENGTH" value={personalBest.singleplayer.maxLength} />
            <StatRow label="GAMES" value={personalBest.singleplayer.totalGames} />
            <StatRow label="KILLS" value={personalBest.singleplayer.kills} />
          </div>

          <div className="stats-section">
            <h3>🌐 MULTIPLAYER</h3>
            <StatRow label="HIGH SCORE" value={personalBest.multiplayer.highScore} highlight />
            <StatRow label="BEST LENGTH" value={personalBest.multiplayer.maxLength} />
            <StatRow label="GAMES" value={personalBest.multiplayer.totalGames} />
            <StatRow label="KILLS" value={personalBest.multiplayer.kills} />
          </div>
        </div>

        {/* CENTER: Mode Selection */}
        <div className="panel mode-panel">
          <h2>⚡ PLAY</h2>
          
          <div className="name-input-section">
            <label>ENTER YOUR NAME</label>
            <input
              type="text"
              value={username}
              onChange={(e) => onUsernameChange(e.target.value.toUpperCase())}
              maxLength={12}
              placeholder="PLAYER"
              autoComplete="off"
              onKeyDown={(e) => e.key === 'Enter' && onStart('multiplayer')}
            />
          </div>

          <div className="mode-buttons">
            <button className="btn btn-solo" onClick={() => onStart('singleplayer')}>
              🎮 SOLO PLAY
              <span className="btn-desc">Practice offline</span>
            </button>
            <button className="btn btn-multiplayer" onClick={() => onStart('multiplayer')}>
              🌐 JOIN SERVER
              <span className="btn-desc">Play with others</span>
            </button>
          </div>

          <div className="instructions">
            <span>↑</span><span>↓</span><span>←</span><span>→</span> or{' '}
            <span>W</span><span>A</span><span>S</span><span>D</span>
          </div>
        </div>

        {/* RIGHT: Top Players */}
        <div className="panel leaderboard-panel">
          <h2>🏆 TOP PLAYERS</h2>
          
          <table className="highscores-table">
            <thead>
              <tr>
                <th className="rank-col">#</th>
                <th>NAME</th>
                <th className="kills-col">☠</th>
                <th className="score-col">PTS</th>
              </tr>
            </thead>
            <tbody>
              {leaderboard.length === 0 ? (
                <tr>
                  <td colSpan={4} className="empty-msg">
                    No scores yet!
                  </td>
                </tr>
              ) : (
                leaderboard.slice(0, 7).map((entry, index) => (
                  <tr key={entry.id} className={index < 3 ? `rank-${index + 1}` : ''}>
                    <td className="rank-col">{index + 1}</td>
                    <td className="name-col">{entry.name}</td>
                    <td className="kills-col">{entry.kills || 0}</td>
                    <td className="score-col">{entry.score}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>

          <button
            className="btn btn-secondary full-lb-btn"
            onClick={onShowLeaderboard}
          >
            VIEW ALL
          </button>
        </div>
      </div>
    </div>
  );
}
