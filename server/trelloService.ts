export interface BoardCachedData {
  boardName: string;
  lists: { id: string; name: string }[];
  labels: { id: string; name: string; color: string }[];
  customFields: Record<string, string>; // UPPERCASE_NAME -> ID
  defaultListDemandasId: string;
  defaultListFreteId: string;
  defaultListCadastroId: string;
  timestamp: number;
}

const TRELLO_KEY = process.env.TRELLO_API_KEY || 'c9c79cf6c41d3521bd7a8d79f2dec202';
const TRELLO_TOKEN = process.env.TRELLO_TOKEN || 'ATTA631fc95a87a351811e61eac1864c866dc5dfc5c8b8af5deb3c90848cc7ee9b0727C80483';
const BOARD_ID = process.env.TRELLO_BOARD_ID || '1ongu3oT';
const API_BASE = 'https://api.trello.com/1';

let cachedBoardData: BoardCachedData | null = null;
const CACHE_TTL_MS = 60 * 1000; // 1 minute cache

function buildUrl(endpoint: string, params: Record<string, string> = {}): string {
  const url = new URL(`${API_BASE}${endpoint}`);
  url.searchParams.set('key', TRELLO_KEY);
  url.searchParams.set('token', TRELLO_TOKEN);
  for (const [k, v] of Object.entries(params)) {
    if (v !== undefined && v !== null) {
      url.searchParams.set(k, String(v));
    }
  }
  return url.toString();
}

