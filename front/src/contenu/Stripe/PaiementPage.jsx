import { useLocation } from "react-router-dom";
import StripeContainer from "./StripeContainer";
import "./PaiementPage.css";

export default function PaiementPage() {
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const commande_id = params.get("commande_id");
  const amount = parseFloat(params.get("amount"));

  return (
    <div className="paiement-container">
      <div className="card paiement-card">
        <div className="card-header">
          <h4>Paiement de votre commande</h4>
        </div>
        <div className="card-body">
          <div className="resume-commande mb-4">
            <h5>Résumé de la commande</h5>
            <ul>
              <li>
                <span className="resume-label">Numéro de commande :</span>
                <span className="resume-value">#{commande_id}</span>
              </li>
              <li>
                <span className="resume-label">Montant à payer :</span>
                <span className="resume-value">{amount.toFixed(2)} €</span>
              </li>
            </ul>
            <div className="alert alert-info mt-3">
              Merci de vérifier le montant avant de procéder au paiement.<br />
              Le paiement est 100% sécurisé via Stripe.
            </div>
          </div>
          <div className="stripe-section">
            <StripeContainer amount={amount} commande_id={commande_id} />
          </div>
        </div>
      </div>
    </div>
  );
}