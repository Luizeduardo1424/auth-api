import express, { Application, Request, Response } from 'express';

const app: Application = express();

app.use(express.json());

app.get('/api/v1/health', (_req: Request, res: Response) => {
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
  });
});

export default app;
