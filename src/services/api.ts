import {
  BoardDataResponse,
  CardCreateResult,
  TeamInfo,
  TeamName,
} from '../types';
import { CreateCardPayload } from '../../server/trelloService';
import { FALLBACK_BOARD_DATA } from '../data/defaultBoardData';

export async function fetchBoardData(refresh = false): Promise<BoardDataResponse> {
  const url = `/api/trello/board-data${refresh ? '?refresh=true' : ''}`;
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 12000);

    const res = await fetch(url, { signal: controller.signal });
    clearTimeout(timeoutId);

    if (!res.ok) {
      const data = await res.json().catch(() => ({ error: 'Falha na conexão' }));
      console.warn('Erro ao obter board-data da API, utilizando dados em cache local:', data);
      return FALLBACK_BOARD_DATA;
    }
    const json = await res.json();
    if (json && json.lists && json.lists.length > 0) {
      return json;
    }
    return FALLBACK_BOARD_DATA;
  } catch (err: any) {
    console.warn('Fetch board-data falhou ou excedeu o tempo limite. Usando fallback offline:', err);
    return FALLBACK_BOARD_DATA;
  }
}

export async function createTrelloCard(payload: CreateCardPayload): Promise<CardCreateResult> {
  const res = await fetch('/api/trello/cards', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const errData = await res.json().catch(() => ({ error: 'Erro ao criar card' }));
    throw new Error(errData.error || `Erro HTTP ${res.status}`);
  }
  return res.json();
}

export async function createBoardLabel(name: string, color = 'blue'): Promise<{ id: string; name: string; color: string }> {
  const res = await fetch('/api/trello/labels', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, color }),
  });
  if (!res.ok) {
    const errorText = await res.text().catch(() => '');
    let errMsg = 'Erro ao criar situação';
    try {
      const errJson = JSON.parse(errorText);
      errMsg = errJson.error || errJson.message || errMsg;
    } catch {
      if (errorText) errMsg = errorText;
    }
    throw new Error(errMsg);
  }
  return res.json();
}

export async function updateBoardLabel(id: string, name: string): Promise<{ id: string; name: string }> {
  // 1. Try PUT /api/trello/labels/:id first
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

  // 2. Fallback to POST /api/trello/labels/update
  const resFallback = await fetch('/api/trello/labels/update', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id, name }),
  });

  if (!resFallback.ok) {
    const errorText = await resFallback.text().catch(() => '');
    let errMsg = 'Erro ao renomear situação';
    try {
      const errJson = JSON.parse(errorText);
      errMsg = errJson.error || errJson.message || errMsg;
    } catch {
      if (errorText) errMsg = errorText;
    }
    throw new Error(errMsg);
  }
  return resFallback.json();
}

export async function deleteBoardLabel(id: string): Promise<{ success: boolean }> {
  // 1. Try DELETE /api/trello/labels/:id first
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

  // 2. Fallback to POST /api/trello/labels/delete
  const resFallback = await fetch('/api/trello/labels/delete', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id }),
  });

  if (!resFallback.ok) {
    const errorText = await resFallback.text().catch(() => '');
    let errMsg = 'Erro ao excluir situação';
    try {
      const errJson = JSON.parse(errorText);
      errMsg = errJson.error || errJson.message || errMsg;
    } catch {
      if (errorText) errMsg = errorText;
    }
    throw new Error(errMsg);
  }
  return resFallback.json();
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
