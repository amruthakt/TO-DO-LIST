import 'dotenv/config';
import express from 'express';
import fs from 'node:fs';
import path from 'node:path';
import { createApiApp } from './backend/app.ts';
import { connectDatabase } from './backend/config/db.ts';

async function startServer(): Promise<void> {
  await connectDatabase();

  const app = createApiApp();
  const port = Number(process.env.PORT) || 3000;
  const isProd = process.env.NODE_ENV === 'production';

  if (isProd) {
    const distDir = path.resolve(process.cwd(), 'dist');
    app.use(express.static(distDir));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distDir, 'index.html'));
    });
  } else {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);

    // Fallback to index.html if Vite middleware didn't serve a static route
    app.get('*', async (req, res, next) => {
      try {
        const indexPath = path.resolve(process.cwd(), 'index.html');
        const template = fs.readFileSync(indexPath, 'utf-8');
        const html = await vite.transformIndexHtml(req.originalUrl, template);
        res.status(200).set({ 'Content-Type': 'text/html' }).end(html);
      } catch (err) {
        next(err);
      }
    });
  }

  app.listen(port, '0.0.0.0', () => {
    console.log(`[server] TaskFlow running on http://0.0.0.0:${port}`);
  });
}

startServer().catch((error) => {
  console.error('[server] Fatal startup error:', error);
  process.exit(1);
});