async function trelloFetch<T>(endpoint: string, options: RequestInit = {}, params: Record<string, string> = {}): Promise<T> {
  const url = buildUrl(endpoint, params);
  const response = await fetch(url, {
    ...options,
    headers: {
      ...options.headers,
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Trello API error (${response.status}): ${errorText}`);
  }

  // Handle empty responses
  const contentType = response.headers.get('content-type');
  if (contentType && contentType.includes('application/json')) {
    return response.json() as Promise<T>;
  }
  return {} as T;
}

export async function fetchBoardData(forceRefresh = false): Promise<BoardCachedData> {
  const now = Date.now();
  if (!forceRefresh && cachedBoardData && (now - cachedBoardData.timestamp < CACHE_TTL_MS)) {
    return cachedBoardData;
  }

  try {
    const [boardInfo, lists, labels, customFields] = await Promise.all([
      trelloFetch<{ name: string }>(`/boards/${BOARD_ID}`, {}, { fields: 'name' }),
      trelloFetch<{ id: string; name: string }[]>(`/boards/${BOARD_ID}/lists`, {}, { filter: 'open', fields: 'id,name' }),
      trelloFetch<{ id: string; name: string; color: string }[]>(`/boards/${BOARD_ID}/labels`, {}, { fields: 'id,name,color', limit: '100' }),
      trelloFetch<{ id: string; name: string; type: string }[]>(`/boards/${BOARD_ID}/customFields`),
    ]);

    const normalize = (s: string) =>
      s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toUpperCase().trim();

    // Locate default lists
    const afList = lists.find((l) => normalize(l.name).includes('FAZER')) || lists[0];
    const freteList = lists.find((l) => normalize(l.name).includes('FRETE')) || afList;
    const cadList = lists.find((l) => {
      const n = normalize(l.name);
      return n === 'CADASTRO' || n.startsWith('CADASTRO') || n.includes('CADASTRO');
    }) || afList;

    const cfMap: Record<string, string> = {};
    for (const cf of customFields) {
      cfMap[cf.name.toUpperCase()] = cf.id;
      // also stripped version without accents
      cfMap[normalize(cf.name)] = cf.id;
    }

    cachedBoardData = {
      boardName: boardInfo?.name || 'Trello CX',
      lists: lists || [],
      labels: (labels || []).filter((l) => Boolean(l.name)),
      customFields: cfMap,
      defaultListDemandasId: afList?.id || '',
      defaultListFreteId: freteList?.id || afList?.id || '',
      defaultListCadastroId: cadList?.id || afList?.id || '',
      timestamp: now,
    };

    return cachedBoardData;
  } catch (error) {
    if (cachedBoardData) {
      return cachedBoardData;
    }
    throw error;
  }
}

export function invalidateBoardCache() {
  cachedBoardData = null;
}

export interface CreateCardPayload {
  type: 'demandas' | 'frete' | 'cadastro';
  name: string;
  desc: string;
  idList?: string;
  idLabels?: string[];
  customFields?: Record<string, string | number | undefined>;
  userEmail?: string;
  attachments?: { name: string; dataUrl: string }[];
}

export async function createCardWithDetails(payload: CreateCardPayload) {
  const boardData = await fetchBoardData();

  // Determine list ID
  let targetListId = payload.idList;
  if (!targetListId) {
    if (payload.type === 'frete') targetListId = boardData.defaultListFreteId;
    else if (payload.type === 'cadastro') targetListId = boardData.defaultListCadastroId;
    else targetListId = boardData.defaultListDemandasId;
  }

  // 1. Create the Card
  const cardUrlParams = new URLSearchParams({
    idList: targetListId,
    name: payload.name,
    desc: payload.desc,
    pos: 'bottom',
  });

  if (payload.idLabels && payload.idLabels.length > 0) {
    cardUrlParams.set('idLabels', payload.idLabels.join(','));
  }

  const newCard = await trelloFetch<{ id: string; url: string; shortUrl: string }>(
    '/cards',
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: cardUrlParams.toString(),
    }
  );

  const warnings: string[] = [];

  // 2. Set Custom Fields (in parallel)
  if (payload.customFields) {
    const cfEntries = Object.entries(payload.customFields).filter(([_, val]) => val !== undefined && val !== '');
    
    await Promise.allSettled(
      cfEntries.map(async ([fieldName, val]) => {
        const normName = fieldName.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toUpperCase().trim();
        const cfId =
          boardData.customFields[fieldName.toUpperCase()] ||
          boardData.customFields[normName] ||
          Object.entries(boardData.customFields).find(([k]) => k.includes(normName.split(' ')[0]))?.[1];

        if (!cfId) {
          return;
        }

        try {
          await trelloFetch(
            `/cards/${newCard.id}/customField/${cfId}/item`,
            {
              method: 'PUT',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({ value: { text: String(val) } }),
            }
          );
        } catch (err: any) {
          warnings.push(`Custom field '${fieldName}': ${err.message}`);
        }
      })
    );
  }

  // 3. Post attribution comment
  if (payload.userEmail) {
    try {
      const typeLabel =
        payload.type === 'frete'
          ? '🚚 Solicitação de frete'
          : payload.type === 'cadastro'
          ? '📋 Solicitação de cadastro'
          : '📌 Demanda';

      await trelloFetch(
        `/cards/${newCard.id}/actions/comments`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: new URLSearchParams({
            text: `📝 *${typeLabel} criada via Portal por:* ${payload.userEmail}`,
          }).toString(),
        }
      );
    } catch (err: any) {
      warnings.push(`Comment attribution: ${err.message}`);
    }
  }

  // 4. Upload Attachments (using native FormData & base64 buffer)
  if (payload.attachments && payload.attachments.length > 0) {
    for (const att of payload.attachments) {
      try {
        // Parse base64 dataUrl: data:image/png;base64,...
        const match = att.dataUrl.match(/^data:([^;]+);base64,(.+)$/);
        if (!match) continue;

        const mimeType = match[1];
        const base64Data = match[2];
        const buffer = Buffer.from(base64Data, 'base64');
        const blob = new Blob([buffer], { type: mimeType });

        const formData = new FormData();
        formData.append('file', blob, att.name || 'anexo.png');
        formData.append('key', TRELLO_KEY);
        formData.append('token', TRELLO_TOKEN);

        const uploadUrl = new URL(`${API_BASE}/cards/${newCard.id}/attachments`);
        const resp = await fetch(uploadUrl.toString(), {
          method: 'POST',
          body: formData,
        });

        if (!resp.ok) {
          const errTxt = await resp.text();
          warnings.push(`Attachment '${att.name}': ${errTxt}`);
        }
      } catch (err: any) {
        warnings.push(`Attachment '${att.name}': ${err.message}`);
      }
    }
  }

  return {
    success: true,
    cardId: newCard.id,
    url: newCard.url,
    shortUrl: newCard.shortUrl || newCard.url,
    warnings: warnings.length > 0 ? warnings : undefined,
  };
}

export async function createBoardLabel(name: string, color = 'blue') {
  const res = await trelloFetch<{ id: string; name: string; color: string }>(
    `/boards/${BOARD_ID}/labels`,
    {
      method: 'POST',
    },
    {
      name,
      color,
    }
  );
  invalidateBoardCache();
  return res;
}

export async function updateBoardLabel(id: string, name: string) {
  const res = await trelloFetch<{ id: string; name: string }>(
    `/labels/${id}/name`,
    {
      method: 'PUT',
    },
    {
      value: name,
    }
  );
  invalidateBoardCache();
  return res;
}

export async function deleteBoardLabel(id: string) {
  await trelloFetch(`/labels/${id}`, {
    method: 'DELETE',
  });
  invalidateBoardCache();
  return { success: true };
}
