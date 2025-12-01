# 🐍 Neon CyberSnake MMO

A retro-futuristic multiplayer snake game with real-time competition, leaderboards, and kill tracking.

![Neon CyberSnake](https://img.shields.io/badge/Game-MMO%20Snake-39ff14?style=for-the-badge&logo=game)
![Firebase](https://img.shields.io/badge/Backend-Firebase-FFCA28?style=for-the-badge&logo=firebase)
![Vercel](https://img.shields.io/badge/Deployed-Vercel-000000?style=for-the-badge&logo=vercel)

## 🎮 Features

- **Real-time Multiplayer** - See and compete with other players in real-time
- **Live Leaderboard** - Track top players during gameplay
- **Persistent High Scores** - Your best scores are saved forever
- **Kill Tracking** - Get bonus points for eliminating other players
- **Kill Feed** - See who's eliminating who in real-time
- **Responsive Design** - Play on desktop or mobile
- **Retro Cyberpunk Aesthetic** - Neon colors and CRT effects

## 🚀 Quick Start

### Prerequisites

- A Firebase project with Firestore enabled
- Node.js 18+ (optional, for local development server)
- Vercel account (for deployment)

### Local Development

1. Clone this repository
2. Set up your Firebase configuration in `js/config.js`
3. Run a local server:

```bash
# Using npm
npm run dev

# Or using Python
python -m http.server 8000

# Or using PHP
php -S localhost:8000
```

4. Open `http://localhost:8000` in your browser

## 🔧 Firebase Setup

### 1. Create a Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project
3. Enable **Firestore Database**
4. Enable **Anonymous Authentication**

### 2. Configure Firestore Rules

In Firebase Console → Firestore → Rules, add:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Allow read/write access to all documents under artifacts path
    match /artifacts/{appId}/public/data/{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

### 3. Get Your Config

1. Go to Project Settings → General
2. Scroll to "Your apps" → Web app
3. Copy the config object

### 4. Update the Game

Replace the Firebase config in `js/config.js`:

```javascript
return {
    apiKey: "YOUR_API_KEY",
    authDomain: "YOUR_PROJECT.firebaseapp.com",
    projectId: "YOUR_PROJECT_ID",
    storageBucket: "YOUR_PROJECT.appspot.com",
    messagingSenderId: "YOUR_SENDER_ID",
    appId: "YOUR_APP_ID"
};
```

## 📦 Deploy to Vercel

### Option 1: Vercel CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Deploy to production
vercel --prod
```

### Option 2: Git Integration

1. Push your code to GitHub
2. Go to [Vercel](https://vercel.com)
3. Import your GitHub repository
4. Click Deploy

### Environment Variables (Optional)

If you want to use environment variables for Firebase config:

1. Go to your Vercel project settings
2. Add environment variables:
   - `FIREBASE_API_KEY`
   - `FIREBASE_AUTH_DOMAIN`
   - `FIREBASE_PROJECT_ID`
   - `FIREBASE_STORAGE_BUCKET`
   - `FIREBASE_MESSAGING_SENDER_ID`
   - `FIREBASE_APP_ID`

## 🎯 How to Play

- **Arrow Keys** or **WASD** to move
- **Eat food (red squares)** to grow and score points
- **Avoid walls** and other snakes
- **Crash into other players** to eliminate them (bonus points!)
- **Climb the leaderboard** and become the top snake!

## 📁 Project Structure

```
MMO CyberSnake/
├── index.html          # Main HTML file
├── css/
│   └── styles.css      # All styles
├── js/
│   ├── main.js         # Entry point
│   ├── config.js       # Game configuration
│   ├── firebase-service.js  # Firebase operations
│   ├── game.js         # Game logic
│   └── ui.js           # UI controller
├── vercel.json         # Vercel configuration
├── package.json        # Project metadata
└── README.md           # This file
```

## 🏆 Scoring System

| Action | Points |
|--------|--------|
| Eat Food | +10 |
| Kill Player | +50 |

## 🔒 Security

- Anonymous authentication for easy access
- Firestore rules restrict access to authenticated users
- No sensitive data stored client-side

## 🐛 Troubleshooting

### "Connection Failed" Error
- Check your Firebase configuration
- Ensure Firestore and Anonymous Auth are enabled
- Check browser console for specific errors

### Players Not Syncing
- Verify Firestore rules are correct
- Check network connectivity
- Players timeout after 10 seconds of inactivity

### Mobile Controls Not Working
- Ensure touch events aren't blocked
- Try refreshing the page
- Check for JavaScript errors in console

## 📄 License

MIT License - Feel free to use, modify, and distribute!

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

---

Made with 💚 and neon lights
