const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const path = require('path');
const connectDB = require('./config/db');
const { errorHandler } = require('./middleware/errorHandler');

dotenv.config();
connectDB();

const app = express();

// ── Core Middleware ──
app.use(cors());
app.use(express.json({ limit: '15mb' }));
app.use(express.urlencoded({ limit: '15mb', extended: true }));

// ── Serve Frontend Static Files ──
app.use(express.static(path.join(__dirname, 'public')));

// ── API Routes ──
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const postRoutes = require('./routes/postRoutes');
const followRoutes = require('./routes/followRoutes');
const notificationRoutes = require('./routes/notificationRoutes');

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/users', followRoutes);
app.use('/api/notifications', notificationRoutes);

// Health check for deployment platforms (Vercel, Render, Railway, AWS)
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    service: 'Sakura Social API',
  });
});

// Clean friendly frontend URLs
app.get('/feed', (req, res) => {
  res.sendFile(path.resolve(__dirname, 'public', 'feed.html'));
});

app.get('/profile', (req, res) => {
  res.sendFile(path.resolve(__dirname, 'public', 'profile.html'));
});

app.get('/user-profile', (req, res) => {
  res.sendFile(path.resolve(__dirname, 'public', 'user-profile.html'));
});

app.get('/user', (req, res) => {
  res.sendFile(path.resolve(__dirname, 'public', 'user-profile.html'));
});

app.get('/login', (req, res) => {
  res.sendFile(path.resolve(__dirname, 'public', 'login.html'));
});

app.get('/register', (req, res) => {
  res.sendFile(path.resolve(__dirname, 'public', 'register.html'));
});

app.get('/', (req, res) => {
  res.sendFile(path.resolve(__dirname, 'public', 'login.html'));
});

// ── API 404 handler ──
app.use('/api', (req, res) => {
  res.status(404).json({
    message: `API Route ${req.method} ${req.originalUrl} not found`,
  });
});

// ── Catch-all page router ──
app.use((req, res) => {
  res.sendFile(path.resolve(__dirname, 'public', 'login.html'));
});

// ── Error Handler ──
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`
  🌸 ─────────────────────────────────────
     Sakura Server Running!
     Local: http://localhost:${PORT}
     Status: Ready for live deployment
  🌸 ─────────────────────────────────────
  `);
});
