'use client';

import { signInAnonymously, onAuthStateChanged, User } from 'firebase/auth';
import {
  ref,
  set,
  remove,
  onValue,
  push,
  query,
  orderByChild,
  limitToLast,
  get,
  onDisconnect,
  serverTimestamp,
  Unsubscribe,
  DataSnapshot,
} from 'firebase/database';
import { auth, db } from './firebase';
import { CONFIG } from '@/config/game';
import { PlayerData, RemotePlayer, LeaderboardEntry, KillFeedEntry } from '@/types';

// Auth
export async function signInAnon(): Promise<User> {
  if (!auth) throw new Error('Auth not initialized');
  const result = await signInAnonymously(auth);
  return result.user;
}

export function onAuthChange(callback: (user: User | null) => void): Unsubscribe {
  if (!auth) return () => {};
  return onAuthStateChanged(auth, callback);
}

export function getCurrentUser(): User | null {
  return auth?.currentUser ?? null;
}

// Player operations
export async function syncPlayerState(userId: string, playerData: PlayerData): Promise<void> {
  if (!db) return;
  const playerRef = ref(db, `${CONFIG.PATHS.PLAYERS}/${userId}`);
  await set(playerRef, {
    ...playerData,
    updatedAt: Date.now(),
  });
}

export async function removePlayer(userId: string): Promise<void> {
  if (!db) return;
  const playerRef = ref(db, `${CONFIG.PATHS.PLAYERS}/${userId}`);
  await remove(playerRef);
}

export function setupDisconnectCleanup(userId: string): void {
  if (!db) return;
  const playerRef = ref(db, `${CONFIG.PATHS.PLAYERS}/${userId}`);
  onDisconnect(playerRef).remove();
}

export function subscribeToPlayers(
  currentUserId: string,
  callback: (players: Record<string, RemotePlayer>, count: number) => void
): Unsubscribe {
  if (!db) return () => {};
  const playersRef = ref(db, CONFIG.PATHS.PLAYERS);

  return onValue(playersRef, (snapshot: DataSnapshot) => {
    const players: Record<string, RemotePlayer> = {};
    const now = Date.now();
    let count = 0;

    snapshot.forEach((child) => {
      count++;
      if (child.key !== currentUserId) {
        const data = child.val() as PlayerData;
        if (data && data.name) {
          players[child.key!] = {
            ...data,
            lastSeen: now,
          };
        }
      }
    });

    callback(players, count);
  });
}

// Leaderboard operations
export async function submitHighScore(
  userId: string,
  scoreData: {
    name: string;
    score: number;
    kills: number;
    maxLength: number;
  }
): Promise<void> {
  if (!db) {
    console.error('Database not initialized for score submission');
    return;
  }
  
  // Skip if score is 0
  if (scoreData.score <= 0) {
    console.log('Score is 0, not submitting to leaderboard');
    return;
  }
  
  // Use normalized player name as the key (lowercase, no spaces)
  // This ensures same player name always updates the same entry
  const normalizedName = scoreData.name.toLowerCase().replace(/\s+/g, '_');
  const leaderboardRef = ref(db, `${CONFIG.PATHS.LEADERBOARD}/${normalizedName}`);

  try {
    const snapshot = await get(leaderboardRef);
    const existingData = snapshot.exists() ? snapshot.val() : null;

    // Only update if new score is higher than existing
    if (!existingData || scoreData.score > existingData.score) {
      console.log('Submitting high score:', scoreData);
      await set(leaderboardRef, {
        name: scoreData.name, // Keep original display name
        score: scoreData.score,
        kills: scoreData.kills,
        maxLength: scoreData.maxLength,
        updatedAt: Date.now(),
        date: new Date().toISOString().split('T')[0],
      });
      console.log('High score submitted successfully');
    } else {
      console.log('Existing score is higher, not updating');
    }
  } catch (error) {
    console.error('Submit score error:', error);
  }
}

export function subscribeToLeaderboard(
  callback: (leaderboard: LeaderboardEntry[]) => void
): Unsubscribe {
  if (!db) {
    console.warn('Database not initialized for leaderboard');
    callback([]); // Return empty array so UI shows "No scores yet"
    return () => {};
  }
  const leaderboardRef = ref(db, CONFIG.PATHS.LEADERBOARD);
  const q = query(leaderboardRef, orderByChild('score'), limitToLast(CONFIG.MAX_LEADERBOARD_ENTRIES));

  return onValue(q, (snapshot: DataSnapshot) => {
    const leaderboard: LeaderboardEntry[] = [];
    snapshot.forEach((child) => {
      const data = child.val();
      if (data && data.name && typeof data.score === 'number') {
        leaderboard.push({
          id: child.key!,
          name: data.name,
          score: data.score,
          kills: data.kills || 0,
          maxLength: data.maxLength || 0,
          date: data.date || '',
        });
      }
    });
    // Sort descending (Firebase orders ascending)
    leaderboard.sort((a, b) => b.score - a.score);
    console.log('Leaderboard updated:', leaderboard.length, 'entries');
    callback(leaderboard);
  }, (error) => {
    console.error('Leaderboard subscription error:', error);
    callback([]);
  });
}

// Kill feed operations
export async function reportKill(killerName: string, victimName: string): Promise<void> {
  if (!db) return;
  const killFeedRef = ref(db, CONFIG.PATHS.KILL_FEED);
  const newKillRef = push(killFeedRef);
  
  await set(newKillRef, {
    killer: killerName,
    victim: victimName,
    timestamp: Date.now(),
  });
}

export function subscribeToKillFeed(callback: (kills: KillFeedEntry[]) => void): Unsubscribe {
  if (!db) return () => {};
  const killFeedRef = ref(db, CONFIG.PATHS.KILL_FEED);
  const q = query(killFeedRef, orderByChild('timestamp'), limitToLast(5));

  return onValue(q, (snapshot: DataSnapshot) => {
    const kills: KillFeedEntry[] = [];
    snapshot.forEach((child) => {
      kills.push(child.val() as KillFeedEntry);
    });
    // Reverse to show newest first
    kills.reverse();
    callback(kills);
  });
}
