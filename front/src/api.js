import axios from 'axios';

// Configuration de l'instance axios
const axiosInstance = axios.create({
  baseURL: 'http://localhost:3001/api',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Intercepteur pour gérer les erreurs
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('Erreur API:', error);
    return Promise.reject(error);
  }
);

const api = {
  // Auth
  login: (credentials) => axiosInstance.post('/login', credentials),
  register: (userData) => axiosInstance.post('/register', userData),
  logout: () => axiosInstance.get('/logout'),
  getUser: () => axiosInstance.get('/user'),
  updateUser: (userData) => axiosInstance.post('/user', userData),
  updatePassword: (passwordData) => axiosInstance.post('/password', passwordData),
  
  // Produits
  getProducts: () => axiosInstance.get('/produits'),
  getProduits: () => axiosInstance.get('/produits'),
  addProduct: (productData) => axiosInstance.post('/produits', productData),
  deleteProduct: (id) => axiosInstance.delete(`/produits/${id}`),
  
  // Catégories
  getCategories: () => axiosInstance.get('/categories'),
  getAdminCategories: () => axiosInstance.get('/admin/categories'),
  addCategory: (categoryData) => axiosInstance.post('/admin/categories', categoryData),
  updateCategory: (id, categoryData) => axiosInstance.put(`/admin/categories/${id}`, categoryData),
  deleteCategory: (id) => axiosInstance.delete(`/admin/categories/${id}`),
  
  // Commandes
  createOrder: (orderData) => axiosInstance.post('/commande', orderData),
  newCommande: (orderData) => axiosInstance.post('/commande', orderData),
  getOrders: () => axiosInstance.get('/commandes'),
  getCommandes: () => axiosInstance.get('/commandes'),
  

  // Admin
  checkAdmin: () => axiosInstance.post('/check-admin'),
  getAdminUsers: () => axiosInstance.get('/admin/utilisateurs'),
  getAdminUtilisateurs: () => axiosInstance.get('/admin/utilisateurs'),
  getAdminCommandes: () => axiosInstance.get('/admin/commandes'),
  getAdminProducts: () => axiosInstance.get('/admin/produits'),
  getAdminProduits: () => axiosInstance.get('/admin/produits'),
  addAdminProduct: (productData) => axiosInstance.post('/admin/produits', productData),
  deleteAdminProduct: (id) => axiosInstance.delete(`/admin/produits/${id}`),
  deleteAdminUser: (id) => axiosInstance.delete(`/admin/utilisateurs/${id}`),
  deleteAdminCommande: (id) => axiosInstance.delete(`/admin/commandes/${id}`),
  updateCommandeStatus: (id, statusData) => axiosInstance.put(`/admin/commandes/${id}/statut`, statusData),
  updateCommandeStatut: (id, newStatut) => axiosInstance.put(`/admin/commandes/${id}/statut`, { statutPaiement: newStatut }),
  
  // Statistiques
  getVentesParJour: () => axiosInstance.get('/admin/stats/ventes-par-jour'),
  getPanierMoyen: () => axiosInstance.get('/admin/stats/panier-moyen'),
  getVentesParCategorie: () => axiosInstance.get('/admin/stats/ventes-par-categorie'),
  getStatistiquesGenerales: () => axiosInstance.get('/admin/stats/generales'),
  
  // Admin commandes par utilisateur
  getAdminCommandesByUser: (userId) => axiosInstance.get(`/admin/commandes/${userId}`),
  
  // Debug
  debugCommandes: () => axiosInstance.get('/admin/debug/commandes'),
  
  // Paiements
  createPaymentIntent: (paymentData) => axiosInstance.post('/create-payment-intent', paymentData),
  updatePaymentStatus: (statusData) => axiosInstance.post('/update-payment-status', statusData),
  
  // Autres
  getEquipes: () => axiosInstance.get('/equipes'),
  getArticles: () => axiosInstance.get('/articles'),
  getAnnonces: () => axiosInstance.get('/annonces'),
  
  // Gestion compte utilisateur
  downloadUserData: () => axiosInstance.get('/user/pdf', { responseType: 'blob' }),
  deleteUserAccount: () => axiosInstance.delete('/user/delete'),
  
  // Mot de passe oublié
  forgotPassword: (email) => axiosInstance.post('/forgot-password', { email }),
  resetPassword: (resetData) => axiosInstance.post('/reset-password', resetData),
  verifyResetToken: (token) => axiosInstance.get(`/verify-reset-token/${token}`),
  
  // Tests
  testApi: () => axiosInstance.get('/test'),
  testDb: () => axiosInstance.get('/test/db'),
  testProducts: () => axiosInstance.get('/test/produits'),
};

export default api;