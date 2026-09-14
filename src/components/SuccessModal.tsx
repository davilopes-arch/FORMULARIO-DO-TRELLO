import React from 'react';
import { ExternalLink, CheckCircle2, Copy, Check, MessageSquare, Plus, ArrowLeft } from 'lucide-react';
import { FormType, CardSummaryData } from '../types';
import { SouEnergyLogo } from './SouEnergyLogo';

interface SuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  formType: FormType;
  cardUrl: string;
  summary?: CardSummaryData | null;
  onNewCard: () => void;
  onBackToMenu: () => void;
}

export function SuccessModal({
  isOpen,
  onClose,
  formType,
  cardUrl,
  summary,
  onNewCard,
  onBackToMenu,
}: SuccessModalProps) {
  const [copied, setCopied] = React.useState(false);

  if (!isOpen) return null;

  const getFormMeta = () => {
    switch (formType) {
      case 'frete':
        return {
          title: 'Cotação de Frete Criada!',
          desc: 'Seu card foi registrado na lista de cotação com sucesso.',
          accentBg: 'bg-amber-500/10 text-amber-600 border-amber-200',
          badgeText: '🚚 LOGÍSTICA & FRETE',
        };
      case 'cadastro':
        return {
          title: 'Solicitação de Cadastro Criada!',
          desc: 'Seu card foi adicionado na lista de cadastros para aprovação.',
          accentBg: 'bg-sky-500/10 text-sky-600 border-sky-200',
          badgeText: '📋 CADASTRO & FINANCEIRO',
        };
      case 'demandas':
      default:
        return {
          title: 'Demanda Registrada no Trello!',
          desc: 'O card foi criado na lista A FAZER e já está disponível para o time.',
          accentBg: 'bg-orange-500/10 text-orange-600 border-orange-200',
          badgeText: '⚡ ATENDIMENTO CX',
        };
    }
  };

  const meta = getFormMeta();

  const handleCopyLink = async () => {
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(cardUrl);
      } else {
        const ta = document.createElement('textarea');
        ta.value = cardUrl;
        document.body.appendChild(ta);
        ta.select();
        document.execCommand('copy');
        document.body.removeChild(ta);
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {}
  };

  return (
    <div
      className="modal-overlay transition-opacity duration-200"
      id="success-modal-overlay"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="modal-container max-w-[500px] text-left overflow-hidden shadow-2xl border-2 border-[var(--ink)] bg-[var(--surface)] transition-all transform scale-100"
        id="success-modal-box"
      >
        {/* Banner com gradiente solar da Sou Energy */}
        <div className="relative bg-gradient-to-r from-orange-500 via-amber-500 to-amber-600 p-6 text-white text-center flex flex-col items-center">
          <div className="w-14 h-14 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center mb-3 shadow-inner border border-white/30 animate-bounce">
            <CheckCircle2 className="w-8 h-8 text-white stroke-[2.5]" />
          </div>

          <div className="flex items-center gap-1.5 mb-2 bg-white/20 px-2.5 py-1 rounded-full border border-white/30">
            <SouEnergyLogo variant="symbol" height={16} />
            <span className="text-[10px] font-mono uppercase tracking-wider font-bold text-white">
              {meta.badgeText}
            </span>
          </div>

          <h3 className="text-xl font-black tracking-tight text-white m-0">
            {meta.title}
          </h3>
          <p className="text-xs text-white/90 mt-1 max-w-sm m-0">
            {meta.desc}
          </p>
        </div>

        <div className="p-5 space-y-4">
          {/* Link direto do Trello em destaque */}
          <div className="bg-[var(--surface2)] p-3.5 rounded-lg border border-[var(--border)] flex items-center justify-between gap-3">
            <div className="min-w-0 flex-1">
              <span className="block text-[10px] font-mono uppercase tracking-wider font-semibold text-[var(--ink3)] mb-0.5">
                Link do Card no Trello
              </span>
              <a
                href={cardUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs font-semibold text-orange-600 hover:text-orange-700 hover:underline truncate block flex items-center gap-1.5"
                title={cardUrl}
              >
                <span className="truncate">{cardUrl}</span>
                <ExternalLink className="w-3.5 h-3.5 flex-shrink-0" />
              </a>
            </div>

            <button
              type="button"
              onClick={handleCopyLink}
              className="px-2.5 py-1.5 rounded text-xs font-semibold flex items-center gap-1 bg-white hover:bg-orange-50 text-[var(--ink)] border border-[var(--border2)] shadow-xs transition-colors cursor-pointer flex-shrink-0"
              title="Copiar link do card"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="text-emerald-700 font-bold">Copiado!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-[var(--ink2)]" />
                  <span>Copiar</span>
                </>
              )}
            </button>
          </div>

          {/* Resumo compacto de identificação */}
          {summary && (
            <div className="text-xs bg-white p-3 rounded-lg border border-[var(--border)] space-y-1.5">
              <div className="font-bold text-[var(--ink)] truncate">
                📌 {summary.title}
              </div>
              {summary.rcaName && (
                <div className="text-[var(--ink2)] flex items-center gap-1">
                  <span className="text-[var(--ink3)]">RCA:</span>
                  <span className="font-semibold">{summary.rcaName}</span>
                  {summary.teamName && (
                    <span className="text-[10px] px-1.5 py-0.5 bg-[var(--surface2)] rounded font-mono">
                      {summary.teamEmoji} {summary.teamName}
                    </span>
                  )}
                </div>
              )}
              {summary.pedido && (
                <div className="text-[var(--ink2)]">
                  <span className="text-[var(--ink3)]">Pedido:</span>{' '}
                  <span className="font-mono font-semibold">{summary.pedido}</span>
                </div>
              )}
            </div>
          )}

          {/* Botões de Ação Imediata */}
          <div className="flex flex-col gap-2 pt-1">
            <a
              href={cardUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-3 px-4 rounded-lg bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition-all no-underline text-center cursor-pointer active:scale-[0.99]"
            >
              <span>Abrir Card no Trello Agora</span>
              <ExternalLink className="w-4 h-4" />
            </a>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onNewCard}
                className="flex-1 py-2.5 px-3 rounded-lg bg-[var(--surface2)] hover:bg-[var(--border)] text-[var(--ink)] font-semibold text-xs flex items-center justify-center gap-1.5 border border-[var(--border2)] transition-colors cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Novo Chamado</span>
              </button>

              <button
                type="button"
                onClick={onBackToMenu}
                className="flex-1 py-2.5 px-3 rounded-lg bg-[var(--surface)] hover:bg-[var(--surface2)] text-[var(--ink2)] font-semibold text-xs flex items-center justify-center gap-1.5 border border-[var(--border)] transition-colors cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Voltar ao Menu</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
