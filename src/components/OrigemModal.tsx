import React, { useState } from 'react';
import { OrigemOption } from '../types';

interface OrigemModalProps {
  isOpen: boolean;
  onClose: () => void;
  origens: OrigemOption[];
  onUpdateOrigem: (id: string, updates: { nome?: string; emoji?: string }) => Promise<void>;
  onAddOrigem: (nome: string, emoji: string) => Promise<void>;
  onRemoveOrigem: (id: string) => Promise<void>;
  onResetOrigens: () => Promise<void>;
}

const POPULAR_ORIGEM_EMOJIS = [
  '🏢', '🏬', '🏭', '📦', '🚚',
  '🏪', '🏛️', '📍', '🏗️', '🌐',
  '💼', '⚡', '☀️', '🔋', '🏠',
  '🚀', '🎯', '⭐', '🛡️', '🤝',
  '💎', '🔧', '📊', '🌴', '🏖️',
];

export function OrigemModal({
  isOpen,
  onClose,
  origens,
  onUpdateOrigem,
  onAddOrigem,
  onRemoveOrigem,
  onResetOrigens,
}: OrigemModalProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editNome, setEditNome] = useState('');
  const [editEmoji, setEditEmoji] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  // New origin form state
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [newNome, setNewNome] = useState('');
  const [newEmoji, setNewEmoji] = useState('🏢');
  const [showNewEmojiPicker, setShowNewEmojiPicker] = useState(false);

  // Loading indicator
  const [isBusy, setIsBusy] = useState(false);
  const [statusMsg, setStatusMsg] = useState('');

  if (!isOpen) return null;

  const startEdit = (origem: OrigemOption) => {
    setEditingId(origem.id);
    setEditNome(origem.nome);
    setEditEmoji(origem.emoji || '🏢');
    setShowEmojiPicker(false);
    setIsAddingNew(false);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditNome('');
    setEditEmoji('');
    setShowEmojiPicker(false);
  };

  const handleSaveEdit = async (origem: OrigemOption) => {
    const cleanNome = editNome.trim();
    const cleanEmoji = editEmoji.trim() || '🏢';

    if (!cleanNome) {
      alert('Por favor, informe o nome da origem.');
      return;
    }

    try {
      setIsBusy(true);
      setStatusMsg('Salvando alterações...');
      await onUpdateOrigem(origem.id, {
        nome: cleanNome,
        emoji: cleanEmoji,
      });
      cancelEdit();
    } catch (err: any) {
      alert(err.message || 'Erro ao salvar origem');
    } finally {
      setIsBusy(false);
      setStatusMsg('');
    }
  };

  const handleCreateNew = async () => {
    const cleanNome = newNome.trim();
    const cleanEmoji = newEmoji.trim() || '🏢';

    if (!cleanNome) {
      alert('Por favor, informe o nome da nova origem.');
      return;
    }

    try {
      setIsBusy(true);
      setStatusMsg('Criando nova origem...');
      await onAddOrigem(cleanNome, cleanEmoji);
      setNewNome('');
      setNewEmoji('🏢');
      setIsAddingNew(false);
      setShowNewEmojiPicker(false);
    } catch (err: any) {
      alert(err.message || 'Erro ao criar origem');
    } finally {
      setIsBusy(false);
      setStatusMsg('');
    }
  };

  const handleDelete = async (origem: OrigemOption) => {
    if (origens.length <= 1) {
      alert('Você precisa manter pelo menos uma opção de origem cadastrada.');
      return;
    }

    const conf = window.confirm(
      `Deseja realmente remover a origem "${origem.emoji} ${origem.nome}"?`
    );
    if (!conf) return;

    try {
      setIsBusy(true);
      setStatusMsg('Removendo origem...');
      await onRemoveOrigem(origem.id);
      if (editingId === origem.id) {
        cancelEdit();
      }
    } catch (err: any) {
      alert(err.message || 'Erro ao remover origem');
    } finally {
      setIsBusy(false);
      setStatusMsg('');
    }
  };

  const handleReset = async () => {
    const conf = window.confirm(
      'Deseja restaurar as opções de origem padrão (🏢 Matriz e 🏬 Filial)?'
    );
    if (!conf) return;

    try {
      setIsBusy(true);
      setStatusMsg('Restaurando origens padrão...');
      await onResetOrigens();
      cancelEdit();
      setIsAddingNew(false);
    } catch (err: any) {
      alert(err.message || 'Erro ao restaurar origens');
    } finally {
      setIsBusy(false);
      setStatusMsg('');
    }
  };

  return (
    <div
      className="modal-overlay"
      id="modal-origens-bg"
      onClick={(e) => {
        if (e.target === e.currentTarget && !isBusy) onClose();
      }}
    >
      <div className="modal-container" id="modal-origens" style={{ maxWidth: 540 }}>
        {/* Header */}
        <div className="modal-head">
          <div className="modal-head-row">
            <div>
              <h3 className="text-base font-extrabold text-[var(--ink)]">
                Gerenciar Origens
              </h3>
              <p className="text-xs text-[var(--ink2)] mt-0.5">
                Acrescente, edite ou renomeie as opções de origem (ex: Matriz, Filial, Fábrica, CD).
              </p>
            </div>
            <button
              type="button"
              className="text-[var(--ink3)] hover:text-[var(--ink)] text-lg px-2 py-1 leading-none rounded cursor-pointer"
              onClick={onClose}
              disabled={isBusy}
              aria-label="Fechar"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="modal-body space-y-3" id="modal-origens-body">
          {statusMsg && (
            <div className="bg-[var(--surface2)] border border-[var(--border2)] rounded px-3 py-1.5 text-xs text-center font-mono font-bold text-[var(--ink2)] animate-pulse">
              {statusMsg}
            </div>
          )}

          {/* List of current origens */}
          <div className="space-y-2.5">
            {origens.map((origem) => {
              const isCurrentEditing = editingId === origem.id;

              if (isCurrentEditing) {
                return (
                  <div
                    key={origem.id}
                    className="p-3.5 bg-[var(--surface2)] border-2 border-[var(--ink)] rounded-lg shadow-sm space-y-3 transition-all"
                  >
                    <div className="flex items-center gap-3">
                      {/* Emoji button & toggle */}
                      <div className="relative">
                        <button
                          type="button"
                          className="w-12 h-12 flex items-center justify-center text-2xl bg-[var(--surface)] border-2 border-[var(--ink)] rounded-lg hover:bg-white transition-all shadow-sm cursor-pointer"
                          onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                          title="Clique para escolher outro ícone/emoji"
                        >
                          {editEmoji || '🏢'}
                        </button>
                        <span className="absolute -bottom-1.5 -right-1 bg-[var(--ink)] text-white text-[9px] px-1 py-0.5 rounded font-mono">
                          mudar
                        </span>
                      </div>

                      {/* Name input */}
                      <div className="flex-1">
                        <label className="block text-[10px] font-mono font-bold uppercase tracking-wider text-[var(--ink3)] mb-1">
                          Nome da Origem
                        </label>
                        <input
                          type="text"
                          className="w-full bg-[var(--surface)] border border-[var(--border2)] focus:border-[var(--ink)] rounded px-3 py-1.5 text-sm font-semibold text-[var(--ink)] outline-none"
                          value={editNome}
                          onChange={(e) => setEditNome(e.target.value)}
                          placeholder="Ex: Matriz, Filial, CD Itatinga..."
                          autoFocus
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') handleSaveEdit(origem);
                            if (e.key === 'Escape') cancelEdit();
                          }}
                        />
                      </div>
                    </div>

                    {/* Emoji Quick Palette */}
                    {showEmojiPicker && (
                      <div className="p-3 bg-[var(--surface)] border border-[var(--border2)] rounded-lg space-y-2">
                        <div className="text-[11px] font-mono font-bold text-[var(--ink2)]">
                          Selecione um ícone rápido:
                        </div>
                        <div className="grid grid-cols-10 gap-1.5 text-xl">
                          {POPULAR_ORIGEM_EMOJIS.map((emoji) => (
                            <button
                              key={emoji}
                              type="button"
                              className={`p-1.5 rounded hover:bg-[var(--surface2)] transition-colors flex items-center justify-center cursor-pointer ${
                                editEmoji === emoji
                                  ? 'bg-[var(--solar-bg)] ring-2 ring-[var(--solar)]'
                                  : ''
                              }`}
                              onClick={() => {
                                setEditEmoji(emoji);
                                setShowEmojiPicker(false);
                              }}
                            >
                              {emoji}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Action buttons */}
                    <div className="flex items-center justify-end gap-2 pt-1 border-t border-[var(--border2)]">
                      <button
                        type="button"
                        className="px-3 py-1.5 text-xs font-mono font-bold text-[var(--ink3)] hover:text-[var(--ink)] cursor-pointer"
                        onClick={cancelEdit}
                        disabled={isBusy}
                      >
                        Cancelar
                      </button>
                      <button
                        type="button"
                        className="px-3.5 py-1.5 text-xs font-mono font-bold bg-[var(--solar)] hover:bg-[var(--solar-hover)] text-white rounded transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
                        onClick={() => handleSaveEdit(origem)}
                        disabled={isBusy}
                      >
                        Salvar Alterações
                      </button>
                    </div>
                  </div>
                );
              }

              return (
                <div
                  key={origem.id}
                  className="p-3 bg-[var(--surface)] border border-[var(--border2)] rounded-lg hover:border-[var(--ink3)] transition-all flex items-center justify-between group shadow-2xs"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl w-9 h-9 flex items-center justify-center bg-[var(--surface2)] rounded-md">
                      {origem.emoji || '🏢'}
                    </span>
                    <div>
                      <div className="font-bold text-sm text-[var(--ink)] flex items-center gap-2">
                        <span>{origem.nome}</span>
                        {(origem.id === 'matriz' || origem.id === 'filial') && (
                          <span className="text-[10px] font-mono px-1.5 py-0.2 bg-[var(--surface2)] text-[var(--ink3)] rounded border border-[var(--border2)]">
                            padrão
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] font-mono text-[var(--ink3)]">
                        Opção no formulário: {origem.nome}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      className="px-2.5 py-1 text-xs font-mono font-semibold text-[var(--ink2)] hover:text-[var(--ink)] bg-[var(--surface2)] hover:bg-[var(--surface)] border border-[var(--border2)] rounded transition-all cursor-pointer flex items-center gap-1"
                      onClick={() => startEdit(origem)}
                      disabled={isBusy}
                    >
                      <span>✏️</span> Editar
                    </button>
                    <button
                      type="button"
                      className="px-2 py-1 text-xs font-mono font-semibold text-rose-600 hover:text-rose-700 bg-[var(--surface2)] hover:bg-rose-50 border border-[var(--border2)] hover:border-rose-200 rounded transition-all cursor-pointer"
                      onClick={() => handleDelete(origem)}
                      disabled={isBusy || origens.length <= 1}
                      title={
                        origens.length <= 1
                          ? 'Mantenha pelo menos uma opção'
                          : 'Remover esta origem'
                      }
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Form to add a new origin */}
          {isAddingNew ? (
            <div className="p-3.5 bg-[var(--solar-bg)] border-2 border-[var(--solar)] rounded-lg shadow-sm space-y-3 transition-all mt-4">
              <div className="text-xs font-mono font-bold text-[var(--solar-dark)] uppercase tracking-wider flex items-center justify-between">
                <span>Nova Opção de Origem</span>
                <span className="text-[10px] text-[var(--ink3)] lowercase font-normal">
                  será exibida nos formulários
                </span>
              </div>

              <div className="flex items-center gap-3">
                {/* Emoji button */}
                <div className="relative">
                  <button
                    type="button"
                    className="w-12 h-12 flex items-center justify-center text-2xl bg-white border-2 border-[var(--solar)] rounded-lg hover:brightness-105 transition-all shadow-sm cursor-pointer"
                    onClick={() => setShowNewEmojiPicker(!showNewEmojiPicker)}
                    title="Escolha um ícone"
                  >
                    {newEmoji}
                  </button>
                  <span className="absolute -bottom-1.5 -right-1 bg-[var(--solar)] text-white text-[9px] px-1 py-0.5 rounded font-mono">
                    ícone
                  </span>
                </div>

                {/* Name input */}
                <div className="flex-1">
                  <label className="block text-[10px] font-mono font-bold uppercase tracking-wider text-[var(--ink2)] mb-1">
                    Nome da Origem
                  </label>
                  <input
                    type="text"
                    className="w-full bg-white border border-[var(--border2)] focus:border-[var(--solar)] rounded px-3 py-1.5 text-sm font-semibold text-[var(--ink)] outline-none"
                    value={newNome}
                    onChange={(e) => setNewNome(e.target.value)}
                    placeholder="Ex: CD Itatinga, Fábrica Eusébio, Distribuidor..."
                    autoFocus
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleCreateNew();
                      if (e.key === 'Escape') setIsAddingNew(false);
                    }}
                  />
                </div>
              </div>

              {/* Emoji Quick Palette */}
              {showNewEmojiPicker && (
                <div className="p-3 bg-white border border-[var(--border2)] rounded-lg space-y-2">
                  <div className="text-[11px] font-mono font-bold text-[var(--ink2)]">
                    Escolha um ícone para a origem:
                  </div>
                  <div className="grid grid-cols-10 gap-1.5 text-xl">
                    {POPULAR_ORIGEM_EMOJIS.map((emoji) => (
                      <button
                        key={emoji}
                        type="button"
                        className={`p-1.5 rounded hover:bg-[var(--surface2)] transition-colors flex items-center justify-center cursor-pointer ${
                          newEmoji === emoji
                            ? 'bg-[var(--solar-bg)] ring-2 ring-[var(--solar)]'
                            : ''
                        }`}
                        onClick={() => {
                          setNewEmoji(emoji);
                          setShowNewEmojiPicker(false);
                        }}
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Action buttons */}
              <div className="flex items-center justify-end gap-2 pt-1 border-t border-[rgba(232,93,4,0.2)]">
                <button
                  type="button"
                  className="px-3 py-1.5 text-xs font-mono font-bold text-[var(--ink3)] hover:text-[var(--ink)] cursor-pointer"
                  onClick={() => {
                    setIsAddingNew(false);
                    setShowNewEmojiPicker(false);
                  }}
                  disabled={isBusy}
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  className="px-3.5 py-1.5 text-xs font-mono font-bold bg-[var(--solar)] hover:bg-[var(--solar-hover)] text-white rounded transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
                  onClick={handleCreateNew}
                  disabled={isBusy}
                >
                  + Cadastrar Origem
                </button>
              </div>
            </div>
          ) : (
            <button
              type="button"
              className="w-full py-2.5 px-3 border-2 border-dashed border-[var(--border2)] hover:border-[var(--solar)] rounded-lg text-xs font-mono font-bold text-[var(--ink2)] hover:text-[var(--solar-dark)] hover:bg-[var(--surface2)] transition-all flex items-center justify-center gap-2 cursor-pointer mt-2"
              onClick={() => {
                cancelEdit();
                setIsAddingNew(true);
              }}
              disabled={isBusy}
            >
              <span>➕</span> Adicionar Nova Origem
            </button>
          )}

          {/* Reset button */}
          <div className="pt-3 border-t border-[var(--border2)] flex items-center justify-between text-xs">
            <span className="text-[var(--ink3)] text-[11px]">
              Deseja voltar ao formato original?
            </span>
            <button
              type="button"
              className="text-[11px] font-mono text-[var(--ink3)] hover:text-rose-600 underline cursor-pointer"
              onClick={handleReset}
              disabled={isBusy}
            >
              Restaurar Padrão (Matriz e Filial)
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="modal-foot">
          <button
            type="button"
            className="btn-sec text-xs font-mono uppercase"
            onClick={onClose}
            disabled={isBusy}
          >
            Concluir
          </button>
        </div>
      </div>
    </div>
  );
}
