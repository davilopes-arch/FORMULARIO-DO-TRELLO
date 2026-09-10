import { useState, useEffect, useCallback } from 'react';
import {
  FormType,
  BoardDataResponse,
  DemandasFormData,
  FreteFormData,
  CadastroFormData,
  TeamName,
  CardSummaryData,
} from './types';
import { ADMIN_EMAIL, INITIAL_RCAS, isTeamLabel } from './data/constants';
import { FALLBACK_BOARD_DATA } from './data/defaultBoardData';
import {
  fetchBoardData,
  createTrelloCard,
  createBoardLabel,
  updateBoardLabel,
  deleteBoardLabel,
  fetchRCAs,
  addRCAApi,
  renameRCAApi,
  removeRCAApi,
} from './services/api';
import { Header } from './components/Header';
import { LoginView } from './components/LoginView';
import { MainMenuView } from './components/MainMenuView';
import { DemandasForm } from './components/DemandasForm';
import { FreteForm } from './components/FreteForm';
import { CadastroForm } from './components/CadastroForm';
import { SuccessView } from './components/SuccessView';

type ViewState =
  | 'loading'
  | 'error'
  | 'login'
  | 'menu'
  | 'form_demandas'
  | 'form_frete'
  | 'form_cadastro'
  | 'success';

