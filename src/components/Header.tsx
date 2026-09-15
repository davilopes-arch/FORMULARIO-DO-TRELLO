import React from 'react';

interface HeaderProps {
  userEmail: string | null;
  onLogout: () => void;
}

export function Header({ userEmail, onLogout }: HeaderProps) {
  return (
    <header className="hdr text-center">
      {userEmail && (
        <div className="flex flex-col items-center mb-3">
          <div
            className="user-badge transition-all hover:border-orange-300"
            onClick={onLogout}
            title="Clique para desconectar seu e-mail"
          >
            <span className="user-badge-email">{userEmail}</span>
            <span className="user-badge-sair">sair</span>
          </div>
        </div>
      )}

      <h1>
        Novo
        <br />
        <em>Card</em>
      </h1>
    </header>
  );
}
