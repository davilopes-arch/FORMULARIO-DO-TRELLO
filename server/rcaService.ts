import fs from 'fs';
import path from 'path';

export type TeamName = string;

export interface TeamInfo {
  id: string;
  nome: string;
  emoji: string;
}

export const DEFAULT_TEAMS: TeamInfo[] = [
  { id: 'farol', nome: 'Farol', emoji: '🗼' },
  { id: 'cactus', nome: 'Cactus', emoji: '🌵' },
  { id: 'girassol', nome: 'Girassol', emoji: '🌻' },
  { id: 'raio', nome: 'Raio', emoji: '⚡' },
  { id: 'clareou', nome: 'Clareou', emoji: '🌅' },
];

const DEFAULT_RCAS: Record<string, string[]> = {
  Farol: [
    'ALANA SOUSA', 'ANDERSON ARAUJO', 'ARTUR FILHO', 'BRENA INGRED', 'DEBORA AQUINO',
    'DIEGO SOUSA', 'FERNANDA MONTENEGRO', 'GUILHERME RODRIGUES', 'HIDYONARA SOUSA',
    'ITALO HENRIQUE', 'JAMILE SOUZA', 'MARCELINO MONTEIRO', 'MARCO VANBASTEN',
    'MARIA MOURA', 'PROZZYNESK LIBERATO', 'SIDNEI SANTANA', 'LUCAS MAIA'
  ],
  Cactus: [
    'ADEMAR LUCIO', 'ANDRE LUIZ', 'BRENNA BARBOSA', 'CASSIUS LEITE',
    'CHRISTIANO ARAUJO', 'CLAUDETH SANTOS', 'CLEITON OLIVEIRA', 'GILLIARD BARBOSA',
    'ISMAEL HEBSTER', 'JAMES FERREIRA', 'MARCIO WENDELL', 'PATRICIA SANTOS',
    'RAMON BATISTA', 'RAPHAELA OLIVEIRA', 'ROSALY RIBEIRO', 'VICTOR TORRES'
  ],
  Raio: [
    'ANCELMO RODRIGUES', 'BRUNO SOUZA', 'DANILO DIAS', 'HARD TRAJANO',
    'IVAN FERNANDES', 'KARLANY PAIVA', 'LUCAS ARCANJO', 'LUCAS TADEU',
    'MARCELO MOREIRA', 'MARIANA COSTA', 'MILENA BRITO', 'RAFAEL FAUSTINO',
    'ERIK PINHHEIRO', 'OLIVER ORHAND'
  ],
  Girassol: [
    'ALEXANDRE XAVIER', 'ANDRE FELIPE', 'ANTONIO VINICIO', 'CAROLINA COSTA',
    'DAYANA OLIVEIRA', 'DIANA PARENTE', 'DIEGO NEGREIROS', 'GABRIEL SOUSA',
    'ISIS CRISTINE', 'LEVI DA SILVA', 'TALLYS LEAL', 'VITOR FAÇANHA',
    'WALESKA ALMEIDA', 'ERICK RAFAEL'
  ],
  Clareou: [
    'ALEXANDRE BENJAMIN', 'AUGUSTO FILHO', 'DIEGO CRUZ', 'EDUARDA SAMPAIO',
    'FERNANDO MACENA', 'FLAVIA SOUTO', 'JEFFERSON SILVA', 'LUANDERSON LOURENÇO',
    'LWENDRYL VIDAL', 'MARIANA LIMA', 'MATEUS MENESES', 'PATRICIA BODEN',
    'REGINALDO LIMA', 'ROSANGELA MARTIS', 'SIMARA NUNES'
  ],
};

const DATA_DIR = path.join(process.cwd(), 'data');
const RCAS_FILE = path.join(DATA_DIR, 'rcas.json');
const TEAMS_FILE = path.join(DATA_DIR, 'teams.json');

let currentTeams: TeamInfo[] = [...DEFAULT_TEAMS];
let currentRCAs: Record<string, string[]> = { ...DEFAULT_RCAS };

function loadFromDisk() {
  try {
    if (fs.existsSync(TEAMS_FILE)) {
      const data = fs.readFileSync(TEAMS_FILE, 'utf-8');
      const parsed = JSON.parse(data);
      if (Array.isArray(parsed) && parsed.length > 0) {
        currentTeams = parsed;
      }
    }
  } catch (err) {
    console.error('Error loading teams from disk:', err);
  }

  try {
    if (fs.existsSync(RCAS_FILE)) {
      const data = fs.readFileSync(RCAS_FILE, 'utf-8');
      const parsed = JSON.parse(data);
      currentRCAs = { ...DEFAULT_RCAS, ...parsed };
    }
  } catch (err) {
    console.error('Error loading RCAs from disk:', err);
  }
}

