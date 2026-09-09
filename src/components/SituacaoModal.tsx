import { useState } from 'react';
import { TrelloLabel } from '../types';
import { getTrelloColor, isTeamLabel } from '../data/constants';

interface SituacaoModalProps {
  isOpen: boolean;
  onClose: () => void;
  labels: TrelloLabel[];
  selectedLabelIds: string[];
  onConfirm: (selectedIds: string[]) => void;
  isAdmin: boolean;
  onAddLabel: (name: string) => Promise<void>;
  onRenameLabel: (id: string, name: string) => Promise<void>;
  onRemoveLabel: (id: string, name: string) => Promise<void>;
}

export function SituacaoModal({
  isOpen,
  onClose,
  labels,
  selectedLabelIds,
  onConfirm,
  isAdmin,
  onAddLabel,
  onRenameLabel,
  onRemoveLabel,
}: SituacaoModalProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [editMode, setEditMode] = useState(false);
  const [tempSelection, setTempSelection] = useState<Set<string>>(
    new Set(selectedLabelIds)
  );

  if (!isOpen) return null;

  // Filter out team labels from situacoes
  const situacaoLabels = labels.filter((l) => !isTeamLabel(l.name));

  const query = searchTerm.trim().toUpperCase();
  const filteredLabels = query
    ? situacaoLabels.filter((l) => l.name.toUpperCase().includes(query))
    : situacaoLabels;

  const toggleSelect = (id: string) => {
    const next = new Set(tempSelection);
    if (next.has(id)) {
      next.delete(id);
    } else {
      next.add(id);
    }
    setTempSelection(next);
  };

  const handleConfirm = () => {
    onConfirm(Array.from(tempSelection));
    onClose();
  };

  const handleAdd = async () => {
    const nome = prompt('Nome da nova situação para o board do Trello:');
    if (!nome) return;
    const clean = nome.trim();
    if (!clean) return;
    try {
      await onAddLabel(clean);
    } catch (err: any) {
      alert(err.message || 'Erro ao criar situação');
    }
  };

  const handleRename = async (id: string, currentName: string) => {
    const novo = prompt(`Renomear "${currentName}" para:`, currentName);
    if (!novo) return;
    const clean = novo.trim();
    if (!clean || clean === currentName) return;
    try {
      await onRenameLabel(id, clean);
    } catch (err: any) {
      alert(err.message || 'Erro ao renomear situação');
    }
  };

  const handleRemove = async (id: string, name: string) => {
    if (
      !confirm(
        `Remover a situação "${name}"? Isso apagará a etiqueta no board do Trello.`
      )
    ) {
      return;
    }
    try {
      await onRemoveLabel(id, name);
      if (tempSelection.has(id)) {
        const next = new Set(tempSelection);
        next.delete(id);
        setTempSelection(next);
      }
    } catch (err: any) {
      alert(err.message || 'Erro ao excluir situação');
    }
  };

  return (
    <div
      className="modal-overlay"
      id="sit-modal-bg"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="modal-container" style={{ maxWidth: '520px' }}>
        <div className="modal-head">
          <div className="modal-head-row">
            <h3>Selecionar Situação</h3>
            <div className="flex items-center gap-2">
              {isAdmin && (
                <>
                  <button
                    type="button"
                    className="rca-add-btn"
                    onClick={handleAdd}
                  >
                    + Nova situação
                  </button>
                  <button
                    type="button"
                    className={`rca-edit-btn ${editMode ? 'active' : ''}`}
                    onClick={() => setEditMode(!editMode)}
                  >
                    ✎ Editar
                  </button>
                </>
              )}
            </div>
          </div>

          <input
            className="modal-search"
            type="text"
            placeholder="Buscar situação..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            autoFocus
          />
        </div>

        <div className="modal-body" id="sit-modal-body">
          {filteredLabels.length === 0 ? (
            <div className="text-center py-6 text-sm text-[var(--ink3)]">
              Nenhuma situação encontrada.
            </div>
          ) : (
            <div className="et-grid py-1">
              {filteredLabels.map((label) => {
                const color = getTrelloColor(label.color);
                const isSelected = tempSelection.has(label.id);

                if (editMode && isAdmin) {
                  return (
                    <div className="rca-name-edit" key={label.id}>
                      <div
                        className="et-dot"
                        style={{ backgroundColor: color }}
                      />
                      <span className="rca-name-edit-text">{label.name}</span>
                      <button
                        type="button"
                        className="rca-name-edit-icon"
                        title="Renomear"
                        onClick={() => handleRename(label.id, label.name)}
                      >
                        ✎
                      </button>
                      <button
                        type="button"
                        className="rca-name-edit-icon rca-name-edit-del"
                        title="Remover"
                        onClick={() => handleRemove(label.id, label.name)}
                      >
                        ✕
                      </button>
                    </div>
                  );
                }

                return (
                  <div
                    key={label.id}
                    className={`et-btn ${isSelected ? 'sel' : ''}`}
                    onClick={() => toggleSelect(label.id)}
                  >
                    <div
                      className="et-dot"
                      style={{ backgroundColor: color }}
                    />
                    <span>{label.name}</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="modal-foot">
          <div className="text-xs text-[var(--ink2)]">
            <strong className="text-[var(--ink)]">
              {tempSelection.size}
            </strong>{' '}
            selecionada(s)
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
