# 🌸 Sakura — Modern Social Media Platform

Sakura (桜) is a full-stack, live-ready, and fully responsive social media platform developed with Node.js, Express, MongoDB, and modern Vanilla JS & CSS.

---

## ✨ Features & Enhancements

### 📱 Responsive & Every-Device Friendly
- **Mobile First Experience (< 768px):** Clean top header, bottom navigation bar (Home, Search, Floating Create Post, Alerts, Profile), 1-column fluid feed with zero horizontal scrolling.
- **Tablet (768px – 1024px):** Adaptive 2-column layout with fluid sidebars.
- **Desktop (1025px+):** Luxury 3-column layout (Left user profile card & navigation, Center feed stream, Right trending & who to follow widgets).
- **Touch-optimized:** Full touch support, image preview modal, lightboxes, and smooth sheet-style modals.

### 🌗 Theme System
- **Blossom Light Mode:** Elegant soft rose-tinted aesthetics with glassmorphism.
- **Blossom Midnight Dark Mode:** High-contrast dark luxury theme with glowing pink accents.
- Persisted automatically in `localStorage` with zero-flash rendering.

### 🚀 Completed & Enhanced Features
- 🔐 **Authentication:** JWT auth with bcryptjs password hashing, show/hide password toggles, and secure token validation.
- 🖼️ **Persistent Avatars & Cover Photos:** Real photo uploads with client-side canvas compression (keeps payloads lightweight) stored directly in MongoDB so all users see each other's avatars and covers!
- 🌟 **Feed Filters:**
  - **For You:** Global feed of all user moments.
  - **Following:** Dedicated feed of posts only from creators you follow.
  - **Hashtag Filtering:** Click any `#hashtag` in posts or in trending tags to instantly filter the feed!
- 🔖 **Bookmarks / Saved Posts:** Bookmark any post and view all your saved posts in your profile!
- ✏️ **Edit & Delete Posts:** Author can edit post content via a clean modal or delete it.
- 💬 **Interactive Comments:** Add comments in real-time, with delete controls for comment authors and post owners.
- 🔔 **In-App Notifications:** Real-time notification bell with unread badge for likes, comments, and new followers.
- 🔍 **Live Search:** Debounced instant search for people across usernames and full names.
- 📋 **Share Moments:** Native Web Share API with clipboard copy fallback and toast feedback.
- 🍞 **Sakura Toast System:** Replaces alert popups with animated success, error, and info toasts.

---

## 🛠️ Tech Stack

- **Backend:** Node.js, Express.js (v5)
- **Database:** MongoDB with Mongoose (Atlas Cloud ready)
- **Authentication:** JSON Web Tokens (JWT) & bcryptjs
- **Frontend:** Responsive HTML5, CSS3 Variables, Vanilla JavaScript (ES6+)
- **Icons:** SVG vector icons (Lucide system)

---

## 📁 Project Architecture

```
social-media-app/
├── config/
│   └── db.js                 # Database connection logic
├── controllers/
│   ├── authController.js     # Register, Login, GetMe
│   ├── userController.js     # Profiles, Search, Suggestions, Avatars
│   ├── postController.js     # Posts, Feeds, Likes, Comments, Bookmarks
│   ├── followController.js   # Follow, Unfollow, Followers, Following
│   └── notificationController.js # Notifications & Read states
├── middleware/
│   ├── auth.js               # JWT Protect middleware
│   └── errorHandler.js       # Global error handler
├── models/
│   ├── User.js               # User schema (profilePicture, coverPhoto, bookmarks)
│   ├── Post.js               # Post schema (content, image, likes, comments)
│   ├── Comment.js            # Comment schema
│   ├── Follow.js             # Follow relations
│   └── Notification.js       # Notifications schema
├── routes/
│   ├── authRoutes.js         # /api/auth
│   ├── userRoutes.js         # /api/users
│   ├── postRoutes.js         # /api/posts
│   ├── followRoutes.js       # /api/users/:id/follow
│   └── notificationRoutes.js # /api/notifications
├── public/
│   ├── css/
│   │   └── sakura-theme.css  # Shared design system, dark mode, responsive styles
│   ├── js/
│   │   └── sakura-core.js    # Shared auth, theme, toasts, image compression
│   ├── feed.html             # Home Feed & Exploration
│   ├── profile.html          # Current User Profile & Saved Posts
│   ├── user-profile.html     # Other User Profiles & Follow
│   ├── login.html            # Sign In
│   └── register.html         # Sign Up
├── .env.example              # Environment variables template
├── server.js                 # Express server & clean URL handlers
└── package.json
```

---

## 🚀 Live Deployment Guide

### Option 1: Render / Railway / Fly.io

1. **Push your repository to GitHub.**
2. **Create a new Web Service** on [Render](https://render.com) or [Railway](https://railway.app).
3. **Set the environment variables:**
   - `PORT=5000` (or leave default assigned by host)
   - `MONGO_URI=mongodb+srv://...`
   - `JWT_SECRET=your_long_secret_key`
   - `NODE_ENV=production`
4. **Build Command:** `npm install`
5. **Start Command:** `npm start`
6. Healthcheck endpoint: `/api/health`

---

## 💻 Local Setup

1. **Clone & install dependencies:**
   ```bash
   npm install
   ```

2. **Configure `.env` file:**
   ```env
   PORT=5000
   MONGO_URI=mongodb+srv://...
   JWT_SECRET=your_jwt_secret_key
   NODE_ENV=development
   ```

3. **Start the application:**
   ```bash
   npm run dev
   ```

4. **Open in browser:**
   ```
   http://localhost:5000/login
   ```

---

<div align="center">
  Made with 🌸 for CodeAlpha
</div>
