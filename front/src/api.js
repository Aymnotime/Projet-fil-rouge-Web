import axios from 'axios';

// Configuration globale pour axios
axios.defaults.withCredentials = true; // Envoyer les cookies avec toutes les requêtes

const api = {
  register(nom, prenom, email, password, confirm) {
    return axios.post('/api/register', { nom, prenom, email, password, confirm });
  },

  login(email, password, requireAdmin = false) {
    return axios.post('/api/login', { email, password, requireAdmin });
  },

  logout() {
    return axios.get('/api/logout');
  },

  getUser() {
    return axios.get('/api/user');
  },

  // Vérifier si l'utilisateur actuel est admin
  checkAdmin() {
    return axios.post('/api/check-admin');
  },

  updateUser(nom, prenom, email) {
    return axios.post('/api/user', { nom, prenom, email });
  },

  updatePassword(oldPassword, password, confirm) {
    return axios.post('/api/password', { oldPassword, password, confirm });
  },

  getCommandes() {
    return axios.get('/api/commandes');
  },

  newCommande(produits) {
    return axios.post('/api/commande', { produits });
  },

  getEquipes() {
    return axios.get('/api/equipes');
  },

  getProduits() {
    return axios.get('/api/produits');
  },

  getProduitById(id) {
    return axios.get(`/api/produits/${id}`);
  },

  getArticles() {
    return axios.get('/api/articles/');
  },

  deleteProduit(id) {
    return axios.delete('/api/produits/' + id);
  },

  postProduit(titre, contenu) {
    return axios.post('/api/produits', { titre, contenu });
  },

  getAdminCommandes: () => axios.get("/api/admin/commandes"),
  getAdminUtilisateurs: () => axios.get("/api/admin/utilisateurs"),
  getAdminCommandesByUser: (id) => axios.get(`/api/admin/commandes/${id}`),
  getAdminProduits: () => axios.get("/api/admin/produits"),

  deleteUser: (id) => axios.delete(`/api/admin/utilisateurs/${id}`),
  deleteCommande: (id) => axios.delete(`/api/admin/commandes/${id}`),
  deleteProduit: (id) => axios.delete(`/api/admin/produits/${id}`),

  // Nouvelle fonction pour mettre à jour le statut d'une commande
  updateCommandeStatut: (commandeId, nouveauStatut) => axios.put(
    `/api/admin/commandes/${commandeId}/statut`, 
    { statutPaiement: nouveauStatut }
  ),

  // Méthode modifiée pour envoyer des données JSON standard (non multipart)
  addProduit: (productData) => {
    console.log("Envoi de données produit:", productData);
    return axios.post(
      `/api/admin/produits`, 
      productData, 
      {
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );
  },

  // Méthode alternative pour l'ajout de produit avec des paramètres explicites
  // Mise à jour pour inclure la quantité
  addProduitWithImageUrl: (nom, prix, description, imageUrl, quantite = 0) => axios.post(
    `/api/admin/produits/with-image`,
    { nom, prix, description, imageUrl, quantite },
    { 
      headers: {
        'Content-Type': 'application/json'
      }
    }
  ),
  
  // Pour les uploads de fichiers réels (si besoin à l'avenir)
  uploadProduitWithFile: (formData) => axios.post(
    `/api/admin/produits/upload`, 
    formData, 
    {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    }
  ),

  // Fonctions du panier d'achat
  addToCart: (produitId, quantite) => axios.post(
    '/api/panier/ajouter',
    { produitId, quantite }
  ),

  getCart: () => axios.get('/api/panier'),

  updateCartItem: (produitId, quantite) => axios.put(
    '/api/panier/modifier',
    { produitId, quantite }
  ),

  removeFromCart: (produitId) => axios.delete(
    `/api/panier/supprimer/${produitId}`
  ),

  clearCart: () => axios.delete('/api/panier/vider'),

  // Fonctions de paiement et commandes
  processPayment: (paymentData) => axios.post(
    '/api/paiement',
    paymentData
  ),

  getCommandeDetails: (commandeId) => axios.get(
    `/api/commandes/${commandeId}`
  ),

  // Fonctions utilisateur
  getUserOrders: () => axios.get('/api/user/commandes'),

  getUserProfile: () => axios.get('/api/user/profile'),

  updateUserProfile: (userData) => axios.put(
    '/api/user/profile',
    userData
  )
};

export default api;