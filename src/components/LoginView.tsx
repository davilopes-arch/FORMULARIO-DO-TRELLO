import { useState, KeyboardEvent } from 'react';

interface LoginViewProps {
  onLogin: (email: string) => void;
}

export function LoginView({ onLogin }: LoginViewProps) {
  const [email, setEmail] = useState('');
  const [hasError, setHasError] = useState(false);

  const handleSubmit = () => {
    const cleanEmail = email.trim();
    const valid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail);
    if (!valid) {
      setHasError(true);
      return;
    }
    setHasError(false);
    onLogin(cleanEmail);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSubmit();
    }
  };

  return (
    <div className="py-8">
      <div className="login-box">
        <h2>Identificação</h2>
        <p>
          Informe seu e-mail para continuar. Ele será registrado no card do Trello como responsável pelo cadastro.
        </p>

        <input
          className={`login-input ${hasError ? 'err' : ''}`}
          type="email"
          id="login-email"
          placeholder="seu@email.com"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            if (hasError) setHasError(false);
          }}
          onKeyDown={handleKeyDown}
          autoFocus
        />

        {hasError && (
          <div className="login-err text-red-600" id="login-err">
            Informe um e-mail válido.
          </div>
        )}

        <button className="btn-login" onClick={handleSubmit}>
          Entrar →
        </button>
      </div>
    </div>
  );
}
