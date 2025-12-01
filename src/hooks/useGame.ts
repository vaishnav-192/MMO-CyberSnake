'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { User } from 'firebase/auth';
import { CONFIG } from '@/config/game';
import {
  signInAnon,
  onAuthChange,
  syncPlayerState,
  removePlayer,
  subscribeToPlayers,
  subscribeToLeaderboard,
  subscribeToKillFeed,
  submitHighScore,
  setupDisconnectCleanup,
} from '@/lib/firebase-service';
import {
  Position,
  RemotePlayer,
  LeaderboardEntry,
  KillFeedEntry,
  GameState,
  ScreenType,
  Direction,
  GameMode,
  PersonalBest,
  PlayerStats,
  DEFAULT_STATS,
} from '@/types';

// LocalStorage keys
const STORAGE_KEYS = {
  USERNAME: 'cybersnake-username',
  PERSONAL_BEST: 'cybersnake-personal-best',
};

// Load personal best from localStorage
function loadPersonalBest(): PersonalBest {
  if (typeof window === 'undefined') {
    return { singleplayer: { ...DEFAULT_STATS }, multiplayer: { ...DEFAULT_STATS } };
  }
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.PERSONAL_BEST);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (e) {
    console.error('Failed to load personal best:', e);
  }
  return { singleplayer: { ...DEFAULT_STATS }, multiplayer: { ...DEFAULT_STATS } };
}

// Save personal best to localStorage
function savePersonalBest(best: PersonalBest): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEYS.PERSONAL_BEST, JSON.stringify(best));
  } catch (e) {
    console.error('Failed to save personal best:', e);
  }
}

