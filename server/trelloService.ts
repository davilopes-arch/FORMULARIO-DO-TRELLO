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

const TRELLO_KEY = process.env.TRELLO_API_KEY || process.env.CHAVE_API_DO_TRELLO || 'c9c79cf6c41d3521bd7a8d79f2dec202';
const TRELLO_TOKEN = process.env.TRELLO_TOKEN || 'ATTA631fc95a87a351811e61eac1864c866dc5dfc5c8b8af5deb3c90848cc7ee9b0727C80483';
const BOARD_ID = process.env.TRELLO_BOARD_ID || process.env.ID_DO_QUADRO_DO_TRELLO || '1ongu3oT';
const API_BASE = 'https://api.trello.com/1';

let cachedBoardData: BoardCachedData | null = {
  boardName: "CADASTRO / DEMANDAS CX/PRODUÇÃO/EXPEDIÇÃO E LOGÍSTICA",
  lists: [
    { id: "69a19f10189e922c7c409ea2", name: "CADASTRO" },
    { id: "69d6aad559189b3b6508c812", name: "SOLICITAÇÃO DE FRETE." },
    { id: "69713bd2d3693600213b526a", name: "EXEMPLOS" },
    { id: "69713ab76e8771706acf7a47", name: "A FAZER" },
    { id: "69713ab76e8771706acf7a48", name: "EM ANDAMENTO" },
    { id: "6a2c6d7abbffa60db0b540cf", name: "CONCLUÍDO 🎉" }
  ],
  labels: [
    { id: "698b70263b0f4d15184b3548", name: "CADASTROS", color: "yellow_dark" },
    { id: "6978cee0100dc54ae9f73a85", name: "Farol 🗼", color: "sky_light" },
    { id: "6978d74174e713b2a7ad1354", name: "Cactus 🌵", color: "lime_light" },
    { id: "6978d76aafa3e117205ea934", name: "Girassol 🌻", color: "orange_light" },
    { id: "6978d75e71a73fe83d738ece", name: "Raio ⚡", color: "yellow_light" },
    { id: "6978d77cfcb3c65ca8d5370f", name: "Clareou 🌅", color: "purple_light" },
    { id: "69d7be9501d64d67ac3e55a0", name: "FRETE 🚚", color: "purple_light" },
    { id: "69714497b34f221e71d621df", name: "DONO - DAVI", color: "orange" },
    { id: "69966c2b08af08ca0737fc04", name: "ATRASO/PROBLEMA NA LOGÍSTICA", color: "yellow" },
    { id: "6978d7ef38019b2e166824ac", name: "SOLICITAÇÃO INDEVIDA", color: "red_dark" },
    { id: "6971405097e69aa0aae0fccd", name: "ATRASO/PROBLEMA NA PRODUÇÃO", color: "lime_dark" },
    { id: "6a285797e7d9630853a7e2f2", name: "HELENA", color: "pink_light" },
    { id: "69b0873d8f4e7d06196f14c8", name: "CC-e", color: "red" },
    { id: "69794534dca7e3aa57b1ba89", name: "PENDÊNCIA FISCAL NA ENTREGA", color: "orange_dark" },
    { id: "6a032fa453e32b07facb7f25", name: "URGENTE", color: "red" },
    { id: "69b31a0dc73766b45305c57b", name: "RASTREIO DE PEDIDO", color: "sky" },
    { id: "697a1cdc60ee10bda10081aa", name: "OCORRÊNCIA NA ENTREGA", color: "purple_dark" },
    { id: "6a302571b2524e8978892d97", name: "DONO - ARTHUR", color: "green_dark" },
    { id: "69b0877811c4e392517159ea", name: "PREVISÃO DE PRODUÇÃO E EXPEDIÇÃO", color: "purple" },
    { id: "69e14cf00228e09d2755f94a", name: "ATRASO/PROBLEMA NA EXPEDIÇÃO", color: "black" },
    { id: "6a0466cf6e3505e65166547e", name: "APENAS  PARA  EXEMPLO", color: "red" },
    { id: "69713ab76e8771706acf7a3b", name: "CX - ACIONAMENTO DE GARANTIA", color: "sky_dark" },
    { id: "69713ab76e8771706acf7a3a", name: "CX - AVARIAS", color: "blue_dark" },
    { id: "6a9af1d2fe77559dd4270c77", name: "Aurora 🌈🌞", color: "pink" },
    { id: "698b750dd8ecc20e33fa3aa7", name: "REPASSE", color: "blue" },
    { id: "6a836eca151f3ce8eaaa3a44", name: "CADASTRAR NOVO", color: "orange_dark" },
    { id: "6a836eca151f3ce8eaaa3a45", name: "GIRASSOL", color: "sky_dark" },
    { id: "69838edf847c65bd04223483", name: "CANCELAMENTO DE PEDIDO", color: "red" },
    { id: "6a8c50efae7321c1f588843d", name: "CLAREOU", color: "pink" },
    { id: "69bc502da18476c4d3a8e7f0", name: "SOU CRED", color: "lime" },
    { id: "6a4d42360e5cc5e225a304d5", name: "EX-TARIFÁRIO", color: "green_light" },
    { id: "6a4d3f43c7c3d88e52f244e1", name: "ABRIR CHAMADO", color: "blue" },
    { id: "6a569509be92f4398b1d3fd5", name: "PREVISÃO DE DESPACHO", color: "lime_dark" },
    { id: "6a29b2463fd7edfb23ff083e", name: "REGISTRO", color: "lime_dark" },
    { id: "6a0f45e687962ec82262f9af", name: "AVISO A LOGÍSTICA", color: "lime" },
    { id: "6a8c50efae7321c1f588843e", name: "Nunca Comprou", color: "orange" },
    { id: "69c293a551ae5e62b664e8f9", name: "CANCELAR PEDIDO E REALOCAR VALOR", color: "red" },
    { id: "69b848fe0d5c1532886b1088", name: "FINANCIAMENTO", color: "sky_light" },
    { id: "69f255cce31daf75d1691360", name: "SOU CRED", color: "orange" },
    { id: "69e27a084aea8dfb4ceaaa84", name: "MAGENTO", color: "black_light" }
  ],
  customFields: {
    "ESTADO": "69baf5a18d52b1a4c57db0ab",
    "RCA": "6a0cb9b967bd23ab9842ea2a"
  },
  defaultListDemandasId: "69713ab76e8771706acf7a47",
  defaultListFreteId: "69d6aad559189b3b6508c812",
  defaultListCadastroId: "69a19f10189e922c7c409ea2",
  timestamp: 0,
};
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

