# Tooro Music 🎵

> **The Sound of Western Uganda**

A production-ready React Native + Expo music streaming app for Tooro Kingdom artists. Featuring Afrobeat, Amapiano, Gospel, Hip Hop, and Traditional Ugandan music.

## Tech Stack

- **Frontend:** React Native + Expo (TypeScript)
- **Styling:** NativeWind (Tailwind CSS for React Native)
- **Backend:** Supabase (Auth, Database, Storage)
- **State Management:** Zustand
- **Build:** EAS Build (Expo Application Services)

## Features

- 🎧 Full music player with background audio
- 👤 Artist profiles and discovery
- 🔐 Authentication (Email/Social)
- 📱 Onboarding experience
- 🎨 Beautiful gradient UI
- 📋 Playlist management
- 🔍 Discover new music

## Getting Started

```bash
# Install dependencies
npm install

# Start development server
npx expo start

# Build for Android
eas build --platform android
```

## Project Structure

```
tooro-music/
├── app/                    # Expo Router screens
├── src/
│   ├── api/                # Supabase API layer
│   ├── components/         # Reusable UI components
│   ├── screens/            # Screen components
│   ├── store/              # Zustand state stores
│   ├── types/              # TypeScript types
│   ├── constants/          # App constants
│   └── utils/              # Utility functions
└── assets/                 # Images, fonts, icons
```

## Target Platform

Google Play Store — Uganda & East Africa

---

Built with ❤️ for Tooro Kingdom | © 2026 Tooro Music
