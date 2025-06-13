import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import StripeContainer from "../Stripe/StripeContainer";
import "./PaiementPage.css";

const PaiementPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [error, setError] = useState("");

  // Récupérer les paramètres de l'URL
  const urlParams = new URLSearchParams(location.search);
  const commandeId = urlParams.get('commande_id');
  const amount = parseFloat(urlParams.get('amount'));

  useEffect(() => {
    // Vérifier que les paramètres essentiels sont présents
    if (!commandeId || commandeId === 'undefined') {
      setError("ID de commande manquant ou invalide");
      return;
    }

    if (!amount || isNaN(amount) || amount <= 0) {
      setError("Montant invalide");
      return;
    }
  }, [commandeId, amount]);

  const handleRetour = () => {
    navigate(-1); // Retour à la page précédente
  };

  if (error) {
    return (
      <div className="paiement-container">
        <div className="alert alert-danger" role="alert">
          <h4 className="alert-heading">Erreur</h4>
          <p>{error}</p>
          <hr />
          <button className="btn btn-outline-danger" onClick={handleRetour}>
            Retour
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="paiement-container">
      <div className="row">
        <div className="col-md-6">
          <div className="card">
            <div className="card-header">
              <h4>Récapitulatif de votre commande</h4>
            </div>
            <div className="card-body">
              <p><strong>Commande N°:</strong> {commandeId}</p>
              <p><strong>Date:</strong> {new Date().toLocaleDateString()}</p>
              
              <hr />
              <div className="d-flex justify-content-between">
                <strong>Total à payer:</strong>
                <strong className="text-primary">{amount.toFixed(2)}€</strong>
              </div>
            </div>
          </div>
          
          <button className="btn btn-secondary mt-3" onClick={handleRetour}>
            <i className="bi bi-arrow-left"></i> Retour au panier
          </button>
        </div>
        
        <div className="col-md-6">
          <div className="card">
            <div className="card-header">
              <h4>Paiement sécurisé</h4>
            </div>
            <div className="card-body">
              <StripeContainer 
                amount={amount}
                commande_id={commandeId}
                onSuccess={() => {
                  // Rediriger vers une page de confirmation après paiement réussi
                  setTimeout(() => {
                    navigate('/commandes?success=true');
                  }, 2000);
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaiementPage;