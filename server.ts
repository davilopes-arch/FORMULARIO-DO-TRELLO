import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import {
  fetchBoardData,
  createCardWithDetails,
  createBoardLabel,
  updateBoardLabel,
  deleteBoardLabel,
  CreateCardPayload,
} from './server/trelloService.ts';
import {
  getRCAs,
  addRCA,
  renameRCA,
  removeRCA,
  TeamName,
} from './server/rcaService.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  // JSON parsing with high limit for images (up to 50MB)
  app.use(express.json({ limit: '50mb' }));
  app.use(express.urlencoded({ extended: true, limit: '50mb' }));

  // --- API ROUTES ---

  // Health check
  app.get('/api/health', (req, res) => {
    res.json({
      status: 'ok',
      service: 'Portal Trello CX Backend',
      timestamp: new Date().toISOString(),
    });
  });

  // 1. Get Board Data (Lists, Labels, Custom Fields) with backend caching
  app.get('/api/trello/board-data', async (req, res) => {
    try {
      const forceRefresh = req.query.refresh === 'true';
      const data = await fetchBoardData(forceRefresh);
      res.json(data);
    } catch (error: any) {
      console.error('Error fetching board data:', error);
      res.status(502).json({
        error: error.message || 'Erro ao comunicar com a API do Trello',
      });
    }
  });

  // 2. Create Card with Custom Fields, Labels, Comments, and Attachments
  app.post('/api/trello/cards', async (req, res) => {
    try {
      const payload: CreateCardPayload = req.body;
      if (!payload.name) {
        return res.status(400).json({ error: 'Título do card é obrigatório' });
      }

      const result = await createCardWithDetails(payload);
      res.status(201).json(result);
    } catch (error: any) {
      console.error('Error creating card:', error);
      res.status(500).json({
        error: error.message || 'Erro ao criar card no Trello',
      });
    }
  });

  // 3. Create Label (Situação)
  app.post('/api/trello/labels', async (req, res) => {
    try {
      const { name, color } = req.body;
      if (!name) return res.status(400).json({ error: 'Nome da situação é obrigatório' });
      const label = await createBoardLabel(name, color || 'blue');
      res.status(201).json(label);
    } catch (error: any) {
      console.error('Error creating label:', error);
      res.status(500).json({ error: error.message });
    }
  });

  // 4. Update Label Name
  app.put('/api/trello/labels/:id', async (req, res) => {
    try {
      const { id } = req.params;
      const { name } = req.body;
      if (!name) return res.status(400).json({ error: 'Novo nome é obrigatório' });
      const updated = await updateBoardLabel(id, name);
      res.json(updated);
    } catch (error: any) {
      console.error('Error updating label:', error);
      res.status(500).json({ error: error.message });
    }
  });

  // 5. Delete Label
  app.delete('/api/trello/labels/:id', async (req, res) => {
    try {
      const { id } = req.params;
      const result = await deleteBoardLabel(id);
      res.json(result);
    } catch (error: any) {
      console.error('Error deleting label:', error);
      res.status(500).json({ error: error.message });
    }
  });

  // 6. RCA Management (Persistent across sessions/devices)
  app.get('/api/rcas', (req, res) => {
    res.json(getRCAs());
  });

  app.post('/api/rcas', (req, res) => {
    const { team, name } = req.body;
    if (!team || !name) return res.status(400).json({ error: 'Equipe e nome são obrigatórios' });
    const result = addRCA(team as TeamName, name);
    if (!result.success) return res.status(400).json(result);
    res.status(201).json(getRCAs());
  });

  app.put('/api/rcas', (req, res) => {
    const { team, oldName, newName } = req.body;
    if (!team || !oldName || !newName) {
      return res.status(400).json({ error: 'Equipe, nome antigo e novo nome são obrigatórios' });
    }
    const result = renameRCA(team as TeamName, oldName, newName);
    if (!result.success) return res.status(400).json(result);
    res.json(getRCAs());
  });

  app.delete('/api/rcas', (req, res) => {
    const { team, name } = req.body;
    if (!team || !name) return res.status(400).json({ error: 'Equipe e nome são obrigatórios' });
    const result = removeRCA(team as TeamName, name);
    if (!result.success) return res.status(400).json(result);
    res.json(getRCAs());
  });

  // --- VITE MIDDLEWARE / STATIC ASSETS ---
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
