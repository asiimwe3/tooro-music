# Firebase Setup Guide — Tooro Music

## Step 1: Create Firebase Project

1. Go to https://console.firebase.google.com
2. Click "Add project"
3. Name it: `tooro-music`
4. Disable Google Analytics (optional)
5. Click Create

## Step 2: Enable Authentication

1. Go to Build > Authentication > Get Started
2. Enable these sign-in methods:
   - Email/Password ✅
   - Google ✅ (optional)

## Step 3: Create Firestore Database

1. Go to Build > Firestore Database > Create database
2. Choose "Start in production mode"
3. Select region: `europe-west3` (closest to Uganda)
4. Click Done

### Firestore Security Rules

Paste these rules in Firestore > Rules tab:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    match /profiles/{userId} {
      allow read: if true;
      allow write: if request.auth != null && request.auth.uid == userId;
    }

    match /artists/{artistId} {
      allow read: if true;
      allow write: if request.auth != null;
    }

    match /songs/{songId} {
      allow read: if resource.data.is_published == true;
      allow write: if request.auth != null;
    }

    match /albums/{albumId} {
      allow read: if true;
      allow write: if request.auth != null;
    }

    match /playlists/{playlistId} {
      allow read: if resource.data.is_public == true || request.auth.uid == resource.data.user_id;
      allow write: if request.auth != null && request.auth.uid == resource.data.user_id;
    }

    match /songLikes/{likeId} {
      allow read, write: if request.auth != null;
    }

    match /artistFollows/{followId} {
      allow read, write: if request.auth != null;
    }

    match /playHistory/{historyId} {
      allow read, write: if request.auth != null;
    }

    match /genres/{genreId} {
      allow read: if true;
    }
  }
}
```

## Step 4: Enable Firebase Storage

1. Go to Build > Storage > Get started
2. Choose production mode
3. Select same region as Firestore

### Storage Rules

```
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /songs/{allPaths=**} {
      allow read: if true;
      allow write: if request.auth != null;
    }
    match /covers/{allPaths=**} {
      allow read: if true;
      allow write: if request.auth != null;
    }
    match /avatars/{allPaths=**} {
      allow read: if true;
      allow write: if request.auth != null;
    }
  }
}
```

## Step 5: Add Android App

1. In Firebase console, click the Android icon (Add app)
2. Android package name: `com.tooromusic.app`
3. App nickname: `Tooro Music`
4. Download `google-services.json`
5. Place it in the root of the project

## Step 6: Seed Genres

Run this in Firebase Console > Firestore > Start collection:

Collection: `genres`

Add these documents:
- id: `afrobeat` → name: "Afrobeat", color: "#FF6B35"
- id: `amapiano` → name: "Amapiano", color: "#9B59B6"
- id: `gospel` → name: "Gospel", color: "#F39C12"
- id: `hiphop` → name: "Hip Hop", color: "#E74C3C"
- id: `traditional` → name: "Traditional", color: "#27AE60"
- id: `rnb` → name: "R&B", color: "#3498DB"
- id: `dancehall` → name: "Dancehall", color: "#E91E63"

## Done! ✅

Your Firebase backend is ready. The app will connect automatically once you place `google-services.json` in the project root.
