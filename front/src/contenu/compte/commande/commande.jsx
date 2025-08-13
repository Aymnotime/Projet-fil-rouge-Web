import React, { useState, useEffect } from "react";
import api from "../../../api";
import StripeContainer from "../../Stripe/StripeContainer";
import { useNavigate } from "react-router-dom";

const CommandePage = () => {
  const [commandes, setCommandes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCommandes = async () => {
      try {
        setLoading(true);
        setError("");
        
        console.log("🔄 Récupération des commandes...");
        const response = await api.getCommandes();
        
        console.log("📋 Réponse complète API:", response);
        console.log("📋 Data:", response.data);
        
        if (response.data && response.data.success) {
          const commandesData = response.data.commands || response.data.commandes || response.data.data || [];
          
          console.log("✅ Commandes récupérées:", commandesData.length);
          console.log("📋 Première commande:", commandesData[0]);
          
          setCommandes(commandesData);
        } else {
          console.error("❌ Réponse API invalide:", response.data);
          setError("Format de réponse invalide");
        }
      } catch (error) {
        console.error("❌ Erreur lors de la récupération des commandes:", error);
        setError("Impossible de récupérer les commandes: " + error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchCommandes();
  }, []);

  const calculateTotal = (produits) => {
    if (!Array.isArray(produits)) {
      console.warn("⚠️ Produits non valides:", produits);
      return 0;
    }
    
    return produits.reduce((total, product) => {
      const prix = parseFloat(product.prix) || 0;
      const quantity = parseInt(product.quantity) || parseInt(product.quantite) || 1;
      return total + (prix * quantity);
    }, 0);
  };

  const getQuantity = (product) => {
    return parseInt(product.quantity) || parseInt(product.quantite) || 1;
  };

  const formatDate = (dateString) => {
    try {
      return new Date(dateString).toLocaleDateString('fr-FR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      return dateString;
    }
  };

  const getStatusBadgeClass = (statut) => {
    switch (statut) {
      case 'Payé':
      case 'paye':
      case 'Livré':
        return 'status-paid';
      case 'En attente':
        return 'status-pending';
      case 'Commande en cours':
        return 'status-processing';
      case 'Expédition de la commande':
        return 'status-shipping';
      default:
        return 'status-unknown';
    }
  };

  if (loading) {
    return (
      <div className="commandes-container">
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Chargement de vos commandes...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="commandes-container">
        <div className="error-container">
          <div className="error-icon">⚠️</div>
          <h3>Une erreur s'est produite</h3>
          <p>{error}</p>
          <button 
            className="btn-retry" 
            onClick={() => window.location.reload()}
          >
            Réessayer
          </button>
        </div>
      </div>
    );
  }

  if (!commandes || commandes.length === 0) {
    return (
      <div className="commandes-container">
        <div className="empty-container">
          <div className="empty-icon">🛒</div>
          <h3>Aucune commande</h3>
          <p>Vous n'avez pas encore passé de commande.</p>
          <button 
            className="btn-primary" 
            onClick={() => navigate('/boutique')}
          >
            Découvrir nos produits
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="commandes-container">
      <div className="commandes-header">
        <h1>Mes commandes</h1>
        <span className="commandes-count">{commandes.length} commande{commandes.length > 1 ? 's' : ''}</span>
      </div>
      
      <div className="commandes-grid">
        {commandes.map((commande, index) => {
          const produits = Array.isArray(commande.produits) ? commande.produits : [];
          const totalAmount = calculateTotal(produits);
          const statutPaiement = commande.statut_paiement || commande.paye || "En attente";
          
          return (
            <div className="commande-card" key={commande.id || index}>
              {/* En-tête de la commande */}
              <div className="commande-card-header">
                <div className="commande-info">
                  <h3>Commande #{commande.id?.substring(0, 8) || index + 1}</h3>
                  <p className="commande-date">{formatDate(commande.date)}</p>
                </div>
                <div className={`status-badge ${getStatusBadgeClass(statutPaiement)}`}>
                  {statutPaiement}
                </div>
              </div>

              {/* Corps de la commande */}
              <div className="commande-card-body">
                {produits.length > 0 ? (
                  <>
                    <div className="produits-section">
                      <h4 className="section-title">
                        Produits commandés ({produits.length})
                      </h4>
                      
                      <div className="produits-list">
                        {produits.map((product, productIndex) => (
                          <div className="produit-item" key={product.id || productIndex}>
                            <div className="produit-visual">
                              {product.image ? (
                                <img 
                                  src={product.image} 
                                  alt={product.nom || "Produit"}
                                  className="produit-image"
                                  onError={(e) => {
                                    e.target.style.display = 'none';
                                    e.target.nextElementSibling.style.display = 'flex';
                                  }}
                                />
                              ) : null}
                              <div className="produit-placeholder" style={{ display: product.image ? 'none' : 'flex' }}>
                                📦
                              </div>
                            </div>
                            
                            <div className="produit-details">
                              <h5 className="produit-nom">{product.nom || "Produit sans nom"}</h5>
                              <p className="produit-quantity">Qté: {getQuantity(product)}</p>
                              {product.description && (
                                <p className="produit-description">{product.description}</p>
                              )}
                            </div>
                            
                            <div className="produit-pricing">
                              <div className="prix-unitaire">
                                {parseFloat(product.prix || 0).toFixed(2)} €
                              </div>
                              <div className="sous-total">
                                Total: {(parseFloat(product.prix || 0) * getQuantity(product)).toFixed(2)} €
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="no-products">
                    <p>⚠️ Aucun produit trouvé pour cette commande.</p>
                    <small>ID commande: {commande.id}</small>
                  </div>
                )}
              </div>

              {/* Pied de la commande */}
              <div className="commande-card-footer">
                <div className="total-section">
                  <div className="total-amount">
                    <span className="total-label">Total:</span>
                    <span className="total-value">{totalAmount.toFixed(2)} €</span>
                  </div>
                  {commande.montant_total && totalAmount !== parseFloat(commande.montant_total) && (
                    <small className="montant-recorded">
                      (Montant enregistré: {parseFloat(commande.montant_total).toFixed(2)} €)
                    </small>
                  )}
                </div>
                
                {(statutPaiement === 'En attente' || (!commande.paye && !statutPaiement)) && (
                  <button
                    className="btn-pay"
                    onClick={() =>
                      navigate(`/paiement?commande_id=${commande.id}&amount=${totalAmount}`)
                    }
                  >
                    💳 Payer la commande
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <style jsx>{`
        .commandes-container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 20px;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        }

        .commandes-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 30px;
          padding-bottom: 15px;
          border-bottom: 2px solid #f0f0f0;
        }

        .commandes-header h1 {
          margin: 0;
          color: #2c3e50;
          font-size: 28px;
          font-weight: 600;
        }

        .commandes-count {
          background: #3498db;
          color: white;
          padding: 8px 16px;
          border-radius: 20px;
          font-size: 14px;
          font-weight: 500;
        }

        .loading-container,
        .error-container,
        .empty-container {
          text-align: center;
          padding: 60px 20px;
        }

        .spinner {
          width: 40px;
          height: 40px;
          border: 4px solid #f3f3f3;
          border-top: 4px solid #3498db;
          border-radius: 50%;
          animation: spin 1s linear infinite;
          margin: 0 auto 20px;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        .error-container .error-icon,
        .empty-container .empty-icon {
          font-size: 48px;
          margin-bottom: 20px;
        }

        .btn-retry,
        .btn-primary {
          background: #3498db;
          color: white;
          border: none;
          padding: 12px 24px;
          border-radius: 8px;
          cursor: pointer;
          font-size: 16px;
          font-weight: 500;
          transition: background-color 0.2s;
        }

        .btn-retry:hover,
        .btn-primary:hover {
          background: #2980b9;
        }

        .commandes-grid {
          display: grid;
          gap: 24px;
          grid-template-columns: repeat(auto-fill, minmax(800px, 1fr));
        }

        @media (max-width: 900px) {
          .commandes-grid {
            grid-template-columns: 1fr;
          }
        }

        .commande-card {
          background: white;
          border-radius: 12px;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.07);
          overflow: hidden;
          transition: transform 0.2s, box-shadow 0.2s;
          border: 1px solid #e1e8ed;
        }

        .commande-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(0, 0, 0, 0.12);
        }

        .commande-card-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          padding: 20px 20px 0;
          margin-bottom: 20px;
        }

        .commande-info h3 {
          margin: 0 0 5px 0;
          color: #2c3e50;
          font-size: 18px;
          font-weight: 600;
        }

        .commande-date {
          margin: 0;
          color: #7f8c8d;
          font-size: 14px;
        }

        .status-badge {
          padding: 6px 12px;
          border-radius: 20px;
          font-size: 12px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .status-paid {
          background: #d4edda;
          color: #155724;
        }

        .status-pending {
          background: #fff3cd;
          color: #856404;
        }

        .status-processing {
          background: #cce5ff;
          color: #0056b3;
        }

        .status-shipping {
          background: #e2e3e5;
          color: #495057;
        }

        .status-unknown {
          background: #f8f9fa;
          color: #6c757d;
        }

        .commande-card-body {
          padding: 0 20px;
        }

        .section-title {
          margin: 0 0 15px 0;
          color: #34495e;
          font-size: 16px;
          font-weight: 600;
        }

        .produits-list {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .produit-item {
          display: flex;
          align-items: center;
          gap: 15px;
          padding: 15px;
          background: #f8f9fa;
          border-radius: 8px;
          border-left: 4px solid #3498db;
        }

        .produit-visual {
          flex-shrink: 0;
          width: 60px;
          height: 60px;
          position: relative;
        }

        .produit-image {
          width: 100%;
          height: 100%;
          object-fit: cover;
          border-radius: 6px;
        }

        .produit-placeholder {
          width: 100%;
          height: 100%;
          background: #ecf0f1;
          border-radius: 6px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 24px;
        }

        .produit-details {
          flex: 1;
          min-width: 0;
        }

        .produit-nom {
          margin: 0 0 5px 0;
          color: #2c3e50;
          font-size: 16px;
          font-weight: 500;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .produit-quantity {
          margin: 0 0 8px 0;
          color: #7f8c8d;
          font-size: 14px;
          font-weight: 500;
        }

        .produit-description {
          margin: 0;
          color: #7f8c8d;
          font-size: 13px;
          line-height: 1.4;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .produit-pricing {
          text-align: right;
          flex-shrink: 0;
        }

        .prix-unitaire {
          font-size: 16px;
          font-weight: 600;
          color: #2c3e50;
          margin-bottom: 4px;
        }

        .sous-total {
          font-size: 14px;
          color: #7f8c8d;
        }

        .no-products {
          text-align: center;
          padding: 30px;
          color: #7f8c8d;
          background: #f8f9fa;
          border-radius: 8px;
          margin: 15px 0;
        }

        .commande-card-footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 20px;
          background: #f8f9fa;
          margin-top: 20px;
          flex-wrap: wrap;
          gap: 15px;
        }

        .total-section {
          display: flex;
          flex-direction: column;
          gap: 5px;
        }

        .total-amount {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .total-label {
          color: #7f8c8d;
          font-size: 14px;
        }

        .total-value {
          color: #2c3e50;
          font-size: 20px;
          font-weight: 700;
        }

        .montant-recorded {
          color: #95a5a6;
          font-size: 12px;
        }

        .btn-pay {
          background: #27ae60;
          color: white;
          border: none;
          padding: 12px 20px;
          border-radius: 8px;
          cursor: pointer;
          font-size: 14px;
          font-weight: 600;
          transition: background-color 0.2s;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .btn-pay:hover {
          background: #229954;
        }

        @media (max-width: 768px) {
          .commandes-container {
            padding: 15px;
          }
          
          .commandes-header {
            flex-direction: column;
            align-items: flex-start;
            gap: 15px;
          }

          .commande-card-header {
            flex-direction: column;
            align-items: flex-start;
            gap: 10px;
          }

          .produit-item {
            flex-direction: column;
            text-align: center;
          }

          .produit-details,
          .produit-pricing {
            width: 100%;
          }

          .commande-card-footer {
            flex-direction: column;
            align-items: stretch;
          }

          .btn-pay {
            justify-content: center;
          }
        }
      `}</style>
    </div>
  );
};

export default CommandePage;