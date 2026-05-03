import 'dotenv/config'; // Loads .env file immediately before other imports
import express from 'express';
import cors from 'cors';
import authRoutes from './routes/authRoutes.js';
import aiRoutes from './routes/aiRoutes.js';
import chatRoutes from './routes/chatRoutes.js';
import statsRoutes from './routes/statsRoutes.js';

const app = express();

// CORS — allow all localhost in dev, and FRONTEND_URL in production
app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (Postman, curl, mobile)
    if (!origin) return callback(null, true);
    // Allow any localhost port in development
    if (origin.match(/^http:\/\/localhost:\d+$/)) return callback(null, true);
    // Allow production frontend URL from env
    if (process.env.FRONTEND_URL && origin === process.env.FRONTEND_URL) return callback(null, true);
    return callback(new Error(`CORS blocked: ${origin}`));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

app.use(express.json({ limit: '10mb' }));

// Routes
app.get('/', (req, res) => {
  res.json({ message: 'RankRise AI Backend API is running' });
});
app.use('/api/auth', authRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/stats', statsRoutes);

// 404 Handler
app.use((req, res) => {
  console.log(`404 - Not Found: ${req.method} ${req.originalUrl}`);
  res.status(404).json({ message: `Route ${req.originalUrl} not found` });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
