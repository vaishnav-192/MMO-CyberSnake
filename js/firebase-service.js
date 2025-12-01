// Firebase Service Module
import { CONFIG, getFirebaseConfig, getAppId } from './config.js';

let db = null;
let auth = null;
let user = null;
let appId = null;
let unsubscribePlayers = null;
let unsubscribeLeaderboard = null;
let unsubscribeKillFeed = null;

// Firebase SDK references (loaded dynamically)
let Firebase = null;

export async function initializeFirebase() {
    return new Promise((resolve, reject) => {
        if (window.Firebase) {
            Firebase = window.Firebase;
            setupFirebase().then(resolve).catch(reject);
        } else {
            window.addEventListener('firebase-ready', async () => {
                Firebase = window.Firebase;
                setupFirebase().then(resolve).catch(reject);
            });
        }
    });
}

async function setupFirebase() {
    const { initializeApp, getAuth, signInAnonymously, signInWithCustomToken, onAuthStateChanged, getFirestore } = Firebase;
    
    const firebaseConfig = getFirebaseConfig();
    appId = getAppId();
    
    const app = initializeApp(firebaseConfig);
    auth = getAuth(app);
    db = getFirestore(app);
    
    // Auth flow
    try {
        if (typeof window.__initial_auth_token !== 'undefined' && window.__initial_auth_token) {
            await signInWithCustomToken(auth, window.__initial_auth_token);
        } else {
            await signInAnonymously(auth);
        }
    } catch (e) {
        console.error("Auth failed:", e);
        throw e;
    }
    
    return new Promise((resolve) => {
        onAuthStateChanged(auth, (u) => {
            if (u) {
                user = u;
                resolve({ user, db, appId });
            }
        });
    });
}

export function getUser() {
    return user;
}

export function getDb() {
    return db;
}

export function getAppIdValue() {
    return appId;
}

// Player sync
export async function syncPlayerState(playerData) {
    if (!user || !db) return;
    
    const { doc, setDoc, serverTimestamp } = Firebase;
    
    try {
        await setDoc(doc(db, 'artifacts', appId, 'public', 'data', CONFIG.PATHS.PLAYERS, user.uid), {
            ...playerData,
            odAt: serverTimestamp()
        });
    } catch (e) {
        console.error("Sync error:", e);
    }
}

export async function removePlayerFromDb() {
    if (!user || !db) return;
    
    const { doc, deleteDoc } = Firebase;
    
    try {
        await deleteDoc(doc(db, 'artifacts', appId, 'public', 'data', CONFIG.PATHS.PLAYERS, user.uid));
    } catch (e) {
        console.error("Remove player error:", e);
    }
}

// Subscribe to live players
export function subscribeToPlayers(callback) {
    if (!db) return;
    
    const { collection, onSnapshot } = Firebase;
    const playersRef = collection(db, 'artifacts', appId, 'public', 'data', CONFIG.PATHS.PLAYERS);
    
    unsubscribePlayers = onSnapshot(playersRef, (snapshot) => {
        const players = {};
        const now = Date.now();
        
        snapshot.forEach(doc => {
            if (doc.id !== user?.uid) {
                players[doc.id] = {
                    ...doc.data(),
                    lastSeen: now
                };
            }
        });
        
        callback(players, snapshot.size);
    }, (error) => {
        console.error("Players sync error:", error);
    });
    
    return () => {
        if (unsubscribePlayers) unsubscribePlayers();
    };
}

