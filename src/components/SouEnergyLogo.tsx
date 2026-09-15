import React from 'react';

interface SouEnergyLogoProps {
  className?: string;
  variant?: 'full' | 'symbol';
  height?: number | string;
  withDarkBackground?: boolean;
}

export function SouEnergyLogo({
  className = '',
  variant = 'full',
  height = 46,
  withDarkBackground = false,
}: SouEnergyLogoProps) {
  // Símbolo solar isolado (Íris com 6 lâminas/pétalas coloridas)
  if (variant === 'symbol') {
    const symbolContent = (
      <svg
        viewBox="0 0 160 160"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{ height }}
        className={`inline-block select-none ${className}`}
        aria-label="SOU Energy Símbolo"
      >
        <defs>
          {/* Lâmina mestre da íris (aperture blade) */}
          <path
            id="souBladeSymbol"
            d="
              M 24.5 -6.0
              C 30.5 -10.5, 42.0 -16.0, 52.5 -18.0
              C 55.0 -18.5, 57.5 -16.0, 57.0 -12.5
              C 56.0 6.0, 52.5 24.0, 42.0 38.5
              C 39.5 42.0, 34.0 41.5, 31.5 37.5
              C 27.0 30.5, 25.5 22.0, 24.5 13.0
              C 23.5 6.0, 23.0 0.0, 24.5 -6.0 Z
            "
          />
        </defs>

        <g transform="translate(80, 80)">
          {/* 1. Topo-esquerda: Vermelho Solar */}
          <use href="#souBladeSymbol" fill="#E52213" transform="rotate(-120)" />
          {/* 2. Topo: Laranja Vibrante */}
          <use href="#souBladeSymbol" fill="#FF5E00" transform="rotate(-60)" />
          {/* 3. Topo-direita: Laranja Tangerina */}
          <use href="#souBladeSymbol" fill="#FF8D00" transform="rotate(0)" />
          {/* 4. Baixo-direita: Amarelo Dourado */}
          <use href="#souBladeSymbol" fill="#FFC814" transform="rotate(60)" />
          {/* 5. Baixo: Laranja Quente */}
          <use href="#souBladeSymbol" fill="#FF7400" transform="rotate(120)" />
          {/* 6. Baixo-esquerda: Coral Escuro */}
          <use href="#souBladeSymbol" fill="#FF4700" transform="rotate(180)" />
        </g>
      </svg>
    );

    if (withDarkBackground) {
      return (
        <div className="inline-flex items-center justify-center p-1.5 rounded-xl bg-[#1C1E22]">
          {symbolContent}
        </div>
      );
    }
    return symbolContent;
  }

  // Logotipo completo ("sou energy" com símbolo e barra degradê)
  const fullContent = (
    <svg
      viewBox="0 0 520 160"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{ height }}
      className={`inline-block select-none ${className}`}
      aria-label="SOU Energy Logo"
    >
      <defs>
        {/* Barra de degradê Amarelo -> Laranja -> Vermelho */}
        <linearGradient id="souBarGradReact" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#FFCC14" />
          <stop offset="48%" stopColor="#FF7300" />
          <stop offset="100%" stopColor="#E82414" />
        </linearGradient>

        {/* Lâmina mestre da íris (curvatura e proporções exatas da logo oficial) */}
        <path
          id="souBladeFull"
          d="
            M 24.5 -6.0
            C 30.5 -10.5, 42.0 -16.0, 52.5 -18.0
            C 55.0 -18.5, 57.5 -16.0, 57.0 -12.5
            C 56.0 6.0, 52.5 24.0, 42.0 38.5
            C 39.5 42.0, 34.0 41.5, 31.5 37.5
            C 27.0 30.5, 25.5 22.0, 24.5 13.0
            C 23.5 6.0, 23.0 0.0, 24.5 -6.0 Z
          "
        />
      </defs>

      {/* Símbolo Solar: Íris de 6 lâminas com furo central */}
      <g transform="translate(82, 80)">
        {/* 1. Topo-esquerda: Vermelho Solar (#E52213) */}
        <use href="#souBladeFull" fill="#E52213" transform="rotate(-120)" />
        {/* 2. Topo: Laranja Brilhante (#FF5E00) */}
        <use href="#souBladeFull" fill="#FF5E00" transform="rotate(-60)" />
        {/* 3. Topo-direita: Laranja Tangerina (#FF8D00) */}
        <use href="#souBladeFull" fill="#FF8D00" transform="rotate(0)" />
        {/* 4. Baixo-direita: Amarelo Dourado (#FFC814) */}
        <use href="#souBladeFull" fill="#FFC814" transform="rotate(60)" />
        {/* 5. Baixo: Laranja Médio (#FF7400) */}
        <use href="#souBladeFull" fill="#FF7400" transform="rotate(120)" />
        {/* 6. Baixo-esquerda: Laranja Coral (#FF4700) */}
        <use href="#souBladeFull" fill="#FF4700" transform="rotate(180)" />
      </g>

      {/* Tipografia "sou" e "energy" com traço refinado, fino e alinhado */}
      <g
        fontFamily="'Fredoka', 'Nunito', 'Segoe UI', system-ui, sans-serif"
        fontWeight="700"
        letterSpacing="-1px"
      >
        {/* "sou" - alinhado perfeitamente em x=166 */}
        <text
          x="166"
          y="72"
          fontSize="62"
          fill="#F26622"
          stroke="#FFFFFF"
          strokeWidth="2.5"
          strokeLinejoin="round"
          strokeLinecap="round"
          paintOrder="stroke fill"
        >
          sou
        </text>

        {/* "energy" - alinhado perfeitamente em x=166 */}
        <text
          x="166"
          y="126"
          fontSize="62"
          fill="#F26622"
          stroke="#FFFFFF"
          strokeWidth="2.5"
          strokeLinejoin="round"
          strokeLinecap="round"
          paintOrder="stroke fill"
        >
          energy
        </text>
      </g>

      {/* Barra de Sublinhado Degradê - traço fino (4.5px), elegante e alinhado com o texto */}
      <rect
        x="166"
        y="140"
        width="204"
        height="4.5"
        rx="2.25"
        fill="url(#souBarGradReact)"
        stroke="#FFFFFF"
        strokeWidth="1.5"
        strokeLinejoin="round"
        paintOrder="stroke fill"
      />
    </svg>
  );

  if (withDarkBackground) {
    return (
      <div className="inline-flex items-center justify-center px-4 py-2.5 rounded-2xl bg-[#1C1E22] border border-neutral-800/80 shadow-md">
        {fullContent}
      </div>
    );
  }

  return fullContent;
}
