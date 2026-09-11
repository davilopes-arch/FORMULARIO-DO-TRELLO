import { useState, useMemo } from 'react';
import { RCAInfo, TeamInfo, TeamName } from '../types';
import { EQ_EMOJI, TEAMS } from '../data/constants';

interface RcaModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectRCA: (rca: RCAInfo) => void;
  rcasByTeam: Record<TeamName, string[]>;
  selectedRCA: RCAInfo | null;
  filteredTeam?: TeamName | null;
  isAdmin: boolean;
  teams?: TeamInfo[];
  onOpenEquipeModal?: () => void;
  onAddRCA: (team: TeamName, name: string) => Promise<void>;
  onRenameRCA: (team: TeamName, oldName: string, newName: string) => Promise<void>;
  onRemoveRCA: (team: TeamName, name: string) => Promise<void>;
  titlePrefix?: string;
}

export function RcaModal({
  isOpen,
  onClose,
  onSelectRCA,
  rcasByTeam,
  selectedRCA,
  filteredTeam,
  isAdmin,
  teams = TEAMS,
  onOpenEquipeModal,
  onAddRCA,
  onRenameRCA,
  onRemoveRCA,
  titlePrefix = 'Selecionar RCA',
}: RcaModalProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [editMode, setEditMode] = useState(false);
  const [tempSelection, setTempSelection] = useState<RCAInfo | null>(selectedRCA);

  // Filtered teams list in order
  const activeTeams = useMemo(() => {
    if (filteredTeam && rcasByTeam[filteredTeam]) {
      return [filteredTeam];
    }
    const set = new Set<string>();
    if (teams && teams.length > 0) {
      teams.forEach((t) => set.add(t.nome));
    }
    Object.keys(rcasByTeam).forEach((k) => set.add(k));
    return Array.from(set);
  }, [filteredTeam, rcasByTeam, teams]);

  if (!isOpen) return null;

  const handleConfirm = () => {
    if (!tempSelection) {
      alert('Selecione um consultor.');
      return;
    }
    onSelectRCA(tempSelection);
    onClose();
  };

  const handleAdd = async (team: TeamName) => {
    const nome = prompt(`Nome do novo consultor para a equipe ${team}:`);
    if (!nome) return;
    const cleanName = nome.trim().toUpperCase();
    if (!cleanName) return;
    try {
      await onAddRCA(team, cleanName);
    } catch (err: any) {
      alert(err.message || 'Erro ao adicionar consultor');
    }
  };

  const handleRename = async (team: TeamName, oldName: string) => {
    const novo = prompt(`Renomear "${oldName}" para:`, oldName);
    if (!novo) return;
    const cleanNew = novo.trim().toUpperCase();
    if (!cleanNew || cleanNew === oldName) return;
    try {
      await onRenameRCA(team, oldName, cleanNew);
      if (tempSelection?.nome === oldName) {
        setTempSelection({ nome: cleanNew, eq: team });
      }
    } catch (err: any) {
      alert(err.message || 'Erro ao renomear consultor');
    }
  };

  const handleRemove = async (team: TeamName, name: string) => {
    if (!confirm(`Remover "${name}" da lista de consultores da equipe ${team}?`)) return;
    try {
      await onRemoveRCA(team, name);
      if (tempSelection?.nome === name) {
        setTempSelection(null);
      }
    } catch (err: any) {
      alert(err.message || 'Erro ao remover consultor');
    }
  };

  const query = searchTerm.trim().toUpperCase();

  return (
    <div
      className="modal-overlay"
      id="rca-modal-bg"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="modal-container" id="rca-modal">
        <div className="modal-head">
          <div className="modal-head-row">
            <h3>{titlePrefix}</h3>
            <div className="flex items-center gap-1.5">
              {isAdmin && onOpenEquipeModal && (
                <button
                  type="button"
                  className="rca-edit-btn"
                  onClick={() => {
                    onClose();
                    onOpenEquipeModal();
                  }}
                  title="Gerenciar nomes e ícones das equipes"
                >
                  ⚙️ Equipes
                </button>
              )}
              {isAdmin && (
                <button
                  type="button"
                  className={`rca-edit-btn ${editMode ? 'active' : ''}`}
                  onClick={() => setEditMode(!editMode)}
                >
                  ✎ Editar
                </button>
              )}
            </div>
          </div>

          <input
            className="modal-search"
            type="text"
            placeholder="Buscar consultor..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            autoFocus
          />
        </div>

        <div className="modal-body" id="rca-modal-body">
          {activeTeams.map((team) => {
            const list = rcasByTeam[team] || [];
            const filtered = query
              ? list.filter((n) => n.toUpperCase().includes(query))
              : list;

            if (filtered.length === 0 && query) return null;

            return (
              <div className="rca-eq-group" key={team}>
                <div className="rca-eq-title">
                  <span>{teams.find((t) => t.nome === team)?.emoji || EQ_EMOJI[team] || '●'}</span>
                  <span>{team}</span>
                  {isAdmin && (
                    <button
                      type="button"
                      className="rca-add-btn"
                      onClick={() => handleAdd(team)}
                    >
                      + Adicionar
                    </button>
                  )}
                </div>

                <div className="rca-names-grid">
                  {filtered.map((nome) => {
                    const isActive = tempSelection?.nome === nome;

                    if (editMode && isAdmin) {
                      return (
                        <div className="rca-name-edit" key={nome}>
                          <span className="rca-name-edit-text">{nome}</span>
                          <button
                            type="button"
                            className="rca-name-edit-icon"
                            title="Renomear"
                            onClick={() => handleRename(team, nome)}
                          >
                            ✎
                          </button>
                          <button
                            type="button"
                            className="rca-name-edit-icon rca-name-edit-del"
                            title="Remover"
                            onClick={() => handleRemove(team, nome)}
                          >
                            ✕
                          </button>
                        </div>
                      );
                    }

                    return (
                      <button
                        type="button"
                        key={nome}
                        className={`rca-name-btn ${isActive ? 'active' : ''}`}
                        onClick={() => setTempSelection({ nome, eq: team })}
                      >
                        {nome}
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        <div className="modal-foot">
          <div className="text-xs text-[var(--ink2)]">
            Selecionado:{' '}
            <strong className="text-[var(--ink)]">
              {tempSelection?.nome || '—'}
            </strong>
          </div>

          <div className="flex items-center gap-3">
            <button type="button" className="btn-cancel-rca" onClick={onClose}>
              Cancelar
            </button>
            <button type="button" className="btn-confirm-rca" onClick={handleConfirm}>
              Confirmar →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
