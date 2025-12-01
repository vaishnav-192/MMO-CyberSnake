import { LeaderboardEntry } from '@/types';

interface LeaderboardProps {
  entries: LeaderboardEntry[];
  onBack: () => void;
}

export function Leaderboard({ entries, onBack }: LeaderboardProps) {
  return (
    <div className="screen">
      <h1>🏆 LEADERBOARD</h1>

      <table className="highscores-table">
        <thead>
          <tr>
            <th className="rank-col">#</th>
            <th>NAME</th>
            <th className="kills-col">KILLS</th>
            <th className="score-col">SCORE</th>
          </tr>
        </thead>
        <tbody>
          {entries.length === 0 ? (
            <tr>
              <td colSpan={4} style={{ textAlign: 'center', color: '#666' }}>
                No scores yet!
              </td>
            </tr>
          ) : (
            entries.map((entry, index) => (
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

      <button className="btn" onClick={onBack} style={{ marginTop: '20px' }}>
        ← BACK
      </button>
    </div>
  );
}
