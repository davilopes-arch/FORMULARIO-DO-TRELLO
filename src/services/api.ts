import {
  BoardDataResponse,
  CardCreateResult,
  TeamInfo,
  TeamName,
} from '../types';
import { CreateCardPayload } from '../../server/trelloService';
import { FALLBACK_BOARD_DATA } from '../data/defaultBoardData';

const CLIENT_TRELLO_KEY = 'c9c79cf6c41d3521bd7a8d79f2dec202';
const CLIENT_TRELLO_TOKEN = 'ATTA631fc95a87a351811e61eac1864c866dc5dfc5c8b8af5deb3c90848cc7ee9b0727C80483';
const CLIENT_BOARD_ID = '1ongu3oT';

async function fetchBoardDataDirectly(): Promise<BoardDataResponse> {
  const [boardRes, listsRes, labelsRes, cfRes] = await Promise.all([
    fetch(`https://api.trello.com/1/boards/${CLIENT_BOARD_ID}?fields=name&key=${CLIENT_TRELLO_KEY}&token=${CLIENT_TRELLO_TOKEN}`),
    fetch(`https://api.trello.com/1/boards/${CLIENT_BOARD_ID}/lists?filter=open&fields=id,name&key=${CLIENT_TRELLO_KEY}&token=${CLIENT_TRELLO_TOKEN}`),
    fetch(`https://api.trello.com/1/boards/${CLIENT_BOARD_ID}/labels?fields=id,name,color&limit=100&key=${CLIENT_TRELLO_KEY}&token=${CLIENT_TRELLO_TOKEN}`),
    fetch(`https://api.trello.com/1/boards/${CLIENT_BOARD_ID}/customFields?key=${CLIENT_TRELLO_KEY}&token=${CLIENT_TRELLO_TOKEN}`),
  ]);

  const [board, lists, labels, customFields] = await Promise.all([
    boardRes.json(),
    listsRes.json(),
    labelsRes.json(),
    cfRes.json(),
  ]);

  const normalize = (s: string) =>
    s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toUpperCase().trim();

  const afList = Array.isArray(lists) ? lists.find((l: any) => normalize(l.name).includes('FAZER')) || lists[0] : null;
  const freteList = Array.isArray(lists) ? lists.find((l: any) => normalize(l.name).includes('FRETE')) || afList : null;
  const cadList = Array.isArray(lists) ? lists.find((l: any) => {
    const n = normalize(l.name);
    return n === 'CADASTRO' || n.startsWith('CADASTRO') || n.includes('CADASTRO');
  }) || afList : null;

  const cfMap: Record<string, string> = {};
  if (Array.isArray(customFields)) {
    for (const cf of customFields) {
      if (cf && cf.name && cf.id) {
        cfMap[cf.name.trim().toUpperCase()] = cf.id;
      }
    }
  }

  return {
    boardName: board?.name || 'CADASTRO / DEMANDAS CX',
    lists: Array.isArray(lists) ? lists : [],
    labels: Array.isArray(labels) ? labels : [],
    customFields: cfMap,
    defaultListDemandasId: afList ? afList.id : '',
    defaultListFreteId: freteList ? freteList.id : '',
    defaultListCadastroId: cadList ? cadList.id : '',
  };
}

export async function fetchBoardData(refresh = false): Promise<BoardDataResponse> {
  const url = `/api/trello/board-data${refresh ? '?refresh=true' : ''}`;
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000);

    const res = await fetch(url, { signal: controller.signal });
    clearTimeout(timeoutId);

    if (res.ok) {
      const json = await res.json();
      if (json && json.lists && json.lists.length > 0) {
        return json;
      }
    }
  } catch (err: any) {
    console.warn('Fetch board-data via proxy falhou:', err);
  }

  // Fallback 1: Buscar diretamente da API do Trello
  try {
    const directData = await fetchBoardDataDirectly();
    if (directData && directData.labels && directData.labels.length > 0) {
      return directData;
    }
  } catch (directErr) {
    console.warn('Fetch direto do Trello falhou:', directErr);
  }

  // Fallback 2: Dados locais estáticos
  return FALLBACK_BOARD_DATA;
}

