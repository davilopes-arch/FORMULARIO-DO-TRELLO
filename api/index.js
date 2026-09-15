// server/app.ts
import express from "express";

// server/trelloService.ts
var TRELLO_KEY = process.env.TRELLO_API_KEY || process.env.CHAVE_API_DO_TRELLO || "c9c79cf6c41d3521bd7a8d79f2dec202";
var TRELLO_TOKEN = process.env.TRELLO_TOKEN || "ATTA631fc95a87a351811e61eac1864c866dc5dfc5c8b8af5deb3c90848cc7ee9b0727C80483";
var BOARD_ID = process.env.TRELLO_BOARD_ID || process.env.ID_DO_QUADRO_DO_TRELLO || "1ongu3oT";
var API_BASE = "https://api.trello.com/1";
var cachedBoardData = {
  boardName: "CADASTRO / DEMANDAS CX/PRODU\xC7\xC3O/EXPEDI\xC7\xC3O E LOG\xCDSTICA",
  lists: [
    { id: "69a19f10189e922c7c409ea2", name: "CADASTRO" },
    { id: "69d6aad559189b3b6508c812", name: "SOLICITA\xC7\xC3O DE FRETE." },
    { id: "69713bd2d3693600213b526a", name: "EXEMPLOS" },
    { id: "69713ab76e8771706acf7a47", name: "A FAZER" },
    { id: "69713ab76e8771706acf7a48", name: "EM ANDAMENTO" },
    { id: "6a2c6d7abbffa60db0b540cf", name: "CONCLU\xCDDO \u{1F389}" }
  ],
  labels: [
    { id: "698b70263b0f4d15184b3548", name: "CADASTROS", color: "yellow_dark" },
    { id: "6978cee0100dc54ae9f73a85", name: "Farol \u{1F5FC}", color: "sky_light" },
    { id: "6978d74174e713b2a7ad1354", name: "Cactus \u{1F335}", color: "lime_light" },
    { id: "6978d76aafa3e117205ea934", name: "Girassol \u{1F33B}", color: "orange_light" },
    { id: "6978d75e71a73fe83d738ece", name: "Raio \u26A1", color: "yellow_light" },
    { id: "6978d77cfcb3c65ca8d5370f", name: "Clareou \u{1F305}", color: "purple_light" },
    { id: "69d7be9501d64d67ac3e55a0", name: "FRETE \u{1F69A}", color: "purple_light" },
    { id: "69714497b34f221e71d621df", name: "DONO - DAVI", color: "orange" },
    { id: "69966c2b08af08ca0737fc04", name: "ATRASO/PROBLEMA NA LOG\xCDSTICA", color: "yellow" },
    { id: "6978d7ef38019b2e166824ac", name: "SOLICITA\xC7\xC3O INDEVIDA", color: "red_dark" },
    { id: "6971405097e69aa0aae0fccd", name: "ATRASO/PROBLEMA NA PRODU\xC7\xC3O", color: "lime_dark" },
    { id: "6a285797e7d9630853a7e2f2", name: "HELENA", color: "pink_light" },
    { id: "69b0873d8f4e7d06196f14c8", name: "CC-e", color: "red" },
    { id: "69794534dca7e3aa57b1ba89", name: "PEND\xCANCIA FISCAL NA ENTREGA", color: "orange_dark" },
    { id: "6a032fa453e32b07facb7f25", name: "URGENTE", color: "red" },
    { id: "69b31a0dc73766b45305c57b", name: "RASTREIO DE PEDIDO", color: "sky" },
    { id: "697a1cdc60ee10bda10081aa", name: "OCORR\xCANCIA NA ENTREGA", color: "purple_dark" },
    { id: "6a302571b2524e8978892d97", name: "DONO - ARTHUR", color: "green_dark" },
    { id: "69b0877811c4e392517159ea", name: "PREVIS\xC3O DE PRODU\xC7\xC3O E EXPEDI\xC7\xC3O", color: "purple" },
    { id: "69e14cf00228e09d2755f94a", name: "ATRASO/PROBLEMA NA EXPEDI\xC7\xC3O", color: "black" },
    { id: "6a0466cf6e3505e65166547e", name: "APENAS  PARA  EXEMPLO", color: "red" },
    { id: "69713ab76e8771706acf7a3b", name: "CX - ACIONAMENTO DE GARANTIA", color: "sky_dark" },
    { id: "69713ab76e8771706acf7a3a", name: "CX - AVARIAS", color: "blue_dark" },
    { id: "6a9af1d2fe77559dd4270c77", name: "Aurora \u{1F308}\u{1F31E}", color: "pink" },
    { id: "698b750dd8ecc20e33fa3aa7", name: "REPASSE", color: "blue" },
    { id: "6a836eca151f3ce8eaaa3a44", name: "CADASTRAR NOVO", color: "orange_dark" },
    { id: "6a836eca151f3ce8eaaa3a45", name: "GIRASSOL", color: "sky_dark" },
    { id: "69838edf847c65bd04223483", name: "CANCELAMENTO DE PEDIDO", color: "red" },
    { id: "6a8c50efae7321c1f588843d", name: "CLAREOU", color: "pink" },
    { id: "69bc502da18476c4d3a8e7f0", name: "SOU CRED", color: "lime" },
    { id: "6a4d42360e5cc5e225a304d5", name: "EX-TARIF\xC1RIO", color: "green_light" },
    { id: "6a4d3f43c7c3d88e52f244e1", name: "ABRIR CHAMADO", color: "blue" },
    { id: "6a569509be92f4398b1d3fd5", name: "PREVIS\xC3O DE DESPACHO", color: "lime_dark" },
    { id: "6a29b2463fd7edfb23ff083e", name: "REGISTRO", color: "lime_dark" },
    { id: "6a0f45e687962ec82262f9af", name: "AVISO A LOG\xCDSTICA", color: "lime" },
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
  timestamp: 0
};
var CACHE_TTL_MS = 60 * 1e3;
function buildUrl(endpoint, params = {}) {
  const url = new URL(`${API_BASE}${endpoint}`);
  url.searchParams.set("key", TRELLO_KEY);
  url.searchParams.set("token", TRELLO_TOKEN);
  for (const [k, v] of Object.entries(params)) {
    if (v !== void 0 && v !== null) {
      url.searchParams.set(k, String(v));
    }
  }
  return url.toString();
}
async function trelloFetch(endpoint, options = {}, params = {}) {
  const url = buildUrl(endpoint, params);
  const response = await fetch(url, {
    ...options,
    headers: {
      ...options.headers
    }
  });
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Trello API error (${response.status}): ${errorText}`);
  }
  const contentType = response.headers.get("content-type");
  if (contentType && contentType.includes("application/json")) {
    return response.json();
  }
  return {};
}
async function fetchBoardData(forceRefresh = false) {
  const now = Date.now();
  if (!forceRefresh && cachedBoardData && now - cachedBoardData.timestamp < CACHE_TTL_MS) {
    return cachedBoardData;
  }
  try {
    const [boardInfo, lists, labels, customFields] = await Promise.all([
      trelloFetch(`/boards/${BOARD_ID}`, {}, { fields: "name" }),
      trelloFetch(`/boards/${BOARD_ID}/lists`, {}, { filter: "open", fields: "id,name" }),
      trelloFetch(`/boards/${BOARD_ID}/labels`, {}, { fields: "id,name,color", limit: "100" }),
      trelloFetch(`/boards/${BOARD_ID}/customFields`)
    ]);
    const normalize = (s) => s.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toUpperCase().trim();
    const afList = lists.find((l) => normalize(l.name).includes("FAZER")) || lists[0];
    const freteList = lists.find((l) => normalize(l.name).includes("FRETE")) || afList;
    const cadList = lists.find((l) => {
      const n = normalize(l.name);
      return n === "CADASTRO" || n.startsWith("CADASTRO") || n.includes("CADASTRO");
    }) || afList;
    const cfMap = {};
    for (const cf of customFields) {
      cfMap[cf.name.toUpperCase()] = cf.id;
      cfMap[normalize(cf.name)] = cf.id;
    }
    cachedBoardData = {
      boardName: boardInfo?.name || "Trello CX",
      lists: lists || [],
      labels: (labels || []).filter((l) => Boolean(l.name)),
      customFields: cfMap,
      defaultListDemandasId: afList?.id || "",
      defaultListFreteId: freteList?.id || afList?.id || "",
      defaultListCadastroId: cadList?.id || afList?.id || "",
      timestamp: now
    };
    return cachedBoardData;
  } catch (error) {
    if (cachedBoardData) {
      return cachedBoardData;
    }
    throw error;
  }
}
function invalidateBoardCache() {
  cachedBoardData = null;
}
async function createCardWithDetails(payload) {
  const boardData = await fetchBoardData();
  let targetListId = payload.idList;
  if (!targetListId) {
    if (payload.type === "frete") targetListId = boardData.defaultListFreteId;
    else if (payload.type === "cadastro") targetListId = boardData.defaultListCadastroId;
    else targetListId = boardData.defaultListDemandasId;
  }
  const cardUrlParams = new URLSearchParams({
    idList: targetListId,
    name: payload.name,
    desc: payload.desc,
    pos: "bottom"
  });
  if (payload.idLabels && payload.idLabels.length > 0) {
    cardUrlParams.set("idLabels", payload.idLabels.join(","));
  }
  const newCard = await trelloFetch(
    "/cards",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded"
      },
      body: cardUrlParams.toString()
    }
  );
  const warnings = [];
  if (payload.customFields) {
    const cfEntries = Object.entries(payload.customFields).filter(([_, val]) => val !== void 0 && val !== "");
    await Promise.allSettled(
      cfEntries.map(async ([fieldName, val]) => {
        const normName = fieldName.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toUpperCase().trim();
        const cfId = boardData.customFields[fieldName.toUpperCase()] || boardData.customFields[normName] || Object.entries(boardData.customFields).find(([k]) => k.includes(normName.split(" ")[0]))?.[1];
        if (!cfId) {
          return;
        }
        try {
          await trelloFetch(
            `/cards/${newCard.id}/customField/${cfId}/item`,
            {
              method: "PUT",
              headers: {
                "Content-Type": "application/json"
              },
              body: JSON.stringify({ value: { text: String(val) } })
            }
          );
        } catch (err) {
          warnings.push(`Custom field '${fieldName}': ${err.message}`);
        }
      })
    );
  }
  if (payload.userEmail) {
    try {
      const typeLabel = payload.type === "frete" ? "\u{1F69A} Solicita\xE7\xE3o de frete" : payload.type === "cadastro" ? "\u{1F4CB} Solicita\xE7\xE3o de cadastro" : "\u{1F4CC} Demanda";
      await trelloFetch(
        `/cards/${newCard.id}/actions/comments`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded"
          },
          body: new URLSearchParams({
            text: `\u{1F4DD} *${typeLabel} criada via Portal por:* ${payload.userEmail}`
          }).toString()
        }
      );
    } catch (err) {
      warnings.push(`Comment attribution: ${err.message}`);
    }
  }
  if (payload.attachments && payload.attachments.length > 0) {
    for (const att of payload.attachments) {
      try {
        const match = att.dataUrl.match(/^data:([^;]+);base64,(.+)$/);
        if (!match) continue;
        const mimeType = match[1];
        const base64Data = match[2];
        const buffer = Buffer.from(base64Data, "base64");
        const blob = new Blob([buffer], { type: mimeType });
        const formData = new FormData();
        formData.append("file", blob, att.name || "anexo.png");
        formData.append("key", TRELLO_KEY);
        formData.append("token", TRELLO_TOKEN);
        const uploadUrl = new URL(`${API_BASE}/cards/${newCard.id}/attachments`);
        const resp = await fetch(uploadUrl.toString(), {
          method: "POST",
          body: formData
        });
        if (!resp.ok) {
          const errTxt = await resp.text();
          warnings.push(`Attachment '${att.name}': ${errTxt}`);
        }
      } catch (err) {
        warnings.push(`Attachment '${att.name}': ${err.message}`);
      }
    }
  }
  return {
    success: true,
    cardId: newCard.id,
    url: newCard.url,
    shortUrl: newCard.shortUrl || newCard.url,
    warnings: warnings.length > 0 ? warnings : void 0
  };
}
async function createBoardLabel(name, color = "blue") {
  const res = await trelloFetch(
    `/boards/${BOARD_ID}/labels`,
    {
      method: "POST"
    },
    {
      name,
      color
    }
  );
  invalidateBoardCache();
  return res;
}
async function updateBoardLabel(id, name) {
  try {
    const res = await trelloFetch(
      `/labels/${id}`,
      { method: "PUT" },
      { name }
    );
    invalidateBoardCache();
    return res;
  } catch {
    const res = await trelloFetch(
      `/labels/${id}/name`,
      { method: "PUT" },
      { value: name }
    );
    invalidateBoardCache();
    return res;
  }
}
async function deleteBoardLabel(id) {
  await trelloFetch(`/labels/${id}`, {
    method: "DELETE"
  });
  invalidateBoardCache();
  return { success: true };
}
var CONFIG_CARD_NAME = "\u2699\uFE0F [SISTEMA] Configura\xE7\xF5es de Equipes e RCAs (Portal CX)";
var CONFIG_LIST_ID = "69713bd2d3693600213b526a";
var configCardIdCache = null;
async function fetchPortalConfigFromTrello() {
  try {
    const board = await trelloFetch(
      `/boards/${BOARD_ID}`,
      {},
      { fields: "id,name,desc" }
    );
    if (board && board.desc) {
      const match = board.desc.match(/<!-- PORTAL_CONFIG_START -->([\s\S]*?)<!-- PORTAL_CONFIG_END -->/);
      if (match && match[1]) {
        const parsed = JSON.parse(match[1]);
        if (parsed && (Array.isArray(parsed.teams) || parsed.rcas)) {
          return parsed;
        }
      }
      try {
        const parsed = JSON.parse(board.desc);
        if (parsed && (Array.isArray(parsed.teams) || parsed.rcas)) {
          return parsed;
        }
      } catch {
      }
    }
  } catch (err) {
    console.warn("Falha ao buscar config na descri\xE7\xE3o do quadro:", err);
  }
  if (configCardIdCache) {
    try {
      const card = await trelloFetch(
        `/cards/${configCardIdCache}`,
        {},
        { fields: "id,name,desc" }
      );
      if (card && card.desc) {
        return JSON.parse(card.desc);
      }
    } catch {
      configCardIdCache = null;
    }
  }
  try {
    const listCards = await trelloFetch(
      `/lists/${CONFIG_LIST_ID}/cards`,
      {},
      { fields: "id,name,desc" }
    );
    const found = listCards.find((c) => c.name.includes("[SISTEMA] Configura\xE7\xF5es de Equipes"));
    if (found) {
      configCardIdCache = found.id;
      if (found.desc) {
        return JSON.parse(found.desc);
      }
    }
  } catch (err) {
    console.warn("Erro ao buscar card de config na lista de exemplos:", err);
  }
  return null;
}
async function savePortalConfigToTrello(data) {
  try {
    const payload = {
      teams: data.teams,
      rcas: data.rcas,
      lastUpdated: (/* @__PURE__ */ new Date()).toISOString()
    };
    const jsonStr = JSON.stringify(payload, null, 2);
    try {
      const curBoard = await trelloFetch(`/boards/${BOARD_ID}`, {}, { fields: "desc" }).catch(() => null);
      const curDesc = curBoard?.desc || "";
      let newDesc = "";
      if (curDesc.includes("<!-- PORTAL_CONFIG_START -->")) {
        newDesc = curDesc.replace(
          /<!-- PORTAL_CONFIG_START -->[\s\S]*?<!-- PORTAL_CONFIG_END -->/,
          `<!-- PORTAL_CONFIG_START -->
${jsonStr}
<!-- PORTAL_CONFIG_END -->`
        );
      } else {
        newDesc = `### \u2699\uFE0F PORTAL CX - CONFIGURA\xC7\xD5ES DO SISTEMA (N\xC3O ALTERE MANUALMENTE)
<!-- PORTAL_CONFIG_START -->
${jsonStr}
<!-- PORTAL_CONFIG_END -->

${curDesc}`.trim();
      }
      await trelloFetch(
        `/boards/${BOARD_ID}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ desc: newDesc })
        }
      );
    } catch (errBoard) {
      console.warn("Aviso: Falha ao salvar no board.desc:", errBoard);
    }
    if (!configCardIdCache) {
      try {
        const listCards = await trelloFetch(
          `/lists/${CONFIG_LIST_ID}/cards`,
          {},
          { fields: "id,name" }
        );
        const found = listCards.find((c) => c.name.includes("[SISTEMA] Configura\xE7\xF5es de Equipes"));
        if (found) configCardIdCache = found.id;
      } catch {
      }
    }
    if (configCardIdCache) {
      try {
        await trelloFetch(
          `/cards/${configCardIdCache}`,
          {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ desc: jsonStr })
          }
        );
        return true;
      } catch {
        configCardIdCache = null;
      }
    }
    try {
      const newCard = await trelloFetch(`/cards`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          idList: CONFIG_LIST_ID,
          name: CONFIG_CARD_NAME,
          desc: jsonStr,
          pos: "bottom"
        })
      });
      if (newCard && newCard.id) {
        configCardIdCache = newCard.id;
      }
    } catch {
    }
    return true;
  } catch (err) {
    console.error("Erro ao salvar configura\xE7\xF5es no Trello:", err);
  }
  return false;
}

