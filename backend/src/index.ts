import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import dotenv from 'dotenv';
import rateLimit from 'express-rate-limit';

// Import routes
import authRoutes from './routes/auth.routes';
import userRoutes from './routes/user.routes';
import eventRoutes from './routes/event.routes';
import reservationRoutes from './routes/reservation.routes';
import paymentRoutes from './routes/payment.routes';
import complaintRoutes from './routes/complaint.routes';

// Import middleware
import { errorHandler } from './middleware/error.middleware';
import { handleWebhook } from './controllers/payment.controller';
import { ensureSeedData } from './utils/seed-check';

dotenv.config();

const app: Application = express();
const PORT = process.env.PORT || 3001;

// Security middleware
app.use(helmet());
app.use(compression()); // Compress responses
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  credentials: true
}));

// Webhook route needs raw body BEFORE other body parsers
app.post('/api/payments/webhook', express.raw({ type: 'application/json' }), handleWebhook);

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'),
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100'),
  message: 'Příliš mnoho požadavků z této IP adresy, zkuste to prosím později.'
});
app.use('/api/', limiter);

// Body parsing middleware for other routes
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check
app.get('/health', (_req: Request, res: Response) => {
  res.status(200).json({ status: 'OK', timestamp: new Date().toISOString() });
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/reservations', reservationRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/complaints', complaintRoutes);

// 404 handler
app.use((_req: Request, res: Response) => {
  res.status(404).json({ error: 'Endpoint nenalezen' });
});

// Error handling middleware
app.use(errorHandler);

// Export app for testing
export default app;

// Start server only if not in test mode
if (process.env.NODE_ENV !== 'test') {
  // Nejdřív zkontrolujeme seed data
  ensureSeedData().then(() => {
    app.listen(PORT, () => {
      console.log(`🚀 Server běží na http://localhost:${PORT}`);
      console.log(`📝 Prostředí: ${process.env.NODE_ENV || 'development'}`);
    });
  }).catch((error) => {
    console.error('❌ Chyba při inicializaci serveru:', error);
    process.exit(1);
  });
}
