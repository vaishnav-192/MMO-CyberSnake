// Main Entry Point
import * as FirebaseService from './firebase-service.js';
import * as Game from './game.js';
import * as UI from './ui.js';

async function init() {
    console.log('🐍 Initializing Neon CyberSnake MMO...');
    
    // Initialize UI first
    UI.initUI();
    UI.initTabs();
    UI.showScreen('loading');
    UI.updateStatus('INITIALIZING...');
    
    try {
        // Initialize Firebase
        UI.updateStatus('CONNECTING TO SERVER...');
        const { user } = await FirebaseService.initializeFirebase();
        
        UI.updateStatus(`CONNECTED: ${user.uid.substring(0, 6)}`);
        console.log('✅ Firebase connected:', user.uid);
        
        // Initialize game canvas
        const canvas = document.getElementById('gameCanvas');
        Game.initGame(canvas);
        
        // Subscribe to global leaderboard
        FirebaseService.subscribeToLeaderboard((leaderboard) => {
            UI.updateHighscoresTable(leaderboard, document.getElementById('highscores-body'));
            UI.updateHighscoresTable(leaderboard, document.getElementById('start-highscores-body'));
        });
        
        // Show start screen
        UI.showScreen('start');
        
    } catch (error) {
        console.error('❌ Initialization failed:', error);
        UI.updateStatus('CONNECTION FAILED - OFFLINE MODE');
        UI.showScreen('start');
    }
}

// Start when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}

// Handle page unload
window.addEventListener('beforeunload', () => {
    FirebaseService.removePlayerFromDb();
    FirebaseService.unsubscribeAll();
});
