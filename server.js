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
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// ── Serve Frontend Static Files ──
app.use(express.static(path.join(__dirname, 'public')));

// ── API Routes ──
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const postRoutes = require('./routes/postRoutes');
const followRoutes = require('./routes/followRoutes');

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/users', followRoutes);

// ── API 404 — only for /api routes ──
app.use('/api', (req, res) => {
  res
    .status(404)
    .json({ message: `Route ${req.method} ${req.originalUrl} not found` });
});

// ── All other routes → serve login.html ──
app.use((req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'login.html'));
});

// ── Error Handler ──
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`
  🌸 ─────────────────────────────────────
     Sakura Server Running!
     http://localhost:${PORT}
  🌸 ─────────────────────────────────────
  `);
});
