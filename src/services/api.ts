import {
  BoardDataResponse,
  CardCreateResult,
  TeamName,
} from '../types';
import { CreateCardPayload } from '../../server/trelloService';

export async function fetchBoardData(refresh = false): Promise<BoardDataResponse> {
  const url = `/api/trello/board-data${refresh ? '?refresh=true' : ''}`;
  const res = await fetch(url);
  if (!res.ok) {
    const data = await res.json().catch(() => ({ error: 'Falha na conexão' }));
    throw new Error(data.error || `Erro HTTP ${res.status}`);
  }
  return res.json();
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
    const err = await res.json().catch(() => ({ error: 'Erro ao criar situação' }));
    throw new Error(err.error || `Erro HTTP ${res.status}`);
  }
  return res.json();
}

export async function updateBoardLabel(id: string, name: string): Promise<{ id: string; name: string }> {
  const res = await fetch(`/api/trello/labels/${encodeURIComponent(id)}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Erro ao renomear situação' }));
    throw new Error(err.error || `Erro HTTP ${res.status}`);
  }
  return res.json();
}

export async function deleteBoardLabel(id: string): Promise<{ success: boolean }> {
  const res = await fetch(`/api/trello/labels/${encodeURIComponent(id)}`, {
    method: 'DELETE',
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Erro ao excluir situação' }));
    throw new Error(err.error || `Erro HTTP ${res.status}`);
  }
  return res.json();
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