export function useGame() {
  // Auth state
  const [user, setUser] = useState<User | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  // UI state
  const [currentScreen, setCurrentScreen] = useState<ScreenType>('loading');
  const [playerName, setPlayerName] = useState('');
  const [statusMessage, setStatusMessage] = useState('CONNECTING TO NET...');

  // Game mode state
  const [gameMode, setGameMode] = useState<GameMode>('multiplayer');
  const [personalBest, setPersonalBest] = useState<PersonalBest>(() => loadPersonalBest());

  // Game state
  const [snake, setSnake] = useState<Position[]>([]);
  const [food, setFood] = useState<Position>({ x: 10, y: 10 });
  const [direction, setDirection] = useState<Direction>({ dx: 0, dy: -1 });
  const [gameState, setGameState] = useState<GameState>({
    isPlaying: false,
    isDead: false,
    score: 0,
    kills: 0,
    maxLength: 3,
  });
  const [killer, setKiller] = useState('WALL');

  // Network state
  const [remotePlayers, setRemotePlayers] = useState<Record<string, RemotePlayer>>({});
  const [playerCount, setPlayerCount] = useState(1);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [killFeed, setKillFeed] = useState<KillFeedEntry[]>([]);

  // Refs for game loop
  const directionRef = useRef(direction);
  const nextDirectionRef = useRef(direction);
  const snakeRef = useRef(snake);
  const gameStateRef = useRef(gameState);
  const remotePlayersRef = useRef(remotePlayers);
  const gameModeRef = useRef(gameMode);
  const lastSyncRef = useRef(0);
  const tileCountRef = useRef(30);

  // Update refs
  useEffect(() => {
    directionRef.current = direction;
    snakeRef.current = snake;
    gameStateRef.current = gameState;
    remotePlayersRef.current = remotePlayers;
    gameModeRef.current = gameMode;
  }, [direction, snake, gameState, remotePlayers, gameMode]);

  // Initialize Firebase auth
  useEffect(() => {
    const unsubscribe = onAuthChange(async (u) => {
      if (u) {
        setUser(u);
        setIsConnected(true);
        setStatusMessage(`CONNECTED: ${u.uid.substring(0, 6)}`);
        setCurrentScreen('start');
      }
    });

    // Sign in anonymously
    signInAnon().catch((error) => {
      console.error('Auth error:', error);
      setStatusMessage('AUTH ERROR - OFFLINE MODE');
      setCurrentScreen('start');
    });

    return () => unsubscribe();
  }, []);

  // Subscribe to leaderboard
  useEffect(() => {
    const unsubscribe = subscribeToLeaderboard(setLeaderboard);
    return () => unsubscribe();
  }, []);

  // Spawn food
  const spawnFood = useCallback(() => {
    const tileCount = tileCountRef.current;
    let newFood: Position;
    let attempts = 0;

    do {
      newFood = {
        x: Math.floor(Math.random() * tileCount),
        y: Math.floor(Math.random() * tileCount),
      };
      attempts++;
    } while (attempts < 100);

    setFood(newFood);
  }, []);

  // Initialize snake
  const initSnake = useCallback(() => {
    const tileCount = tileCountRef.current;
    const startX = Math.floor(Math.random() * (tileCount - 10)) + 5;
    const startY = Math.floor(Math.random() * (tileCount - 10)) + 5;

    const newSnake = [
      { x: startX, y: startY },
      { x: startX, y: startY + 1 },
      { x: startX, y: startY + 2 },
    ];

    setSnake(newSnake);
    snakeRef.current = newSnake;
    setDirection({ dx: 0, dy: -1 });
    directionRef.current = { dx: 0, dy: -1 };
    nextDirectionRef.current = { dx: 0, dy: -1 };
    setGameState({
      isPlaying: true,
      isDead: false,
      score: 0,
      kills: 0,
      maxLength: 3,
    });
    spawnFood();
  }, [spawnFood]);

  // Start game
  const startGame = useCallback(
    (name: string, mode: GameMode = 'multiplayer') => {
      const finalName = name.trim() || `PLAYER ${Math.floor(Math.random() * 1000)}`;
      setPlayerName(finalName);
      setGameMode(mode);
      localStorage.setItem('cybersnake-username', finalName);
      initSnake();
      setCurrentScreen('playing');

      // Only subscribe to multiplayer features if in multiplayer mode
      if (mode === 'multiplayer' && user) {
        // Setup disconnect cleanup
        setupDisconnectCleanup(user.uid);

        const unsubPlayers = subscribeToPlayers(user.uid, (players, count) => {
          setRemotePlayers(players);
          remotePlayersRef.current = players;
          setPlayerCount(count);
        });

        const unsubKillFeed = subscribeToKillFeed(setKillFeed);

        // Store unsubscribes for cleanup
        return () => {
          unsubPlayers();
          unsubKillFeed();
        };
      } else {
        // Singleplayer mode - clear remote players
        setRemotePlayers({});
        remotePlayersRef.current = {};
        setPlayerCount(1);
        setKillFeed([]);
      }
    },
    [user, initSnake]
  );

  // Handle death
  const handleDeath = useCallback(
    async (killerName: string) => {
      setKiller(killerName);
      setGameState((prev) => ({ ...prev, isPlaying: false, isDead: true }));
      setCurrentScreen('gameOver');

      const currentStats = gameStateRef.current;
      
      // Update personal best stats
      setPersonalBest((prev) => {
        const modeStats = gameMode === 'singleplayer' ? prev.singleplayer : prev.multiplayer;
        const newModeStats: PlayerStats = {
          totalGames: modeStats.totalGames + 1,
          highScore: Math.max(modeStats.highScore, currentStats.score),
          kills: modeStats.kills + currentStats.kills,
          maxLength: Math.max(modeStats.maxLength, currentStats.maxLength),
        };
        
        const newBest: PersonalBest = gameMode === 'singleplayer' 
          ? { ...prev, singleplayer: newModeStats }
          : { ...prev, multiplayer: newModeStats };
        
        savePersonalBest(newBest);
        return newBest;
      });

      // Only submit to leaderboard and remove player in multiplayer mode
      if (gameMode === 'multiplayer' && user) {
        await submitHighScore(user.uid, {
          name: playerName,
          score: currentStats.score,
          kills: currentStats.kills,
          maxLength: currentStats.maxLength,
        });

        await removePlayer(user.uid);
      }
    },
    [user, playerName, gameMode]
  );

  // Game tick
  useEffect(() => {
    if (!gameState.isPlaying) return;

    const gameLoop = setInterval(() => {
      const currentDirection = nextDirectionRef.current;
      directionRef.current = currentDirection;
      setDirection(currentDirection);

      const currentSnake = snakeRef.current;
      const tileCount = tileCountRef.current;
      const currentRemotePlayers = remotePlayersRef.current;

      if (currentSnake.length === 0) return;

      let head = {
        x: currentSnake[0].x + currentDirection.dx,
        y: currentSnake[0].y + currentDirection.dy,
      };

      // Wall wrap-around (instead of death)
      if (head.x < 0) {
        head.x = tileCount - 1;
      } else if (head.x >= tileCount) {
        head.x = 0;
      }
      if (head.y < 0) {
        head.y = tileCount - 1;
      } else if (head.y >= tileCount) {
        head.y = 0;
      }

      // Self collision
      for (const seg of currentSnake) {
        if (head.x === seg.x && head.y === seg.y) {
          handleDeath('SELF');
          return;
        }
      }

      // Enemy collision
      for (const uid in currentRemotePlayers) {
        const enemy = currentRemotePlayers[uid];
        if (!enemy.snake) continue;

        for (const seg of enemy.snake) {
          if (head.x === seg.x && head.y === seg.y) {
            handleDeath(enemy.name || 'ENEMY');
            return;
          }
        }
      }

      // Move snake
      const newSnake = [head, ...currentSnake];

      // Check food
      setFood((currentFood) => {
        if (head.x === currentFood.x && head.y === currentFood.y) {
          setGameState((prev) => ({
            ...prev,
            score: prev.score + CONFIG.FOOD_SCORE,
            maxLength: Math.max(prev.maxLength, newSnake.length),
          }));
          spawnFood();
          setSnake(newSnake);
          snakeRef.current = newSnake;
        } else {
          const trimmedSnake = newSnake.slice(0, -1);
          setSnake(trimmedSnake);
          snakeRef.current = trimmedSnake;
        }
        return currentFood;
      });
    }, CONFIG.GAME_SPEED);

    return () => clearInterval(gameLoop);
  }, [gameState.isPlaying, handleDeath, spawnFood]);

  // Sync to Firebase
  useEffect(() => {
    // Skip sync in singleplayer mode
    if (!gameState.isPlaying || !user || gameMode === 'singleplayer') return;

    const syncLoop = setInterval(async () => {
      const now = Date.now();
      if (now - lastSyncRef.current < CONFIG.SYNC_RATE) return;

      await syncPlayerState(user.uid, {
        name: playerName,
        snake: snakeRef.current,
        score: gameStateRef.current.score,
        color: CONFIG.COLORS.SELF,
      });

      lastSyncRef.current = now;
    }, CONFIG.SYNC_RATE);

    return () => clearInterval(syncLoop);
  }, [gameState.isPlaying, user, playerName, gameMode]);

  // Cleanup ghosts
  useEffect(() => {
    const cleanup = setInterval(() => {
      const now = Date.now();
      setRemotePlayers((prev) => {
        const filtered: Record<string, RemotePlayer> = {};
        for (const key in prev) {
          if (now - prev[key].lastSeen <= CONFIG.CLEANUP_THRESHOLD) {
            filtered[key] = prev[key];
          }
        }
        return filtered;
      });
    }, 2000);

    return () => clearInterval(cleanup);
  }, []);

  // Input handler
  const handleInput = useCallback(
    (key: string) => {
      if (!gameState.isPlaying) return;

      const current = directionRef.current;

      if ((key === 'ArrowUp' || key === 'w' || key === 'W') && current.dy !== 1) {
        nextDirectionRef.current = { dx: 0, dy: -1 };
      }
      if ((key === 'ArrowDown' || key === 's' || key === 'S') && current.dy !== -1) {
        nextDirectionRef.current = { dx: 0, dy: 1 };
      }
      if ((key === 'ArrowLeft' || key === 'a' || key === 'A') && current.dx !== 1) {
        nextDirectionRef.current = { dx: -1, dy: 0 };
      }
      if ((key === 'ArrowRight' || key === 'd' || key === 'D') && current.dx !== -1) {
        nextDirectionRef.current = { dx: 1, dy: 0 };
      }
    },
    [gameState.isPlaying]
  );

  // Set tile count when canvas resizes
  const setTileCount = useCallback((count: number) => {
    tileCountRef.current = count;
  }, []);

  // Reset game
  const resetGame = useCallback(() => {
    initSnake();
    setCurrentScreen('playing');
  }, [initSnake]);

  // Get live leaderboard (current players)
  const liveLeaderboard = useCallback(() => {
    const list: { name: string; score: number; isSelf: boolean }[] = [];

    if (gameState.isPlaying) {
      list.push({ name: playerName, score: gameState.score, isSelf: true });
    }

    Object.values(remotePlayers).forEach((player) => {
      list.push({ name: player.name, score: player.score || 0, isSelf: false });
    });

    return list
      .sort((a, b) => b.score - a.score)
      .slice(0, CONFIG.MAX_LIVE_LEADERBOARD);
  }, [gameState, playerName, remotePlayers]);

  return {
    // Auth
    user,
    isConnected,

    // UI
    currentScreen,
    setCurrentScreen,
    statusMessage,

    // Player
    playerName,
    setPlayerName,

    // Game mode
    gameMode,
    personalBest,

    // Game state
    snake,
    food,
    gameState,
    killer,

    // Network
    remotePlayers,
    playerCount,
    leaderboard,
    killFeed,

    // Actions
    startGame,
    resetGame,
    handleInput,
    setTileCount,
    liveLeaderboard,
  };
}
