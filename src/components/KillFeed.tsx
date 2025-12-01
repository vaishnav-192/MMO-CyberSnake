import { KillFeedEntry } from '@/types';

interface KillFeedProps {
  entries: KillFeedEntry[];
}

export function KillFeed({ entries }: KillFeedProps) {
  return (
    <div id="kill-feed">
      {entries.map((kill, index) => (
        <div key={index} className="kill-entry">
          <span className="killer">{kill.killer}</span> ☠{' '}
          <span className="victim">{kill.victim}</span>
        </div>
      ))}
    </div>
  );
}
