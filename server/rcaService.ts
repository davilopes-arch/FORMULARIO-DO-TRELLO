import fs from 'fs';
import path from 'path';

export type TeamName = 'Farol' | 'Cactus' | 'Girassol' | 'Raio' | 'Clareou';

const DEFAULT_RCAS: Record<TeamName, string[]> = {
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

let currentRCAs: Record<TeamName, string[]> = { ...DEFAULT_RCAS };

function loadFromDisk() {
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

function saveToDisk() {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(RCAS_FILE, JSON.stringify(currentRCAs, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error saving RCAs to disk:', err);
  }
}

// Initial load
loadFromDisk();

export function getRCAs(): Record<TeamName, string[]> {
  return currentRCAs;
}

export function addRCA(team: TeamName, name: string): { success: boolean; error?: string } {
  const cleanName = name.trim().toUpperCase();
  if (!cleanName) return { success: false, error: 'Nome inválido' };
  if (!currentRCAs[team]) currentRCAs[team] = [];
  if (currentRCAs[team].includes(cleanName)) {
    return { success: false, error: 'Consultor já cadastrado nessa equipe' };
  }
  currentRCAs[team].push(cleanName);
  currentRCAs[team].sort();
  saveToDisk();
  return { success: true };
}

export function renameRCA(team: TeamName, oldName: string, newName: string): { success: boolean; error?: string } {
  const cleanNewName = newName.trim().toUpperCase();
  if (!cleanNewName) return { success: false, error: 'Novo nome inválido' };
  const list = currentRCAs[team] || [];
  const idx = list.indexOf(oldName);
  if (idx === -1) return { success: false, error: 'Consultor não encontrado' };

  list[idx] = cleanNewName;
  list.sort();
  saveToDisk();
  return { success: true };
}

export function removeRCA(team: TeamName, name: string): { success: boolean; error?: string } {
  const list = currentRCAs[team] || [];
  const beforeLen = list.length;
  currentRCAs[team] = list.filter((n) => n !== name);
  if (currentRCAs[team].length === beforeLen) {
    return { success: false, error: 'Consultor não encontrado' };
  }
  saveToDisk();
  return { success: true };
}
