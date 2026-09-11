import { useState, useMemo } from 'react';
import {
  CadastroFormData,
  RCAInfo,
  TeamInfo,
  TeamName,
} from '../types';
import { TEAMS } from '../data/constants';
import { AnexoUpload } from './AnexoUpload';
import { RcaModal } from './RcaModal';
import { validateDocument } from '../utils/validators';

interface CadastroFormProps {
  onBackToMenu: () => void;
  onSubmit: (data: CadastroFormData) => Promise<void>;
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

const INITIAL_STATE: CadastroFormData = {
  titulo: '',
  equipe: null,
  rca: null,
  origem: null,
  nomeCliente: '',
  cpfCnpj: '',
  idIntegrador: '',
  observacoes: '',
  anexos: [],
};

export function CadastroForm({
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
}: CadastroFormProps) {
  const [formData, setFormData] = useState<CadastroFormData>(INITIAL_STATE);
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

  const docValidation = useMemo(() => {
    return validateDocument(formData.cpfCnpj);
  }, [formData.cpfCnpj]);

  const handleCpfCnpjMask = (raw: string) => {
    const digits = raw.replace(/\D/g, '').slice(0, 14);
    let masked = digits;
    if (digits.length <= 11) {
      masked = digits
        .replace(/(\d{3})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d{1,2})$/, '$1-$2');
    } else {
      masked = digits
        .replace(/^(\d{2})(\d)/, '$1.$2')
        .replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3')
        .replace(/\.(\d{3})(\d)/, '.$1/$2')
        .replace(/(\d{4})(\d{1,2})$/, '$1-$2');
    }
    setFormData((prev) => ({ ...prev, cpfCnpj: masked }));
    clearError('cpfCnpj');
  };

  const handleReset = () => {
    setFormData(INITIAL_STATE);
    setErrors({});
  };

