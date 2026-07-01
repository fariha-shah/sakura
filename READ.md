# 🌸 Sakura — Social Media Platform

Sakura (桜) means "Cherry Blossom" in Japanese — the iconic pink flowers that bloom every spring in Japan.

Sakura is a mini social media platform developed as part of my internship at **CodeAlpha**. It allows users to create profiles, share posts, interact through likes and comments, and connect with others through a follow system.

---

## ✨ Features

- User Registration & Login with JWT Authentication
- Create, view and delete Posts
- Like & Unlike posts
- Comment on posts
- Follow & Unfollow users
- View any user's profile with their posts, followers and following
- Real-time search for users
- Smart follow suggestions
- Profile picture & cover photo upload
- Edit profile name and bio

---

## 🛠️ Tech Stack

- **Backend:** Node.js, Express.js
- **Database:** MongoDB with Mongoose
- **Authentication:** JWT + bcryptjs
- **Frontend:** HTML, CSS, Vanilla JavaScript
- **Icons:** Lucide SVG Icons

---

## 📁 Project Structure

```
social-media-app/
├── config/
│   └── db.js
├── controllers/
│   ├── authController.js
│   ├── userController.js
│   ├── postController.js
│   └── followController.js
├── middleware/
│   ├── auth.js
│   └── errorHandler.js
├── models/
│   ├── User.js
│   ├── Post.js
│   ├── Comment.js
│   └── Follow.js
├── routes/
│   ├── authRoutes.js
│   ├── userRoutes.js
│   ├── postRoutes.js
│   └── followRoutes.js
├── public/
│   ├── login.html
│   ├── register.html
│   ├── feed.html
│   ├── profile.html
│   └── user-profile.html
├── .env
├── server.js
└── package.json
```

---

## 🚀 Getting Started

**1. Install dependencies**

```bash
npm install
```

**2. Create `.env` file**

```
PORT=5000
MONGO_URI=mongodb://localhost:27017/socialmedia
JWT_SECRET=your_secret_key
NODE_ENV=development
```

**3. Run the app**

```bash
npm run dev
```

**4. Open in browser**

```
http://localhost:5000/login.html
```

---

## 👩‍💻 Author

**Fareeha**

- Internship: CodeAlpha
- Degree: BSCS
- Role: Full Stack Developer Intern

---

<div align="center">
  Made with 🌸 by Fareeha — CodeAlpha Intern
</div>
