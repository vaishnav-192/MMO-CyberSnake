// Game Logic Module
import { CONFIG } from './config.js';
import * as FirebaseService from './firebase-service.js';

// Game State
let canvas, ctx;
let TILE_COUNT = 30;

// Player State
let mySnake = [];
let myDx = 0;
let myDy = -1;
let nextDx = 0;
let nextDy = -1;
let myScore = 0;
let myKills = 0;
let myMaxLength = 3;
let myName = "Unknown";
let isPlaying = false;
let isDead = false;
let lastSyncTime = 0;
let food = { x: 10, y: 10 };

// Network State
let remotePlayers = {};
let killFeed = [];
let globalLeaderboard = [];

// Callbacks
let onScoreUpdate = null;
let onPlayerCountUpdate = null;
let onGameOver = null;
let onLeaderboardUpdate = null;
let onKillFeedUpdate = null;

export function initGame(canvasElement) {
    canvas = canvasElement;
    ctx = canvas.getContext('2d');
    resizeGame();
    window.addEventListener('resize', resizeGame);
    
    // Start render loop
    requestAnimationFrame(renderLoop);
    
    // Start game logic loop
    setInterval(gameTick, CONFIG.GAME_SPEED);
    
    // Ghost cleanup
    setInterval(cleanupGhosts, 2000);
}

export function setCallbacks(callbacks) {
    onScoreUpdate = callbacks.onScoreUpdate;
    onPlayerCountUpdate = callbacks.onPlayerCountUpdate;
    onGameOver = callbacks.onGameOver;
    onLeaderboardUpdate = callbacks.onLeaderboardUpdate;
    onKillFeedUpdate = callbacks.onKillFeedUpdate;
}

export function startGame(playerName) {
    myName = playerName || "PLAYER " + Math.floor(Math.random() * 1000);
    initSnake();
    isPlaying = true;
    isDead = false;
    myKills = 0;
    
    // Subscribe to players
    FirebaseService.subscribeToPlayers((players, count) => {
        remotePlayers = players;
        if (onPlayerCountUpdate) onPlayerCountUpdate(count);
        updateLiveLeaderboard();
    });
    
    // Subscribe to kill feed
    FirebaseService.subscribeToKillFeed((kills) => {
        killFeed = kills;
        if (onKillFeedUpdate) onKillFeedUpdate(kills);
    });
}

export function resetGame() {
    initSnake();
    isPlaying = true;
    isDead = false;
    myKills = 0;
}

function initSnake() {
    const startX = Math.floor(Math.random() * (TILE_COUNT - 10)) + 5;
    const startY = Math.floor(Math.random() * (TILE_COUNT - 10)) + 5;
    
    mySnake = [
        { x: startX, y: startY },
        { x: startX, y: startY + 1 },
        { x: startX, y: startY + 2 }
    ];
    myScore = 0;
    myMaxLength = 3;
    myDx = 0;
    myDy = -1;
    nextDx = 0;
    nextDy = -1;
    
    if (onScoreUpdate) onScoreUpdate(myScore, mySnake.length);
    spawnFood();
}

function spawnFood() {
    let newFood;
    let attempts = 0;
    
    do {
        newFood = {
            x: Math.floor(Math.random() * TILE_COUNT),
            y: Math.floor(Math.random() * TILE_COUNT)
        };
        attempts++;
    } while (isPositionOccupied(newFood) && attempts < 100);
    
    food = newFood;
}

function isPositionOccupied(pos) {
    // Check own snake
    for (const seg of mySnake) {
        if (seg.x === pos.x && seg.y === pos.y) return true;
    }
    
    // Check remote snakes
    for (const uid in remotePlayers) {
        const snake = remotePlayers[uid].snake;
        if (!snake) continue;
        for (const seg of snake) {
            if (seg.x === pos.x && seg.y === pos.y) return true;
        }
    }
    
    return false;
}

