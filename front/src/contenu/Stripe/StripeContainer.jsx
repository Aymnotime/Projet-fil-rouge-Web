import React from "react";
import { useState, useEffect } from "react";
import api from "../../api";
import { loadStripe } from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";
import CheckoutForm from "./CheckoutForm";

const PUBLICK_KEY = "pk_test_51RYMZeFRMHKEhCilAjCr5LlXKdlKyO11Gh4Q14y2oez4qk5Zqs4taQRBZIH2kR3MdAByFV1gdLMlQak2Gblk1CZ700slcMjQWp";
const stripePromise = loadStripe(PUBLICK_KEY);

const StripeContainer = (props) => {
  const [clientSecret, setClientSecret] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Récupérez le montant, commande_id et callback depuis les props
  const amount = props.amount || 20;
  const commande_id = props.commande_id || null;
  const onSuccess = props.onSuccess || (() => {});

  useEffect(() => {
    console.log('🔄 Création du Payment Intent pour:', amount, '€, commande:', commande_id);
    
    // Un seul appel API ici dans StripeContainer
    api.createPaymentIntent(amount, commande_id)
      .then((response) => {
        console.log('📦 Réponse API complète:', response);
        console.log('📦 Data de la réponse:', response.data);
        
        if (response.data && response.data.clientSecret) {
          setClientSecret(response.data.clientSecret);
          console.log('✅ Client Secret reçu:', response.data.clientSecret);
        } else {
          console.error("❌ Client secret manquant dans la réponse");
          setError("Client secret manquant dans la réponse");
        }
      })
      .catch((error) => {
        console.error("❌ Erreur lors de la création du Payment Intent:", error);
        setError("Erreur lors de la création du Payment Intent: " + error.message);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [amount, commande_id]);

  // Vérifiez le format du clientSecret
  if (clientSecret && !clientSecret.includes('_secret_')) {
    console.error('❌ Format du clientSecret invalide:', clientSecret);
  }

  // Affichage conditionnel
  if (loading) {
    return (
      <div className="text-center p-4">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <p className="mt-2">🔄 Initialisation du paiement...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="alert alert-danger" role="alert">
        <i className="bi bi-exclamation-triangle-fill me-2"></i>
        ❌ Erreur: {error}
      </div>
    );
  }

  if (!clientSecret) {
    return (
      <div className="alert alert-warning" role="alert">
        <i className="bi bi-exclamation-triangle me-2"></i>
        ❌ Impossible d'initialiser le paiement
      </div>
    );
  }

  return (
    <Elements stripe={stripePromise} options={{ clientSecret }}>
      <CheckoutForm 
        amount={amount} 
        commande_id={commande_id}
        clientSecret={clientSecret}
        onSuccess={onSuccess} // Passer le callback au CheckoutForm
        email={props.email}
      />
    </Elements>
  );
};

export default StripeContainer;