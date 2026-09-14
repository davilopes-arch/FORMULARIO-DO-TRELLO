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

  // Estados inline para evitar window.prompt e window.confirm (bloqueados em iframes)
  const [addingTeam, setAddingTeam] = useState<string | null>(null);
  const [newRcaName, setNewRcaName] = useState('');
  const [editingItem, setEditingItem] = useState<{ team: string; oldName: string; currentVal: string } | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<{ team: string; name: string } | null>(null);
  const [feedbackMsg, setFeedbackMsg] = useState<string | null>(null);

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

  const showFeedback = (msg: string) => {
    setFeedbackMsg(msg);
    setTimeout(() => setFeedbackMsg(null), 3000);
  };

  const handleConfirm = () => {
    if (!tempSelection) {
      showFeedback('Selecione um consultor.');
      return;
    }
    onSelectRCA(tempSelection);
    onClose();
  };

  const startAdd = (team: TeamName) => {
    setAddingTeam(team);
    setNewRcaName('');
    setEditingItem(null);
    setConfirmDelete(null);
  };

  const cancelAdd = () => {
    setAddingTeam(null);
    setNewRcaName('');
  };

  const confirmAdd = async (team: TeamName) => {
    const clean = newRcaName.trim().toUpperCase();
    if (!clean) return;
    try {
      await onAddRCA(team, clean);
      showFeedback(`Consultor "${clean}" adicionado!`);
      setAddingTeam(null);
      setNewRcaName('');
    } catch (err: any) {
      showFeedback(err.message || 'Erro ao adicionar consultor');
    }
  };

  const startRename = (team: TeamName, name: string) => {
    setEditingItem({ team, oldName: name, currentVal: name });
    setAddingTeam(null);
    setConfirmDelete(null);
  };

  const confirmRename = async () => {
    if (!editingItem) return;
    const cleanNew = editingItem.currentVal.trim().toUpperCase();
    if (!cleanNew || cleanNew === editingItem.oldName) {
      setEditingItem(null);
      return;
    }
    try {
      await onRenameRCA(editingItem.team as TeamName, editingItem.oldName, cleanNew);
      if (tempSelection?.nome === editingItem.oldName) {
        setTempSelection({ nome: cleanNew, eq: editingItem.team as TeamName });
      }
      showFeedback(`Renomeado para "${cleanNew}"!`);
      setEditingItem(null);
    } catch (err: any) {
      showFeedback(err.message || 'Erro ao renomear consultor');
    }
  };

  const startDelete = (team: TeamName, name: string) => {
    setConfirmDelete({ team, name });
    setAddingTeam(null);
    setEditingItem(null);
  };

  const executeDelete = async (team: TeamName, name: string) => {
    try {
      await onRemoveRCA(team, name);
      if (tempSelection?.nome === name) {
        setTempSelection(null);
      }
      showFeedback(`Consultor "${name}" removido!`);
      setConfirmDelete(null);
    } catch (err: any) {
      showFeedback(err.message || 'Erro ao remover consultor');
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
                  onClick={() => {
                    setEditMode(!editMode);
                    setAddingTeam(null);
                    setEditingItem(null);
                    setConfirmDelete(null);
                  }}
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

          {feedbackMsg && (
            <div className="mt-2 text-xs font-medium text-amber-800 bg-amber-100 border border-amber-300 rounded px-2.5 py-1 text-center animate-fadeIn">
              {feedbackMsg}
            </div>
          )}
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
                      onClick={() => startAdd(team as TeamName)}
                    >
                      + Adicionar
                    </button>
                  )}
                </div>

                {/* Painel Inline de Adição */}
                {addingTeam === team && (
                  <div className="flex items-center gap-2 mb-3 p-2 bg-orange-50 border border-orange-300 rounded-lg animate-fadeIn">
                    <input
                      type="text"
                      placeholder="Nome do novo consultor..."
                      className="flex-1 px-3 py-1.5 text-xs font-semibold uppercase bg-white border border-gray-300 rounded focus:outline-none focus:border-orange-500 shadow-sm"
                      value={newRcaName}
                      onChange={(e) => setNewRcaName(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') confirmAdd(team as TeamName);
                        if (e.key === 'Escape') cancelAdd();
                      }}
                      autoFocus
                    />
                    <button
                      type="button"
                      className="px-3 py-1.5 text-xs font-bold text-white bg-orange-600 hover:bg-orange-700 rounded transition-colors shadow-sm"
                      onClick={() => confirmAdd(team as TeamName)}
                    >
                      Salvar
                    </button>
                    <button
                      type="button"
                      className="px-2 py-1.5 text-xs text-gray-500 hover:text-gray-800 transition-colors"
                      onClick={cancelAdd}
                    >
                      ✕
                    </button>
                  </div>
                )}

                <div className="rca-names-grid">
                  {filtered.map((nome) => {
                    const isActive = tempSelection?.nome === nome;

                    // Modo de confirmação de exclusão inline
                    if (confirmDelete && confirmDelete.team === team && confirmDelete.name === nome) {
                      return (
                        <div className="flex items-center gap-1.5 bg-red-50 px-2 py-1 rounded-lg border border-red-300 animate-fadeIn" key={nome}>
                          <span className="text-xs text-red-800 font-bold truncate max-w-[100px]">Excluir {nome}?</span>
                          <button
                            type="button"
                            className="px-2 py-0.5 text-xs font-bold text-white bg-red-600 hover:bg-red-700 rounded shadow-sm"
                            onClick={() => executeDelete(team as TeamName, nome)}
                          >
                            Sim
                          </button>
                          <button
                            type="button"
                            className="px-1.5 py-0.5 text-xs text-gray-600 hover:text-gray-900"
                            onClick={() => setConfirmDelete(null)}
                          >
                            Não
                          </button>
                        </div>
                      );
                    }

                    // Modo de edição/renomeação inline
                    if (editingItem && editingItem.team === team && editingItem.oldName === nome) {
                      return (
                        <div className="flex items-center gap-1 bg-amber-50 p-1 rounded-lg border border-amber-300 animate-fadeIn" key={nome}>
                          <input
                            type="text"
                            className="px-2 py-1 text-xs uppercase font-semibold bg-white border border-amber-400 rounded w-36 focus:outline-none"
                            value={editingItem.currentVal}
                            onChange={(e) => setEditingItem({ ...editingItem, currentVal: e.target.value })}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') confirmRename();
                              if (e.key === 'Escape') setEditingItem(null);
                            }}
                            autoFocus
                          />
                          <button
                            type="button"
                            className="px-2 py-1 text-xs font-bold text-white bg-green-600 hover:bg-green-700 rounded shadow-sm"
                            onClick={confirmRename}
                            title="Salvar novo nome"
                          >
                            ✓
                          </button>
                          <button
                            type="button"
                            className="px-1.5 py-1 text-xs text-gray-500 hover:text-gray-800"
                            onClick={() => setEditingItem(null)}
                            title="Cancelar"
                          >
                            ✕
                          </button>
                        </div>
                      );
                    }

                    // Modo de edição ativado pelo Admin
                    if (editMode && isAdmin) {
                      return (
                        <div className="rca-name-edit" key={nome}>
                          <span className="rca-name-edit-text">{nome}</span>
                          <button
                            type="button"
                            className="rca-name-edit-icon hover:text-blue-600"
                            title="Renomear"
                            onClick={() => startRename(team as TeamName, nome)}
                          >
                            ✎
                          </button>
                          <button
                            type="button"
                            className="rca-name-edit-icon rca-name-edit-del hover:text-red-600"
                            title="Remover"
                            onClick={() => startDelete(team as TeamName, nome)}
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