export default function App() {
  const [view, setView] = useState<ViewState>('loading');
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [boardData, setBoardData] = useState<BoardDataResponse | null>(null);
  const [rcasByTeam, setRcasByTeam] = useState<Record<TeamName, string[]>>(INITIAL_RCAS);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusText, setStatusText] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [createdCardUrl, setCreatedCardUrl] = useState('');
  const [lastFormType, setLastFormType] = useState<FormType>('demandas');
  const [lastSummary, setLastSummary] = useState<CardSummaryData | null>(null);

  const isAdmin = Boolean(
    userEmail && userEmail.toLowerCase().trim() === ADMIN_EMAIL
  );

  // Load initial session and board data
  const loadData = useCallback(async () => {
    const savedEmail = localStorage.getItem('cx_user_email');
    if (!savedEmail) {
      setView('login');
      return;
    }

    setUserEmail(savedEmail);
    setView('loading');
    setErrorMessage('');

    try {
      // Fetch both board data and RCAs from backend with bulletproof fallbacks
      const [boardResp, rcaResp] = await Promise.all([
        fetchBoardData().catch((err) => {
          console.warn('Erro ao carregar boardData, usando fallback:', err);
          return FALLBACK_BOARD_DATA;
        }),
        fetchRCAs().catch((err) => {
          console.warn('Erro ao carregar RCAs, usando fallback:', err);
          return INITIAL_RCAS;
        }),
      ]);

      setBoardData(boardResp || FALLBACK_BOARD_DATA);
      if (rccaRespValid(rcaResp)) {
        setRcasByTeam(rcaResp);
      } else {
        setRcasByTeam(INITIAL_RCAS);
      }
      setView('menu');
    } catch (err: any) {
      console.warn('Fallback ativado no loadData:', err);
      setBoardData(FALLBACK_BOARD_DATA);
      setRcasByTeam(INITIAL_RCAS);
      setView('menu');
    }
  }, []);

  function rccaRespValid(res: any): res is Record<TeamName, string[]> {
    return res && typeof res === 'object' && 'Farol' in res;
  }

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleLogin = (email: string) => {
    setUserEmail(email);
    localStorage.setItem('cx_user_email', email);
    loadData();
  };

  const handleLogout = () => {
    if (confirm('Deseja sair? Seu e-mail salvo será removido.')) {
      setUserEmail(null);
      localStorage.removeItem('cx_user_email');
      setView('login');
    }
  };

  const handleSelectForm = (type: FormType) => {
    setLastFormType(type);
    if (type === 'demandas') setView('form_demandas');
    else if (type === 'frete') setView('form_frete');
    else if (type === 'cadastro') setView('form_cadastro');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBackToMenu = () => {
    setView('menu');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // RCA Admin Handlers
  const handleAddRCA = async (team: TeamName, name: string) => {
    const updated = await addRCAApi(team, name);
    setRcasByTeam(updated);
  };

  const handleRenameRCA = async (team: TeamName, oldName: string, newName: string) => {
    const updated = await renameRCAApi(team, oldName, newName);
    setRcasByTeam(updated);
  };

  const handleRemoveRCA = async (team: TeamName, name: string) => {
    const updated = await removeRCAApi(team, name);
    setRcasByTeam(updated);
  };

  // Label Admin Handlers
  const handleAddLabel = async (name: string) => {
    await createBoardLabel(name, 'blue');
    const fresh = await fetchBoardData(true);
    setBoardData(fresh);
  };

  const handleRenameLabel = async (id: string, name: string) => {
    await updateBoardLabel(id, name);
    const fresh = await fetchBoardData(true);
    setBoardData(fresh);
  };

  const handleRemoveLabel = async (id: string, _name: string) => {
    await deleteBoardLabel(id);
    const fresh = await fetchBoardData(true);
    setBoardData(fresh);
  };

  // Submit Demandas
  const handleSubmitDemandas = async (data: DemandasFormData) => {
    if (!boardData || !userEmail) return;
    setIsSubmitting(true);
    setStatusText('Criando card no Trello...');

    try {
      const rca = data.rca?.nome || '';
      const eq = data.equipe?.nome || '';

      const descCard = [
        `👤 RCA: ${rca}`,
        `🔗 ID Integrador: ${data.idint}`,
        data.origem && `📍 Origem: ${data.origem}`,
        `📦 Nº Pedido: ${data.pedido}`,
        data.protocolo && `🎫 Protocolo: ${data.protocolo}`,
        data.nfFutura && `🧾 NF Futura: ${data.nfFutura}`,
        data.nfSaida && `🧾 NF Saída: ${data.nfSaida}`,
        data.transportadora && `🚚 Transportadora: ${data.transportadora}`,
        `---`,
        `📋 *Descrição da Situação:*\n${data.descricao}`,
      ]
        .filter(Boolean)
        .join('\n');

      // Team label if exists on board
      const teamLabel = boardData.labels.find(
        (l) => isTeamLabel(l.name) && l.name.toUpperCase().includes(eq.toUpperCase())
      );

      const allLabelIds = Array.from(
        new Set([...(teamLabel ? [teamLabel.id] : []), ...data.situacaoIds])
      );

      if (data.anexos.length > 0) {
        setStatusText(`Enviando ${data.anexos.length} anexo(s)...`);
      }

      const res = await createTrelloCard({
        type: 'demandas',
        name: data.nome,
        desc: descCard,
        idList: boardData.defaultListDemandasId,
        idLabels: allLabelIds,
        userEmail,
        customFields: {
          'CRIADO POR': userEmail,
          'RCA': rca,
          'ID(INTEGRADOR)': data.idint,
          'PROTOCOLO': data.protocolo,
          'ORIGEM': data.origem || undefined,
          'NUMERO DO PEDIDO': data.pedido,
          'NF FUTURA': data.nfFutura,
          'NF DE SAÍDA': data.nfSaida,
          'TRANSPORTADORA': data.transportadora,
          'DESCRIÇÃO DA SITUAÇÃO': data.descricao,
        },
        attachments: data.anexos.map((a) => ({
          name: a.name,
          dataUrl: a.dataUrl,
        })),
      });

      const finalUrl = res.url || res.shortUrl;
      const situacoesNomes = data.situacaoIds
        .map((id) => boardData.labels.find((l) => l.id === id)?.name)
        .filter(Boolean) as string[];

      setCreatedCardUrl(finalUrl);
      setLastSummary({
        formType: 'demandas',
        title: data.nome,
        cardUrl: finalUrl,
        rcaName: rca,
        teamName: eq,
        teamEmoji: data.equipe?.emoji,
        origem: data.origem || undefined,
        pedido: data.pedido,
        protocolo: data.protocolo,
        idClienteOuIntegrador: data.idint,
        situacoesNomes,
      });
      setView('success');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err: any) {
      alert(`Erro ao criar card:\n${err.message}`);
    } finally {
      setIsSubmitting(false);
      setStatusText('');
    }
  };

  // Submit Frete
  const handleSubmitFrete = async (data: FreteFormData) => {
    if (!boardData || !userEmail) return;
    setIsSubmitting(true);
    setStatusText('Solicitando frete...');

    try {
      const rca = data.rca?.nome || '';
      const eq = data.equipe?.nome || '';

      const descCard = [
        `👤 RCA: ${rca}`,
        `🏷️ Equipe: ${data.equipe?.emoji} ${eq}`,
        `📍 Origem: ${data.origem}`,
        `🆔 ID Cliente: ${data.idCliente}`,
        `📮 CEP: ${data.cep}`,
        data.linkOrcamento && `🔗 Link do Orçamento: ${data.linkOrcamento}`,
        data.observacoes && `\n📋 Observações:\n${data.observacoes}`,
        `---`,
        `📝 Criado por: ${userEmail}`,
      ]
        .filter(Boolean)
        .join('\n');

      const norm = (s: string) =>
        s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toUpperCase().trim();

      const freteLabel = boardData.labels.find((l) => norm(l.name).includes('FRETE'));
      const teamLabel = boardData.labels.find(
        (l) => isTeamLabel(l.name) && norm(l.name).includes(norm(eq))
      );

      const labelIds = [teamLabel?.id, freteLabel?.id].filter(Boolean) as string[];

      if (data.anexos.length > 0) {
        setStatusText(`Enviando ${data.anexos.length} anexo(s)...`);
      }

      const res = await createTrelloCard({
        type: 'frete',
        name: data.nome,
        desc: descCard,
        idList: boardData.defaultListFreteId,
        idLabels: labelIds,
        userEmail,
        customFields: {
          'RCA': rca,
          'ID(INTEGRADOR)': data.idCliente,
          'CRIADO POR': userEmail,
          'LINK': data.linkOrcamento,
        },
        attachments: data.anexos.map((a) => ({
          name: a.name,
          dataUrl: a.dataUrl,
        })),
      });

      const finalUrl = res.url || res.shortUrl;
      setCreatedCardUrl(finalUrl);
      setLastSummary({
        formType: 'frete',
        title: data.nome,
        cardUrl: finalUrl,
        rcaName: rca,
        teamName: eq,
        teamEmoji: data.equipe?.emoji,
        origem: data.origem || undefined,
        idClienteOuIntegrador: data.idCliente,
        cep: data.cep,
        linkOrcamento: data.linkOrcamento,
      });
      setView('success');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err: any) {
      alert(`Erro ao criar card de frete:\n${err.message}`);
    } finally {
      setIsSubmitting(false);
      setStatusText('');
    }
  };

  // Submit Cadastro
  const handleSubmitCadastro = async (data: CadastroFormData) => {
    if (!boardData || !userEmail) return;
    setIsSubmitting(true);
    setStatusText('Solicitando cadastro...');

    try {
      const rca = data.rca?.nome || '';
      const eq = data.equipe?.nome || '';

      const descCard = [
        `RCA: ${rca}`,
        `Equipe: ${data.equipe?.emoji} ${eq}`,
        `Origem: ${data.origem || '—'}`,
        `Cliente: ${data.nomeCliente}`,
        data.cpfCnpj && `CPF/CNPJ: ${data.cpfCnpj}`,
        data.idIntegrador && `ID Integrador: ${data.idIntegrador}`,
        data.observacoes && `Observações: ${data.observacoes}`,
        `---`,
        `Criado por: ${userEmail}`,
      ]
        .filter(Boolean)
        .join('\n');

      const norm = (s: string) =>
        s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toUpperCase().trim();

      const cadLabel = boardData.labels.find((l) => norm(l.name).includes('CADASTRO'));
      const teamLabel = boardData.labels.find(
        (l) => isTeamLabel(l.name) && norm(l.name).includes(norm(eq))
      );

      const labelIds = [teamLabel?.id, cadLabel?.id].filter(Boolean) as string[];

      if (data.anexos.length > 0) {
        setStatusText(`Enviando ${data.anexos.length} anexo(s)...`);
      }

      const res = await createTrelloCard({
        type: 'cadastro',
        name: data.titulo,
        desc: descCard,
        idList: boardData.defaultListCadastroId,
        idLabels: labelIds,
        userEmail,
        customFields: {
          'RCA': rca,
          'ID(INTEGRADOR)': data.idIntegrador,
          'CRIADO POR': userEmail,
        },
        attachments: data.anexos.map((a) => ({
          name: a.name,
          dataUrl: a.dataUrl,
        })),
      });

      const finalUrl = res.url || res.shortUrl;
      setCreatedCardUrl(finalUrl);
      setLastSummary({
        formType: 'cadastro',
        title: data.titulo,
        cardUrl: finalUrl,
        nomeCliente: data.nomeCliente,
        cpfCnpj: data.cpfCnpj,
        idClienteOuIntegrador: data.idIntegrador,
        rcaName: rca,
        teamName: eq,
        teamEmoji: data.equipe?.emoji,
        origem: data.origem || undefined,
      });
      setView('success');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err: any) {
      alert(`Erro ao criar card de cadastro:\n${err.message}`);
    } finally {
      setIsSubmitting(false);
      setStatusText('');
    }
  };

  return (
    <div className="page">
      <Header
        userEmail={userEmail}
        onLogout={handleLogout}
      />

      {/* VIEW: LOGIN */}
      {view === 'login' && <LoginView onLogin={handleLogin} />}

      {/* VIEW: LOADING */}
      {view === 'loading' && (
        <div className="spinner-wrap">
          <div className="spinner" />
          <div className="spinner-label">Conectando ao Trello...</div>
        </div>
      )}

      {/* VIEW: ERROR */}
      {view === 'error' && (
        <div className="py-6">
          <div className="error-box">
            <h2>Erro de conexão</h2>
            <p>{errorMessage || 'Não foi possível conectar ao Trello.'}</p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mt-4">
              <button
                type="button"
                className="btn-retry"
                onClick={loadData}
              >
                ↻ Tentar novamente
              </button>
              <button
                type="button"
                className="text-xs text-stone-600 hover:text-stone-900 underline px-3 py-2 cursor-pointer transition-colors"
                onClick={() => {
                  localStorage.removeItem('cx_user_email');
                  setUserEmail(null);
                  setView('login');
                }}
              >
                Trocar de e-mail / Fazer login novamente
              </button>
            </div>
          </div>
        </div>
      )}

      {/* VIEW: MENU */}
      {view === 'menu' && (
        <MainMenuView onSelectForm={handleSelectForm} />
      )}

      {/* VIEW: FORM DEMANDAS */}
      {view === 'form_demandas' && boardData && (
        <DemandasForm
          onBackToMenu={handleBackToMenu}
          onSubmit={handleSubmitDemandas}
          isSubmitting={isSubmitting}
          statusText={statusText}
          labels={boardData.labels}
          rcasByTeam={rcasByTeam}
          isAdmin={isAdmin}
          onAddRCA={handleAddRCA}
          onRenameRCA={handleRenameRCA}
          onRemoveRCA={handleRemoveRCA}
          onAddLabel={handleAddLabel}
          onRenameLabel={handleRenameLabel}
          onRemoveLabel={handleRemoveLabel}
        />
      )}

      {/* VIEW: FORM FRETE */}
      {view === 'form_frete' && (
        <FreteForm
          onBackToMenu={handleBackToMenu}
          onSubmit={handleSubmitFrete}
          isSubmitting={isSubmitting}
          statusText={statusText}
          rcasByTeam={rcasByTeam}
          isAdmin={isAdmin}
          onAddRCA={handleAddRCA}
          onRenameRCA={handleRenameRCA}
          onRemoveRCA={handleRemoveRCA}
        />
      )}

      {/* VIEW: FORM CADASTRO */}
      {view === 'form_cadastro' && (
        <CadastroForm
          onBackToMenu={handleBackToMenu}
          onSubmit={handleSubmitCadastro}
          isSubmitting={isSubmitting}
          statusText={statusText}
          rcasByTeam={rcasByTeam}
          isAdmin={isAdmin}
          onAddRCA={handleAddRCA}
          onRenameRCA={handleRenameRCA}
          onRemoveRCA={handleRemoveRCA}
        />
      )}

      {/* VIEW: SUCCESS */}
      {view === 'success' && (
        <SuccessView
          formType={lastFormType}
          cardUrl={createdCardUrl}
          summary={lastSummary}
          onReset={() => {
            if (lastFormType === 'demandas') setView('form_demandas');
            else if (lastFormType === 'frete') setView('form_frete');
            else setView('form_cadastro');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          onBackToMenu={handleBackToMenu}
        />
      )}
    </div>
  );
}
