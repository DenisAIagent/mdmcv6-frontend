import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import '../../assets/styles/auth.css';

const ForgotPasswordForm = () => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setMessage('');

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/auth/forgotpassword`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok) {
        setIsSuccess(true);
        setMessage('Un email de réinitialisation a été envoyé à votre adresse email.');
      } else {
        setError(data.error || 'Une erreur est survenue');
      }
    } catch (err) {
      setError('Erreur de connexion. Veuillez réessayer.');
    } finally {
      setIsLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="auth-container">
        <div className="auth-card">
          <div className="auth-header">
            <h1>Email envoyé</h1>
            <p>Vérifiez votre boîte de réception</p>
          </div>

          <div className="auth-success">
            <div className="success-icon">✅</div>
            <p>{message}</p>
            <p className="success-note">
              Si vous ne recevez pas l'email dans quelques minutes, vérifiez votre dossier spam.
            </p>
          </div>

          <div className="auth-footer">
            <Link to="/admin/login" className="auth-link">
              ← Retour à la connexion
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <h1>Mot de passe oublié</h1>
          <p>Entrez votre adresse email pour recevoir un lien de réinitialisation</p>
        </div>

        {error && <div className="auth-error">{error}</div>}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label htmlFor="email">Adresse email</label>
            <div className="input-wrapper">
              <i className="input-icon">📧</i>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading}
                required
                autoFocus
                placeholder="votre@email.com"
              />
            </div>
          </div>

          <button
            type="submit"
            className={`auth-button ${isLoading ? 'loading' : ''}`}
            disabled={isLoading}
          >
            {isLoading ? (
              <span className="loading-spinner"></span>
            ) : (
              'Envoyer le lien de réinitialisation'
            )}
          </button>
        </form>

        <div className="auth-footer">
          <Link to="/admin/login" className="auth-link">
            ← Retour à la connexion
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordForm;