# CynaShop App 

**Réalisé par Aymen Atif**

## Structure du projet

- `lib/main.dart` : Point d'entrée, initialisation Stripe, Provider, deep links
- `lib/route/` : Gestion des routes et navigation
- `lib/theme/` : Thèmes et service de gestion du mode sombre/clair
- `lib/services/` : Services réseau et autres utilitaires
- `lib/screens/` : Écrans principaux de l'application

## Deep Links

L'application gère les liens de type :
- `cynashop://reset-password/<token>` 
- `https://.../reset-password/<token>`

## Paiement Stripe

La clé publique Stripe doit être configurée dans le code. Les paiements sont gérés via le package `flutter_stripe`.

## Licence

**Tous droits réservés.**  
Aucune utilisation, copie ou distribution de ce code n'est autorisée sans paiement et accord explicite de l'auteur.