function saveRcasToDisk() {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(RCAS_FILE, JSON.stringify(currentRCAs, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error saving RCAs to disk:', err);
  }
}

function saveTeamsToDisk() {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(TEAMS_FILE, JSON.stringify(currentTeams, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error saving Teams to disk:', err);
  }
}

// Initial load
loadFromDisk();

// --- TEAMS MANAGEMENT ---

export function getTeams(): TeamInfo[] {
  return currentTeams;
}

export function addTeam(nome: string, emoji: string): { success: boolean; error?: string; teams?: TeamInfo[]; rcas?: Record<string, string[]> } {
  const cleanName = nome.trim();
  const cleanEmoji = emoji.trim() || '⚡';
  if (!cleanName) return { success: false, error: 'Nome da equipe é obrigatório' };

  const exists = currentTeams.some((t) => t.nome.toLowerCase() === cleanName.toLowerCase());
  if (exists) return { success: false, error: 'Já existe uma equipe com este nome' };

  const id = cleanName.toLowerCase().replace(/[^a-z0-9]/g, '') + '_' + Date.now().toString(36);
  const newTeam: TeamInfo = { id, nome: cleanName, emoji: cleanEmoji };
  currentTeams.push(newTeam);

  if (!currentRCAs[cleanName]) {
    currentRCAs[cleanName] = [];
  }

  saveTeamsToDisk();
  saveRcasToDisk();
  return { success: true, teams: currentTeams, rcas: currentRCAs };
}

export function updateTeam(
  id: string,
  updates: { nome?: string; emoji?: string }
): { success: boolean; error?: string; teams?: TeamInfo[]; rcas?: Record<string, string[]> } {
  const team = currentTeams.find((t) => t.id === id || t.nome.toLowerCase() === id.toLowerCase());
  if (!team) return { success: false, error: 'Equipe não encontrada' };

  const oldNome = team.nome;

  if (updates.nome !== undefined) {
    const cleanName = updates.nome.trim();
    if (!cleanName) return { success: false, error: 'Nome da equipe não pode ser vazio' };

    const duplicate = currentTeams.some(
      (t) => t.id !== team.id && t.nome.toLowerCase() === cleanName.toLowerCase()
    );
    if (duplicate) return { success: false, error: 'Já existe outra equipe com este nome' };

    if (cleanName !== oldNome) {
      team.nome = cleanName;
      // Transfer RCAs seamlessly from old team name to new team name
      if (currentRCAs[oldNome]) {
        currentRCAs[cleanName] = currentRCAs[oldNome];
        delete currentRCAs[oldNome];
      } else if (!currentRCAs[cleanName]) {
        currentRCAs[cleanName] = [];
      }
    }
  }

  if (updates.emoji !== undefined) {
    const cleanEmoji = updates.emoji.trim();
    if (cleanEmoji) {
      team.emoji = cleanEmoji;
    }
  }

  saveTeamsToDisk();
  saveRcasToDisk();
  return { success: true, teams: currentTeams, rcas: currentRCAs };
}

export function removeTeam(id: string): { success: boolean; error?: string; teams?: TeamInfo[]; rcas?: Record<string, string[]> } {
  if (currentTeams.length <= 1) {
    return { success: false, error: 'É necessário manter pelo menos uma equipe' };
  }

  const teamIdx = currentTeams.findIndex((t) => t.id === id || t.nome.toLowerCase() === id.toLowerCase());
  if (teamIdx === -1) return { success: false, error: 'Equipe não encontrada' };

  const [removed] = currentTeams.splice(teamIdx, 1);
  saveTeamsToDisk();
  return { success: true, teams: currentTeams, rcas: currentRCAs };
}

export function resetTeams(): { success: boolean; teams: TeamInfo[]; rcas: Record<string, string[]> } {
  currentTeams = [...DEFAULT_TEAMS];
  saveTeamsToDisk();
  return { success: true, teams: currentTeams, rcas: currentRCAs };
}

// --- RCA MANAGEMENT ---

export function getRCAs(): Record<string, string[]> {
  return currentRCAs;
}

export function addRCA(team: string, name: string): { success: boolean; error?: string } {
  const cleanName = name.trim().toUpperCase();
  if (!cleanName) return { success: false, error: 'Nome inválido' };
  if (!currentRCAs[team]) currentRCAs[team] = [];
  if (currentRCAs[team].includes(cleanName)) {
    return { success: false, error: 'Consultor já cadastrado nessa equipe' };
  }
  currentRCAs[team].push(cleanName);
  currentRCAs[team].sort();
  saveRcasToDisk();
  return { success: true };
}

export function renameRCA(team: string, oldName: string, newName: string): { success: boolean; error?: string } {
  const cleanNewName = newName.trim().toUpperCase();
  if (!cleanNewName) return { success: false, error: 'Novo nome inválido' };
  const list = currentRCAs[team] || [];
  const idx = list.indexOf(oldName);
  if (idx === -1) return { success: false, error: 'Consultor não encontrado' };

  list[idx] = cleanNewName;
  list.sort();
  saveRcasToDisk();
  return { success: true };
}

export function removeRCA(team: string, name: string): { success: boolean; error?: string } {
  const list = currentRCAs[team] || [];
  const beforeLen = list.length;
  currentRCAs[team] = list.filter((n) => n !== name);
  if (currentRCAs[team].length === beforeLen) {
    return { success: false, error: 'Consultor não encontrado' };
  }
  saveRcasToDisk();
  return { success: true };
}