// --- PORTAL CONFIG PERSISTENCE ON TRELLO (PERMANENT STORAGE) ---
const CONFIG_CARD_NAME = '⚙️ [SISTEMA] Configurações de Equipes e RCAs (Portal CX)';
const CONFIG_LIST_ID = '69713bd2d3693600213b526a'; // List EXEMPLOS
let configCardIdCache: string | null = null;

export async function fetchPortalConfigFromTrello(): Promise<{ teams?: any[]; rcas?: Record<string, string[]> } | null> {
  try {
    if (configCardIdCache) {
      try {
        const card = await trelloFetch<{ id: string; name: string; desc: string }>(
          `/cards/${configCardIdCache}`,
          {},
          { fields: 'id,name,desc' }
        );
        if (card && card.desc) {
          const parsed = JSON.parse(card.desc);
          return parsed;
        }
      } catch {
        configCardIdCache = null;
      }
    }

    const cards = await trelloFetch<{ id: string; name: string; desc: string }[]>(
      `/boards/${BOARD_ID}/cards`,
      {},
      { fields: 'id,name,desc' }
    );
    const found = cards.find((c) => c.name.includes('[SISTEMA] Configurações de Equipes'));
    if (found) {
      configCardIdCache = found.id;
      if (found.desc) {
        return JSON.parse(found.desc);
      }
    }
  } catch (err) {
    console.error('Erro ao buscar configurações no Trello:', err);
  }
  return null;
}

export async function savePortalConfigToTrello(data: { teams: any[]; rcas: Record<string, string[]> }): Promise<boolean> {
  try {
    const jsonStr = JSON.stringify(data, null, 2);
    if (!configCardIdCache) {
      const cards = await trelloFetch<{ id: string; name: string }[]>(
        `/boards/${BOARD_ID}/cards`,
        {},
        { fields: 'id,name' }
      );
      const found = cards.find((c) => c.name.includes('[SISTEMA] Configurações de Equipes'));
      if (found) configCardIdCache = found.id;
    }

    if (configCardIdCache) {
      await trelloFetch(
        `/cards/${configCardIdCache}`,
        {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ desc: jsonStr }),
        }
      );
      return true;
    } else {
      const newCard = await trelloFetch<{ id: string }>(`/cards`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          idList: CONFIG_LIST_ID,
          name: CONFIG_CARD_NAME,
          desc: jsonStr,
          pos: 'bottom',
        }),
      });
      if (newCard && newCard.id) {
        configCardIdCache = newCard.id;
        return true;
      }
    }
  } catch (err) {
    console.error('Erro ao salvar configurações no Trello:', err);
  }
  return false;
}
