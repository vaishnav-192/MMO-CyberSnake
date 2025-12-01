'use client';

import { useEffect, useMemo } from 'react';
import { useGame } from '@/hooks/useGame';
import { GameMode } from '@/types';
import {
  GameCanvas,
  StartScreen,
  GameOverScreen,
  Leaderboard,
  LiveLeaderboard,
  KillFeed,
  MobileControls,
} from '@/components';

export default function Home() {
  const {
    currentScreen,
    setCurrentScreen,
    statusMessage,
    playerName,
    setPlayerName,
    gameMode,
    personalBest,
    snake,
    food,
    gameState,
    killer,
    remotePlayers,
    playerCount,
    leaderboard,
    killFeed,
    startGame,
    resetGame,
    handleInput,
    liveLeaderboard,
  } = useGame();

  // Calculate player's rank based on their score in the leaderboard
  const playerRank = useMemo(() => {
    if (gameMode === 'singleplayer' || !playerName) return null;
    
    // Normalize player name for comparison
    const normalizedName = playerName.toLowerCase().replace(/\s+/g, '_');
    
    // Find player's position in leaderboard
    const index = leaderboard.findIndex(
      (entry) => entry.name.toLowerCase().replace(/\s+/g, '_') === normalizedName
    );
    
    return index >= 0 ? index + 1 : null;
  }, [leaderboard, playerName, gameMode]);

  // Load saved username on mount
  useEffect(() => {
    const saved = localStorage.getItem('cybersnake-username');
    if (saved) setPlayerName(saved);
  }, [setPlayerName]);

  // Keyboard input
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      handleInput(e.key);
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleInput]);

  // Touch swipe handling
  useEffect(() => {
    let touchStartX = 0;
    let touchStartY = 0;

    const handleTouchStart = (e: TouchEvent) => {
      touchStartX = e.touches[0].clientX;
      touchStartY = e.touches[0].clientY;
    };

    const handleTouchEnd = (e: TouchEvent) => {
      const dX = e.changedTouches[0].clientX - touchStartX;
      const dY = e.changedTouches[0].clientY - touchStartY;
      const threshold = 30;

      if (Math.abs(dX) > Math.abs(dY)) {
        if (Math.abs(dX) > threshold) {
          handleInput(dX > 0 ? 'ArrowRight' : 'ArrowLeft');
        }
      } else {
        if (Math.abs(dY) > threshold) {
          handleInput(dY > 0 ? 'ArrowDown' : 'ArrowUp');
        }
      }
    };

    window.addEventListener('touchstart', handleTouchStart);
    window.addEventListener('touchend', handleTouchEnd);

    return () => {
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchend', handleTouchEnd);
    };
  }, [handleInput]);

  const handleStartGame = (mode: GameMode) => {
    startGame(playerName, mode);
  };

  return (
    <div id="game-container">
      <GameCanvas
        snake={snake}
        food={food}
        remotePlayers={remotePlayers}
        isPlaying={gameState.isPlaying}
      />
      <div className="scanlines" />

      {/* Top UI Bar */}
      <div className="ui-layer">
        <div>
          <span>SCORE: {gameState.score}</span>
          <span style={{ marginLeft: '20px' }}>LENGTH: {snake.length}</span>
          {gameMode === 'singleplayer' && (
            <span style={{ marginLeft: '20px', color: 'var(--color-accent)' }}>SOLO</span>
          )}
        </div>
        <div>
          {gameMode === 'multiplayer' ? `ONLINE: ${playerCount}` : 'OFFLINE'}
        </div>
      </div>

      {/* Live Leaderboard - only in multiplayer */}
      {currentScreen === 'playing' && gameMode === 'multiplayer' && (
        <LiveLeaderboard entries={liveLeaderboard()} />
      )}

      {/* Kill Feed - only in multiplayer */}
      {currentScreen === 'playing' && gameMode === 'multiplayer' && (
        <KillFeed entries={killFeed} />
      )}

      {/* Status Bar */}
      <div className="status-bar">{statusMessage}</div>

      {/* Loading Screen */}
      {currentScreen === 'loading' && (
        <div className="screen">
          <h1 className="pulse">
            INITIALIZING<span className="loading-dots"></span>
          </h1>
          <p style={{ color: '#888' }}>Connecting to game server...</p>
        </div>
      )}

      {/* Start Screen */}
      {currentScreen === 'start' && (
        <StartScreen
          username={playerName}
          onUsernameChange={setPlayerName}
          onStart={handleStartGame}
          onShowLeaderboard={() => setCurrentScreen('leaderboard')}
          leaderboard={leaderboard}
          personalBest={personalBest}
        />
      )}

      {/* Game Over Screen */}
      {currentScreen === 'gameOver' && (
        <GameOverScreen
          killer={killer}
          score={gameState.score}
          length={gameState.maxLength}
          kills={gameState.kills}
          rank={playerRank}
          gameMode={gameMode}
          onRespawn={resetGame}
          onShowLeaderboard={() => setCurrentScreen('leaderboard')}
        />
      )}

      {/* Leaderboard Screen */}
      {currentScreen === 'leaderboard' && (
        <Leaderboard
          entries={leaderboard}
          onBack={() => setCurrentScreen(gameState.isDead ? 'gameOver' : 'start')}
        />
      )}

      {/* Mobile Controls */}
      {currentScreen === 'playing' && (
        <MobileControls
          onUp={() => handleInput('ArrowUp')}
          onDown={() => handleInput('ArrowDown')}
          onLeft={() => handleInput('ArrowLeft')}
          onRight={() => handleInput('ArrowRight')}
        />
      )}
    </div>
  );
}