export async function createTrelloCard(payload: CreateCardPayload): Promise<CardCreateResult> {
  try {
    const res = await fetch('/api/trello/cards', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (res.ok) {
      return await res.json();
    }
    const errData = await res.json().catch(() => ({}));
    if (res.status < 500 && errData.error) {
      throw new Error(errData.error);
    }
  } catch (proxyErr: any) {
    if (proxyErr.message && !proxyErr.message.includes('FUNCTION_INVOCATION_FAILED') && !proxyErr.message.includes('500') && !proxyErr.message.includes('Failed to fetch')) {
      throw proxyErr;
    }
  }

  // Fallback direto: Criar card diretamente no Trello
  const board = await fetchBoardData();
  let targetListId = payload.idList;
  if (!targetListId) {
    if (payload.type === 'frete') targetListId = board.defaultListFreteId;
    else if (payload.type === 'cadastro') targetListId = board.defaultListCadastroId;
    else targetListId = board.defaultListDemandasId;
  }

  const cardParams = new URLSearchParams({
    key: CLIENT_TRELLO_KEY,
    token: CLIENT_TRELLO_TOKEN,
    idList: targetListId || board.lists[0]?.id || '',
    name: payload.name,
    desc: payload.desc,
    pos: 'bottom',
  });
  if (payload.idLabels && payload.idLabels.length > 0) {
    cardParams.set('idLabels', payload.idLabels.join(','));
  }

  const directRes = await fetch('https://api.trello.com/1/cards', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: cardParams.toString(),
  });

  if (!directRes.ok) {
    const errTxt = await directRes.text().catch(() => '');
    throw new Error(`Erro ao criar card no Trello: ${errTxt || directRes.status}`);
  }

  const createdCard = await directRes.json();
  return {
    success: true,
    cardId: createdCard.id,
    url: createdCard.url,
    shortUrl: createdCard.shortUrl,
  };
}

export async function createBoardLabel(name: string, color = 'blue'): Promise<{ id: string; name: string; color: string }> {
  // 1. Tenta pelo backend proxy
  try {
    const res = await fetch('/api/trello/labels', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, color }),
    });
    if (res.ok) {
      return await res.json();
    }
  } catch {}

  // 2. Fallback direto no Trello
  try {
    const trelloUrl = `https://api.trello.com/1/boards/${CLIENT_BOARD_ID}/labels?key=${CLIENT_TRELLO_KEY}&token=${CLIENT_TRELLO_TOKEN}&name=${encodeURIComponent(name)}&color=${encodeURIComponent(color)}`;
    const directRes = await fetch(trelloUrl, { method: 'POST' });
    if (directRes.ok) {
      return await directRes.json();
    }
    const txt = await directRes.text().catch(() => '');
    throw new Error(`Trello: ${txt || directRes.status}`);
  } catch (directErr: any) {
    throw new Error(directErr.message || 'Erro ao criar situação');
  }
}

export async function updateBoardLabel(id: string, name: string): Promise<{ id: string; name: string }> {
  // 1. Tenta PUT /api/trello/labels/:id
  try {
    const res = await fetch(`/api/trello/labels/${encodeURIComponent(id)}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, id }),
    });
    if (res.ok) {
      return await res.json();
    }
  } catch {}

  // 2. Tenta POST /api/trello/labels/update
  try {
    const resFallback = await fetch('/api/trello/labels/update', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, name }),
    });
    if (resFallback.ok) {
      return await resFallback.json();
    }
  } catch {}

  // 3. Fallback direto no Trello
  try {
    const trelloUrl = `https://api.trello.com/1/labels/${encodeURIComponent(id)}?key=${CLIENT_TRELLO_KEY}&token=${CLIENT_TRELLO_TOKEN}&name=${encodeURIComponent(name)}`;
    const directRes = await fetch(trelloUrl, { method: 'PUT' });
    if (directRes.ok) {
      return await directRes.json();
    }
    const txt = await directRes.text().catch(() => '');
    throw new Error(`Trello: ${txt || directRes.status}`);
  } catch (directErr: any) {
    throw new Error(directErr.message || 'Erro ao renomear situação');
  }
}

export async function deleteBoardLabel(id: string): Promise<{ success: boolean }> {
  // 1. Tenta DELETE /api/trello/labels/:id
  try {
    const res = await fetch(`/api/trello/labels/${encodeURIComponent(id)}`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    });
    if (res.ok) {
      return await res.json();
    }
  } catch {}

  // 2. Tenta POST /api/trello/labels/delete
  try {
    const resFallback = await fetch('/api/trello/labels/delete', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    });
    if (resFallback.ok) {
      return await resFallback.json();
    }
  } catch {}

  // 3. Fallback direto na API do Trello (bypassa FUNCTION_INVOCATION_FAILED da Vercel)
  try {
    const trelloUrl = `https://api.trello.com/1/labels/${encodeURIComponent(id)}?key=${CLIENT_TRELLO_KEY}&token=${CLIENT_TRELLO_TOKEN}`;
    const directRes = await fetch(trelloUrl, { method: 'DELETE' });
    if (directRes.ok) {
      return { success: true };
    }
    const txt = await directRes.text().catch(() => '');
    throw new Error(`Trello: ${txt || directRes.status}`);
  } catch (directErr: any) {
    throw new Error(directErr.message || 'Erro ao excluir situação');
  }
}