// server/rcaService.ts
import fs from "fs";
import path from "path";
var DEFAULT_TEAMS = [
  { id: "farol", nome: "Farol", emoji: "\u{1F5FC}" },
  { id: "cactus", nome: "Cactus", emoji: "\u{1F335}" },
  { id: "girassol", nome: "Girassol", emoji: "\u{1F33B}" },
  { id: "raio", nome: "Aurora", emoji: "\u{1F308}" },
  { id: "clareou", nome: "Clareou", emoji: "\u{1F305}" }
];
var DEFAULT_RCAS = {
  Farol: [
    "ALANA SOUSA",
    "ANDERSON ARAUJO",
    "ARTUR FILHO",
    "BRENA INGRED",
    "DEBORA AQUINO",
    "DIEGO SOUSA",
    "FERNANDA MONTENEGRO",
    "GUILHERME RODRIGUES",
    "HIDYONARA SOUSA",
    "ITALO HENRIQUE",
    "JAMILE SOUZA",
    "MARCELINO MONTEIRO",
    "MARCO VANBASTEN",
    "MARIA MOURA",
    "PROZZYNESK LIBERATO",
    "SIDNEI SANTANA",
    "LUCAS MAIA"
  ],
  Cactus: [
    "ADEMAR LUCIO",
    "ANDRE LUIZ",
    "BRENNA BARBOSA",
    "CASSIUS LEITE",
    "CHRISTIANO ARAUJO",
    "CLAUDETH SANTOS",
    "CLEITON OLIVEIRA",
    "GILLIARD BARBOSA",
    "ISMAEL HEBSTER",
    "JAMES FERREIRA",
    "MARCIO WENDELL",
    "PATRICIA SANTOS",
    "RAMON BATISTA",
    "RAPHAELA OLIVEIRA",
    "ROSALY RIBEIRO",
    "VICTOR TORRES"
  ],
  Aurora: [
    "ANCELMO RODRIGUES",
    "BRUNO SOUZA",
    "DANILO DIAS",
    "HARD TRAJANO",
    "IVAN FERNANDES",
    "KARLANY PAIVA",
    "LUCAS ARCANJO",
    "LUCAS TADEU",
    "MARCELO MOREIRA",
    "MARIANA COSTA",
    "MILENA BRITO",
    "RAFAEL FAUSTINO",
    "ERIK PINHHEIRO",
    "OLIVER ORHAND"
  ],
  Raio: [
    "ANCELMO RODRIGUES",
    "BRUNO SOUZA",
    "DANILO DIAS",
    "HARD TRAJANO",
    "IVAN FERNANDES",
    "KARLANY PAIVA",
    "LUCAS ARCANJO",
    "LUCAS TADEU",
    "MARCELO MOREIRA",
    "MARIANA COSTA",
    "MILENA BRITO",
    "RAFAEL FAUSTINO",
    "ERIK PINHHEIRO",
    "OLIVER ORHAND"
  ],
  Girassol: [
    "ALEXANDRE XAVIER",
    "ANDRE FELIPE",
    "ANTONIO VINICIO",
    "CAROLINA COSTA",
    "DAYANA OLIVEIRA",
    "DIANA PARENTE",
    "DIEGO NEGREIROS",
    "GABRIEL SOUSA",
    "ISIS CRISTINE",
    "LEVI DA SILVA",
    "TALLYS LEAL",
    "VITOR FA\xC7ANHA",
    "WALESKA ALMEIDA",
    "ERICK RAFAEL"
  ],
  Clareou: [
    "ALEXANDRE BENJAMIN",
    "AUGUSTO FILHO",
    "DIEGO CRUZ",
    "EDUARDA SAMPAIO",
    "FERNANDO MACENA",
    "FLAVIA SOUTO",
    "JEFFERSON SILVA",
    "LUANDERSON LOUREN\xC7O",
    "LWENDRYL VIDAL",
    "MARIANA LIMA",
    "MATEUS MENESES",
    "PATRICIA BODEN",
    "REGINALDO LIMA",
    "ROSANGELA MARTIS",
    "SIMARA NUNES"
  ]
};
var DATA_DIR = process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME ? path.join("/tmp", "data") : path.join(process.cwd(), "data");
var currentTeams = [...DEFAULT_TEAMS];
var currentRCAs = { ...DEFAULT_RCAS };
function loadFromDisk() {
  const possiblePaths = [
    path.join(DATA_DIR, "teams.json"),
    path.join(process.cwd(), "data", "teams.json"),
    path.join("/tmp", "data", "teams.json")
  ];
  for (const p of possiblePaths) {
    try {
      if (fs.existsSync(p)) {
        const data = fs.readFileSync(p, "utf-8");
        const parsed = JSON.parse(data);
        if (Array.isArray(parsed) && parsed.length > 0) {
          currentTeams = parsed;
          break;
        }
      }
    } catch {
    }
  }
  const possibleRcaPaths = [
    path.join(DATA_DIR, "rcas.json"),
    path.join(process.cwd(), "data", "rcas.json"),
    path.join("/tmp", "data", "rcas.json")
  ];
  for (const p of possibleRcaPaths) {
    try {
      if (fs.existsSync(p)) {
        const data = fs.readFileSync(p, "utf-8");
        const parsed = JSON.parse(data);
        currentRCAs = { ...DEFAULT_RCAS, ...parsed };
        break;
      }
    } catch {
    }
  }
}
function saveRcasToDisk() {
  const dirs = [DATA_DIR, path.join("/tmp", "data")];
  for (const dir of dirs) {
    try {
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      fs.writeFileSync(path.join(dir, "rcas.json"), JSON.stringify(currentRCAs, null, 2), "utf-8");
      break;
    } catch {
    }
  }
}
function saveTeamsToDisk() {
  const dirs = [DATA_DIR, path.join("/tmp", "data")];
  for (const dir of dirs) {
    try {
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      fs.writeFileSync(path.join(dir, "teams.json"), JSON.stringify(currentTeams, null, 2), "utf-8");
      break;
    } catch {
    }
  }
}
loadFromDisk();
var isTrelloSynced = false;
async function syncWithTrelloCloud() {
  try {
    const config = await fetchPortalConfigFromTrello();
    if (config) {
      if (Array.isArray(config.teams) && config.teams.length > 0) {
        currentTeams = config.teams;
        saveTeamsToDisk();
      }
      if (config.rcas && typeof config.rcas === "object" && Object.keys(config.rcas).length > 0) {
        currentRCAs = { ...DEFAULT_RCAS, ...config.rcas };
        saveRcasToDisk();
      }
      isTrelloSynced = true;
    }
  } catch (err) {
    console.error("Falha ao sincronizar com Trello:", err);
  }
}
syncWithTrelloCloud().catch(() => {
});
async function persistAll() {
  saveTeamsToDisk();
  saveRcasToDisk();
  try {
    await savePortalConfigToTrello({ teams: currentTeams, rcas: currentRCAs });
  } catch (err) {
    console.error("Erro ao persistir no Trello:", err);
  }
}
function getTeams() {
  return currentTeams;
}
async function addTeam(nome, emoji) {
  await syncWithTrelloCloud().catch(() => {
  });
  const cleanName = nome.trim();
  const cleanEmoji = emoji.trim() || "\u26A1";
  if (!cleanName) return { success: false, error: "Nome da equipe \xE9 obrigat\xF3rio" };
  const exists = currentTeams.some((t) => t.nome.toLowerCase() === cleanName.toLowerCase());
  if (exists) return { success: false, error: "J\xE1 existe uma equipe com este nome" };
  const id = cleanName.toLowerCase().replace(/[^a-z0-9]/g, "") + "_" + Date.now().toString(36);
  const newTeam = { id, nome: cleanName, emoji: cleanEmoji };
  currentTeams.push(newTeam);
  if (!currentRCAs[cleanName]) {
    currentRCAs[cleanName] = [];
  }
  await persistAll();
  return { success: true, teams: currentTeams, rcas: currentRCAs };
}
async function updateTeam(id, updates) {
  await syncWithTrelloCloud().catch(() => {
  });
  const team = currentTeams.find((t) => t.id === id || t.nome.toLowerCase() === id.toLowerCase());
  if (!team) return { success: false, error: "Equipe n\xE3o encontrada" };
  const oldNome = team.nome;
  if (updates.nome !== void 0) {
    const cleanName = updates.nome.trim();
    if (!cleanName) return { success: false, error: "Nome da equipe n\xE3o pode ser vazio" };
    const duplicate = currentTeams.some(
      (t) => t.id !== team.id && t.nome.toLowerCase() === cleanName.toLowerCase()
    );
    if (duplicate) return { success: false, error: "J\xE1 existe outra equipe com este nome" };
    if (cleanName !== oldNome) {
      team.nome = cleanName;
      if (currentRCAs[oldNome]) {
        currentRCAs[cleanName] = currentRCAs[oldNome];
        delete currentRCAs[oldNome];
      } else if (!currentRCAs[cleanName]) {
        currentRCAs[cleanName] = [];
      }
    }
  }
  if (updates.emoji !== void 0) {
    const cleanEmoji = updates.emoji.trim();
    if (cleanEmoji) {
      team.emoji = cleanEmoji;
    }
  }
  await persistAll();
  return { success: true, teams: currentTeams, rcas: currentRCAs };
}
async function removeTeam(id) {
  await syncWithTrelloCloud().catch(() => {
  });
  if (currentTeams.length <= 1) {
    return { success: false, error: "\xC9 necess\xE1rio manter pelo menos uma equipe" };
  }
  const teamIdx = currentTeams.findIndex((t) => t.id === id || t.nome.toLowerCase() === id.toLowerCase());
  if (teamIdx === -1) return { success: false, error: "Equipe n\xE3o encontrada" };
  const [removed] = currentTeams.splice(teamIdx, 1);
  await persistAll();
  return { success: true, teams: currentTeams, rcas: currentRCAs };
}
async function resetTeams() {
  currentTeams = [...DEFAULT_TEAMS];
  await persistAll();
  return { success: true, teams: currentTeams, rcas: currentRCAs };
}
function resolveTeamKey(team) {
  const clean = team.trim();
  const existingKey = Object.keys(currentRCAs).find((k) => k.toLowerCase() === clean.toLowerCase());
  if (existingKey) return existingKey;
  const foundTeam = currentTeams.find((t) => t.id.toLowerCase() === clean.toLowerCase() || t.nome.toLowerCase() === clean.toLowerCase());
  if (foundTeam) {
    if (!currentRCAs[foundTeam.nome]) currentRCAs[foundTeam.nome] = [];
    return foundTeam.nome;
  }
  if (!currentRCAs[clean]) currentRCAs[clean] = [];
  return clean;
}
function getRCAs() {
  return currentRCAs;
}
async function addRCA(team, name) {
  await syncWithTrelloCloud().catch(() => {
  });
  const cleanName = name.trim().toUpperCase();
  if (!cleanName) return { success: false, error: "Nome inv\xE1lido" };
  const key = resolveTeamKey(team);
  if (!currentRCAs[key]) currentRCAs[key] = [];
  const exists = currentRCAs[key].some((n) => n.trim().toUpperCase() === cleanName);
  if (!exists) {
    currentRCAs[key].push(cleanName);
    currentRCAs[key].sort();
    await persistAll();
  }
  return { success: true };
}
async function renameRCA(team, oldName, newName) {
  await syncWithTrelloCloud().catch(() => {
  });
  const cleanOld = oldName.trim().toUpperCase();
  const cleanNew = newName.trim().toUpperCase();
  if (!cleanNew) return { success: false, error: "Novo nome inv\xE1lido" };
  const key = resolveTeamKey(team);
  const list = currentRCAs[key] || [];
  const idx = list.findIndex((n) => n.trim().toUpperCase() === cleanOld);
  if (idx !== -1) {
    list[idx] = cleanNew;
    list.sort();
  } else {
    if (!list.includes(cleanNew)) {
      list.push(cleanNew);
      list.sort();
    }
  }
  await persistAll();
  return { success: true };
}
async function removeRCA(team, name) {
  await syncWithTrelloCloud().catch(() => {
  });
  const key = resolveTeamKey(team);
  const cleanTarget = name.trim().toUpperCase();
  const list = currentRCAs[key] || [];
  currentRCAs[key] = list.filter((n) => n.trim().toUpperCase() !== cleanTarget);
  await persistAll();
  return { success: true };
}

