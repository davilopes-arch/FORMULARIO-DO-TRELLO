import express from 'express';
import {
  fetchBoardData,
  createCardWithDetails,
  createBoardLabel,
  updateBoardLabel,
  deleteBoardLabel,
  type CreateCardPayload,
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
  syncWithTrelloCloud,
  type TeamName,
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
    const name = (req.body?.name || req.query?.name || '').toString().trim();
    const color = (req.body?.color || req.query?.color || 'blue').toString();
    if (!name) return res.status(400).json({ error: 'Nome da situação é obrigatório' });
    const label = await createBoardLabel(name, color);
    res.status(201).json(label);
  } catch (error: any) {
    console.error('Error creating label:', error);
    res.status(500).json({ error: error.message || 'Erro ao criar situação' });
  }
});

// 4. Update Label Name (supports PUT, POST, with param or body)
const handleLabelUpdate = async (req: express.Request, res: express.Response) => {
  try {
    const id = (req.params.id || req.body?.id || req.query?.id || '').toString().trim();
    const name = (req.body?.name || req.query?.name || '').toString().trim();
    if (!id) return res.status(400).json({ error: 'ID da situação é obrigatório' });
    if (!name) return res.status(400).json({ error: 'Novo nome é obrigatório' });
    const updated = await updateBoardLabel(id, name);
    res.json(updated);
  } catch (error: any) {
    console.error('Error updating label:', error);
    res.status(500).json({ error: error.message || 'Erro ao renomear situação' });
  }
};

apiRouter.put('/trello/labels/:id', handleLabelUpdate);
apiRouter.put('/trello/labels', handleLabelUpdate);
apiRouter.post('/trello/labels/update', handleLabelUpdate);
apiRouter.post('/trello/labels/:id/update', handleLabelUpdate);

// 5. Delete Label (supports DELETE, POST, with param or body)
const handleLabelDelete = async (req: express.Request, res: express.Response) => {
  try {
    const id = (req.params.id || req.body?.id || req.query?.id || '').toString().trim();
    if (!id) return res.status(400).json({ error: 'ID da situação é obrigatório' });
    const result = await deleteBoardLabel(id);
    res.json(result);
  } catch (error: any) {
    console.error('Error deleting label:', error);
    res.status(500).json({ error: error.message || 'Erro ao excluir situação' });
  }
};

apiRouter.delete('/trello/labels/:id', handleLabelDelete);
apiRouter.delete('/trello/labels', handleLabelDelete);
apiRouter.post('/trello/labels/delete', handleLabelDelete);
apiRouter.post('/trello/labels/:id/delete', handleLabelDelete);

// 6. RCA Management (Persistent across sessions/devices)
apiRouter.get('/rcas', async (req, res) => {
  await syncWithTrelloCloud().catch(() => {});
  res.json(getRCAs());
});

apiRouter.post('/rcas', async (req, res) => {
  const { team, name } = req.body;
  if (!team || !name) return res.status(400).json({ error: 'Equipe e nome são obrigatórios' });
  const result = await addRCA(team as TeamName, name);
  if (!result.success) return res.status(400).json(result);
  res.status(201).json(getRCAs());
});

apiRouter.put('/rcas', async (req, res) => {
  const { team, oldName, newName } = req.body;
  if (!team || !oldName || !newName) {
    return res.status(400).json({ error: 'Equipe, nome antigo e novo nome são obrigatórios' });
  }
  const result = await renameRCA(team as TeamName, oldName, newName);
  if (!result.success) return res.status(400).json(result);
  res.json(getRCAs());
});

apiRouter.delete('/rcas', async (req, res) => {
  const { team, name } = req.body;
  if (!team || !name) return res.status(400).json({ error: 'Equipe e nome são obrigatórios' });
  const result = await removeRCA(team as TeamName, name);
  if (!result.success) return res.status(400).json(result);
  res.json(getRCAs());
});

// 7. Teams Management (Editable name and icon/emoji with persistence)
apiRouter.get('/teams', async (req, res) => {
  await syncWithTrelloCloud().catch(() => {});
  res.json(getTeams());
});

apiRouter.post('/teams', async (req, res) => {
  const { nome, emoji } = req.body;
  if (!nome) return res.status(400).json({ error: 'Nome da equipe é obrigatório' });
  const result = await addTeam(nome, emoji || '⚡');
  if (!result.success) return res.status(400).json(result);
  res.status(201).json(result);
});

const handleTeamUpdate = async (req: express.Request, res: express.Response) => {
  const id = req.params.id || req.body.id;
  const { nome, emoji } = req.body;
  if (!id) return res.status(400).json({ error: 'ID ou nome da equipe é obrigatório' });
  const result = await updateTeam(id, { nome, emoji });
  if (!result.success) return res.status(400).json(result);
  res.json(result);
};

apiRouter.put('/teams/:id', handleTeamUpdate);
apiRouter.put('/teams', handleTeamUpdate);
apiRouter.post('/teams/update', handleTeamUpdate);

const handleTeamDelete = async (req: express.Request, res: express.Response) => {
  const id = req.params.id || req.body.id;
  if (!id) return res.status(400).json({ error: 'ID da equipe é obrigatório' });
  const result = await removeTeam(id);
  if (!result.success) return res.status(400).json(result);
  res.json(result);
};

apiRouter.delete('/teams/:id', handleTeamDelete);
apiRouter.delete('/teams', handleTeamDelete);
apiRouter.post('/teams/delete', handleTeamDelete);

apiRouter.post('/teams/reset', async (req, res) => {
  const result = await resetTeams();
  res.json(result);
});

// Mount router on both /api (standard) and root / (in case Vercel rewrites strip /api)
app.use('/api', apiRouter);
app.use(apiRouter);

export default app;
