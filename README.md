# 🐍 Neon CyberSnake MMO

A retro-futuristic multiplayer snake game built with Next.js, TypeScript, and Firebase.

![Next.js](https://img.shields.io/badge/Next.js-14-black?style=for-the-badge&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5.3-3178C6?style=for-the-badge&logo=typescript)
![Firebase](https://img.shields.io/badge/Firebase-Realtime%20DB-FFCA28?style=for-the-badge&logo=firebase)
![Vercel](https://img.shields.io/badge/Deploy-Vercel-000000?style=for-the-badge&logo=vercel)

## 🎮 Features

- **Real-time Multiplayer** - See and compete with other players in real-time
- **Live Leaderboard** - Track top players during gameplay
- **Persistent High Scores** - Your best scores are saved to Firebase
- **Kill Tracking** - Get bonus points for eliminating other players
- **Kill Feed** - See who's eliminating who in real-time
- **Responsive Design** - Play on desktop or mobile with touch controls
- **Retro Cyberpunk Aesthetic** - Neon colors and CRT scanline effects

## 🛠️ Tech Stack

- **[Next.js 14](https://nextjs.org/)** - React framework with App Router
- **[TypeScript](https://www.typescriptlang.org/)** - Type-safe development
- **[Firebase](https://firebase.google.com/)** - Realtime Database & Anonymous Auth
- **[Vercel](https://vercel.com/)** - Deployment platform

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- Firebase project with Realtime Database enabled

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/vaishnav-192/MMO-CyberSnake.git
   cd MMO-CyberSnake
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   
   Create a `.env.local` file:
   ```env
   NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
   NEXT_PUBLIC_FIREBASE_DATABASE_URL=https://your_project-default-rtdb.firebaseio.com
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
   ```

4. **Run the development server**
   ```bash
   npm run dev
   ```

5. **Open [http://localhost:3000](http://localhost:3000)** in your browser

## 🔥 Firebase Setup

### 1. Create a Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project

### 2. Enable Authentication

1. Go to **Authentication** → **Sign-in method**
2. Enable **Anonymous** authentication

### 3. Create Realtime Database

1. Go to **Realtime Database** → **Create Database**
2. Choose a location
3. Start in **Test mode** (or set rules below)

### 4. Set Database Rules

```json
{
  "rules": {
    "players": {
      ".read": true,
      ".write": "auth != null"
    },
    "leaderboard": {
      ".read": true,
      ".write": "auth != null",
      ".indexOn": ["score"]
    },
    "killFeed": {
      ".read": true,
      ".write": "auth != null",
      ".indexOn": ["timestamp"]
    }
  }
}
```

### 5. Get Your Config

1. Go to **Project Settings** → **General**
2. Scroll to "Your apps" → Add a **Web app**
3. Copy the config values to your `.env.local`

## 📦 Deploy to Vercel

### Option 1: One-Click Deploy

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/vaishnav-192/MMO-CyberSnake)

### Option 2: Vercel CLI

```bash
npm i -g vercel
vercel
```

### Option 3: Git Integration

1. Push your code to GitHub
2. Import project in [Vercel Dashboard](https://vercel.com/new)
3. Add environment variables from `.env.local`
4. Deploy!

## 🎯 How to Play

| Control | Action |
|---------|--------|
| ↑ ↓ ← → | Move snake |
| W A S D | Move snake |
| Touch Swipe | Move (mobile) |
| D-Pad | Move (mobile) |

### Scoring

| Action | Points |
|--------|--------|
| Eat Food | +10 |
| Kill Player | +50 |

## 📁 Project Structure

```
MMO-CyberSnake/
├── src/
│   ├── app/
│   │   ├── layout.tsx      # Root layout with fonts
│   │   ├── page.tsx        # Main game page
│   │   └── globals.css     # Global styles
│   ├── components/
│   │   ├── GameCanvas.tsx
│   │   ├── StartScreen.tsx
│   │   ├── GameOverScreen.tsx
│   │   ├── Leaderboard.tsx
│   │   ├── LiveLeaderboard.tsx
│   │   ├── KillFeed.tsx
│   │   └── MobileControls.tsx
│   ├── hooks/
│   │   ├── useGame.ts      # Main game logic
│   │   └── useGameCanvas.ts # Canvas rendering
│   ├── lib/
│   │   ├── firebase.ts     # Firebase initialization
│   │   └── firebase-service.ts # Database operations
│   ├── config/
│   │   └── game.ts         # Game configuration
│   └── types/
│       └── game.ts         # TypeScript types
├── package.json
├── tsconfig.json
├── next.config.js
└── vercel.json
```

## 🐛 Troubleshooting

### "Firebase error - URL not configured"
- Ensure you've created a Realtime Database in Firebase Console
- Verify the `NEXT_PUBLIC_FIREBASE_DATABASE_URL` is correct

### "Auth error - configuration not found"
- Enable Anonymous Authentication in Firebase Console
- Check your API key is correct

### Players not syncing
- Verify Realtime Database rules allow read/write
- Check browser console for Firebase errors

## 📄 License

MIT License - Feel free to use, modify, and distribute!

---

Made with 💚 and neon lights