function gameTick() {
    if (!isPlaying || isDead) return;
    
    myDx = nextDx;
    myDy = nextDy;
    
    const head = { x: mySnake[0].x + myDx, y: mySnake[0].y + myDy };
    
    // Wall collision
    if (head.x < 0 || head.x >= TILE_COUNT || head.y < 0 || head.y >= TILE_COUNT) {
        handleDeath("WALL");
        return;
    }
    
    // Self collision
    for (let i = 0; i < mySnake.length; i++) {
        if (head.x === mySnake[i].x && head.y === mySnake[i].y) {
            handleDeath("SELF");
            return;
        }
    }
    
    // Enemy collision
    for (const uid in remotePlayers) {
        const enemy = remotePlayers[uid];
        if (!enemy.snake) continue;
        
        for (let i = 0; i < enemy.snake.length; i++) {
            const seg = enemy.snake[i];
            if (head.x === seg.x && head.y === seg.y) {
                // Check if we hit their head (mutual kill) or body
                if (i === 0) {
                    // Head-on collision - both die (handled by other player too)
                    handleDeath(enemy.name || "ENEMY");
                } else {
                    // We hit their body - we die
                    handleDeath(enemy.name || "ENEMY");
                }
                return;
            }
        }
    }
    
    // Move snake
    mySnake.unshift(head);
    
    // Check for eating food
    if (head.x === food.x && head.y === food.y) {
        myScore += CONFIG.FOOD_SCORE;
        myMaxLength = Math.max(myMaxLength, mySnake.length);
        if (onScoreUpdate) onScoreUpdate(myScore, mySnake.length);
        spawnFood();
    } else {
        mySnake.pop();
    }
    
    // Sync to server
    syncPlayerState();
}

async function syncPlayerState() {
    const now = Date.now();
    if (now - lastSyncTime < CONFIG.SYNC_RATE) return;
    
    await FirebaseService.syncPlayerState({
        name: myName,
        snake: mySnake,
        score: myScore,
        color: CONFIG.COLORS.SELF
    });
    
    lastSyncTime = now;
}

async function handleDeath(killer) {
    isPlaying = false;
    isDead = true;
    
    // Submit score to leaderboard
    await FirebaseService.submitHighScore({
        name: myName,
        score: myScore,
        kills: myKills,
        maxLength: myMaxLength
    });
    
    // Remove from active players
    await FirebaseService.removePlayerFromDb();
    
    // Notify UI
    if (onGameOver) {
        onGameOver({
            killer,
            score: myScore,
            kills: myKills,
            maxLength: myMaxLength
        });
    }
}

// Called when this player kills another
export function registerKill(victimName) {
    myKills++;
    myScore += CONFIG.KILL_BONUS;
    if (onScoreUpdate) onScoreUpdate(myScore, mySnake.length);
    FirebaseService.reportKill(myName, victimName);
}

// Input handling
export function setDirection(dx, dy) {
    if (!isPlaying) return;
    
    // Prevent 180-degree turns
    if (dx !== 0 && dx === -myDx) return;
    if (dy !== 0 && dy === -myDy) return;
    
    nextDx = dx;
    nextDy = dy;
}

export function handleKeyInput(key) {
    const goingUp = myDy === -1;
    const goingDown = myDy === 1;
    const goingLeft = myDx === -1;
    const goingRight = myDx === 1;
    
    if ((key === 'ArrowUp' || key === 'w' || key === 'W') && !goingDown) {
        setDirection(0, -1);
    }
    if ((key === 'ArrowDown' || key === 's' || key === 'S') && !goingUp) {
        setDirection(0, 1);
    }
    if ((key === 'ArrowLeft' || key === 'a' || key === 'A') && !goingRight) {
        setDirection(-1, 0);
    }
    if ((key === 'ArrowRight' || key === 'd' || key === 'D') && !goingLeft) {
        setDirection(1, 0);
    }
}

