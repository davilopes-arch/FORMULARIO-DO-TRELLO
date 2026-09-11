import React, { useState } from 'react';
import { TeamInfo } from '../types';

interface EquipeModalProps {
  isOpen: boolean;
  onClose: () => void;
  teams: TeamInfo[];
  onUpdateTeam: (id: string, updates: { nome?: string; emoji?: string }) => Promise<void>;
  onAddTeam: (nome: string, emoji: string) => Promise<void>;
  onRemoveTeam: (id: string) => Promise<void>;
  onResetTeams: () => Promise<void>;
}

const POPULAR_EMOJIS = [
  '🗼', '🌵', '🌻', '⚡', '🌅',
  '☀️', '🔋', '🚀', '💎', '🛡️',
  '🏆', '🎯', '📦', '🚚', '💡',
  '⚙️', '🔥', '🌟', '🌊', '🌿',
  '🦅', '🦁', '⭐', '✨', '🤝',
  '🏢', '💼', '🌈', '🔧', '📊',
];

export function EquipeModal({
  isOpen,
  onClose,
  teams,
  onUpdateTeam,
  onAddTeam,
  onRemoveTeam,
  onResetTeams,
}: EquipeModalProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editNome, setEditNome] = useState('');
  const [editEmoji, setEditEmoji] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  // New team form state
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [newNome, setNewNome] = useState('');
  const [newEmoji, setNewEmoji] = useState('⚡');
  const [showNewEmojiPicker, setShowNewEmojiPicker] = useState(false);

  // Loading indicator
  const [isBusy, setIsBusy] = useState(false);
  const [statusMsg, setStatusMsg] = useState('');

  if (!isOpen) return null;

  const startEdit = (team: TeamInfo) => {
    setEditingId(team.id || team.nome);
    setEditNome(team.nome);
    setEditEmoji(team.emoji);
    setShowEmojiPicker(false);
    setIsAddingNew(false);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditNome('');
    setEditEmoji('');
    setShowEmojiPicker(false);
  };

  const handleSaveEdit = async (team: TeamInfo) => {
    const cleanNome = editNome.trim();
    const cleanEmoji = editEmoji.trim() || '⚡';

    if (!cleanNome) {
      alert('Por favor, informe o nome da equipe.');
      return;
    }

    try {
      setIsBusy(true);
      setStatusMsg('Salvando alterações...');
      await onUpdateTeam(team.id || team.nome, {
        nome: cleanNome,
        emoji: cleanEmoji,
      });
      cancelEdit();
    } catch (err: any) {
      alert(err.message || 'Erro ao salvar equipe');
    } finally {
      setIsBusy(false);
      setStatusMsg('');
    }
  };

  const handleCreateNew = async () => {
    const cleanNome = newNome.trim();
    const cleanEmoji = newEmoji.trim() || '⚡';

    if (!cleanNome) {
      alert('Por favor, informe o nome da nova equipe.');
      return;
    }

    try {
      setIsBusy(true);
      setStatusMsg('Criando nova equipe...');
      await onAddTeam(cleanNome, cleanEmoji);
      setNewNome('');
      setNewEmoji('⚡');
      setIsAddingNew(false);
      setShowNewEmojiPicker(false);
    } catch (err: any) {
      alert(err.message || 'Erro ao criar equipe');
    } finally {
      setIsBusy(false);
      setStatusMsg('');
    }
  };

  const handleDelete = async (team: TeamInfo) => {
    if (teams.length <= 1) {
      alert('Você precisa manter pelo menos uma equipe cadastrada.');
      return;
    }

    const conf = window.confirm(
      `Deseja realmente remover a equipe "${team.emoji} ${team.nome}"?`
    );
    if (!conf) return;

    try {
      setIsBusy(true);
      setStatusMsg('Removendo equipe...');
      await onRemoveTeam(team.id || team.nome);
      if (editingId === (team.id || team.nome)) {
        cancelEdit();
      }
    } catch (err: any) {
      alert(err.message || 'Erro ao remover equipe');
    } finally {
      setIsBusy(false);
      setStatusMsg('');
    }
  };

  const handleReset = async () => {
    const conf = window.confirm(
      'Deseja restaurar as equipes originais do padrão Sou Energy (Farol, Cactus, Girassol, Raio, Clareou)?'
    );
    if (!conf) return;

    try {
      setIsBusy(true);
      setStatusMsg('Restaurando equipes padrão...');
      await onResetTeams();
      cancelEdit();
      setIsAddingNew(false);
    } catch (err: any) {
      alert(err.message || 'Erro ao restaurar equipes');
    } finally {
      setIsBusy(false);
      setStatusMsg('');
    }
  };

  return (
    <div
      className="modal-overlay"
      id="modal-equipes-bg"
      onClick={(e) => {
        if (e.target === e.currentTarget && !isBusy) onClose();
      }}
    >
      <div className="modal-container" id="modal-equipes" style={{ maxWidth: 540 }}>
        {/* Header */}
        <div className="modal-head">
          <div className="modal-head-row">
            <div>
              <h3 className="text-base font-extrabold text-[var(--ink)]">
                Gerenciar Equipes
              </h3>
              <p className="text-xs text-[var(--ink2)] mt-0.5">
                Altere o ícone (emoji) e o nome das equipes conforme a sua operação.
              </p>
            </div>
            <button
              type="button"
              className="text-[var(--ink3)] hover:text-[var(--ink)] text-lg px-2 py-1 leading-none rounded"
              onClick={onClose}
              disabled={isBusy}
              aria-label="Fechar"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="modal-body space-y-3" id="modal-equipes-body">
          {statusMsg && (
            <div className="bg-[var(--surface2)] border border-[var(--border2)] rounded px-3 py-1.5 text-xs text-center font-mono font-bold text-[var(--ink2)] animate-pulse">
              {statusMsg}
            </div>
          )}

          {/* List of current teams */}
          <div className="space-y-2.5">
            {teams.map((team) => {
              const isCurrentEditing = editingId === (team.id || team.nome);

              if (isCurrentEditing) {
                return (
                  <div
                    key={team.id || team.nome}
                    className="p-3.5 bg-[var(--surface2)] border-2 border-[var(--ink)] rounded-lg shadow-sm space-y-3 transition-all"
                  >
                    <div className="flex items-center gap-3">
                      {/* Emoji button & toggle */}
                      <div className="relative">
                        <button
                          type="button"
                          className="w-12 h-12 flex items-center justify-center text-2xl bg-[var(--surface)] border-2 border-[var(--ink)] rounded-lg hover:bg-white transition-all shadow-sm"
                          onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                          title="Clique para escolher outro ícone/emoji"
                        >
                          {editEmoji || '⚡'}
                        </button>
                        <span className="absolute -bottom-1.5 -right-1 bg-[var(--ink)] text-white text-[9px] px-1 py-0.5 rounded font-mono">
                          mudar
                        </span>
                      </div>

                      {/* Name input */}
                      <div className="flex-1">
                        <label className="block text-[10px] font-mono font-bold uppercase tracking-wider text-[var(--ink3)] mb-1">
                          Nome da Equipe
                        </label>
                        <input
                          type="text"
                          className="w-full bg-[var(--surface)] border border-[var(--border2)] focus:border-[var(--ink)] rounded px-3 py-1.5 text-sm font-semibold text-[var(--ink)] outline-none"
                          value={editNome}
                          onChange={(e) => setEditNome(e.target.value)}
                          placeholder="Ex: Águia, Farol, Vendas..."
                          autoFocus
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
                          {POPULAR_EMOJIS.map((emoji) => (
                            <button
                              key={emoji}
                              type="button"
                              className={`w-8 h-8 flex items-center justify-center rounded hover:bg-[var(--surface2)] transition-all ${
                                editEmoji === emoji ? 'bg-[var(--surface2)] ring-2 ring-[var(--ink)]' : ''
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
                        <div className="pt-1 border-t border-[var(--border)] flex items-center gap-2">
                          <span className="text-[10px] text-[var(--ink3)] font-mono">
                            Ou digite/cole:
                          </span>
                          <input
                            type="text"
                            maxLength={4}
                            className="w-16 text-center bg-white border border-[var(--border2)] rounded py-0.5 text-sm outline-none"
                            value={editEmoji}
                            onChange={(e) => setEditEmoji(e.target.value)}
                            placeholder="Emoji"
                          />
                          <button
                            type="button"
                            className="text-[10px] font-mono text-[var(--ink2)] underline ml-auto"
                            onClick={() => setShowEmojiPicker(false)}
                          >
                            Fechar seletor
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Action buttons */}
                    <div className="flex items-center justify-between pt-1">
                      <button
                        type="button"
                        className="text-xs text-[var(--red)] hover:underline font-mono"
                        onClick={() => handleDelete(team)}
                        disabled={isBusy || teams.length <= 1}
                      >
                        Excluir equipe
                      </button>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          className="px-3 py-1.5 text-xs font-semibold rounded text-[var(--ink2)] hover:bg-[var(--surface)] border border-transparent"
                          onClick={cancelEdit}
                          disabled={isBusy}
                        >
                          Cancelar
                        </button>
                        <button
                          type="button"
                          className="px-4 py-1.5 text-xs font-bold rounded bg-[var(--ink)] text-white hover:bg-black transition-all shadow-sm"
                          onClick={() => handleSaveEdit(team)}
                          disabled={isBusy}
                        >
                          Salvar Alterações
                        </button>
                      </div>
                    </div>
                  </div>
                );
              }

              // Normal view of the team card
              return (
                <div
                  key={team.id || team.nome}
                  className="flex items-center justify-between p-2.5 bg-[var(--surface)] border border-[var(--border2)] rounded-lg hover:border-[var(--ink)] transition-all"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl w-9 text-center leading-none select-none">
                      {team.emoji}
                    </span>
                    <div>
                      <span className="font-bold text-sm text-[var(--ink)]">
                        {team.nome}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      className="px-3 py-1 text-xs font-semibold rounded bg-[var(--surface2)] hover:bg-[var(--border2)] text-[var(--ink)] border border-[var(--border2)] transition-all"
                      onClick={() => startEdit(team)}
                      disabled={isBusy}
                    >
                      ✎ Editar
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Add New Team Section */}
          {isAddingNew ? (
            <div className="p-3.5 bg-[var(--surface2)] border-2 border-dashed border-[var(--ink)] rounded-lg space-y-3 transition-all mt-3">
              <div className="text-xs font-mono font-bold uppercase tracking-wider text-[var(--ink)]">
                + Nova Equipe
              </div>

              <div className="flex items-center gap-3">
                {/* Emoji button */}
                <div className="relative">
                  <button
                    type="button"
                    className="w-12 h-12 flex items-center justify-center text-2xl bg-[var(--surface)] border-2 border-[var(--ink)] rounded-lg hover:bg-white transition-all shadow-sm"
                    onClick={() => setShowNewEmojiPicker(!showNewEmojiPicker)}
                    title="Clique para escolher outro emoji"
                  >
                    {newEmoji || '⚡'}
                  </button>
                  <span className="absolute -bottom-1.5 -right-1 bg-[var(--ink)] text-white text-[9px] px-1 py-0.5 rounded font-mono">
                    ícone
                  </span>
                </div>

                {/* Name input */}
                <div className="flex-1">
                  <label className="block text-[10px] font-mono font-bold uppercase tracking-wider text-[var(--ink3)] mb-1">
                    Nome da Nova Equipe
                  </label>
                  <input
                    type="text"
                    className="w-full bg-[var(--surface)] border border-[var(--border2)] focus:border-[var(--ink)] rounded px-3 py-1.5 text-sm font-semibold text-[var(--ink)] outline-none"
                    value={newNome}
                    onChange={(e) => setNewNome(e.target.value)}
                    placeholder="Ex: Águia, Marte, Expansão..."
                    autoFocus
                  />
                </div>
              </div>

              {/* Emoji quick palette for new team */}
              {showNewEmojiPicker && (
                <div className="p-3 bg-[var(--surface)] border border-[var(--border2)] rounded-lg space-y-2">
                  <div className="text-[11px] font-mono font-bold text-[var(--ink2)]">
                    Selecione um ícone rápido:
                  </div>
                  <div className="grid grid-cols-10 gap-1.5 text-xl">
                    {POPULAR_EMOJIS.map((emoji) => (
                      <button
                        key={emoji}
                        type="button"
                        className={`w-8 h-8 flex items-center justify-center rounded hover:bg-[var(--surface2)] transition-all ${
                          newEmoji === emoji ? 'bg-[var(--surface2)] ring-2 ring-[var(--ink)]' : ''
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
                  <div className="pt-1 border-t border-[var(--border)] flex items-center gap-2">
                    <span className="text-[10px] text-[var(--ink3)] font-mono">
                      Ou digite/cole:
                    </span>
                    <input
                      type="text"
                      maxLength={4}
                      className="w-16 text-center bg-white border border-[var(--border2)] rounded py-0.5 text-sm outline-none"
                      value={newEmoji}
                      onChange={(e) => setNewEmoji(e.target.value)}
                      placeholder="Emoji"
                    />
                    <button
                      type="button"
                      className="text-[10px] font-mono text-[var(--ink2)] underline ml-auto"
                      onClick={() => setShowNewEmojiPicker(false)}
                    >
                      Fechar
                    </button>
                  </div>
                </div>
              )}

              {/* Action buttons */}
              <div className="flex items-center justify-end gap-2 pt-1">
                <button
                  type="button"
                  className="px-3 py-1.5 text-xs font-semibold rounded text-[var(--ink2)] hover:bg-[var(--surface)]"
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
                  className="px-4 py-1.5 text-xs font-bold rounded bg-[var(--ink)] text-white hover:bg-black transition-all shadow-sm"
                  onClick={handleCreateNew}
                  disabled={isBusy}
                >
                  Adicionar Equipe
                </button>
              </div>
            </div>
          ) : (
            <button
              type="button"
              className="w-full py-2 border-2 border-dashed border-[var(--border2)] hover:border-[var(--ink)] hover:bg-[var(--surface2)] text-[var(--ink)] rounded-lg text-xs font-bold font-mono transition-all flex items-center justify-center gap-1.5"
              onClick={() => {
                setIsAddingNew(true);
                cancelEdit();
              }}
              disabled={isBusy}
            >
              <span>+</span> Adicionar Nova Equipe
            </button>
          )}
        </div>

        {/* Footer */}
        <div className="modal-foot">
          <button
            type="button"
            className="text-[11px] font-mono text-[var(--ink3)] hover:text-[var(--red)] underline transition-colors"
            onClick={handleReset}
            disabled={isBusy}
          >
            Restaurar Padrão Sou Energy
          </button>

          <button
            type="button"
            className="px-4 py-2 text-xs font-bold rounded bg-[var(--ink)] text-white hover:bg-black transition-all shadow-sm"
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
