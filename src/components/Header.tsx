interface HeaderProps {
  userEmail: string | null;
  onLogout: () => void;
}

export function Header({ userEmail, onLogout }: HeaderProps) {
  return (
    <header className="hdr text-center">
      <div className="flex flex-col items-center">
        <div className="hdr-badge">
          Trello · CADASTRO / DEMANDAS CX
        </div>

        {userEmail && (
          <div
            className="user-badge"
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
