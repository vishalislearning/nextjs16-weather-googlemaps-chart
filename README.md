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

- <img width="1278" height="831" alt="image" src="https://github.com/user-attachments/assets/ce1b724e-8e38-48fc-9d38-aae6ee46633c" />

<img width="1191" height="821" alt="image" src="https://github.com/user-attachments/assets/60c0a3b2-1ad7-44f6-aa33-26d80d9b35b1" />

<img width="1195" height="855" alt="image" src="https://github.com/user-attachments/assets/f732d15f-d982-48ea-b782-5cac1b46a5ee" />




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
[https://github.com/thebase666/nextjs16-weather-mapbox-chart.git]

All architectural refactoring and production-level improvements were implemented independently.
