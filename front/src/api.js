import axios from 'axios';

const paymentsApi = axios.create({
  baseURL: 'http://localhost:3000'
});

const api = {
  register(nom, prenom, email, password, confirm) {
    return axios.post('/api/register', { nom, prenom, email, password, confirm });
  },

  login(email, password) {
    return axios.post('/api/login', { email, password });
  },

  logout() {
    return axios.get('/api/logout');
  },

  getUser() {
    return axios.get('/api/user');
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

  getArticles() {
    return axios.get('/api/articles/');
  },

  deleteProduit(id) {
    return axios.delete('/api/produits/' + id);
  },

  postProduit(titre, contenu) {
    return axios.post('/api/produits', { titre, contenu });
  },

  createPaymentIntent(amount, commande_id = null) {
    console.log('📤 Envoi de la requête API avec montant:', amount, 'et commande_id:', commande_id);
    return paymentsApi.post('/api/create-payment-intent', { amount, commande_id });
  },

  updatePaymentStatus(payment_intent_id, statut) {
    return paymentsApi.post('/api/update-payment-status', { 
      payment_intent_id, 
      statut 
    });
  }
};

export default api;
