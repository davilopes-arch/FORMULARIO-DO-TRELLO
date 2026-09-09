import { useState, useMemo } from 'react';
import { FormType, CardSummaryData } from '../types';

interface SuccessViewProps {
  formType: FormType;
  cardUrl: string;
  summary?: CardSummaryData | null;
  onReset: () => void;
  onBackToMenu: () => void;
}

export function SuccessView({
  formType,
  cardUrl,
  summary,
  onReset,
  onBackToMenu,
}: SuccessViewProps) {
  const [copied, setCopied] = useState(false);
  const [showPreviewText, setShowPreviewText] = useState(false);

  // Gera o texto formatado para WhatsApp e Teams
  const formattedMessage = useMemo(() => {
    if (!summary) {
      return `📌 *CHAMADO CX SOU ENERGY*\n🔗 *Acompanhe no Trello:* ${cardUrl}`;
    }

    const lines: string[] = [];

    if (summary.formType === 'demandas') {
      lines.push('*📋 PROTOCOLO DE ATENDIMENTO CX*');
      lines.push('━━━━━━━━━━━━━━━━━━━━');
      lines.push(`📌 *Assunto:* ${summary.title}`);
      if (summary.rcaName) {
        lines.push(`👤 *RCA:* ${summary.rcaName} ${summary.teamName ? `(${summary.teamEmoji || ''} ${summary.teamName})` : ''}`);
      }
      if (summary.origem) lines.push(`🏢 *Origem:* ${summary.origem}`);
      if (summary.pedido) lines.push(`📦 *Nº Pedido:* ${summary.pedido}`);
      if (summary.protocolo) lines.push(`🎫 *Protocolo:* ${summary.protocolo}`);
      if (summary.idClienteOuIntegrador) lines.push(`🔗 *ID Integrador:* ${summary.idClienteOuIntegrador}`);
      if (summary.situacoesNomes && summary.situacoesNomes.length > 0) {
        lines.push(`🏷️ *Situações:* ${summary.situacoesNomes.join(', ')}`);
      }
      lines.push('━━━━━━━━━━━━━━━━━━━━');
      lines.push(`🔗 *Acompanhe no Trello:* ${summary.cardUrl || cardUrl}`);
      lines.push('💬 _Demanda registrada e em acompanhamento pelo CX._');
    } else if (summary.formType === 'frete') {
      lines.push('*🚚 SOLICITAÇÃO DE COTAÇÃO DE FRETE*');
      lines.push('━━━━━━━━━━━━━━━━━━━━');
      lines.push(`📌 *Identificação:* ${summary.title}`);
      if (summary.rcaName) {
        lines.push(`👤 *RCA:* ${summary.rcaName} ${summary.teamName ? `(${summary.teamEmoji || ''} ${summary.teamName})` : ''}`);
      }
      if (summary.origem) lines.push(`🏢 *Origem:* ${summary.origem}`);
      if (summary.idClienteOuIntegrador) lines.push(`🆔 *ID Cliente:* ${summary.idClienteOuIntegrador}`);
      if (summary.cep) lines.push(`📮 *CEP:* ${summary.cep}`);
      if (summary.linkOrcamento) lines.push(`🔗 *Link Orçamento:* ${summary.linkOrcamento}`);
      lines.push('━━━━━━━━━━━━━━━━━━━━');
      lines.push(`🔗 *Acompanhe no Trello:* ${summary.cardUrl || cardUrl}`);
      lines.push('💬 _Solicitação enviada para a equipe de logística._');
    } else {
      lines.push('*📝 SOLICITAÇÃO DE NOVO CADASTRO*');
      lines.push('━━━━━━━━━━━━━━━━━━━━');
      lines.push(`📌 *Título:* ${summary.title}`);
      if (summary.nomeCliente) lines.push(`👤 *Cliente:* ${summary.nomeCliente}`);
      if (summary.cpfCnpj) lines.push(`📄 *CPF/CNPJ:* ${summary.cpfCnpj}`);
      if (summary.rcaName) {
        lines.push(`💼 *RCA Responsável:* ${summary.rcaName} ${summary.teamName ? `(${summary.teamEmoji || ''} ${summary.teamName})` : ''}`);
      }
      if (summary.origem) lines.push(`🏢 *Origem:* ${summary.origem}`);
      if (summary.idClienteOuIntegrador) lines.push(`🆔 *ID Integrador:* ${summary.idClienteOuIntegrador}`);
      lines.push('━━━━━━━━━━━━━━━━━━━━');
      lines.push(`🔗 *Acompanhe no Trello:* ${summary.cardUrl || cardUrl}`);
      lines.push('💬 _Cadastro registrado para aprovação do time financeiro/cadastro._');
    }

    return lines.join('\n');
  }, [summary, cardUrl]);

  const handleCopyMessage = async () => {
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(formattedMessage);
      } else {
        const textarea = document.createElement('textarea');
        textarea.value = formattedMessage;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    } catch (err) {
      console.error('Falha ao copiar:', err);
      alert('Não foi possível copiar automaticamente. Selecione o texto abaixo e copie manualmente.');
      setShowPreviewText(true);
    }
  };

  const whatsappUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(formattedMessage)}`;

  let title = 'Card criado!';
  let desc = 'O card foi adicionado com sucesso ao Trello.';
  let icon = '✅';
  let boxStyle = {};
  let buttonStyle = {};
  let newButtonText = '+ Criar outro card';

  if (formType === 'frete') {
    title = 'Frete solicitado!';
    desc = 'O card foi criado na lista SOLICITAÇÃO DE FRETE com sucesso.';
    icon = '🚚';
    boxStyle = { background: 'var(--yellow-bg)', borderColor: '#e8c840' };
    buttonStyle = { background: '#c87800', boxShadow: '3px 3px 0 #7a4800' };
    newButtonText = '+ Nova solicitação de frete';
  } else if (formType === 'cadastro') {
    title = 'Cadastro solicitado!';
    desc = 'O card foi criado na lista CADASTRO com sucesso.';
    icon = '📋';
    boxStyle = { background: 'var(--blue-bg)', borderColor: '#5a9fd4' };
    buttonStyle = { background: 'var(--blue)', boxShadow: '3px 3px 0 #0d2a4e' };
    newButtonText = '+ Novo cadastro';
  }

  return (
    <div className="py-6">
      <div className="success-box max-w-xl mx-auto" style={boxStyle}>
        <div className="text-5xl mb-4">{icon}</div>
        <h2>{title}</h2>
        <p>{desc}</p>

        <a
          href={cardUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="success-link"
        >
          Abrir no Trello →
        </a>

        {/* ÁREA DE COMPARTILHAMENTO RÁPIDO (WHATSAPP / TEAMS) */}
        <div className="my-6 p-4 rounded-lg bg-[var(--surface)] border border-[var(--border)] text-left shadow-sm">
          <div className="flex items-center justify-between gap-2 mb-2">
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-[var(--ink)]">
              ⚡ Compartilhamento Rápido
            </span>
            <button
              type="button"
              className="text-[11px] text-[var(--ink2)] hover:text-[var(--ink)] underline cursor-pointer"
              onClick={() => setShowPreviewText(!showPreviewText)}
            >
              {showPreviewText ? 'Ocultar prévia' : 'Ver mensagem'}
            </button>
          </div>

          <p className="text-xs text-[var(--ink2)] mb-3 leading-relaxed">
            Envie o resumo formatado com link direto para o integrador ou no grupo da equipe com 1 clique:
          </p>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={handleCopyMessage}
              className="flex-1 min-w-[190px] py-2.5 px-3 rounded text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer border"
              style={{
                background: copied ? 'var(--green, #1a8a3c)' : 'var(--ink)',
                color: '#fff',
                borderColor: copied ? 'var(--green, #1a8a3c)' : 'var(--ink)',
                boxShadow: '2px 2px 0 rgba(0,0,0,0.15)',
              }}
            >
              <span>{copied ? '✓' : '📋'}</span>
              <span>{copied ? 'Mensagem copiada!' : 'Copiar resumo para WhatsApp / Teams'}</span>
            </button>

            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="py-2.5 px-3 rounded text-xs font-bold text-emerald-800 bg-emerald-100 hover:bg-emerald-200 border border-emerald-300 flex items-center gap-1.5 transition-colors no-underline"
              title="Abrir no WhatsApp Web já com a mensagem preenchida"
            >
              <span>💬</span>
              <span>WhatsApp Web</span>
            </a>
          </div>

          {/* Prévia retrátil do texto */}
          {showPreviewText && (
            <div className="mt-3 p-2.5 bg-[var(--surface2)] rounded border border-[var(--border)] text-[11px] font-mono whitespace-pre-wrap text-[var(--ink)] leading-relaxed select-all">
              {formattedMessage}
            </div>
          )}
        </div>

        <div className="mt-4 flex flex-col items-center gap-3">
          <button
            type="button"
            className="btn-novo"
            style={buttonStyle}
            onClick={onReset}
          >
            {newButtonText}
          </button>
          <button
            type="button"
            className="btn-back-menu !mb-0"
            onClick={onBackToMenu}
          >
            ← Voltar ao menu principal
          </button>
        </div>
      </div>
    </div>
  );
}
