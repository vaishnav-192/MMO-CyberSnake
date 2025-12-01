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
} from '@/types';

export function useGame() {
  // Auth state
  const [user, setUser] = useState<User | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  // UI state
  const [currentScreen, setCurrentScreen] = useState<ScreenType>('loading');
  const [playerName, setPlayerName] = useState('');
  const [statusMessage, setStatusMessage] = useState('CONNECTING TO NET...');

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
  const lastSyncRef = useRef(0);
  const tileCountRef = useRef(30);

  // Update refs
  useEffect(() => {
    directionRef.current = direction;
    snakeRef.current = snake;
    gameStateRef.current = gameState;
    remotePlayersRef.current = remotePlayers;
  }, [direction, snake, gameState, remotePlayers]);

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
    (name: string) => {
      const finalName = name.trim() || `PLAYER ${Math.floor(Math.random() * 1000)}`;
      setPlayerName(finalName);
      localStorage.setItem('cybersnake-username', finalName);
      initSnake();
      setCurrentScreen('playing');

      // Subscribe to players
      if (user) {
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

      if (user) {
        await submitHighScore(user.uid, {
          name: playerName,
          score: gameStateRef.current.score,
          kills: gameStateRef.current.kills,
          maxLength: gameStateRef.current.maxLength,
        });

        await removePlayer(user.uid);
      }
    },
    [user, playerName]
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

      const head = {
        x: currentSnake[0].x + currentDirection.dx,
        y: currentSnake[0].y + currentDirection.dy,
      };

      // Wall collision
      if (head.x < 0 || head.x >= tileCount || head.y < 0 || head.y >= tileCount) {
        handleDeath('WALL');
        return;
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
    if (!gameState.isPlaying || !user) return;

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
  }, [gameState.isPlaying, user, playerName]);

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
