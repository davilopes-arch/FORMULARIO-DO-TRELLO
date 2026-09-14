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

// --- CONFIG CARD CLOUD SYNC (TRELLO PERMANENT STORAGE) ---
const CONFIG_CARD_ID = '6aa8433d68d41358727d4b45';

async function fetchPortalConfigFromTrelloDirect(): Promise<{ teams?: TeamInfo[]; rcas?: Record<string, string[]> } | null> {
  try {
    const res = await fetch(
      `https://api.trello.com/1/cards/${CONFIG_CARD_ID}?fields=desc&key=${CLIENT_TRELLO_KEY}&token=${CLIENT_TRELLO_TOKEN}`
    );
    if (res.ok) {
      const card = await res.json();
      if (card?.desc) {
        return JSON.parse(card.desc);
      }
    }
  } catch (err) {
    console.warn('Falha ao ler config card diretamente do Trello:', err);
  }
  return null;
}

async function savePortalConfigToTrelloDirect(data: { teams?: TeamInfo[]; rcas?: Record<string, string[]> }): Promise<boolean> {
  try {
    // Merge with existing local data so we never overwrite other fields
    let teamsData = data.teams;
    if (!teamsData) {
      try {
        const localTeams = localStorage.getItem('cx_teams_data');
        if (localTeams) teamsData = JSON.parse(localTeams);
      } catch {}
    }

    let rcasData = data.rcas;
    if (!rcasData) {
      try {
        const localRcas = localStorage.getItem('cx_rcas_data');
        if (localRcas) rcasData = JSON.parse(localRcas);
      } catch {}
    }

    const payload = {
      teams: teamsData,
      rcas: rcasData,
      lastUpdated: new Date().toISOString(),
    };

    const res = await fetch(
      `https://api.trello.com/1/cards/${CONFIG_CARD_ID}?key=${CLIENT_TRELLO_KEY}&token=${CLIENT_TRELLO_TOKEN}`,
      {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ desc: JSON.stringify(payload, null, 2) }),
      }
    );
    return res.ok;
  } catch (err) {
    console.warn('Falha ao salvar config card diretamente no Trello:', err);
    return false;
  }
}

export async function fetchRCAs(): Promise<Record<TeamName, string[]>> {
  // 1. Tenta pelo backend proxy
  try {
    const res = await fetch('/api/rcas');
    if (res.ok) {
      const data = await res.json();
      if (data && typeof data === 'object' && Object.keys(data).length > 0) {
        return data;
      }
    }
  } catch {}

  // 2. Tenta diretamente no card do Trello
  const cloud = await fetchPortalConfigFromTrelloDirect();
  if (cloud?.rcas && Object.keys(cloud.rcas).length > 0) {
    return cloud.rcas;
  }

  // 3. Fallback do localStorage
  try {
    const raw = localStorage.getItem('cx_rcas_data');
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === 'object') return parsed;
    }
  } catch {}

  throw new Error('Falha ao carregar lista de consultores');
}

export async function addRCAApi(team: TeamName, name: string): Promise<Record<TeamName, string[]>> {
  const cleanName = name.trim().toUpperCase();

  // Obter estado atual do localStorage
  let current: Record<string, string[]> = {};
  try {
    const raw = localStorage.getItem('cx_rcas_data');
    if (raw) current = JSON.parse(raw);
  } catch {}

  const key = Object.keys(current).find((k) => k.toLowerCase() === team.trim().toLowerCase()) || team.trim();
  const list = current[key] ? [...current[key]] : [];
  if (!list.includes(cleanName)) {
    list.push(cleanName);
    list.sort();
  }
  current[key] = list;
  localStorage.setItem('cx_rcas_data', JSON.stringify(current));

  // 1. Tenta POST /api/rcas
  try {
    const res = await fetch('/api/rcas', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ team, name: cleanName }),
    });
    if (res.ok) {
      const data = await res.json();
      savePortalConfigToTrelloDirect({ rcas: data }).catch(() => {});
      return data;
    }
  } catch {}

  // 2. Tenta POST /api/rcas/add
  try {
    const resAdd = await fetch('/api/rcas/add', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ team, name: cleanName }),
    });
    if (resAdd.ok) {
      const data = await resAdd.json();
      savePortalConfigToTrelloDirect({ rcas: data }).catch(() => {});
      return data;
    }
  } catch {}

  // 3. Sincroniza diretamente com o Trello Cloud
  await savePortalConfigToTrelloDirect({ rcas: current });
  return current;
}

