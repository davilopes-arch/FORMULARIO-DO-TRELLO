import express from 'express';
import {
  fetchBoardData,
  createCardWithDetails,
  createBoardLabel,
  updateBoardLabel,
  deleteBoardLabel,
  CreateCardPayload,
} from './trelloService.ts';
import {
  getRCAs,
  addRCA,
  renameRCA,
  removeRCA,
  getTeams,
  addTeam,
  updateTeam,
  removeTeam,
  resetTeams,
  TeamName,
} from './rcaService.ts';

const app = express();

// JSON parsing with high limit for images (up to 100MB)
app.use(express.json({ limit: '100mb' }));
app.use(express.urlencoded({ extended: true, limit: '100mb' }));

// Router for API endpoints
const apiRouter = express.Router();

// Health check
apiRouter.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'Portal Trello CX Backend',
    timestamp: new Date().toISOString(),
  });
});

// 1. Get Board Data (Lists, Labels, Custom Fields) with backend caching
apiRouter.get('/trello/board-data', async (req, res) => {
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
apiRouter.post('/trello/cards', async (req, res) => {
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
apiRouter.post('/trello/labels', async (req, res) => {
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
apiRouter.put('/trello/labels/:id', async (req, res) => {
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
apiRouter.delete('/trello/labels/:id', async (req, res) => {
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
apiRouter.get('/rcas', (req, res) => {
  res.json(getRCAs());
});

apiRouter.post('/rcas', (req, res) => {
  const { team, name } = req.body;
  if (!team || !name) return res.status(400).json({ error: 'Equipe e nome são obrigatórios' });
  const result = addRCA(team as TeamName, name);
  if (!result.success) return res.status(400).json(result);
  res.status(201).json(getRCAs());
});

apiRouter.put('/rcas', (req, res) => {
  const { team, oldName, newName } = req.body;
  if (!team || !oldName || !newName) {
    return res.status(400).json({ error: 'Equipe, nome antigo e novo nome são obrigatórios' });
  }
  const result = renameRCA(team as TeamName, oldName, newName);
  if (!result.success) return res.status(400).json(result);
  res.json(getRCAs());
});

apiRouter.delete('/rcas', (req, res) => {
  const { team, name } = req.body;
  if (!team || !name) return res.status(400).json({ error: 'Equipe e nome são obrigatórios' });
  const result = removeRCA(team as TeamName, name);
  if (!result.success) return res.status(400).json(result);
  res.json(getRCAs());
});

// 7. Teams Management (Editable name and icon/emoji with persistence)
apiRouter.get('/teams', (req, res) => {
  res.json(getTeams());
});

apiRouter.post('/teams', (req, res) => {
  const { nome, emoji } = req.body;
  if (!nome) return res.status(400).json({ error: 'Nome da equipe é obrigatório' });
  const result = addTeam(nome, emoji || '⚡');
  if (!result.success) return res.status(400).json(result);
  res.status(201).json(result);
});

apiRouter.put('/teams/:id', (req, res) => {
  const { id } = req.params;
  const { nome, emoji } = req.body;
  const result = updateTeam(id, { nome, emoji });
  if (!result.success) return res.status(400).json(result);
  res.json(result);
});

apiRouter.delete('/teams/:id', (req, res) => {
  const { id } = req.params;
  const result = removeTeam(id);
  if (!result.success) return res.status(400).json(result);
  res.json(result);
});

apiRouter.post('/teams/reset', (req, res) => {
  const result = resetTeams();
  res.json(result);
});

// Mount router on both /api (standard) and root / (in case Vercel rewrites strip /api)
app.use('/api', apiRouter);
app.use(apiRouter);

export default app;
