'use client';

import { useEffect, useState } from 'react';
import { useGame } from '@/hooks/useGame';
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
    setTileCount,
    liveLeaderboard,
  } = useGame();

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

  return (
    <div id="game-container">
      <GameCanvas
        snake={snake}
        food={food}
        remotePlayers={remotePlayers}
        isPlaying={gameState.isPlaying}
        onResize={setTileCount}
      />
      <div className="scanlines" />

      {/* Top UI Bar */}
      <div className="ui-layer">
        <div>
          <span>SCORE: {gameState.score}</span>
          <span style={{ marginLeft: '20px' }}>LENGTH: {snake.length}</span>
        </div>
        <div>ONLINE: {playerCount}</div>
      </div>

      {/* Live Leaderboard */}
      {currentScreen === 'playing' && (
        <LiveLeaderboard entries={liveLeaderboard()} />
      )}

      {/* Kill Feed */}
      {currentScreen === 'playing' && <KillFeed entries={killFeed} />}

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
          onStart={() => startGame(playerName)}
          onShowLeaderboard={() => setCurrentScreen('leaderboard')}
          leaderboard={leaderboard}
        />
      )}

      {/* Game Over Screen */}
      {currentScreen === 'gameOver' && (
        <GameOverScreen
          killer={killer}
          score={gameState.score}
          length={gameState.maxLength}
          kills={gameState.kills}
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
