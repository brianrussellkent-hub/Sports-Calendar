import path from 'node:path';
import express from 'express';
import cors from 'cors';
import { fileURLToPath } from 'node:url';
import { getConfig, getEvents, refreshEvents } from './ingest.js';
import { startScheduler } from './scheduler.js';

const app = express();
const port = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

app.get('/api/config', (req, res) => {
  res.json(getConfig());
});

app.get('/api/events', async (req, res) => {
  try {
    const search = req.query.search ?? '';
    const sports = req.query.sports ? String(req.query.sports).split(',').filter(Boolean) : [];
    const events = await getEvents({ search: String(search), sports });
    res.json({ timezone: 'America/New_York', events });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/refresh', async (req, res) => {
  try {
    const result = await refreshEvents();
    res.json({ message: 'Refreshed', count: result.events.length, lastRunAt: result.lastRunAt });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const distPath = path.resolve(__dirname, '../dist');

app.use(express.static(distPath));
app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api')) {
    return next();
  }
  return res.sendFile(path.join(distPath, 'index.html'), (err) => {
    if (err) {
      res.status(404).send('Frontend not built. Run npm run dev or npm run build.');
    }
  });
});

app.listen(port, async () => {
  console.log(`API server running on http://localhost:${port}`);

  try {
    await refreshEvents();
    console.log('Initial feed refresh complete.');
  } catch (error) {
    console.error('Initial refresh failed:', error.message);
  }

  startScheduler();
});