export async function renameRCAApi(team: TeamName, oldName: string, newName: string): Promise<Record<TeamName, string[]>> {
  const cleanOld = oldName.trim().toUpperCase();
  const cleanNew = newName.trim().toUpperCase();

  let current: Record<string, string[]> = {};
  try {
    const raw = localStorage.getItem('cx_rcas_data');
    if (raw) current = JSON.parse(raw);
  } catch {}

  const key = Object.keys(current).find((k) => k.toLowerCase() === team.trim().toLowerCase()) || team.trim();
  const list = (current[key] || []).map((n) => (n.trim().toUpperCase() === cleanOld ? cleanNew : n));
  list.sort();
  current[key] = list;
  localStorage.setItem('cx_rcas_data', JSON.stringify(current));

  // 1. Tenta PUT /api/rcas
  try {
    const res = await fetch('/api/rcas', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ team, oldName: cleanOld, newName: cleanNew }),
    });
    if (res.ok) {
      const data = await res.json();
      savePortalConfigToTrelloDirect({ rcas: data }).catch(() => {});
      return data;
    }
  } catch {}

  // 2. Tenta POST /api/rcas/rename
  try {
    const resRename = await fetch('/api/rcas/rename', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ team, oldName: cleanOld, newName: cleanNew }),
    });
    if (resRename.ok) {
      const data = await resRename.json();
      savePortalConfigToTrelloDirect({ rcas: data }).catch(() => {});
      return data;
    }
  } catch {}

  // 3. Sincroniza diretamente com o Trello Cloud
  await savePortalConfigToTrelloDirect({ rcas: current });
  return current;
}

export async function removeRCAApi(team: TeamName, name: string): Promise<Record<TeamName, string[]>> {
  const cleanTarget = name.trim().toUpperCase();

  let current: Record<string, string[]> = {};
  try {
    const raw = localStorage.getItem('cx_rcas_data');
    if (raw) current = JSON.parse(raw);
  } catch {}

  const key = Object.keys(current).find((k) => k.toLowerCase() === team.trim().toLowerCase()) || team.trim();
  const list = (current[key] || []).filter((n) => n.trim().toUpperCase() !== cleanTarget);
  current[key] = list;
  localStorage.setItem('cx_rcas_data', JSON.stringify(current));

  // 1. Tenta DELETE /api/rcas
  try {
    const res = await fetch('/api/rcas', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ team, name: cleanTarget }),
    });
    if (res.ok) {
      const data = await res.json();
      savePortalConfigToTrelloDirect({ rcas: data }).catch(() => {});
      return data;
    }
  } catch {}

  // 2. Tenta POST /api/rcas/delete
  try {
    const resDelete = await fetch('/api/rcas/delete', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ team, name: cleanTarget }),
    });
    if (resDelete.ok) {
      const data = await resDelete.json();
      savePortalConfigToTrelloDirect({ rcas: data }).catch(() => {});
      return data;
    }
  } catch {}

  // 3. Sincroniza diretamente com o Trello Cloud
  await savePortalConfigToTrelloDirect({ rcas: current });
  return current;
}

// Teams API
export async function fetchTeams(): Promise<TeamInfo[]> {
  // 1. Tenta backend proxy
  try {
    const res = await fetch('/api/teams');
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        return data;
      }
    }
  } catch {}

  // 2. Tenta diretamente no card do Trello
  const cloud = await fetchPortalConfigFromTrelloDirect();
  if (Array.isArray(cloud?.teams) && cloud.teams.length > 0) {
    return cloud.teams;
  }

  // 3. Fallback do localStorage
  try {
    const raw = localStorage.getItem('cx_teams_data');
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch {}

  throw new Error('Falha ao carregar equipes');
}

