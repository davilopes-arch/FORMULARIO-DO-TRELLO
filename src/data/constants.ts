import { TeamInfo, TeamName } from '../types';

export const ADMIN_EMAIL = 'davi.lopes@souenergy.com.br';

export const DEFAULT_TEAMS: TeamInfo[] = [
  { id: 'farol', nome: 'Farol', emoji: '🗼' },
  { id: 'cactus', nome: 'Cactus', emoji: '🌵' },
  { id: 'girassol', nome: 'Girassol', emoji: '🌻' },
  { id: 'raio', nome: 'Raio', emoji: '⚡' },
  { id: 'clareou', nome: 'Clareou', emoji: '🌅' },
];

export const TEAMS: TeamInfo[] = [...DEFAULT_TEAMS];

export const EQ_EMOJI: Record<string, string> = {
  Farol: '🗼',
  Cactus: '🌵',
  Girassol: '🌻',
  Raio: '⚡',
  Clareou: '🌅',
};

export const INITIAL_RCAS: Record<TeamName, string[]> = {
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

export const TRELLO_COLOR_MAP: Record<string, string> = {
  green: '#1a8a3c',
  green_light: '#4bbf6b',
  green_dark: '#0d5c28',
  yellow: '#c9821b',
  yellow_light: '#e8c840',
  yellow_dark: '#8f5c00',
  orange: '#d35400',
  orange_light: '#ff8533',
  orange_dark: '#a84300',
  red: '#c0392b',
  red_light: '#e74c3c',
  red_dark: '#7d1919',
  purple: '#7b2fa0',
  purple_light: '#9b6dff',
  purple_dark: '#521d6e',
  blue: '#0079bf',
  blue_light: '#33a3ea',
  blue_dark: '#004c78',
  sky: '#00aecc',
  sky_light: '#5acfed',
  sky_dark: '#007b91',
  lime: '#4bbf6b',
  lime_light: '#72cf8c',
  lime_dark: '#2e8b49',
  pink: '#e91e8c',
  pink_light: '#f26ab5',
  pink_dark: '#a81363',
  black: '#333333',
  black_light: '#555555',
  black_dark: '#111111',
};

export function getTrelloColor(color?: string): string {
  if (!color) return '#666666';
  const c = color.toLowerCase();
  if (TRELLO_COLOR_MAP[c]) return TRELLO_COLOR_MAP[c];
  const base = c.split('_')[0];
  return TRELLO_COLOR_MAP[base] || '#666666';
}

export function isTeamLabel(name: string, teamsList?: { nome: string }[]): boolean {
  if (!name) return false;
  const n = name.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  const defaultNomes = ['farol', 'cactus', 'girassol', 'raio', 'clareou'];
  const customNomes = teamsList
    ? teamsList.map((t) => t.nome.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, ''))
    : [];
  const allNomes = Array.from(new Set([...defaultNomes, ...customNomes]));
  return allNomes.some((eq) => eq && n.includes(eq));
}
