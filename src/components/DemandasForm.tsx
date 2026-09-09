import { useState } from 'react';
import {
  DemandasFormData,
  RCAInfo,
  TeamInfo,
  TrelloLabel,
  TeamName,
} from '../types';
import { TEAMS, getTrelloColor, isTeamLabel } from '../data/constants';
import { AnexoUpload } from './AnexoUpload';
import { RcaModal } from './RcaModal';
import { SituacaoModal } from './SituacaoModal';

interface DemandasFormProps {
  onBackToMenu: () => void;
  onSubmit: (data: DemandasFormData) => Promise<void>;
  isSubmitting: boolean;
  statusText?: string;
  labels: TrelloLabel[];
  rcasByTeam: Record<TeamName, string[]>;
  isAdmin: boolean;
  onAddRCA: (team: TeamName, name: string) => Promise<void>;
  onRenameRCA: (team: TeamName, oldName: string, newName: string) => Promise<void>;
  onRemoveRCA: (team: TeamName, name: string) => Promise<void>;
  onAddLabel: (name: string) => Promise<void>;
  onRenameLabel: (id: string, name: string) => Promise<void>;
  onRemoveLabel: (id: string, name: string) => Promise<void>;
}

const INITIAL_STATE: DemandasFormData = {
  nome: '',
  equipe: null,
  rca: null,
  idint: '',
  protocolo: '',
  origem: null,
  pedido: '',
  nfFutura: '',
  nfSaida: '',
  transportadora: '',
  situacaoIds: [],
  descricao: '',
  anexos: [],
};

