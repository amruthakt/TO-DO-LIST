import express, { type NextFunction, type Request, type Response } from 'express';
import { getDatabaseMode } from './config/db.ts';
import taskRouter from './routes/taskRoutes.ts';

export function createApiApp(): express.Express {
  const app = express();

  app.use(express.json({ limit: '100kb' }));

  app.get('/api/health', (_req: Request, res: Response) => {
    res.json({
      ok: true,
      database: getDatabaseMode(),
    });
  });

  app.use('/api/tasks', taskRouter);

  app.use('/api', (_req: Request, res: Response) => {
    res.status(404).json({ error: 'API endpoint not found.' });
  });

  app.use((error: unknown, _req: Request, res: Response, _next: NextFunction) => {
    console.error('[api] Unhandled error:', error);
    if (error instanceof SyntaxError && 'body' in error) {
      res.status(400).json({ error: 'Malformed JSON request body.' });
      return;
    }
    res.status(500).json({ error: 'An unexpected server error occurred. Please try again.' });
  });

  return app;
}
