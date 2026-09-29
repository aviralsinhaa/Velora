import 'dotenv/config';
import express from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const port = process.env.PORT || 3000;

  app.use(express.json());

  // Cloud Run / container health check probes
  app.get('/healthz', (_req, res) => {
    res.status(200).send('OK');
  });

  app.get('/api/health', (_req, res) => {
    res.status(200).json({ status: 'ok', resort: 'VELORA', timestamp: new Date().toISOString() });
  });

  // Local Concierge API endpoint (zero remote LLM dependency)
  app.post('/api/concierge', (req, res) => {
    return res.status(200).json({
      status: 'ok',
      message: 'Velora Concierge runs completely client-side in the browser atelier.',
    });
  });

  const distPath = path.join(__dirname, 'dist');
  const isProd = process.env.NODE_ENV === 'production';

  if (isProd && fs.existsSync(distPath)) {
    console.log('[Server] Serving production static files from dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  } else {
    console.log('[Server] Mounting Vite middlewares in development mode');
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(Number(port), '0.0.0.0', () => {
    console.log(`VELORA Island server listening on 0.0.0.0:${port}`);
  });
}

startServer().catch((err) => {
  console.error('Fatal error starting server:', err);
  process.exit(1);
});
