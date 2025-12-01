interface LiveLeaderboardProps {
  entries: { name: string; score: number; isSelf: boolean }[];
}

export function LiveLeaderboard({ entries }: LiveLeaderboardProps) {
  return (
    <div id="leaderboard">
      <div className="lb-header">TOP PLAYERS</div>
      {entries.map((player, index) => (
        <div key={index} className={`lb-entry ${player.isSelf ? 'lb-self' : ''}`}>
          <span className="lb-rank">#{index + 1}</span>
          {player.name}: {player.score}
        </div>
      ))}
    </div>
  );
}
