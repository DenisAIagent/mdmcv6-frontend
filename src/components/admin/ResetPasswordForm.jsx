import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import '../../assets/styles/auth.css';

const ResetPasswordForm = () => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState({ score: 0, text: '', color: '' });

  const { token } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    if (!token) {
      setError('Token de réinitialisation manquant');
    }
  }, [token]);

  // Calculer la force du mot de passe
  const calculatePasswordStrength = (password) => {
    let score = 0;
    let text = '';
    let color = '';

    if (password.length >= 8) score += 1;
    if (/[a-z]/.test(password)) score += 1;
    if (/[A-Z]/.test(password)) score += 1;
    if (/[0-9]/.test(password)) score += 1;
    if (/[^A-Za-z0-9]/.test(password)) score += 1;

    switch (score) {
      case 0:
      case 1:
        text = 'Très faible';
        color = '#ff4444';
        break;
      case 2:
        text = 'Faible';
        color = '#ff8800';
        break;
      case 3:
        text = 'Moyen';
        color = '#ffaa00';
        break;
      case 4:
        text = 'Fort';
        color = '#88cc00';
        break;
      case 5:
        text = 'Très fort';
        color = '#00cc44';
        break;
      default:
        text = '';
        color = '';
    }

    return { score, text, color };
  };

  useEffect(() => {
    setPasswordStrength(calculatePasswordStrength(password));
  }, [password]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setMessage('');

    if (password !== confirmPassword) {
      setError('Les mots de passe ne correspondent pas');
      setIsLoading(false);
      return;
    }

    if (passwordStrength.score < 3) {
      setError('Le mot de passe doit être plus fort');
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/auth/resetpassword/${token}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ password }),
      });

      const data = await response.json();

      if (response.ok) {
        setIsSuccess(true);
        setMessage('Mot de passe réinitialisé avec succès');
        setTimeout(() => {
          navigate('/admin/login');
        }, 3000);
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
            <h1>Mot de passe réinitialisé</h1>
            <p>Votre mot de passe a été mis à jour avec succès</p>
          </div>

          <div className="auth-success">
            <div className="success-icon">✅</div>
            <p>{message}</p>
            <p className="success-note">
              Vous allez être redirigé vers la page de connexion dans quelques secondes...
            </p>
          </div>

          <div className="auth-footer">
            <Link to="/admin/login" className="auth-link">
              Se connecter maintenant →
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
          <h1>Réinitialiser le mot de passe</h1>
          <p>Entrez votre nouveau mot de passe</p>
        </div>

        {error && <div className="auth-error">{error}</div>}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label htmlFor="password">Nouveau mot de passe</label>
            <div className="input-wrapper">
              <i className="input-icon">🔑</i>
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading}
                required
                autoFocus
                placeholder="Entrez votre nouveau mot de passe"
              />
              <button
                type="button"
                className="toggle-password"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? "🙈" : "👁️"}
              </button>
            </div>
            {password && (
              <div className="password-strength">
                <div className="strength-bar">
                  <div 
                    className="strength-fill"
                    style={{ 
                      width: `${(passwordStrength.score / 5) * 100}%`,
                      backgroundColor: passwordStrength.color
                    }}
                  />
                </div>
                <span 
                  className="strength-text"
                  style={{ color: passwordStrength.color }}
                >
                  {passwordStrength.text}
                </span>
              </div>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="confirmPassword">Confirmer le mot de passe</label>
            <div className="input-wrapper">
              <i className="input-icon">🔑</i>
              <input
                type={showConfirmPassword ? "text" : "password"}
                id="confirmPassword"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                disabled={isLoading}
                required
                placeholder="Confirmez votre nouveau mot de passe"
              />
              <button
                type="button"
                className="toggle-password"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                {showConfirmPassword ? "🙈" : "👁️"}
              </button>
            </div>
            {confirmPassword && password !== confirmPassword && (
              <div className="password-mismatch">
                Les mots de passe ne correspondent pas
              </div>
            )}
          </div>

          <div className="password-requirements">
            <h4>Exigences du mot de passe :</h4>
            <ul>
              <li className={password.length >= 8 ? 'valid' : ''}>
                Au moins 8 caractères
              </li>
              <li className={/[a-z]/.test(password) ? 'valid' : ''}>
                Au moins une lettre minuscule
              </li>
              <li className={/[A-Z]/.test(password) ? 'valid' : ''}>
                Au moins une lettre majuscule
              </li>
              <li className={/[0-9]/.test(password) ? 'valid' : ''}>
                Au moins un chiffre
              </li>
              <li className={/[^A-Za-z0-9]/.test(password) ? 'valid' : ''}>
                Au moins un caractère spécial
              </li>
            </ul>
          </div>

          <button
            type="submit"
            className={`auth-button ${isLoading ? 'loading' : ''}`}
            disabled={isLoading || passwordStrength.score < 3 || password !== confirmPassword}
          >
            {isLoading ? (
              <span className="loading-spinner"></span>
            ) : (
              'Réinitialiser le mot de passe'
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

export default ResetPasswordForm;