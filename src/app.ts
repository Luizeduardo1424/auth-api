import express, { Application, Request, Response } from 'express';
import { pool } from './database/pool';

const app: Application = express();

app.use(express.json());

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

export default app;
