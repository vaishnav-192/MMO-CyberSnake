// Game Configuration
export const CONFIG = {
    // Game Settings
    GRID_SIZE: 20,
    GAME_SPEED: 120, // ms per tick
    SYNC_RATE: 150, // ms per network sync
    CLEANUP_THRESHOLD: 10000, // 10s timeout for ghost players
    
    // Scoring
    FOOD_SCORE: 10,
    KILL_BONUS: 50,
    
    // Leaderboard
    MAX_LEADERBOARD_ENTRIES: 10,
    MAX_LIVE_LEADERBOARD: 5,
    
    // Colors
    COLORS: {
        BG: '#0a0a12',
        GRID: '#111122',
        SELF: '#39ff14',
        ENEMY: '#00ffff',
        FOOD: '#ff0055',
        POWERUP: '#ffff00'
    },
    
    // Firebase paths
    PATHS: {
        PLAYERS: 'players',
        LEADERBOARD: 'leaderboard',
        STATS: 'stats',
        KILL_FEED: 'killFeed'
    }
};

// Get Firebase config from environment or use defaults
export function getFirebaseConfig() {
    // For Vercel deployment, these should be set in environment variables
    // For local development, you can set them here or use a .env file
    if (typeof window !== 'undefined' && window.__firebase_config) {
        return JSON.parse(window.__firebase_config);
    }
    
    // Default/fallback config - replace with your Firebase config
    return {
        apiKey: process.env.FIREBASE_API_KEY || "",
        authDomain: process.env.FIREBASE_AUTH_DOMAIN || "",
        projectId: process.env.FIREBASE_PROJECT_ID || "",
        storageBucket: process.env.FIREBASE_STORAGE_BUCKET || "",
        messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID || "",
        appId: process.env.FIREBASE_APP_ID || ""
    };
}

export function getAppId() {
    if (typeof window !== 'undefined' && window.__app_id) {
        return window.__app_id;
    }
    return 'mmo-cybersnake';
}
