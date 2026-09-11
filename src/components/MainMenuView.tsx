import { FormType } from '../types';

interface MainMenuViewProps {
  onSelectForm: (type: FormType) => void;
  onOpenEquipeModal?: () => void;
}

export function MainMenuView({ onSelectForm, onOpenEquipeModal }: MainMenuViewProps) {
  return (
    <div className="py-2">
      <div className="menu-title flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-[var(--solar)] inline-block" />
        O que você deseja fazer?
      </div>
      <div className="menu-sub">Selecione o tipo de solicitação para continuar.</div>

      <div className="menu-list">
        <button
          type="button"
          className="menu-btn menu-btn-demandas"
          onClick={() => onSelectForm('demandas')}
        >
          <span className="menu-btn-icon">📌</span>
          <span className="menu-btn-body">
            <span className="menu-btn-title">Demandas</span>
            <span className="menu-btn-desc">
              Atrasos, problemas de logística, produção, CC-e e outros
            </span>
          </span>
          <span className="menu-btn-arrow">→</span>
        </button>

        <button
          type="button"
          className="menu-btn menu-btn-frete"
          onClick={() => onSelectForm('frete')}
        >
          <span className="menu-btn-icon">🚚</span>
          <span className="menu-btn-body">
            <span className="menu-btn-title">Cotar Frete</span>
            <span className="menu-btn-desc">
              Solicitar orçamento de frete com ID do cliente, filial e CEP
            </span>
          </span>
          <span className="menu-btn-arrow">→</span>
        </button>

        <button
          type="button"
          className="menu-btn menu-btn-cadastro"
          onClick={() => onSelectForm('cadastro')}
        >
          <span className="menu-btn-icon">📋</span>
          <span className="menu-btn-body">
            <span className="menu-btn-title">Cadastro</span>
            <span className="menu-btn-desc">
              Solicitar novo cadastro de cliente com CPF/CNPJ e ID integrador
            </span>
          </span>
          <span className="menu-btn-arrow">→</span>
        </button>
      </div>

      {onOpenEquipeModal && (
        <div className="pt-4 flex justify-center">
          <button
            type="button"
            className="text-xs font-mono font-semibold text-[var(--ink2)] hover:text-[var(--solar-dark)] bg-[var(--surface)] hover:bg-[var(--solar-bg)] border border-[var(--border2)] hover:border-[var(--solar-bd)] px-3.5 py-2 rounded-lg transition-all flex items-center gap-2 shadow-xs cursor-pointer"
            onClick={onOpenEquipeModal}
            title="Gerenciar nomes e ícones das equipes"
          >
            <span>⚙️</span> Personalizar Equipes (Ícones e Nomes)
          </button>
        </div>
      )}
    </div>
  );
}
