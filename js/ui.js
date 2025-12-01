// UI Controller Module
import * as Game from './game.js';
import * as FirebaseService from './firebase-service.js';

// DOM Elements
let elements = {};

export function initUI() {
    // Cache DOM elements
    elements = {
        loadingScreen: document.getElementById('loading-screen'),
        startScreen: document.getElementById('start-screen'),
        gameOverScreen: document.getElementById('game-over-screen'),
        leaderboardScreen: document.getElementById('leaderboard-screen'),
        usernameInput: document.getElementById('username-input'),
        scoreDisplay: document.getElementById('score'),
        lengthDisplay: document.getElementById('length'),
        playerCount: document.getElementById('player-count'),
        statusMsg: document.getElementById('status-msg'),
        liveLeaderboard: document.getElementById('leaderboard'),
        killFeed: document.getElementById('kill-feed'),
        finalScore: document.getElementById('final-score'),
        finalLength: document.getElementById('final-length'),
        finalKills: document.getElementById('final-kills'),
        killerName: document.getElementById('killer-name'),
        highscoresBody: document.getElementById('highscores-body'),
        startHighscoresBody: document.getElementById('start-highscores-body')
    };
    
    // Set up game callbacks
    Game.setCallbacks({
        onScoreUpdate: updateScore,
        onPlayerCountUpdate: updatePlayerCount,
        onGameOver: showGameOver,
        onLeaderboardUpdate: updateLiveLeaderboard,
        onKillFeedUpdate: updateKillFeed
    });
    
    // Set up input handlers
    setupInputHandlers();
    
    // Load saved username
    const savedName = localStorage.getItem('cybersnake-username');
    if (savedName && elements.usernameInput) {
        elements.usernameInput.value = savedName;
    }
}

function setupInputHandlers() {
    // Keyboard controls
    document.addEventListener('keydown', (e) => {
        Game.handleKeyInput(e.key);
    });
    
    // Touch controls
    const canvas = document.getElementById('gameCanvas');
    let touchStartX, touchStartY;
    
    canvas.addEventListener('touchstart', (e) => {
        touchStartX = e.touches[0].clientX;
        touchStartY = e.touches[0].clientY;
        e.preventDefault();
    }, { passive: false });
    
    canvas.addEventListener('touchend', (e) => {
        if (!Game.isGamePlaying()) return;
        
        const dX = e.changedTouches[0].clientX - touchStartX;
        const dY = e.changedTouches[0].clientY - touchStartY;
        const threshold = 30;
        
        if (Math.abs(dX) > Math.abs(dY)) {
            if (Math.abs(dX) > threshold) {
                Game.setDirection(dX > 0 ? 1 : -1, 0);
            }
        } else {
            if (Math.abs(dY) > threshold) {
                Game.setDirection(0, dY > 0 ? 1 : -1);
            }
        }
    });
    
    canvas.addEventListener('touchmove', (e) => e.preventDefault(), { passive: false });
    
    // Mobile control buttons
    const mobileUp = document.getElementById('mobile-up');
    const mobileDown = document.getElementById('mobile-down');
    const mobileLeft = document.getElementById('mobile-left');
    const mobileRight = document.getElementById('mobile-right');
    
    if (mobileUp) mobileUp.addEventListener('click', () => Game.setDirection(0, -1));
    if (mobileDown) mobileDown.addEventListener('click', () => Game.setDirection(0, 1));
    if (mobileLeft) mobileLeft.addEventListener('click', () => Game.setDirection(-1, 0));
    if (mobileRight) mobileRight.addEventListener('click', () => Game.setDirection(1, 0));
}

export function showScreen(screenName) {
    // Hide all screens
    elements.loadingScreen?.classList.add('hidden');
    elements.startScreen?.classList.add('hidden');
    elements.gameOverScreen?.classList.add('hidden');
    elements.leaderboardScreen?.classList.add('hidden');
    
    // Show requested screen
    switch (screenName) {
        case 'loading':
            elements.loadingScreen?.classList.remove('hidden');
            break;
        case 'start':
            elements.startScreen?.classList.remove('hidden');
            break;
        case 'gameOver':
            elements.gameOverScreen?.classList.remove('hidden');
            break;
        case 'leaderboard':
            elements.leaderboardScreen?.classList.remove('hidden');
            break;
    }
}

export function updateStatus(message) {
    if (elements.statusMsg) {
        elements.statusMsg.textContent = message;
    }
}

function updateScore(score, length) {
    if (elements.scoreDisplay) {
        elements.scoreDisplay.textContent = `SCORE: ${score}`;
    }
    if (elements.lengthDisplay) {
        elements.lengthDisplay.textContent = `LENGTH: ${length}`;
    }
}

function updatePlayerCount(count) {
    if (elements.playerCount) {
        elements.playerCount.textContent = `ONLINE: ${count}`;
    }
}

function updateLiveLeaderboard(leaderboard) {
    if (!elements.liveLeaderboard) return;
    
    let html = '<div class="lb-header">TOP PLAYERS</div>';
    
    leaderboard.forEach((player, index) => {
        const selfClass = player.isSelf ? 'lb-self' : '';
        html += `
            <div class="lb-entry ${selfClass}">
                <span class="lb-rank">#${index + 1}</span>
                ${player.name}: ${player.score}
            </div>
        `;
    });
    
    elements.liveLeaderboard.innerHTML = html;
}

function updateKillFeed(kills) {
    if (!elements.killFeed) return;
    
    let html = '';
    kills.forEach(kill => {
        html += `
            <div class="kill-entry">
                <span class="killer">${kill.killer}</span> ☠ <span class="victim">${kill.victim}</span>
            </div>
        `;
    });
    
    elements.killFeed.innerHTML = html;
}

function showGameOver(data) {
    if (elements.finalScore) elements.finalScore.textContent = data.score;
    if (elements.finalLength) elements.finalLength.textContent = data.maxLength;
    if (elements.finalKills) elements.finalKills.textContent = data.kills;
    if (elements.killerName) elements.killerName.textContent = data.killer;
    
    showScreen('gameOver');
}

export function updateHighscoresTable(leaderboard, tableBody) {
    if (!tableBody) return;
    
    if (leaderboard.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="4" style="text-align: center;">No scores yet!</td></tr>';
        return;
    }
    
    let html = '';
    leaderboard.forEach((entry, index) => {
        html += `
            <tr>
                <td class="rank-col">${index + 1}</td>
                <td>${entry.name}</td>
                <td class="kills-col">${entry.kills || 0}</td>
                <td class="score-col">${entry.score}</td>
            </tr>
        `;
    });
    
    tableBody.innerHTML = html;
}

// Tab functionality
export function initTabs() {
    const tabBtns = document.querySelectorAll('.tab-btn');
    
    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const tabId = btn.dataset.tab;
            
            // Update buttons
            tabBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            // Update content
            document.querySelectorAll('.tab-content').forEach(content => {
                content.classList.remove('active');
            });
            document.getElementById(tabId)?.classList.add('active');
        });
    });
}

// Expose functions globally for HTML onclick handlers
window.startGame = function() {
    const username = elements.usernameInput?.value.trim() || '';
    
    // Save username
    if (username) {
        localStorage.setItem('cybersnake-username', username);
    }
    
    showScreen(null); // Hide all screens
    Game.startGame(username);
};

window.resetGame = function() {
    showScreen(null);
    Game.resetGame();
};

window.showLeaderboard = function() {
    showScreen('leaderboard');
};

window.backToStart = function() {
    showScreen('start');
};