// server/app.ts
var app = express();
app.use(express.json({ limit: "100mb" }));
app.use(express.urlencoded({ extended: true, limit: "100mb" }));
var apiRouter = express.Router();
apiRouter.get("/health", (req, res) => {
  res.json({
    status: "ok",
    service: "Portal Trello Backend",
    timestamp: (/* @__PURE__ */ new Date()).toISOString()
  });
});
apiRouter.get("/trello/board-data", async (req, res) => {
  try {
    const forceRefresh = req.query.refresh === "true";
    const data = await fetchBoardData(forceRefresh);
    res.json(data);
  } catch (error) {
    console.error("Error fetching board data:", error);
    res.status(502).json({
      error: error.message || "Erro ao comunicar com a API do Trello"
    });
  }
});
apiRouter.post("/trello/cards", async (req, res) => {
  try {
    const payload = req.body;
    if (!payload.name) {
      return res.status(400).json({ error: "T\xEDtulo do card \xE9 obrigat\xF3rio" });
    }
    const result = await createCardWithDetails(payload);
    res.status(201).json(result);
  } catch (error) {
    console.error("Error creating card:", error);
    res.status(500).json({
      error: error.message || "Erro ao criar card no Trello"
    });
  }
});
apiRouter.post("/trello/labels", async (req, res) => {
  try {
    const name = (req.body?.name || req.query?.name || "").toString().trim();
    const color = (req.body?.color || req.query?.color || "blue").toString();
    if (!name) return res.status(400).json({ error: "Nome da situa\xE7\xE3o \xE9 obrigat\xF3rio" });
    const label = await createBoardLabel(name, color);
    res.status(201).json(label);
  } catch (error) {
    console.error("Error creating label:", error);
    res.status(500).json({ error: error.message || "Erro ao criar situa\xE7\xE3o" });
  }
});
var handleLabelUpdate = async (req, res) => {
  try {
    const id = (req.params.id || req.body?.id || req.query?.id || "").toString().trim();
    const name = (req.body?.name || req.query?.name || "").toString().trim();
    if (!id) return res.status(400).json({ error: "ID da situa\xE7\xE3o \xE9 obrigat\xF3rio" });
    if (!name) return res.status(400).json({ error: "Novo nome \xE9 obrigat\xF3rio" });
    const updated = await updateBoardLabel(id, name);
    res.json(updated);
  } catch (error) {
    console.error("Error updating label:", error);
    res.status(500).json({ error: error.message || "Erro ao renomear situa\xE7\xE3o" });
  }
};
apiRouter.put("/trello/labels/:id", handleLabelUpdate);
apiRouter.put("/trello/labels", handleLabelUpdate);
apiRouter.post("/trello/labels/update", handleLabelUpdate);
apiRouter.post("/trello/labels/:id/update", handleLabelUpdate);
var handleLabelDelete = async (req, res) => {
  try {
    const id = (req.params.id || req.body?.id || req.query?.id || "").toString().trim();
    if (!id) return res.status(400).json({ error: "ID da situa\xE7\xE3o \xE9 obrigat\xF3rio" });
    const result = await deleteBoardLabel(id);
    res.json(result);
  } catch (error) {
    console.error("Error deleting label:", error);
    res.status(500).json({ error: error.message || "Erro ao excluir situa\xE7\xE3o" });
  }
};
apiRouter.delete("/trello/labels/:id", handleLabelDelete);
apiRouter.delete("/trello/labels", handleLabelDelete);
apiRouter.post("/trello/labels/delete", handleLabelDelete);
apiRouter.post("/trello/labels/:id/delete", handleLabelDelete);
apiRouter.get("/rcas", async (req, res) => {
  await syncWithTrelloCloud().catch(() => {
  });
  res.json(getRCAs());
});
var handleRcaAdd = async (req, res) => {
  const team = (req.body?.team || req.query?.team || "").toString().trim();
  const name = (req.body?.name || req.query?.name || "").toString().trim();
  if (!team || !name) return res.status(400).json({ error: "Equipe e nome s\xE3o obrigat\xF3rios" });
  const result = await addRCA(team, name);
  if (!result.success) return res.status(400).json(result);
  res.status(201).json(getRCAs());
};
apiRouter.post("/rcas", handleRcaAdd);
apiRouter.post("/rcas/add", handleRcaAdd);
var handleRcaRename = async (req, res) => {
  const team = (req.body?.team || req.query?.team || "").toString().trim();
  const oldName = (req.body?.oldName || req.query?.oldName || "").toString().trim();
  const newName = (req.body?.newName || req.query?.newName || "").toString().trim();
  if (!team || !oldName || !newName) {
    return res.status(400).json({ error: "Equipe, nome antigo e novo nome s\xE3o obrigat\xF3rios" });
  }
  const result = await renameRCA(team, oldName, newName);
  if (!result.success) return res.status(400).json(result);
  res.json(getRCAs());
};
apiRouter.put("/rcas", handleRcaRename);
apiRouter.post("/rcas/rename", handleRcaRename);
apiRouter.post("/rcas/update", handleRcaRename);
var handleRcaDelete = async (req, res) => {
  const team = (req.body?.team || req.query?.team || "").toString().trim();
  const name = (req.body?.name || req.query?.name || "").toString().trim();
  if (!team || !name) return res.status(400).json({ error: "Equipe e nome s\xE3o obrigat\xF3rios" });
  const result = await removeRCA(team, name);
  if (!result.success) return res.status(400).json(result);
  res.json(getRCAs());
};
apiRouter.delete("/rcas", handleRcaDelete);
apiRouter.post("/rcas/delete", handleRcaDelete);
apiRouter.post("/rcas/remove", handleRcaDelete);
apiRouter.get("/teams", async (req, res) => {
  await syncWithTrelloCloud().catch(() => {
  });
  res.json(getTeams());
});
apiRouter.post("/teams", async (req, res) => {
  const { nome, emoji } = req.body;
  if (!nome) return res.status(400).json({ error: "Nome da equipe \xE9 obrigat\xF3rio" });
  const result = await addTeam(nome, emoji || "\u26A1");
  if (!result.success) return res.status(400).json(result);
  res.status(201).json(result);
});
var handleTeamUpdate = async (req, res) => {
  const id = req.params.id || req.body.id;
  const { nome, emoji } = req.body;
  if (!id) return res.status(400).json({ error: "ID ou nome da equipe \xE9 obrigat\xF3rio" });
  const result = await updateTeam(id, { nome, emoji });
  if (!result.success) return res.status(400).json(result);
  res.json(result);
};
apiRouter.put("/teams/:id", handleTeamUpdate);
apiRouter.put("/teams", handleTeamUpdate);
apiRouter.post("/teams/update", handleTeamUpdate);
var handleTeamDelete = async (req, res) => {
  const id = req.params.id || req.body.id;
  if (!id) return res.status(400).json({ error: "ID da equipe \xE9 obrigat\xF3rio" });
  const result = await removeTeam(id);
  if (!result.success) return res.status(400).json(result);
  res.json(result);
};
apiRouter.delete("/teams/:id", handleTeamDelete);
apiRouter.delete("/teams", handleTeamDelete);
apiRouter.post("/teams/delete", handleTeamDelete);
apiRouter.post("/teams/reset", async (req, res) => {
  const result = await resetTeams();
  res.json(result);
});
app.use("/api", apiRouter);
app.use(apiRouter);
var app_default = app;

// server/vercelHandler.ts
function handler(req, res) {
  try {
    if (req.url === "/api" && req.headers && req.headers["x-matched-path"]) {
      req.url = req.headers["x-matched-path"];
    }
    return app_default(req, res);
  } catch (err) {
    console.error("Unhandled api error:", err);
    if (!res.headersSent) {
      res.status(500).json({ error: err.message || "Internal Server Error" });
    }
  }
}
export {
  handler as default
};