  const validate = (): boolean => {
    const newErrors: Record<string, boolean> = {};
    if (!formData.titulo.trim()) newErrors.titulo = true;
    if (!formData.equipe) newErrors.equipe = true;
    if (!formData.rca) newErrors.rca = true;
    if (!formData.origem) newErrors.origem = true;
    if (!formData.nomeCliente.trim()) newErrors.nomeCliente = true;

    if (formData.cpfCnpj.trim()) {
      if (!docValidation.isValid) {
        newErrors.cpfCnpj = true;
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    await onSubmit(formData);
  };

  const hasPreviewData =
    Boolean(formData.titulo.trim()) ||
    Boolean(formData.nomeCliente.trim()) ||
    Boolean(formData.cpfCnpj.trim()) ||
    Boolean(formData.rca);

  return (
    <div id="st-cadastro">
      <button
        type="button"
        className="btn-back-menu"
        onClick={onBackToMenu}
      >
        ← Menu principal
      </button>

      <div className="cadastro-header">
        <div className="cadastro-badge">📋 Novo Cadastro</div>
        <h2>
          Novo <em>Cadastro</em>
        </h2>
        <p>
          Preencha os dados abaixo para criar um card na lista <strong>CADASTRO</strong> com todas as informações do cliente.
        </p>
      </div>

      <div className="form-body">
        {/* NOME E TITULO DO CARD */}
        <div className={`field ${errors.titulo ? 'invalid' : ''}`} id="fc-titulo">
          <div className="field-head">
            <div className="field-label">
              Nome e Título <span className="req">*</span>
            </div>
            <div className="field-hint">título do card no Trello</div>
          </div>
          <input
            type="text"
            className="custom-input"
            id="ci-titulo"
            placeholder="Ex: Cadastro – João Silva"
            value={formData.titulo}
            onChange={(e) => {
              setFormData({ ...formData, titulo: e.target.value });
              clearError('titulo');
            }}
          />
          {errors.titulo && <div className="field-err">Campo obrigatório.</div>}
        </div>

        {/* EQUIPE */}
        <div className={`field ${errors.equipe ? 'invalid' : ''}`} id="fc-equipe">
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
                id={`ceq-${team.nome.toLowerCase().replace(/\s+/g, '-')}`}
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
        <div className={`field ${errors.rca ? 'invalid' : ''}`} id="fc-rca">
          <div className="field-head">
            <div className="field-label">
              RCA <span className="req">*</span>
            </div>
            <div className="field-hint">consultor responsável</div>
          </div>

          <div
            className="rca-display"
            id="crca-display"
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
        <div className={`field ${errors.origem ? 'invalid' : ''}`} id="fc-orig">
          <div className="field-head">
            <div className="field-label">
              Origem <span className="req">*</span>
            </div>
          </div>
          <div className="toggle-row">
            <div
              className={`toggle-opt ${formData.origem === 'MATRIZ' ? 'sel' : ''}`}
              id="ctog-matriz"
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
              id="ctog-filial"
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

        {/* NOME DO CLIENTE */}
        <div className={`field ${errors.nomeCliente ? 'invalid' : ''}`} id="fc-nomecliente">
          <div className="field-head">
            <div className="field-label">
              Nome do Cliente <span className="req">*</span>
            </div>
          </div>
          <input
            type="text"
            className="custom-input"
            id="ci-nomecliente"
            placeholder="Ex: João Silva"
            value={formData.nomeCliente}
            onChange={(e) => {
              setFormData({ ...formData, nomeCliente: e.target.value });
              clearError('nomeCliente');
            }}
          />
          {errors.nomeCliente && <div className="field-err">Campo obrigatório.</div>}
        </div>

        {/* CPF / CNPJ */}
        <div className={`field ${errors.cpfCnpj ? 'invalid' : ''}`} id="fc-cpfcnpj">
          <div className="field-head">
            <div className="field-label">CPF / CNPJ</div>
            <div
              className="field-hint text-xs"
              id="cpfcnpj-hint"
              style={{
                color:
                  docValidation.type === 'cpf' || docValidation.type === 'cnpj'
                    ? 'var(--green, #1a8a3c)'
                    : docValidation.type === 'invalido'
                    ? 'var(--red, #c0392b)'
                    : 'inherit',
                fontWeight: docValidation.type === 'invalido' || docValidation.type === 'cpf' || docValidation.type === 'cnpj' ? '600' : 'normal',
              }}
            >
              {docValidation.message}
            </div>
          </div>
          <div className="relative flex items-center">
            <input
              type="text"
              className="custom-input w-full"
              id="ci-cpfcnpj"
              placeholder="000.000.000-00 ou CNPJ"
              maxLength={18}
              value={formData.cpfCnpj}
              onChange={(e) => handleCpfCnpjMask(e.target.value)}
            />
            {formData.cpfCnpj && (
              <div className="absolute right-3 pointer-events-none text-sm">
                {(docValidation.type === 'cpf' || docValidation.type === 'cnpj') && (
                  <span title="Dígitos verificados" className="text-emerald-600 font-bold">✓</span>
                )}
                {docValidation.type === 'invalido' && (
                  <span title="Dígitos inválidos" className="text-rose-600 font-bold">⚠</span>
                )}
              </div>
            )}
          </div>
          {errors.cpfCnpj && (
            <div className="field-err">
              O número de {docValidation.type === 'invalido' ? 'CPF/CNPJ' : 'documento'} informado possui dígitos verificadores inválidos.
            </div>
          )}
        </div>

        {/* ID INTEGRADOR */}
        <div className="field" id="fc-idint">
          <div className="field-head">
            <div className="field-label">ID (Integrador)</div>
            <div className="field-hint">opcional</div>
          </div>
          <input
            type="text"
            className="custom-input"
            id="ci-idint"
            placeholder="Ex: INT-00123"
            value={formData.idIntegrador}
            onChange={(e) => setFormData({ ...formData, idIntegrador: e.target.value })}
          />
        </div>

        {/* OBSERVAÇÕES */}
        <div className="field" id="fc-obs">
          <div className="field-head">
            <div className="field-label">Observações</div>
            <div className="field-hint">opcional</div>
          </div>
          <textarea
            className="custom-textarea min-h-[100px]"
            id="ci-obs"
            placeholder="Informações adicionais sobre o cadastro..."
            maxLength={3000}
            value={formData.observacoes}
            onChange={(e) => setFormData({ ...formData, observacoes: e.target.value })}
          />
        </div>

        {/* ANEXOS */}
        <AnexoUpload
          idPrefix="canexo"
          anexos={formData.anexos}
          onChange={(anexos) => setFormData({ ...formData, anexos })}
        />
      </div>

      {/* PRÉVIA CADASTRO */}
      <div className="preview-wrap" id="cadastro-preview">
        <span className="preview-header-label">PRÉVIA DO CARD</span>
        <div
          className="preview-list"
          style={{
            background: 'var(--blue-bg)',
            color: 'var(--blue)',
            borderColor: '#5a9fd4',
          }}
        >
          → CADASTRO
        </div>

        <div id="cadastro-preview-content">
          {!hasPreviewData ? (
            <div className="preview-empty">Preencha os campos para ver a prévia em tempo real.</div>
          ) : (
            <div>
              {formData.titulo && <div className="preview-title">{formData.titulo}</div>}

              <div className="preview-tags">
                <span
                  className="preview-tag"
                  style={{
                    background: 'var(--blue-bg)',
                    color: 'var(--blue)',
                    border: '1px solid #5a9fd455',
                  }}
                >
                  📋 CADASTROS
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
                {formData.nomeCliente && (
                  <div className="preview-meta-item">
                    Cliente: <strong>{formData.nomeCliente}</strong>
                  </div>
                )}
                {formData.cpfCnpj && (
                  <div className="preview-meta-item flex items-center gap-1.5">
                    <span>
                      Doc: <strong>{formData.cpfCnpj}</strong>
                    </span>
                    {(docValidation.type === 'cpf' || docValidation.type === 'cnpj') && (
                      <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-1 py-0.5 rounded">
                        ✓
                      </span>
                    )}
                    {docValidation.type === 'invalido' && (
                      <span className="text-[10px] bg-rose-100 text-rose-800 font-bold px-1 py-0.5 rounded">
                        ⚠
                      </span>
                    )}
                  </div>
                )}
                {formData.idIntegrador && (
                  <div className="preview-meta-item">
                    ID: <strong>{formData.idIntegrador}</strong>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* SUBMIT CADASTRO */}
      <div className="submit-area">
        <button
          type="button"
          className="btn-submit"
          id="btn-cadastro-sub"
          onClick={handleSubmit}
          disabled={isSubmitting}
          style={{
            background: 'var(--blue)',
            borderColor: 'var(--blue)',
            boxShadow: '3px 3px 0 #0d2a4e',
          }}
        >
          <span>{statusText || (isSubmitting ? 'Solicitando cadastro...' : '📋 Solicitar Cadastro')}</span>
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

      {/* MODAL RCA CADASTRO */}
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
        titlePrefix="Selecionar RCA — Cadastro"
      />
    </div>
  );
}
