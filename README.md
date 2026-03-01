# 🌦 Weather Map Application (Refactored Version)

This project is a fork of an open-source Next.js Weather Map application.

It has been refactored and optimized for better API handling, improved script loading behavior, and production-ready configuration.

---

## 🚀 Overview

An interactive map application built using:

- Next.js (App Router)
- React
- TypeScript
- Google Maps JavaScript API
- @react-google-maps/api

Users can:

- View interactive map
- Select locations dynamically
- Render markers on selected positions

---

## 🔧 Key Improvements & Refactoring

The following engineering changes were implemented:

- Replaced `LoadScript` with `useJsApiLoader` to prevent duplicate script injection
- Fixed the "Google API already presented" runtime error
- Implemented environment-based API key configuration
- Improved Google Maps API restriction handling
- Cleaned up component structure
- Verified compatibility with Next.js production build

---

## 🔐 Environment Setup

Create `.env.local`:

```
NEXT_PUBLIC_GOOGLE_MAPS_KEY=your_google_maps_api_key
```

Ensure:
- Google Maps JavaScript API is enabled
- Geocoding API is enabled (if used)
- HTTP referrer restrictions are configured properly

---

## 🖥 Running Locally

```bash
npm install
npm run dev
```

Open:
http://localhost:3000

---

## 📦 Production Test

```bash
npm run build
npm start
```

---

## 📚 Original Repository

This repository is forked from:
[Original Repo Link Here]

All architectural refactoring and production-level improvements were implemented independently.
