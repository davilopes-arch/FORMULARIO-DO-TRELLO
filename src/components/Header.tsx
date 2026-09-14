import React from 'react';
import { SouEnergyLogo } from './SouEnergyLogo';

interface HeaderProps {
  userEmail: string | null;
  onLogout: () => void;
}

export function Header({ userEmail, onLogout }: HeaderProps) {
  return (
    <header className="hdr text-center">
      <div className="flex flex-col items-center">
        {/* Logotipo Oficial SOU Energy */}
        <div className="mb-3 transition-transform hover:scale-105 duration-200 cursor-default">
          <SouEnergyLogo height={52} />
        </div>

        {userEmail && (
          <div
            className="user-badge transition-all hover:border-orange-300"
            onClick={onLogout}
            title="Clique para desconectar seu e-mail"
          >
            <span className="user-badge-email">{userEmail}</span>
            <span className="user-badge-sair">sair</span>
          </div>
        )}
      </div>

      <h1>
        Novo
        <br />
        <em>Card</em>
      </h1>
    </header>
  );
}
