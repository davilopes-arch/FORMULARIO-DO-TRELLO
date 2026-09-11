import { useState } from 'react';
import {
  FreteFormData,
  RCAInfo,
  TeamInfo,
  TeamName,
} from '../types';
import { TEAMS } from '../data/constants';
import { AnexoUpload } from './AnexoUpload';
import { RcaModal } from './RcaModal';

interface FreteFormProps {
  onBackToMenu: () => void;
  onSubmit: (data: FreteFormData) => Promise<void>;
  isSubmitting: boolean;
  statusText?: string;
  rcasByTeam: Record<TeamName, string[]>;
  teams?: TeamInfo[];
  onOpenEquipeModal?: () => void;
  isAdmin: boolean;
  onAddRCA: (team: TeamName, name: string) => Promise<void>;
  onRenameRCA: (team: TeamName, oldName: string, newName: string) => Promise<void>;
  onRemoveRCA: (team: TeamName, name: string) => Promise<void>;
}

const INITIAL_STATE: FreteFormData = {
  nome: '',
  equipe: null,
  rca: null,
  origem: null,
  idCliente: '',
  cep: '',
  linkOrcamento: '',
  observacoes: '',
  anexos: [],
};

export function FreteForm({
  onBackToMenu,
  onSubmit,
  isSubmitting,
  statusText,
  rcasByTeam,
  teams = TEAMS,
  onOpenEquipeModal,
  isAdmin,
  onAddRCA,
  onRenameRCA,
  onRemoveRCA,
}: FreteFormProps) {
  const [formData, setFormData] = useState<FreteFormData>(INITIAL_STATE);
  const [errors, setErrors] = useState<Record<string, boolean>>({});
  const [isRcaModalOpen, setIsRcaModalOpen] = useState(false);

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
    const teamObj = teams.find((t) => t.nome === rca.eq) || null;
    setFormData((prev) => ({
      ...prev,
      rca,
      equipe: prev.equipe || teamObj,
    }));
    clearError('rca');
  };

  const handleCEPMask = (val: string) => {
    const clean = val.replace(/\D/g, '').slice(0, 8);
    const masked = clean.replace(/^(\d{5})(\d{1,3})/, '$1-$2');
    setFormData((prev) => ({ ...prev, cep: masked }));
    clearError('cep');
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
    if (!formData.origem) newErrors.origem = true;
    if (!formData.idCliente.trim()) newErrors.idCliente = true;
    if (!formData.cep.trim()) newErrors.cep = true;

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    await onSubmit(formData);
  };

  const hasPreviewData =
    Boolean(formData.nome.trim()) ||
    Boolean(formData.idCliente.trim()) ||
    Boolean(formData.cep.trim()) ||
    Boolean(formData.rca);

  return (
    <div id="st-frete">
      <button
        type="button"
        className="btn-back-menu"
        onClick={onBackToMenu}
      >
        ← Menu principal
      </button>

      <div className="form-body">
        {/* NOME / TITULO */}
        <div className={`field ${errors.nome ? 'invalid' : ''}`} id="ff-nome">
          <div className="field-head">
            <div className="field-label">
              Nome e Título <span className="req">*</span>
            </div>
            <div className="field-hint">título do card no Trello</div>
          </div>
          <input
            type="text"
            className="custom-input"
            id="fi-nome"
            placeholder="Ex: Cotação Frete – Cliente João Silva"
            value={formData.nome}
            onChange={(e) => {
              setFormData({ ...formData, nome: e.target.value });
              clearError('nome');
            }}
          />
          {errors.nome && <div className="field-err">Campo obrigatório.</div>}
        </div>

        {/* EQUIPE */}
        <div className={`field ${errors.equipe ? 'invalid' : ''}`} id="ff-equipe">
          <div className="field-head">
            <div className="field-label">
              Equipe <span className="req">*</span>
            </div>
            {onOpenEquipeModal && (
              <button
                type="button"
                className="text-xs font-mono font-bold text-[var(--ink2)] hover:text-[var(--ink)] bg-[var(--surface)] hover:bg-[var(--surface2)] border border-[var(--border2)] px-2.5 py-1 rounded transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
                onClick={onOpenEquipeModal}
                title="Editar nome e ícone das equipes"
              >
                <span>⚙️</span> Editar Equipes
              </button>
            )}
          </div>
          <div className="eq-row">
            {teams.map((team) => (
              <div
                key={team.id || team.nome}
                className={`eq-box ${formData.equipe?.nome === team.nome ? 'sel' : ''}`}
                id={`feq-${team.nome.toLowerCase().replace(/\s+/g, '-')}`}
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
        <div className={`field ${errors.rca ? 'invalid' : ''}`} id="ff-rca">
          <div className="field-head">
            <div className="field-label">
              RCA <span className="req">*</span>
            </div>
            <div className="field-hint">consultor responsável</div>
          </div>

          <div
            className="rca-display"
            id="frca-display"
            onClick={() => setIsRcaModalOpen(true)}
          >
            <div>
              {formData.rca ? (
                <>
                  <div className="rca-display-name">{formData.rca.nome}</div>
                  <div className="rca-display-eq">
                    {teams.find((t) => t.nome === formData.rca?.eq)?.emoji} {formData.rca.eq}
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
        <div className={`field ${errors.origem ? 'invalid' : ''}`} id="ff-orig">
          <div className="field-head">
            <div className="field-label">
              Origem <span className="req">*</span>
            </div>
          </div>
          <div className="toggle-row">
            <div
              className={`toggle-opt ${formData.origem === 'MATRIZ' ? 'sel' : ''}`}
              id="ftog-matriz"
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
              id="ftog-filial"
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

        {/* ID DO CLIENTE */}
        <div className={`field ${errors.idCliente ? 'invalid' : ''}`} id="ff-idcliente">
          <div className="field-head">
            <div className="field-label">
              ID do Cliente <span className="req">*</span>
            </div>
          </div>
          <input
            type="text"
            className="custom-input"
            id="fi-idcliente"
            placeholder="Ex: CLI-00123"
            value={formData.idCliente}
            onChange={(e) => {
              setFormData({ ...formData, idCliente: e.target.value });
              clearError('idCliente');
            }}
          />
          {errors.idCliente && <div className="field-err">Campo obrigatório.</div>}
        </div>

        {/* CEP */}
        <div className={`field ${errors.cep ? 'invalid' : ''}`} id="ff-cep">
          <div className="field-head">
            <div className="field-label">
              CEP <span className="req">*</span>
            </div>
            <div className="field-hint">destino</div>
          </div>
          <input
            type="text"
            className="custom-input"
            id="fi-cep"
            placeholder="Ex: 01310-100"
            maxLength={9}
            value={formData.cep}
            onChange={(e) => handleCEPMask(e.target.value)}
          />
          {errors.cep && <div className="field-err">Campo obrigatório.</div>}
        </div>

        {/* LINK DO ORÇAMENTO */}
        <div className="field" id="ff-link">
          <div className="field-head">
            <div className="field-label">Link do Orçamento</div>
            <div className="field-hint">opcional</div>
          </div>
          <input
            type="text"
            className="custom-input"
            id="fi-link"
            placeholder="https://..."
            value={formData.linkOrcamento}
            onChange={(e) => setFormData({ ...formData, linkOrcamento: e.target.value })}
          />
        </div>

        {/* OBSERVAÇÕES */}
        <div className="field" id="ff-desc">
          <div className="field-head">
            <div className="field-label">Observações</div>
            <div className="field-hint">opcional</div>
          </div>
          <textarea
            className="custom-textarea min-h-[100px]"
            id="fi-desc"
            placeholder="Informações adicionais sobre o frete..."
            maxLength={3000}
            value={formData.observacoes}
            onChange={(e) => setFormData({ ...formData, observacoes: e.target.value })}
          />
        </div>

        {/* ANEXOS */}
        <AnexoUpload
          idPrefix="fanexo"
          anexos={formData.anexos}
          onChange={(anexos) => setFormData({ ...formData, anexos })}
        />
      </div>

      {/* PRÉVIA FRETE */}
      <div className="preview-wrap" id="frete-preview">
        <span className="preview-header-label">PRÉVIA DO CARD</span>
        <div
          className="preview-list"
          style={{
            background: 'var(--yellow-bg)',
            color: 'var(--yellow)',
            borderColor: '#e8c840',
          }}
        >
          → SOLICITAÇÃO DE FRETE
        </div>

        <div id="frete-preview-content">
          {!hasPreviewData ? (
            <div className="preview-empty">Preencha os campos para ver a prévia em tempo real.</div>
          ) : (
            <div>
              {formData.nome && <div className="preview-title">{formData.nome}</div>}

              <div className="preview-tags">
                <span
                  className="preview-tag"
                  style={{
                    background: '#fef8e8',
                    color: 'var(--yellow)',
                    border: '1px solid #e8c840',
                  }}
                >
                  🚚 FRETE
                </span>
              </div>

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
                {formData.origem && (
                  <div className="preview-meta-item">
                    Origem: <strong>{formData.origem}</strong>
                  </div>
                )}
                {formData.idCliente && (
                  <div className="preview-meta-item">
                    ID: <strong>{formData.idCliente}</strong>
                  </div>
                )}
                {formData.cep && (
                  <div className="preview-meta-item">
                    CEP: <strong>{formData.cep}</strong>
                  </div>
                )}
                {formData.linkOrcamento && (
                  <div className="preview-meta-item">
                    Link:{' '}
                    <strong style={{ color: 'var(--blue)' }}>
                      ✓ preenchido
                    </strong>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* SUBMIT FRETE */}
      <div className="submit-area">
        <button
          type="button"
          className="btn-submit"
          id="btn-frete-sub"
          onClick={handleSubmit}
          disabled={isSubmitting}
          style={{
            background: '#c87800',
            borderColor: '#c87800',
            boxShadow: '3px 3px 0 #7a4800',
          }}
        >
          <span>{statusText || (isSubmitting ? 'Solicitando frete...' : '🚚 Solicitar Frete')}</span>
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

      {/* MODAL RCA FRETE */}
      <RcaModal
        isOpen={isRcaModalOpen}
        onClose={() => setIsRcaModalOpen(false)}
        onSelectRCA={handleSelectRCA}
        rcasByTeam={rcasByTeam}
        selectedRCA={formData.rca}
        filteredTeam={formData.equipe?.nome}
        isAdmin={isAdmin}
        teams={teams}
        onOpenEquipeModal={onOpenEquipeModal}
        onAddRCA={onAddRCA}
        onRenameRCA={onRenameRCA}
        onRemoveRCA={onRemoveRCA}
        titlePrefix="Selecionar RCA — Frete"
      />
    </div>
  );
}
