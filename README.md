# 🤫 Campus Whisper

> **Voice Your Thoughts, Anonymously & Securely.**

Campus Whisper is a modern, anonymous social platform designed for university students to share thoughts, ask questions, and discuss campus life without fear of judgment. Built with **React**, **Firebase**, and **AI-powered moderation**, it ensures a safe and engaging community.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![React](https://img.shields.io/badge/React-18-61DAFB?logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript)
![Firebase](https://img.shields.io/badge/Firebase-Auth%20%7C%20Firestore-FFCA28?logo=firebase)
![Tailwind](https://img.shields.io/badge/Tailwind_CSS-3-38B2AC?logo=tailwindcss)
![Gemini AI](https://img.shields.io/badge/AI-Google_Gemini-8E75B2?logo=google)

---

## ✨ Features

### 🎭 Anonymous Identity System
- Users are assigned a unique, deterministic **"Adjective + Animal"** alias (e.g., *Silent Owl*, *Brave Tiger*) based on their ID.
- Keeps identity hidden while allowing consistent recognition of contributors across posts.

### 🗳️ Secure Voting & Karma
- **Real-time Upvote/Downvote** system with optimistic UI updates.
- Powered by **Firestore Transactions** to ensure accuracy and prevent double-voting or race conditions.
- Posts are ranked by community interest.

### 🤖 AI Content Moderation
- Integrated **Google Gemini AI** to automatically scan every post before it goes live.
- Blocks hate speech, bullying, and revealing of real names (`blockReason` provided).
- Shadow-banning capabilities for suspicious content.

### 📢 University Hub (Channels)
- Filter feeds by department tags: `#CSE`, `#EEE`, `#Law`, `#CampusLife`, etc.
- Horizontal scrollable channel bar for quick navigation.
- "View Feed" shortcuts from the dedicated Channels page.

### 🛡️ Admin Dashboard
- Secured route (`/admin`) accessible only to authorized personnel.
- View flagged posts, manage reports, and delete content.
- Overview of community health and report status.

### 🎨 Modern UI/UX
- **Glassmorphism** design on cards and navigation.
- Fully responsive **Dark/Light mode** toggle.
- Smooth animations and transitions powered by Tailwind CSS.

---

## 🛠️ Tech Stack

- **Frontend**: React (Vite), TypeScript, Tailwind CSS
- **Backend / Database**: Firebase Firestore, Firebase Authentication (Anonymous + Email)
- **AI / ML**: Google Gemini API (Content Safety)
- **Icons**: Lucide React
- **State Management**: React Hooks (`useState`, `useEffect`, `useContext`)

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v16+)
- A Firebase Project (Firestore & Auth enabled)
- A Google Cloud Project with Gemini API enabled

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/AZtheE1/Campus-Whisper.git
   cd campus-whisper
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Configure Environment Variables**
   Create a `.env.local` file in the root directory and add your keys:
   ```env
   VITE_FIREBASE_API_KEY=your_api_key
   VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=your_project_id
   VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
   VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   VITE_FIREBASE_APP_ID=your_app_id
   
   GEMINI_API_KEY=your_google_gemini_key
   ```

4. **Run Locally**
   ```bash
   npm run dev
   ```

---

## 🔒 Security

- **No Hardcoded Keys**: All secrets are managed via strictly typed environment variables.
- **Strict Firestore Rules**: Database rules ensure users can only edit their own votes and cannot tamper with others' data.
- **Client-Side Validation**: Typescript interfaces ensure data integrity before it reaches the backend.

---

## 🤝 Contributing

Contributions are welcome! Please fork the repo and submit a Pull Request.

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

**Made with ❤️ by [Jabu](https://github.com/AZtheE1)**