export async function fetchRCAs(): Promise<Record<TeamName, string[]>> {
  const res = await fetch('/api/rcas');
  if (!res.ok) {
    throw new Error('Falha ao carregar lista de consultores');
  }
  return res.json();
}

export async function addRCAApi(team: TeamName, name: string): Promise<Record<TeamName, string[]>> {
  const res = await fetch('/api/rcas', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ team, name }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Erro ao adicionar consultor' }));
    throw new Error(err.error || `Erro HTTP ${res.status}`);
  }
  return res.json();
}

export async function renameRCAApi(team: TeamName, oldName: string, newName: string): Promise<Record<TeamName, string[]>> {
  const res = await fetch('/api/rcas', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ team, oldName, newName }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Erro ao renomear consultor' }));
    throw new Error(err.error || `Erro HTTP ${res.status}`);
  }
  return res.json();
}

export async function removeRCAApi(team: TeamName, name: string): Promise<Record<TeamName, string[]>> {
  const res = await fetch('/api/rcas', {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ team, name }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Erro ao remover consultor' }));
    throw new Error(err.error || `Erro HTTP ${res.status}`);
  }
  return res.json();
}

// Teams API
export async function fetchTeams(): Promise<TeamInfo[]> {
  const res = await fetch('/api/teams');
  if (!res.ok) {
    throw new Error('Falha ao carregar equipes');
  }
  return res.json();
}

export async function addTeamApi(
  nome: string,
  emoji: string
): Promise<{ teams: TeamInfo[]; rcas: Record<string, string[]> }> {
  const res = await fetch('/api/teams', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ nome, emoji }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Erro ao criar equipe no servidor' }));
    throw new Error(err.error || `Erro HTTP ${res.status}`);
  }
  return res.json();
}

export async function updateTeamApi(
  id: string,
  updates: { nome?: string; emoji?: string }
): Promise<{ teams: TeamInfo[]; rcas: Record<string, string[]> }> {
  // Try PUT /api/teams/:id first
  try {
    const res = await fetch(`/api/teams/${encodeURIComponent(id)}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...updates, id }),
    });
    if (res.ok) {
      return await res.json();
    }
  } catch {}

  // Fallback to POST /api/teams/update
  const resFallback = await fetch('/api/teams/update', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id, ...updates }),
  });
  if (!resFallback.ok) {
    const err = await resFallback.json().catch(() => ({ error: 'Erro ao atualizar equipe no servidor' }));
    throw new Error(err.error || `Erro HTTP ${resFallback.status}`);
  }
  return resFallback.json();
}

export async function deleteTeamApi(
  id: string
): Promise<{ teams: TeamInfo[]; rcas: Record<string, string[]> }> {
  try {
    const res = await fetch(`/api/teams/${encodeURIComponent(id)}`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    });
    if (res.ok) {
      return await res.json();
    }
  } catch {}

  const resFallback = await fetch('/api/teams/delete', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id }),
  });
  if (!resFallback.ok) {
    const err = await resFallback.json().catch(() => ({ error: 'Erro ao remover equipe no servidor' }));
    throw new Error(err.error || `Erro HTTP ${resFallback.status}`);
  }
  return resFallback.json();
}

export async function resetTeamsApi(): Promise<{ teams: TeamInfo[]; rcas: Record<string, string[]> }> {
  const res = await fetch('/api/teams/reset', {
    method: 'POST',
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Erro ao restaurar equipes padrão no servidor' }));
    throw new Error(err.error || `Erro HTTP ${res.status}`);
  }
  return res.json();
}
