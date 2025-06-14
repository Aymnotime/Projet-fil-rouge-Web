import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api';

function ResetPasswordPage() {
  const { token } = useParams(); // Récupère le token depuis l'URL
  const navigate = useNavigate();
  
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Vérifier si le token est présent
    if (!token) {
      setError('Token de réinitialisation manquant');
    }
  }, [token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      setError('Les mots de passe ne correspondent pas');
      return;
    }

    if (password.length < 6) {
      setError('Le mot de passe doit contenir au moins 6 caractères');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await api.resetPassword(token, password, confirmPassword);
      
      if (response.data.success) {
        setSuccess('Votre mot de passe a été réinitialisé avec succès !');
        // Rediriger vers la page de connexion après 3 secondes
        setTimeout(() => {
          navigate('/');
        }, 3000);
      } else {
        setError(response.data.message || 'Erreur lors de la réinitialisation');
      }
    } catch (err) {
      setError('Une erreur est survenue. Veuillez réessayer.');
      console.error('Erreur réinitialisation:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mt-5">
      <div className="row justify-content-center">
        <div className="col-md-6">
          <div className="card">
            <div className="card-header">
              <h4 className="mb-0">Réinitialiser votre mot de passe</h4>
            </div>
            <div className="card-body">
              {success ? (
                <div className="alert alert-success">
                  <i className="bi bi-check-circle me-2"></i>
                  {success}
                  <div className="mt-2">
                    <small>Vous allez être redirigé vers la page d'accueil...</small>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSubmit}>
                  <div className="mb-3">
                    <p className="text-muted">
                      Entrez votre nouveau mot de passe ci-dessous.
                    </p>
                  </div>
                  
                  <div className="mb-3">
                    <label htmlFor="password" className="form-label">
                      Nouveau mot de passe
                    </label>
                    <input
                      type="password"
                      className="form-control"
                      id="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      minLength="6"
                      placeholder="Entrez votre nouveau mot de passe"
                    />
                  </div>
                  
                  <div className="mb-3">
                    <label htmlFor="confirmPassword" className="form-label">
                      Confirmer le mot de passe
                    </label>
                    <input
                      type="password"
                      className="form-control"
                      id="confirmPassword"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                      minLength="6"
                      placeholder="Confirmez votre nouveau mot de passe"
                    />
                  </div>
                  
                  {error && (
                    <div className="alert alert-danger">
                      <i className="bi bi-exclamation-triangle me-2"></i>
                      {error}
                    </div>
                  )}
                  
                  <button
                    type="submit"
                    className="btn btn-primary w-100"
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                        Réinitialisation...
                      </>
                    ) : (
                      'Réinitialiser le mot de passe'
                    )}
                  </button>
                </form>
              )}
              
              <div className="text-center mt-3">
                <button
                  type="button"
                  className="btn btn-link"
                  onClick={() => navigate('/')}
                >
                  Retour à l'accueil
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ResetPasswordPage;