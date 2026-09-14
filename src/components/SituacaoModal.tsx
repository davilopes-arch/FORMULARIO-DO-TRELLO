import React, { useState, useMemo } from 'react';
import {
  Search,
  Plus,
  Edit2,
  Trash2,
  Check,
  X,
  AlertTriangle,
  Tag,
  ArrowRight,
} from 'lucide-react';
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

  // Estado para confirmação suave de exclusão inline
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [isBusy, setIsBusy] = useState(false);

  // Estado para inline add e rename
  const [isAddingInline, setIsAddingInline] = useState(false);
  const [newLabelName, setNewLabelName] = useState('');
  const [editingLabelId, setEditingLabelId] = useState<string | null>(null);
  const [editingLabelName, setEditingLabelName] = useState('');

  if (!isOpen) return null;

  // Filtra fora as etiquetas de equipes (para mostrar apenas situações de CX)
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

  const handleSaveAdd = async () => {
    const clean = newLabelName.trim();
    if (!clean) return;
    try {
      setIsBusy(true);
      await onAddLabel(clean);
      setNewLabelName('');
      setIsAddingInline(false);
    } catch (err: any) {
      alert(err.message || 'Erro ao criar situação');
    } finally {
      setIsBusy(false);
    }
  };

  const handleSaveRename = async (id: string) => {
    const clean = editingLabelName.trim();
    if (!clean) return;
    try {
      setIsBusy(true);
      await onRenameLabel(id, clean);
      setEditingLabelId(null);
      setEditingLabelName('');
    } catch (err: any) {
      alert(err.message || 'Erro ao renomear situação');
    } finally {
      setIsBusy(false);
    }
  };

  const confirmRemove = async (label: TrelloLabel) => {
    try {
      setIsBusy(true);
      await onRemoveLabel(label.id, label.name);
      if (tempSelection.has(label.id)) {
        const next = new Set(tempSelection);
        next.delete(label.id);
        setTempSelection(next);
      }
      setDeletingId(null);
    } catch (err: any) {
      alert(err.message || 'Erro ao excluir situação');
    } finally {
      setIsBusy(false);
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
      <div className="modal-container max-w-[540px]" style={{ maxHeight: '85vh' }}>
        {/* Header do Modal */}
        <div className="modal-head">
          <div className="modal-head-row">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-orange-100 text-orange-600 flex items-center justify-center">
                <Tag className="w-4 h-4 stroke-[2.5]" />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-[var(--ink)] leading-tight">
                  Situação da Demanda
                </h3>
                <span className="text-[11px] text-[var(--ink3)]">
                  Selecione uma ou mais etiquetas para categorizar no Trello
                </span>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              {isAdmin && (
                <>
                  <button
                    type="button"
                    className="rca-add-btn flex items-center gap-1 font-semibold text-xs py-1.5 px-2.5 rounded-md hover:bg-emerald-100 transition-colors"
                    onClick={() => {
                      setIsAddingInline(true);
                      setEditMode(false);
                    }}
                    title="Adicionar nova situação"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Nova</span>
                  </button>
                  <button
                    type="button"
                    className={`rca-edit-btn flex items-center gap-1 font-semibold text-xs py-1.5 px-2.5 rounded-md transition-colors ${
                      editMode ? 'active bg-zinc-900 text-white' : 'hover:bg-zinc-100'
                    }`}
                    onClick={() => {
                      setEditMode(!editMode);
                      setDeletingId(null);
                      setIsAddingInline(false);
                    }}
                  >
                    <Edit2 className="w-3 h-3" />
                    <span>{editMode ? 'Concluir' : 'Gerenciar'}</span>
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Campo de criação rápida de situação */}
          {isAddingInline && (
            <div className="my-2.5 p-2.5 bg-orange-50/70 border border-orange-200 rounded-lg flex items-center gap-2 animate-fadeIn">
              <input
                type="text"
                className="custom-input !py-1.5 !text-xs flex-1 bg-white"
                placeholder="Nome da nova situação (ex: COBRANÇA DE PRAZO)"
                value={newLabelName}
                onChange={(e) => setNewLabelName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleSaveAdd();
                  if (e.key === 'Escape') setIsAddingInline(false);
                }}
                autoFocus
              />
              <button
                type="button"
                className="py-1.5 px-3 rounded text-xs font-bold bg-orange-500 hover:bg-orange-600 text-white cursor-pointer transition-colors"
                onClick={handleSaveAdd}
                disabled={isBusy || !newLabelName.trim()}
              >
                Adicionar
              </button>
              <button
                type="button"
                className="p-1.5 text-zinc-500 hover:text-zinc-800 rounded hover:bg-zinc-200/60 cursor-pointer"
                onClick={() => setIsAddingInline(false)}
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Barra de Pesquisa */}
          <div className="relative mt-2">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[var(--ink3)]" />
            <input
              className="modal-search !pl-9 !py-2 text-xs"
              type="text"
              placeholder="Buscar situação por palavra-chave..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              autoFocus={!isAddingInline}
            />
            {searchTerm && (
              <button
                type="button"
                onClick={() => setSearchTerm('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-[var(--ink3)] hover:text-[var(--ink)] bg-transparent border-none cursor-pointer"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {/* Lista de Situações */}
        <div className="modal-body space-y-2 py-3" id="sit-modal-body">
          {filteredLabels.length === 0 ? (
            <div className="text-center py-8 text-xs text-[var(--ink3)]">
              {query
                ? `Nenhuma situação encontrada com "${searchTerm}".`
                : 'Nenhuma situação cadastrada.'}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {filteredLabels.map((label) => {
                const color = getTrelloColor(label.color);
                const isSelected = tempSelection.has(label.id);
                const isConfirmingDelete = deletingId === label.id;
                const isEditingThis = editingLabelId === label.id;

                if (isEditingThis) {
                  return (
                    <div
                      key={label.id}
                      className="col-span-full p-2 bg-amber-50 rounded-lg border border-amber-300 flex items-center gap-2"
                    >
                      <input
                        type="text"
                        className="custom-input !py-1 !text-xs flex-1 bg-white"
                        value={editingLabelName}
                        onChange={(e) => setEditingLabelName(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') handleSaveRename(label.id);
                          if (e.key === 'Escape') setEditingLabelId(null);
                        }}
                        autoFocus
                      />
                      <button
                        type="button"
                        className="px-2.5 py-1 text-xs font-bold bg-amber-600 text-white rounded hover:bg-amber-700"
                        onClick={() => handleSaveRename(label.id)}
                        disabled={isBusy}
                      >
                        Salvar
                      </button>
                      <button
                        type="button"
                        className="p-1 text-zinc-500 hover:text-zinc-800"
                        onClick={() => setEditingLabelId(null)}
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  );
                }

                if (editMode && isAdmin) {
                  return (
                    <div
                      key={label.id}
                      className="p-2 rounded-lg border border-[var(--border2)] bg-white flex items-center justify-between gap-2 text-xs shadow-xs"
                    >
                      {isConfirmingDelete ? (
                        /* Confirmação suave inline antes de excluir */
                        <div className="flex-1 flex items-center justify-between gap-1 bg-red-50 p-1.5 rounded border border-red-200 animate-fadeIn">
                          <div className="flex items-center gap-1.5 text-[11px] font-bold text-red-700">
                            <AlertTriangle className="w-3.5 h-3.5 text-red-600 flex-shrink-0" />
                            <span>Excluir?</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <button
                              type="button"
                              className="px-2 py-0.5 rounded text-[10px] font-bold bg-red-600 text-white hover:bg-red-700 cursor-pointer"
                              onClick={() => confirmRemove(label)}
                              disabled={isBusy}
                            >
                              Sim
                            </button>
                            <button
                              type="button"
                              className="px-2 py-0.5 rounded text-[10px] font-semibold bg-zinc-200 text-zinc-700 hover:bg-zinc-300 cursor-pointer"
                              onClick={() => setDeletingId(null)}
                            >
                              Não
                            </button>
                          </div>
                        </div>
                      ) : (
                        <>
                          <div className="flex items-center gap-2 min-w-0 flex-1">
                            <span
                              className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                              style={{ backgroundColor: color }}
                            />
                            <span className="truncate font-medium text-[var(--ink)]">
                              {label.name}
                            </span>
                          </div>
                          <div className="flex items-center gap-1 flex-shrink-0">
                            <button
                              type="button"
                              className="p-1 text-zinc-400 hover:text-zinc-700 rounded hover:bg-zinc-100"
                              title="Renomear"
                              onClick={() => {
                                setEditingLabelId(label.id);
                                setEditingLabelName(label.name);
                              }}
                            >
                              <Edit2 className="w-3 h-3" />
                            </button>
                            <button
                              type="button"
                              className="p-1 text-red-400 hover:text-red-700 rounded hover:bg-red-50"
                              title="Excluir etiqueta"
                              onClick={() => setDeletingId(label.id)}
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  );
                }

                // Modo Normal de Seleção com Transição Suave
                return (
                  <div
                    key={label.id}
                    className={`group relative p-2.5 rounded-lg border text-xs cursor-pointer flex items-center gap-2.5 transition-all duration-150 select-none ${
                      isSelected
                        ? 'border-orange-500 bg-orange-50/70 text-orange-950 font-semibold shadow-xs ring-1 ring-orange-400/30'
                        : 'border-[var(--border)] bg-white text-[var(--ink2)] hover:border-orange-300 hover:bg-orange-50/20'
                    }`}
                    onClick={() => toggleSelect(label.id)}
                  >
                    <span
                      className="w-3 h-3 rounded-full flex-shrink-0 transition-transform group-hover:scale-110"
                      style={{ backgroundColor: color }}
                    />
                    <span className="flex-1 truncate leading-tight">{label.name}</span>
                    <div
                      className={`w-4 h-4 rounded-full flex items-center justify-center transition-all ${
                        isSelected
                          ? 'bg-orange-500 text-white'
                          : 'border border-zinc-300 text-transparent'
                      }`}
                    >
                      <Check className="w-2.5 h-2.5 stroke-[3]" />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Rodapé com Contador e Botões */}
        <div className="modal-foot bg-[var(--surface)]">
          <div className="text-xs text-[var(--ink2)] flex items-center gap-1.5">
            <span className="px-2 py-0.5 rounded bg-orange-100 text-orange-700 font-mono font-bold text-[11px]">
              {tempSelection.size}
            </span>
            <span>selecionada(s)</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              className="btn-cancel-rca !no-underline px-3 py-1.5 rounded text-xs text-[var(--ink2)] hover:bg-[var(--surface2)]"
              onClick={onClose}
            >
              Cancelar
            </button>
            <button
              type="button"
              className="btn-confirm-rca flex items-center gap-1.5 text-xs py-2 px-4 shadow-sm"
              onClick={handleConfirm}
            >
              <span>Aplicar</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
