import React, { useState } from 'react';

interface SouEnergyLogoProps {
  className?: string;
  variant?: 'full' | 'symbol';
  height?: number | string;
  withDarkBackground?: boolean;
}

export function SouEnergyLogo({
  className = '',
  variant = 'full',
  height = 48,
  withDarkBackground = false,
}: SouEnergyLogoProps) {
  const [pngAvailable, setPngAvailable] = useState(true);

  // Símbolo isolado (apenas as 6 pétalas brancas/transparentes, para tags ou pequenos emblemas)
  if (variant === 'symbol') {
    const symbolOnly = (
      <svg
        viewBox="0 0 320 320"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{ height }}
        className={`inline-block select-none ${className}`}
        aria-label="SOU Energy Símbolo"
      >
        <defs>
          <path
            id="souOrganicPetalSymbol"
            d="
              M 59.4 -8.4
              C 83.5 -33.7, 114.2 -50.8, 142.8 -30.4
              C 157.4 13.8, 145.0 67.6, 105.0 101.4
              C 75.5 111.9, 47.5 82.3, 49.5 55.0
              C 52.6 32.9, 56.7 12.1, 59.4 -8.4 Z
            "
          />
        </defs>

        <g transform="translate(160, 160) scale(1.05)">
          <use href="#souOrganicPetalSymbol" fill="currentColor" transform="rotate(-120)" />
          <use href="#souOrganicPetalSymbol" fill="currentColor" transform="rotate(-60)" />
          <use href="#souOrganicPetalSymbol" fill="currentColor" transform="rotate(0)" />
          <use href="#souOrganicPetalSymbol" fill="currentColor" transform="rotate(60)" />
          <use href="#souOrganicPetalSymbol" fill="currentColor" transform="rotate(120)" />
          <use href="#souOrganicPetalSymbol" fill="currentColor" transform="rotate(180)" />
        </g>
      </svg>
    );

    if (withDarkBackground) {
      return (
        <div className="inline-flex items-center justify-center p-1.5 bg-[#1C1E22]">
          {symbolOnly}
        </div>
      );
    }
    return symbolOnly;
  }

  // Ícone Oficial SOU Energy: Quadrado 1:1 exato com fundo Laranja (#FF5500) e 6 Pétalas Brancas
  const iconContent = (
    <span className={`inline-block ${className}`}>
      {pngAvailable ? (
        <img
          src="/sou-energy-logo.png"
          alt="SOU Energy"
          style={{ height, width: height }}
          className="inline-block select-none object-contain"
          onError={() => setPngAvailable(false)}
        />
      ) : (
        <svg
          viewBox="0 0 512 512"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          style={{ height, width: height }}
          className="inline-block select-none"
          aria-label="SOU Energy Logo"
        >
          <defs>
            <path
              id="souOrganicPetalFull"
              d="
                M 59.4 -8.4
                C 83.5 -33.7, 114.2 -50.8, 142.8 -30.4
                C 157.4 13.8, 145.0 67.6, 105.0 101.4
                C 75.5 111.9, 47.5 82.3, 49.5 55.0
                C 52.6 32.9, 56.7 12.1, 59.4 -8.4 Z
              "
            />
          </defs>

          {/* Fundo Laranja Oficial 100% Quadrado (Cantos Retos como no arquivo original) */}
          <rect width="512" height="512" fill="#FF5500" />

          {/* 6 Pétalas Brancas em Espiral Suave */}
          <g transform="translate(256, 256) scale(1.05)">
            <use href="#souOrganicPetalFull" fill="#FFFFFF" transform="rotate(-120)" />
            <use href="#souOrganicPetalFull" fill="#FFFFFF" transform="rotate(-60)" />
            <use href="#souOrganicPetalFull" fill="#FFFFFF" transform="rotate(0)" />
            <use href="#souOrganicPetalFull" fill="#FFFFFF" transform="rotate(60)" />
            <use href="#souOrganicPetalFull" fill="#FFFFFF" transform="rotate(120)" />
            <use href="#souOrganicPetalFull" fill="#FFFFFF" transform="rotate(180)" />
          </g>
        </svg>
      )}
    </span>
  );

  if (withDarkBackground) {
    return (
      <div className="inline-flex items-center justify-center p-2 bg-[#1C1E22]">
        {iconContent}
      </div>
    );
  }

  return iconContent;
}