export function DemandasForm({
  onBackToMenu,
  onSubmit,
  isSubmitting,
  statusText,
  labels,
  rcasByTeam,
  isAdmin,
  onAddRCA,
  onRenameRCA,
  onRemoveRCA,
  onAddLabel,
  onRenameLabel,
  onRemoveLabel,
}: DemandasFormProps) {
  const [formData, setFormData] = useState<DemandasFormData>(INITIAL_STATE);
  const [errors, setErrors] = useState<Record<string, boolean>>({});
  const [isRcaModalOpen, setIsRcaModalOpen] = useState(false);
  const [isSitModalOpen, setIsSitModalOpen] = useState(false);

  const clearError = (field: string) => {
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: false }));
    }
  };

  const handleSelectTeam = (team: TeamInfo) => {
    let nextRca = formData.rca;
    if (nextRca && nextRca.eq !== team.nome) {
      nextRca = null;
    }
    setFormData((prev) => ({
      ...prev,
      equipe: team,
      rca: nextRca,
    }));
    clearError('equipe');
  };

  const handleSelectRCA = (rca: RCAInfo) => {
    const teamObj = TEAMS.find((t) => t.nome === rca.eq) || null;
    setFormData((prev) => ({
      ...prev,
      rca,
      equipe: prev.equipe || teamObj,
    }));
    clearError('rca');
  };

  const handleConfirmSituacoes = (selectedIds: string[]) => {
    setFormData((prev) => ({
      ...prev,
      situacaoIds: selectedIds,
    }));
    if (selectedIds.length > 0) {
      clearError('situacao');
    }
  };

  const handleReset = () => {
    setFormData(INITIAL_STATE);
    setErrors({});
  };

  const validate = (): boolean => {
    const newErrors: Record<string, boolean> = {};
    if (!formData.nome.trim()) newErrors.nome = true;
    if (!formData.equipe) newErrors.equipe = true;
    if (!formData.rca) newErrors.rca = true;
    if (!formData.idint.trim()) newErrors.idint = true;
    if (!formData.origem) newErrors.origem = true;
    if (!formData.pedido.trim()) newErrors.pedido = true;
    if (formData.situacaoIds.length === 0) newErrors.situacao = true;
    if (!formData.descricao.trim()) newErrors.descricao = true;

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) {
      return;
    }
    await onSubmit(formData);
  };

  // Selected situacao labels
  const selectedLabels = formData.situacaoIds
    .map((id) => labels.find((l) => l.id === id))
    .filter(Boolean) as TrelloLabel[];

  // Also include team label in preview
  const teamLabel = formData.equipe
    ? labels.find((l) => isTeamLabel(l.name) && l.name.toUpperCase().includes(formData.equipe!.nome.toUpperCase()))
    : null;

  const allPreviewTags = [...(teamLabel ? [teamLabel] : []), ...selectedLabels];

  const hasPreviewData =
    Boolean(formData.nome.trim()) ||
    Boolean(formData.rca) ||
    Boolean(formData.idint.trim()) ||
    allPreviewTags.length > 0;

  return (
    <div id="st-form">
      <button
        type="button"
        className="btn-back-menu"
        onClick={onBackToMenu}
      >
        ← Menu principal
      </button>

      <div className="form-body">
        {/* NOME E TÍTULO */}
        <div className={`field ${errors.nome ? 'invalid' : ''}`} id="f-nome">
          <div className="field-head">
            <div className="field-label">
              Nome e Título <span className="req">*</span>
            </div>
            <div className="field-hint">título do card no Trello</div>
          </div>
          <input
            type="text"
            className="custom-input"
            id="i-nome"
            placeholder="Ex: João Silva – Pedido #12345 com atraso na entrega"
            value={formData.nome}
            onChange={(e) => {
              setFormData({ ...formData, nome: e.target.value });
              clearError('nome');
            }}
          />
          {errors.nome && <div className="field-err">Campo obrigatório.</div>}
        </div>

        {/* EQUIPE */}
        <div className={`field ${errors.equipe ? 'invalid' : ''}`} id="f-equipe">
          <div className="field-head">
            <div className="field-label">
              Equipe <span className="req">*</span>
            </div>
          </div>
          <div className="eq-row">
            {TEAMS.map((team) => (
              <div
                key={team.nome}
                className={`eq-box ${formData.equipe?.nome === team.nome ? 'sel' : ''}`}
                id={`eq-${team.nome.toLowerCase()}`}
                onClick={() => handleSelectTeam(team)}
              >
                <span className="eq-ico">{team.emoji}</span>
                <span className="eq-name">{team.nome}</span>
              </div>
            ))}
          </div>
          {errors.equipe && <div className="field-err">Selecione a equipe.</div>}
        </div>

        {/* RCA */}
        <div className={`field ${errors.rca ? 'invalid' : ''}`} id="f-rca">
          <div className="field-head">
            <div className="field-label">
              RCA <span className="req">*</span>
            </div>
            <div className="field-hint">consultor responsável</div>
          </div>

          <div
            className="rca-display"
            id="rca-display"
            onClick={() => setIsRcaModalOpen(true)}
          >
            <div>
              {formData.rca ? (
                <>
                  <div className="rca-display-name">{formData.rca.nome}</div>
                  <div className="rca-display-eq">
                    {TEAMS.find((t) => t.nome === formData.rca?.eq)?.emoji} {formData.rca.eq}
                  </div>
                </>
              ) : (
                <div className="rca-placeholder">Selecionar consultor...</div>
              )}
            </div>
            <div className="rca-display-arrow">▼</div>
          </div>
          {errors.rca && <div className="field-err">Selecione o RCA responsável.</div>}
        </div>

        {/* ORIGEM */}
        <div className={`field ${errors.origem ? 'invalid' : ''}`} id="f-orig">
          <div className="field-head">
            <div className="field-label">
              Origem <span className="req">*</span>
            </div>
          </div>
          <div className="toggle-row">
            <div
              className={`toggle-opt ${formData.origem === 'MATRIZ' ? 'sel' : ''}`}
              id="tog-matriz"
              onClick={() => {
                setFormData({ ...formData, origem: 'MATRIZ' });
                clearError('origem');
              }}
            >
              <span className="tog-icon">🏢</span>
              Matriz
            </div>
            <div
              className={`toggle-opt ${formData.origem === 'FILIAL' ? 'sel' : ''}`}
              id="tog-filial"
              onClick={() => {
                setFormData({ ...formData, origem: 'FILIAL' });
                clearError('origem');
              }}
            >
              <span className="tog-icon">🏬</span>
              Filial
            </div>
          </div>
          {errors.origem && <div className="field-err">Selecione a origem.</div>}
        </div>

        {/* PROTOCOLO */}
        <div className="field" id="f-prot">
          <div className="field-head">
            <div className="field-label">Protocolo</div>
            <div className="field-hint">opcional</div>
          </div>
          <input
            type="text"
            className="custom-input"
            id="i-prot"
            placeholder="Ex: PROT-2024-00456"
            value={formData.protocolo}
            onChange={(e) => setFormData({ ...formData, protocolo: e.target.value })}
          />
        </div>

        {/* NÚMERO DO PEDIDO */}
        <div className={`field ${errors.pedido ? 'invalid' : ''}`} id="f-pedido">
          <div className="field-head">
            <div className="field-label">
              Número do Pedido <span className="req">*</span>
            </div>
          </div>
          <input
            type="text"
            className="custom-input"
            id="i-pedido"
            placeholder="Ex: 98765"
            value={formData.pedido}
            onChange={(e) => {
              setFormData({ ...formData, pedido: e.target.value });
              clearError('pedido');
            }}
          />
          {errors.pedido && <div className="field-err">Campo obrigatório.</div>}
        </div>

        {/* ID INTEGRADOR */}
        <div className={`field ${errors.idint ? 'invalid' : ''}`} id="f-idint">
          <div className="field-head">
            <div className="field-label">
              ID (Integrador) <span className="req">*</span>
            </div>
            <div className="field-hint">código</div>
          </div>
          <input
            type="text"
            className="custom-input"
            id="i-idint"
            placeholder="Ex: INT-00123"
            value={formData.idint}
            onChange={(e) => {
              setFormData({ ...formData, idint: e.target.value });
              clearError('idint');
            }}
          />
          {errors.idint && <div className="field-err">Campo obrigatório.</div>}
        </div>

        {/* NF FUTURA */}
        <div className="field" id="f-nff">
          <div className="field-head">
            <div className="field-label">NF Futura</div>
            <div className="field-hint">opcional</div>
          </div>
          <input
            type="text"
            className="custom-input"
            id="i-nff"
            placeholder="Número da NF Futura"
            value={formData.nfFutura}
            onChange={(e) => setFormData({ ...formData, nfFutura: e.target.value })}
          />
        </div>

        {/* NF DE SAÍDA */}
        <div className="field" id="f-nfs">
          <div className="field-head">
            <div className="field-label">NF de Saída</div>
            <div className="field-hint">opcional</div>
          </div>
          <input
            type="text"
            className="custom-input"
            id="i-nfs"
            placeholder="Número da NF de Saída"
            value={formData.nfSaida}
            onChange={(e) => setFormData({ ...formData, nfSaida: e.target.value })}
          />
        </div>

        {/* TRANSPORTADORA */}
        <div className="field" id="f-transp">
          <div className="field-head">
            <div className="field-label">Transportadora</div>
            <div className="field-hint">opcional</div>
          </div>
          <input
            type="text"
            className="custom-input"
            id="i-transp"
            placeholder="Nome da transportadora"
            value={formData.transportadora}
            onChange={(e) => setFormData({ ...formData, transportadora: e.target.value })}
          />
        </div>

        {/* SITUAÇÃO / ETIQUETAS */}
        <div className={`field ${errors.situacao ? 'invalid' : ''}`} id="f-situacao">
          <div className="field-head">
            <div className="field-label">
              Situação / Etiquetas <span className="req">*</span>
            </div>
            <div className="field-hint" id="et-hint">
              {formData.situacaoIds.length === 0
                ? 'Selecione uma ou mais'
                : `${formData.situacaoIds.length} selecionada${formData.situacaoIds.length > 1 ? 's' : ''}`}
            </div>
          </div>

          <div
            className="rca-display"
            id="sit-display"
            onClick={() => setIsSitModalOpen(true)}
          >
            <div>
              {selectedLabels.length > 0 ? (
                <div className="rca-display-name">
                  {selectedLabels.map((l) => l.name).join(' · ')}
                </div>
              ) : (
                <div className="rca-placeholder">Selecionar situações no Trello...</div>
              )}
            </div>
            <div className="rca-display-arrow">▼</div>
          </div>
          {errors.situacao && <div className="field-err">Selecione pelo menos uma situação.</div>}
        </div>

        {/* DESCRIÇÃO DA SITUAÇÃO */}
        <div className={`field ${errors.descricao ? 'invalid' : ''}`} id="f-desc">
          <div className="field-head">
            <div className="field-label">
              Descrição da Situação <span className="req">*</span>
            </div>
            <div className="field-hint">sem restrição curta — descreva com todos os detalhes</div>
          </div>
          <textarea
            className="custom-textarea min-h-[140px]"
            id="i-desc"
            placeholder="Descreva a situação detalhadamente (ocorrido, histórico, datas, etc.)..."
            maxLength={4000}
            value={formData.descricao}
            onChange={(e) => {
              setFormData({ ...formData, descricao: e.target.value });
              clearError('descricao');
            }}
          />
          <div className="char-wrap">
            <span
              className={`char-c ${
                formData.descricao.length > 3500
                  ? formData.descricao.length >= 4000
                    ? 'over'
                    : 'warn'
                  : ''
              }`}
              id="char-c"
            >
              {formData.descricao.length} / 4.000 caracteres
            </span>
          </div>
          {errors.descricao && <div className="field-err">Campo obrigatório.</div>}
        </div>

        {/* ANEXOS */}
        <AnexoUpload
          idPrefix="danexo"
          anexos={formData.anexos}
          onChange={(anexos) => setFormData({ ...formData, anexos })}
        />
      </div>

      {/* PRÉVIA */}
      <div className="preview-wrap" id="preview">
        <span className="preview-header-label">PRÉVIA DO CARD</span>
        <div className="preview-list">→ A FAZER</div>

        <div id="preview-content">
          {!hasPreviewData ? (
            <div className="preview-empty">
              Preencha os campos para ver a prévia do card em tempo real.
            </div>
          ) : (
            <div>
              {formData.nome && <div className="preview-title">{formData.nome}</div>}

              {allPreviewTags.length > 0 && (
                <div className="preview-tags">
                  {allPreviewTags.map((et) => {
                    const color = getTrelloColor(et.color);
                    return (
                      <span
                        key={et.id}
                        className="preview-tag"
                        style={{
                          backgroundColor: `${color}22`,
                          color: color,
                          border: `1px solid ${color}55`,
                        }}
                      >
                        {et.name}
                      </span>
                    );
                  })}
                </div>
              )}

              <div className="preview-meta">
                {formData.rca && (
                  <div className="preview-meta-item">
                    RCA: <strong>{formData.rca.nome}</strong>
                  </div>
                )}
                {formData.equipe && (
                  <div className="preview-meta-item">
                    Equipe:{' '}
                    <strong>
                      {formData.equipe.emoji} {formData.equipe.nome}
                    </strong>
                  </div>
                )}
                {formData.idint && (
                  <div className="preview-meta-item">
                    ID: <strong>{formData.idint}</strong>
                  </div>
                )}
                {formData.origem && (
                  <div className="preview-meta-item">
                    Origem: <strong>{formData.origem}</strong>
                  </div>
                )}
                {formData.pedido && (
                  <div className="preview-meta-item">
                    Pedido: <strong>{formData.pedido}</strong>
                  </div>
                )}
                {formData.protocolo && (
                  <div className="preview-meta-item">
                    Protocolo: <strong>{formData.protocolo}</strong>
                  </div>
                )}
                {formData.nfFutura && (
                  <div className="preview-meta-item">
                    NF Futura: <strong>{formData.nfFutura}</strong>
                  </div>
                )}
                {formData.nfSaida && (
                  <div className="preview-meta-item">
                    NF Saída: <strong>{formData.nfSaida}</strong>
                  </div>
                )}
                {formData.transportadora && (
                  <div className="preview-meta-item">
                    Transp.: <strong>{formData.transportadora}</strong>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* SUBMIT */}
      <div className="submit-area">
        <button
          type="button"
          className="btn-submit"
          id="btn-sub"
          onClick={handleSubmit}
          disabled={isSubmitting}
        >
          <span>{statusText || (isSubmitting ? 'Criando card...' : 'Criar card no Trello')}</span>
        </button>

        <button
          type="button"
          className="btn-reset"
          onClick={handleReset}
          disabled={isSubmitting}
        >
          Limpar formulário
        </button>
      </div>

      {/* MODALS */}
      <RcaModal
        isOpen={isRcaModalOpen}
        onClose={() => setIsRcaModalOpen(false)}
        onSelectRCA={handleSelectRCA}
        rcasByTeam={rcasByTeam}
        selectedRCA={formData.rca}
        filteredTeam={formData.equipe?.nome}
        isAdmin={isAdmin}
        onAddRCA={onAddRCA}
        onRenameRCA={onRenameRCA}
        onRemoveRCA={onRemoveRCA}
        titlePrefix="Selecionar RCA — Demandas"
      />

      <SituacaoModal
        isOpen={isSitModalOpen}
        onClose={() => setIsSitModalOpen(false)}
        labels={labels}
        selectedLabelIds={formData.situacaoIds}
        onConfirm={handleConfirmSituacoes}
        isAdmin={isAdmin}
        onAddLabel={onAddLabel}
        onRenameLabel={onRenameLabel}
        onRemoveLabel={onRemoveLabel}
      />
    </div>
  );
}
