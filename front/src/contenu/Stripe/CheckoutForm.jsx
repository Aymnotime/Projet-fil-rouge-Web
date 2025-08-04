import React, { useState } from "react";
import { useElements, useStripe, CardElement } from "@stripe/react-stripe-js";
import axios from "axios";

export default function CheckoutForm({ amount, commande_id = null, clientSecret, onSuccess, email }) {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  // Options pour personnaliser l'apparence du CardElement
  const cardElementOptions = {
    style: {
      base: {
        fontSize: '16px',
        color: '#424770',
        '::placeholder': {
          color: '#aab7c4',
        },
        fontFamily: '"Helvetica Neue", Helvetica, sans-serif',
        fontSmoothing: 'antialiased',
      },
      invalid: {
        color: '#9e2146',
      },
    },
    hidePostalCode: false,
  };

  console.log('💳 CheckoutForm reçu:', { amount, commande_id, clientSecret });

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError("");

    // Vérifications essentielles
    if (!stripe) {
      setError("Stripe n'est pas encore chargé");
      setLoading(false);
      return;
    }

    if (!elements) {
      setError("Elements Stripe non disponibles");
      setLoading(false);
      return;
    }

    if (!clientSecret) {
      setError("Secret client non disponible");
      setLoading(false);
      return;
    }

    const cardElement = elements.getElement(CardElement);

    if (!cardElement) {
      setError("Élément de carte non trouvé");
      setLoading(false);
      return;
    }

    // Vérifier si la carte est complète avant de soumettre
    const { error: cardError } = await stripe.createPaymentMethod({
      type: 'card',
      card: cardElement,
    });

    if (cardError) {
      setError(cardError.message);
      setLoading(false);
      return;
    }

    // Confirmer le paiement
    const { error: stripeError, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
      payment_method: {
        card: cardElement,
        billing_details: {
          name: "Client test",
          email: email || "test@example.com",
        },
      },
    });

    if (stripeError) {
      console.error("Erreur Stripe :", stripeError.message);
      setError(stripeError.message);
    } else if (paymentIntent.status === "succeeded") {
      setSuccess(true);
      console.log("Paiement réussi :", paymentIntent.id);
      console.log("Pour la commande :", commande_id);
      
      // Mettre à jour le statut du paiement en base
      try {
        await axios.post("http://localhost:3001/api/update-payment-status", {
          payment_intent_id: paymentIntent.id,
          statut: "succeeded",
          commande_id: commande_id
        });
        console.log("✅ Statut mis à jour en base");
        
        // Appeler le callback de succès si fourni
        if (onSuccess) {
          onSuccess(paymentIntent, commande_id);
        }
      } catch (updateError) {
        console.error("❌ Erreur mise à jour statut:", updateError);
      }
    }

    setLoading(false);
  };

  if (success) {
    return (
      <div className="success-container">
        <div className="text-center p-4">
          <div className="success-icon">
            <i className="bi bi-check-circle-fill text-success" style={{ fontSize: '4rem' }}></i>
          </div>
          <h2 className="text-success mt-3 mb-3">Paiement réussi !</h2>
          <p className="text-muted mb-2">
            Votre paiement de <strong>{amount}€</strong> a été traité avec succès.
          </p>
          {commande_id && (
            <p className="text-muted mb-4">
              <small>Commande N°: <strong>{commande_id}</strong></small>
            </p>
          )}
          <div className="alert alert-success" role="alert">
            <i className="bi bi-info-circle me-2"></i>
            Vous allez être redirigé vers vos commandes dans quelques secondes...
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="payment-form">
      <div className="mb-4">
        <h5 className="mb-3">
          <i className="bi bi-credit-card me-2"></i>
          Paiement de {amount}€
        </h5>
        {commande_id && (
          <p className="text-muted mb-3">
            <small>Commande N°: <strong>{commande_id}</strong></small>
          </p>
        )}
      </div>

      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <label className="form-label fw-bold">
            <i className="bi bi-credit-card-2-front me-2"></i>
            Informations de carte
          </label>
          <div className="card-element-container p-3 border rounded">
            <CardElement options={{cardElementOptions, hidePostalCode:true}} />
          </div>
          <small className="form-text text-muted mt-2">
            <i className="bi bi-info-circle me-1"></i>
            Utilisez <strong>4242 4242 4242 4242</strong> pour tester le paiement
          </small>
        </div>

        {error && (
          <div className="alert alert-danger" role="alert">
            <i className="bi bi-exclamation-triangle-fill me-2"></i>
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={!stripe || loading || !clientSecret}
          className={`btn btn-lg w-100 ${
            !stripe || loading || !clientSecret
              ? 'btn-secondary'
              : 'btn-success'
          }`}
        >
          {loading ? (
            <>
              <span className="spinner-border spinner-border-sm me-2" role="status"></span>
              Traitement en cours...
            </>
          ) : (
            <>
              <i className="bi bi-shield-check me-2"></i>
              Payer {amount}€
            </>
          )}
        </button>

        {(!stripe || !clientSecret) && (
          <div className="text-center mt-3">
            <small className="text-muted">
              <span className="spinner-border spinner-border-sm me-2"></span>
              Chargement de Stripe...
            </small>
          </div>
        )}
      </form>
    </div>
  );
}