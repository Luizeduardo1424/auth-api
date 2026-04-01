import express, { Application, Request, Response } from 'express';
import helmet from 'helmet';
import cors from 'cors';
import { pool } from './database/pool';
import { errorHandler } from './middlewares/errorHandler.middleware';
import authRoutes from './modules/auth/auth.routes';
import userRoutes from './modules/users/user.routes';
import { env } from './config/env';
import pinoHttp from 'pino-http';
import { logger } from './config/logger';

const app: Application = express();

// Segurança
app.use(helmet());
app.use(
  cors({
    origin: env.ALLOWED_ORIGINS.split(','),
    credentials: true,
  }),
);

app.use(pinoHttp({ logger }));

app.use(express.json());

// Rotas
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/users', userRoutes);

// Health check
app.get('/api/v1/health', async (_req: Request, res: Response) => {
  try {
    await pool.query('SELECT 1');
    res.status(200).json({
      status: 'ok',
      database: 'connected',
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    res.status(503).json({
      status: 'error',
      database: 'disconnected',
      timestamp: new Date().toISOString(),
    });
  }
});

app.use(errorHandler);

export default app;
