export type FormType = 'demandas' | 'frete' | 'cadastro';

export type TeamName = 'Farol' | 'Cactus' | 'Girassol' | 'Raio' | 'Clareou';

export interface TeamInfo {
  nome: TeamName;
  emoji: string;
}

export interface RCAInfo {
  nome: string;
  eq: TeamName;
}

export interface TrelloLabel {
  id: string;
  name: string;
  color: string;
}

export interface TrelloList {
  id: string;
  name: string;
}

export interface BoardDataResponse {
  boardName: string;
  lists: TrelloList[];
  labels: TrelloLabel[];
  customFields: Record<string, string>;
  defaultListDemandasId: string;
  defaultListFreteId: string;
  defaultListCadastroId: string;
}

export interface AttachmentItem {
  id?: string;
  name: string;
  dataUrl: string; // base64 data url
  size?: number;
}

export interface DemandasFormData {
  nome: string;
  equipe: TeamInfo | null;
  rca: RCAInfo | null;
  idint: string;
  protocolo: string;
  origem: 'MATRIZ' | 'FILIAL' | null;
  pedido: string;
  nfFutura: string;
  nfSaida: string;
  transportadora: string;
  situacaoIds: string[];
  descricao: string;
  anexos: AttachmentItem[];
}

export interface FreteFormData {
  nome: string;
  equipe: TeamInfo | null;
  rca: RCAInfo | null;
  origem: 'MATRIZ' | 'FILIAL' | null;
  idCliente: string;
  cep: string;
  linkOrcamento: string;
  observacoes: string;
  anexos: AttachmentItem[];
}

export interface CadastroFormData {
  titulo: string;
  equipe: TeamInfo | null;
  rca: RCAInfo | null;
  origem: 'MATRIZ' | 'FILIAL' | null;
  nomeCliente: string;
  cpfCnpj: string;
  idIntegrador: string;
  observacoes: string;
  anexos: AttachmentItem[];
}

export interface CardCreateResult {
  success: boolean;
  cardId: string;
  url: string;
  shortUrl: string;
  warnings?: string[];
}

export interface CardSummaryData {
  formType: FormType;
  title: string;
  cardUrl: string;
  rcaName?: string;
  teamName?: string;
  teamEmoji?: string;
  origem?: string;
  pedido?: string;
  protocolo?: string;
  idClienteOuIntegrador?: string;
  nomeCliente?: string;
  cpfCnpj?: string;
  cep?: string;
  linkOrcamento?: string;
  situacoesNomes?: string[];
}