// Rendering
function renderLoop() {
    ctx.fillStyle = CONFIG.COLORS.BG;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    drawGrid();
    drawFood();
    
    // Draw remote players
    for (const uid in remotePlayers) {
        const player = remotePlayers[uid];
        drawSnake(player.snake, player.color || CONFIG.COLORS.ENEMY, player.name);
    }
    
    // Draw self
    if (isPlaying) {
        drawSnake(mySnake, CONFIG.COLORS.SELF, null);
    }
    
    requestAnimationFrame(renderLoop);
}

function drawGrid() {
    ctx.strokeStyle = CONFIG.COLORS.GRID;
    ctx.lineWidth = 1;
    ctx.beginPath();
    
    for (let x = 0; x <= canvas.width; x += CONFIG.GRID_SIZE) {
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
    }
    
    for (let y = 0; y <= canvas.height; y += CONFIG.GRID_SIZE) {
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
    }
    
    ctx.stroke();
}

function drawFood() {
    ctx.shadowBlur = 15;
    ctx.shadowColor = CONFIG.COLORS.FOOD;
    ctx.fillStyle = CONFIG.COLORS.FOOD;
    
    const x = food.x * CONFIG.GRID_SIZE + 2;
    const y = food.y * CONFIG.GRID_SIZE + 2;
    const size = CONFIG.GRID_SIZE - 4;
    
    // Draw pulsing food
    const pulse = Math.sin(Date.now() / 200) * 2;
    ctx.fillRect(x - pulse/2, y - pulse/2, size + pulse, size + pulse);
    
    ctx.shadowBlur = 0;
}

function drawSnake(snakeBody, color, labelName) {
    if (!snakeBody || snakeBody.length === 0) return;
    
    ctx.fillStyle = color;
    ctx.shadowBlur = 10;
    ctx.shadowColor = color;
    
    snakeBody.forEach((seg, i) => {
        const size = i === 0 ? CONFIG.GRID_SIZE - 2 : CONFIG.GRID_SIZE - 4;
        const offset = i === 0 ? 1 : 2;
        ctx.fillRect(
            seg.x * CONFIG.GRID_SIZE + offset,
            seg.y * CONFIG.GRID_SIZE + offset,
            size,
            size
        );
    });
    
    ctx.shadowBlur = 0;
    
    // Draw name tag
    if (labelName) {
        const head = snakeBody[0];
        ctx.fillStyle = '#fff';
        ctx.font = '12px VT323';
        ctx.textAlign = 'center';
        ctx.fillText(labelName, head.x * CONFIG.GRID_SIZE + CONFIG.GRID_SIZE/2, head.y * CONFIG.GRID_SIZE - 5);
    }
}

function cleanupGhosts() {
    const now = Date.now();
    Object.keys(remotePlayers).forEach(key => {
        if (now - remotePlayers[key].lastSeen > CONFIG.CLEANUP_THRESHOLD) {
            delete remotePlayers[key];
        }
    });
    updateLiveLeaderboard();
}

function updateLiveLeaderboard() {
    let list = [];
    
    // Add self
    if (isPlaying) {
        list.push({ name: myName, score: myScore, isSelf: true });
    }
    
    // Add others
    for (const uid in remotePlayers) {
        list.push({
            name: remotePlayers[uid].name,
            score: remotePlayers[uid].score || 0,
            isSelf: false
        });
    }
    
    // Sort and limit
    list.sort((a, b) => b.score - a.score);
    list = list.slice(0, CONFIG.MAX_LIVE_LEADERBOARD);
    
    if (onLeaderboardUpdate) onLeaderboardUpdate(list);
}

function resizeGame() {
    let size = Math.min(window.innerWidth - 20, window.innerHeight - 150, 800);
    size = Math.floor(size / CONFIG.GRID_SIZE) * CONFIG.GRID_SIZE;
    canvas.width = size;
    canvas.height = size;
    TILE_COUNT = size / CONFIG.GRID_SIZE;
}

// Getters
export function getPlayerName() { return myName; }
export function getScore() { return myScore; }
export function getKills() { return myKills; }
export function isGamePlaying() { return isPlaying; }