// Leaderboard operations
export async function submitHighScore(scoreData) {
    if (!user || !db) return;
    
    const { doc, setDoc, getDoc, serverTimestamp } = Firebase;
    
    const leaderboardRef = doc(db, 'artifacts', appId, 'public', 'data', CONFIG.PATHS.LEADERBOARD, user.uid);
    
    try {
        // Get existing score
        const existingDoc = await getDoc(leaderboardRef);
        const existingData = existingDoc.exists() ? existingDoc.data() : null;
        
        // Only update if new score is higher
        if (!existingData || scoreData.score > existingData.score) {
            await setDoc(leaderboardRef, {
                name: scoreData.name,
                score: scoreData.score,
                kills: scoreData.kills || 0,
                maxLength: scoreData.maxLength || 3,
                updatedAt: serverTimestamp(),
                date: new Date().toISOString().split('T')[0]
            });
        }
        
        // Update total stats
        await updatePlayerStats(scoreData);
    } catch (e) {
        console.error("Submit score error:", e);
    }
}

export async function updatePlayerStats(gameData) {
    if (!user || !db) return;
    
    const { doc, setDoc, getDoc, increment } = Firebase;
    
    const statsRef = doc(db, 'artifacts', appId, 'public', 'data', CONFIG.PATHS.STATS, user.uid);
    
    try {
        const existingDoc = await getDoc(statsRef);
        const existingData = existingDoc.exists() ? existingDoc.data() : {
            totalGames: 0,
            totalScore: 0,
            totalKills: 0,
            highestScore: 0,
            longestSnake: 0
        };
        
        await setDoc(statsRef, {
            name: gameData.name,
            totalGames: (existingData.totalGames || 0) + 1,
            totalScore: (existingData.totalScore || 0) + gameData.score,
            totalKills: (existingData.totalKills || 0) + (gameData.kills || 0),
            highestScore: Math.max(existingData.highestScore || 0, gameData.score),
            longestSnake: Math.max(existingData.longestSnake || 0, gameData.maxLength || 3)
        });
    } catch (e) {
        console.error("Update stats error:", e);
    }
}

export function subscribeToLeaderboard(callback) {
    if (!db) return;
    
    const { collection, onSnapshot, query, orderBy, limit } = Firebase;
    const leaderboardRef = collection(db, 'artifacts', appId, 'public', 'data', CONFIG.PATHS.LEADERBOARD);
    const q = query(leaderboardRef, orderBy('score', 'desc'), limit(CONFIG.MAX_LEADERBOARD_ENTRIES));
    
    unsubscribeLeaderboard = onSnapshot(q, (snapshot) => {
        const leaderboard = [];
        snapshot.forEach(doc => {
            leaderboard.push({
                id: doc.id,
                ...doc.data()
            });
        });
        callback(leaderboard);
    }, (error) => {
        console.error("Leaderboard sync error:", error);
    });
    
    return () => {
        if (unsubscribeLeaderboard) unsubscribeLeaderboard();
    };
}

// Kill feed
export async function reportKill(killerName, victimName) {
    if (!db) return;
    
    const { collection, addDoc, serverTimestamp } = Firebase;
    
    try {
        await addDoc(collection(db, 'artifacts', appId, 'public', 'data', CONFIG.PATHS.KILL_FEED), {
            killer: killerName,
            victim: victimName,
            timestamp: serverTimestamp()
        });
    } catch (e) {
        console.error("Report kill error:", e);
    }
}

export function subscribeToKillFeed(callback) {
    if (!db) return;
    
    const { collection, onSnapshot, query, orderBy, limit } = Firebase;
    const killFeedRef = collection(db, 'artifacts', appId, 'public', 'data', CONFIG.PATHS.KILL_FEED);
    const q = query(killFeedRef, orderBy('timestamp', 'desc'), limit(5));
    
    unsubscribeKillFeed = onSnapshot(q, (snapshot) => {
        const kills = [];
        snapshot.forEach(doc => {
            kills.push(doc.data());
        });
        callback(kills);
    }, (error) => {
        console.error("Kill feed sync error:", error);
    });
    
    return () => {
        if (unsubscribeKillFeed) unsubscribeKillFeed();
    };
}

// Cleanup
export function unsubscribeAll() {
    if (unsubscribePlayers) unsubscribePlayers();
    if (unsubscribeLeaderboard) unsubscribeLeaderboard();
    if (unsubscribeKillFeed) unsubscribeKillFeed();
}