export async function addTeamApi(
  nome: string,
  emoji: string
): Promise<{ teams: TeamInfo[]; rcas: Record<string, string[]> }> {
  // 1. Tenta POST /api/teams
  try {
    const res = await fetch('/api/teams', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nome, emoji }),
    });
    if (res.ok) {
      const data = await res.json();
      savePortalConfigToTrelloDirect(data).catch(() => {});
      return data;
    }
  } catch {}

  // 2. Fallback direto no client
  let teams: TeamInfo[] = [];
  try {
    const raw = localStorage.getItem('cx_teams_data');
    if (raw) teams = JSON.parse(raw);
  } catch {}
  let rcas: Record<string, string[]> = {};
  try {
    const rawR = localStorage.getItem('cx_rcas_data');
    if (rawR) rcas = JSON.parse(rawR);
  } catch {}

  const cleanName = nome.trim();
  const id = cleanName.toLowerCase().replace(/[^a-z0-9]/g, '') + '_' + Date.now().toString(36);
  teams.push({ id, nome: cleanName, emoji: emoji || '⚡' });
  if (!rcas[cleanName]) rcas[cleanName] = [];

  localStorage.setItem('cx_teams_data', JSON.stringify(teams));
  localStorage.setItem('cx_rcas_data', JSON.stringify(rcas));
  await savePortalConfigToTrelloDirect({ teams, rcas });

  return { teams, rcas };
}

export async function updateTeamApi(
  id: string,
  updates: { nome?: string; emoji?: string }
): Promise<{ teams: TeamInfo[]; rcas: Record<string, string[]> }> {
  // 1. Tenta PUT /api/teams/:id
  try {
    const res = await fetch(`/api/teams/${encodeURIComponent(id)}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...updates, id }),
    });
    if (res.ok) {
      const data = await res.json();
      savePortalConfigToTrelloDirect(data).catch(() => {});
      return data;
    }
  } catch {}

  // 2. Tenta POST /api/teams/update
  try {
    const resFallback = await fetch('/api/teams/update', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, ...updates }),
    });
    if (resFallback.ok) {
      const data = await resFallback.json();
      savePortalConfigToTrelloDirect(data).catch(() => {});
      return data;
    }
  } catch {}

  // 3. Fallback direto no client
  let teams: TeamInfo[] = [];
  try {
    const raw = localStorage.getItem('cx_teams_data');
    if (raw) teams = JSON.parse(raw);
  } catch {}
  let rcas: Record<string, string[]> = {};
  try {
    const rawR = localStorage.getItem('cx_rcas_data');
    if (rawR) rcas = JSON.parse(rawR);
  } catch {}

  const idx = teams.findIndex((t) => t.id === id || t.nome.toLowerCase() === id.toLowerCase());
  if (idx !== -1) {
    const oldName = teams[idx].nome;
    const newName = updates.nome?.trim() || oldName;
    teams[idx] = {
      ...teams[idx],
      nome: newName,
      emoji: updates.emoji?.trim() || teams[idx].emoji,
    };
    if (oldName !== newName && rcas[oldName]) {
      rcas[newName] = rcas[oldName];
      delete rcas[oldName];
    }
  }

  localStorage.setItem('cx_teams_data', JSON.stringify(teams));
  localStorage.setItem('cx_rcas_data', JSON.stringify(rcas));
  await savePortalConfigToTrelloDirect({ teams, rcas });

  return { teams, rcas };
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
      const data = await res.json();
      savePortalConfigToTrelloDirect(data).catch(() => {});
      return data;
    }
  } catch {}

  try {
    const resFallback = await fetch('/api/teams/delete', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    });
    if (resFallback.ok) {
      const data = await resFallback.json();
      savePortalConfigToTrelloDirect(data).catch(() => {});
      return data;
    }
  } catch {}

  // Fallback client
  let teams: TeamInfo[] = [];
  try {
    const raw = localStorage.getItem('cx_teams_data');
    if (raw) teams = JSON.parse(raw);
  } catch {}
  let rcas: Record<string, string[]> = {};
  try {
    const rawR = localStorage.getItem('cx_rcas_data');
    if (rawR) rcas = JSON.parse(rawR);
  } catch {}

  teams = teams.filter((t) => t.id !== id && t.nome.toLowerCase() !== id.toLowerCase());
  localStorage.setItem('cx_teams_data', JSON.stringify(teams));
  await savePortalConfigToTrelloDirect({ teams, rcas });

  return { teams, rcas };
}

export async function resetTeamsApi(): Promise<{ teams: TeamInfo[]; rcas: Record<string, string[]> }> {
  try {
    const res = await fetch('/api/teams/reset', {
      method: 'POST',
    });
    if (res.ok) {
      const data = await res.json();
      savePortalConfigToTrelloDirect(data).catch(() => {});
      return data;
    }
  } catch {}

  return { teams: [], rcas: {} };
}
