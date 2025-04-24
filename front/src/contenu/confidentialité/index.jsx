import React, { useEffect } from "react";

import { useState } from "react";
import Accordion from "react-bootstrap/Accordion";
import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";


function Confidentialité(props) {

    return (
        <div className="p-6 max-w-4xl mx-auto text-gray-800">
      <h1 className="text-3xl font-bold mb-4">Politique de Confidentialité – Techshop</h1>

      <section className="mb-6">
        <h2 className="text-xl font-semibold">1. Introduction</h2>
        <p>Bienvenue sur Techshop. La confidentialité de vos données personnelles est une priorité pour nous. Cette politique de confidentialité vous informe sur la manière dont vos données sont collectées, utilisées et protégées lorsque vous utilisez notre application ou notre site web.</p>
      </section>

      <section className="mb-6">
        <h2 className="text-xl font-semibold">2. Données que nous collectons</h2>
        <ul className="list-disc list-inside">
          <li>Données personnelles : nom, prénom, adresse, e-mail, téléphone</li>
          <li>Informations de paiement via prestataire sécurisé</li>
          <li>Historique d’achats</li>
          <li>Données de navigation : IP, navigateur, pages visitées</li>
          <li>Avis et commentaires produits</li>
        </ul>
      </section>

      <section className="mb-6">
        <h2 className="text-xl font-semibold">3. Utilisation de vos données</h2>
        <ul className="list-disc list-inside">
          <li>Traitement des commandes et livraisons</li>
          <li>Gestion du compte utilisateur</li>
          <li>Communication sur votre commande</li>
          <li>Offres personnalisées (avec consentement)</li>
          <li>Amélioration continue de l'expérience</li>
          <li>Sécurité et lutte contre la fraude</li>
        </ul>
      </section>

      <section className="mb-6">
        <h2 className="text-xl font-semibold">4. Partage de vos données</h2>
        <p>Vos données peuvent être partagées avec nos prestataires de services ou les autorités compétentes dans le respect de la loi. Nous ne vendons jamais vos données personnelles.</p>
      </section>

      <section className="mb-6">
        <h2 className="text-xl font-semibold">5. Conservation des données</h2>
        <p>Les données sont conservées aussi longtemps que nécessaire pour les finalités prévues, puis supprimées ou archivées en toute sécurité.</p>
      </section>

      <section className="mb-6">
        <h2 className="text-xl font-semibold">6. Vos droits</h2>
        <p>Conformément au RGPD, vous avez le droit d'accéder, rectifier, supprimer, limiter ou transférer vos données. Contact : <a href="mailto:contact@techshop.fr" className="text-blue-600">contact@techshop.fr</a></p>
      </section>

      <section className="mb-6">
        <h2 className="text-xl font-semibold">7. Sécurité</h2>
        <p>Nous utilisons des protocoles de sécurité avancés pour protéger vos données : chiffrement, hébergement sécurisé, accès restreint, etc.</p>
      </section>

      <section className="mb-6">
        <h2 className="text-xl font-semibold">8. Cookies</h2>
        <p>Techshop utilise des cookies pour améliorer votre navigation et personnaliser les contenus. Vous pouvez gérer vos préférences dans votre navigateur.</p>
      </section>

      <section className="mb-6">
        <h2 className="text-xl font-semibold">9. Modifications</h2>
        <p>Cette politique peut être modifiée à tout moment. Vous serez informé en cas de changements importants.</p>
      </section>
    </div>
    )

}

export default Confidentialité;