import React, { useEffect, useState, useRef } from 'react';
import api from '../api';

// Fonction pour vérifier si une URL d'image est valide
const isValidImageUrl = (url) => {
  if (!url || typeof url !== 'string') return false;
  
  // Vérifier si c'est une URL basique
  try {
    new URL(url);
    // Vérifier les extensions d'image courantes
    const extensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg'];
    return extensions.some(ext => url.toLowerCase().endsWith(ext)) || 
          url.includes('placeholder.com') ||
          url.includes('picsum.photos');
  } catch (e) {
    return false;
  }
};

const AdminDashboard = () => {
  const [utilisateurs, setUtilisateurs] = useState([]);
  const [commandes, setCommandes] = useState([]);
  const [produits, setProduits] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showProduits, setShowProduits] = useState(false);
  const [error, setError] = useState("");
  const [statusUpdating, setStatusUpdating] = useState(null);
  const [showAddProductForm, setShowAddProductForm] = useState(false);
  const [newProduct, setNewProduct] = useState({ nom: "", prix: "", description: "", quantite: "0",  image: "", categorie_id: ""});
  const [produitsMap, setProduitsMap] = useState({});
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [productSearchTerm, setProductSearchTerm] = useState("");
  const [categories, setCategories] = useState([]);
  const [categoryFilter, setCategoryFilter] = useState("");
  const [showCategories, setShowCategories] = useState(false);
  const [showAddCategoryForm, setShowAddCategoryForm] = useState(false);
  const [newCategory, setNewCategory] = useState({ nom: "", description: "" });
  const [editingCategory, setEditingCategory] = useState(null);
  const [showStats, setShowStats] = useState(false);

  const [statsData, setStatsData] = useState({
  ventesParJour: [],
  panierMoyen: [],
  ventesParCategorie: [],
  statistiquesGenerales: {}
});
const [statsLoading, setStatsLoading] = useState(false);

const resetForm = () => {
  setNewProduct({ 
    nom: "", 
    prix: "", 
    description: "", 
    image: "",
    quantite: "0",
    categorie_id: "" // ← Vérifier que cette ligne existe
  });
  setError("");
};
  
  useEffect(() => {
    api.getAdminUtilisateurs()
      .then(res => {
        if (res.data.success) setUtilisateurs(res.data.utilisateurs);
        else setError(res.data.message || "Erreur lors du chargement des utilisateurs");
      })
      .catch(() => setError("Erreur d'accès à l'API utilisateurs"));

    // Charger tous les produits pour avoir accès aux images dans les commandes
    api.getAdminProduits()
      .then(res => {
        if (res.data.success) {
          setProduits(res.data.produits);
          // Créer un map des produits par ID pour un accès facile
          const map = {};
          res.data.produits.forEach(prod => {
            map[prod.id] = prod;
          });
          setProduitsMap(map);
          console.log("Produits chargés:", res.data.produits.length, "Map créé:", Object.keys(map).length);
        }
      })
      .catch((err) => {
        console.error("Erreur chargement produits:", err);
        setError("Erreur d'accès à l'API produits");
      });

    // Charger les catégories
    api.getAdminCategories()
      .then(res => {
        if (res.data.success) {
          setCategories(res.data.categories);
          console.log("Catégories chargées:", res.data.categories.length);
        }
      })
      .catch((err) => {
        console.error("Erreur chargement catégories:", err);
        // Ne pas afficher d'erreur car les catégories ne sont pas encore implémentées côté serveur
      });
  }, []);

  // Filtrer les utilisateurs en fonction du terme de recherche
  const filteredUsers = utilisateurs.filter(user => {
    if (!searchTerm.trim()) return true;
    
    const searchLower = searchTerm.toLowerCase();
    const nameMatch = user.nom && user.nom.toLowerCase().includes(searchLower);
    const emailMatch = user.email && user.email.toLowerCase().includes(searchLower);
    
    return nameMatch || emailMatch;
  });

const filteredProducts = produits.filter(product => {
  // Filtre par nom de produit
  const nameMatch = !productSearchTerm.trim() || 
    (product.nom && product.nom.toLowerCase().includes(productSearchTerm.toLowerCase()));
  
  // Filtre par catégorie
  const categoryMatch = !categoryFilter || 
    String(product.categorie_id) === String(categoryFilter);
  
  return nameMatch && categoryMatch;
});

    // Fonction pour obtenir le nom d'un utilisateur par son ID
  const getUserNameById = (userId) => {
    const user = utilisateurs.find(u => u.id === userId);
    return user ? user.nom : `Utilisateur ${userId}`;
  };

  const handleShowCommandes = (userId) => {
    if (selectedUser === userId) {
      setSelectedUser(null);
      setCommandes([]);
      return;
    }
    
    setSelectedUser(userId);
    
    // S'assurer que les produits sont chargés avant de charger les commandes
    let produitsPromise = Promise.resolve();
    if (Object.keys(produitsMap).length === 0) {
      console.log("Chargement préalable des produits nécessaire");
      produitsPromise = api.getAdminProduits()
        .then(res => {
          if (res.data.success) {
            setProduits(res.data.produits);
            // Créer un map des produits par ID pour un accès facile
            const map = {};
            res.data.produits.forEach(prod => {
              map[prod.id] = prod;
            });
            setProduitsMap(map);
            console.log("Produits chargés avant commandes:", res.data.produits.length);
          }
        })
        .catch(err => {
          console.error("Erreur chargement produits:", err);
        });
    }
    
    // Ensuite charger les commandes
    produitsPromise.then(() => {
      api.getAdminCommandesByUser(userId)
        .then(res => {
          if (res.data.success) {
            console.log("Commandes chargées:", res.data.commandes.length);
            
            // Analyser les données de commande pour extraire les quantités
            const commandesProcessed = res.data.commandes.map(cmd => {
              console.log(`Traitement commande ${cmd.id}, produits:`, cmd.produits);
              
              // Essayer de parser les produits si au format JSON
              try {
                // Tenter de parser en JSON si c'est une chaîne qui ressemble à un objet JSON
                if (typeof cmd.produits === 'string' && (cmd.produits.trim().startsWith('{') || cmd.produits.trim().startsWith('['))) {
                  try {
                    const produitsObj = JSON.parse(cmd.produits);
                    console.log(`Commande ${cmd.id} - JSON parsé:`, produitsObj);
                    cmd.produitsDetails = produitsObj;
                  } catch (e) {
                    console.error(`Erreur parsing JSON commande ${cmd.id}:`, e);
                  }
                }
                // Format id:qty
                else if (typeof cmd.produits === 'string' && cmd.produits.includes(':')) {
                  const produitsObj = {};
                  cmd.produits.split(',').forEach(item => {
                    const [id, qty] = item.split(':');
                    produitsObj[id.trim()] = parseInt(qty, 10) || 1;
                  });
                  cmd.produitsDetails = produitsObj;
                  console.log(`Commande ${cmd.id} - format id:qty détecté:`, produitsObj);
                }
              } catch (e) {
                console.error(`Erreur traitement commande ${cmd.id}:`, e);
              }
              return cmd;
            });
            setCommandes(commandesProcessed);
          }
          else setError(res.data.message || "Erreur lors du chargement des commandes");
        })
        .catch((err) => {
          console.error("Erreur chargement commandes:", err);
          setError("Erreur d'accès à l'API commandes");
        });
    });
  };

  const handleToggleProduits = () => {
    if (!showProduits) {
      api.getAdminProduits()
        .then(res => {
          if (res.data.success) {
            setProduits(res.data.produits);
            // Mettre à jour le map des produits
            const map = {};
            res.data.produits.forEach(prod => {
              map[prod.id] = prod;
            });
            setProduitsMap(map);
          } else {
            setError(res.data.message || "Erreur lors du chargement des produits");
          }
        })
        .catch(() => setError("Erreur d'accès à l'API produits"));
    }
    setShowProduits(!showProduits);
  };

  // Fonctions de gestion des catégories
  const handleToggleCategories = () => {
    if (!showCategories) {
      api.getAdminCategories()
        .then(res => {
          if (res.data.success) {
            setCategories(res.data.categories);
          }
        })
        .catch(err => console.error("Erreur chargement catégories:", err));
    }
    setShowCategories(!showCategories);
  };

  const handleShowAddCategoryForm = () => {
    if (showAddCategoryForm) {
      resetCategoryForm();
    }
    setShowAddCategoryForm(!showAddCategoryForm);
  };

  const resetCategoryForm = () => {
    setNewCategory({ nom: "", description: "" });
    setEditingCategory(null);
    setError("");
  };

  const handleCategoryInputChange = (e) => {
    const { name, value } = e.target;
    setNewCategory({
      ...newCategory,
      [name]: value
    });
  };

  const handleAddCategory = (e) => {
    e.preventDefault();
    
    if (!newCategory.nom.trim()) {
      setError("Le nom de la catégorie est requis");
      return;
    }

    setError("");
    setIsSubmitting(true);
    
    const categoryData = {
      nom: newCategory.nom.trim(),
      description: newCategory.description.trim() || ""
    };

    api.addCategory(categoryData)
      .then(res => {
        if (res.data && res.data.success) {
          setCategories([...categories, res.data.category]);
          setError(`✅ Catégorie "${res.data.category.nom}" ajoutée avec succès!`);
          setTimeout(() => setError(""), 3000);
          resetCategoryForm();
          setShowAddCategoryForm(false);
        } else {
          setError(`❌ ${res.data?.message || "Erreur lors de l'ajout de la catégorie"}`);
        }
      })
      .catch(err => {
        console.error("Erreur lors de l'ajout de la catégorie:", err);
        if (err.response) {
          setError(`❌ Erreur ${err.response.status}: ${err.response.data?.message || "Problème lors de l'ajout"}`);
        } else {
          setError("❌ Erreur de connexion");
        }
      })
      .finally(() => {
        setIsSubmitting(false);
      });
  };

  const handleEditCategory = (category) => {
    setEditingCategory(category);
    setNewCategory({ nom: category.nom, description: category.description || "" });
    setShowAddCategoryForm(true);
  };

  const handleUpdateCategory = (e) => {
    e.preventDefault();
    
    if (!newCategory.nom.trim()) {
      setError("Le nom de la catégorie est requis");
      return;
    }

    setError("");
    setIsSubmitting(true);
    
    const categoryData = {
      nom: newCategory.nom.trim(),
      description: newCategory.description.trim() || ""
    };

    api.updateCategory(editingCategory.id, categoryData)
      .then(res => {
        if (res.data && res.data.success) {
          setCategories(categories.map(cat => 
            cat.id === editingCategory.id ? res.data.category : cat
          ));
          setError(`✅ Catégorie "${res.data.category.nom}" modifiée avec succès!`);
          setTimeout(() => setError(""), 3000);
          resetCategoryForm();
          setShowAddCategoryForm(false);
        } else {
          setError(`❌ ${res.data?.message || "Erreur lors de la modification"}`);
        }
      })
      .catch(err => {
        console.error("Erreur lors de la modification:", err);
        if (err.response) {
          setError(`❌ Erreur ${err.response.status}: ${err.response.data?.message || "Problème lors de la modification"}`);
        } else {
          setError("❌ Erreur de connexion");
        }
      })
      .finally(() => {
        setIsSubmitting(false);
      });
  };

  const handleDeleteCategory = (category) => {
    if (window.confirm(`Supprimer la catégorie "${category.nom}" ?\n\nAttention : Cette action est irréversible.`)) {
      api.deleteCategory(category.id)
        .then(res => {
          if (res.data && res.data.success) {
            setCategories(categories.filter(cat => cat.id !== category.id));
            setError(`✅ Catégorie "${category.nom}" supprimée avec succès!`);
            setTimeout(() => setError(""), 3000);
          } else {
            setError(`❌ ${res.data?.message || "Erreur lors de la suppression"}`);
          }
        })
        .catch(err => {
          console.error("Erreur lors de la suppression:", err);
          if (err.response) {
            setError(`❌ Erreur ${err.response.status}: ${err.response.data?.message || "Impossible de supprimer"}`);
          } else {
            setError("❌ Erreur de connexion");
          }
        });
    }
  };

const loadStatistics = async () => {
  setStatsLoading(true);
  try {
    const [ventesParJour, panierMoyen, ventesParCategorie, statistiquesGenerales] = await Promise.all([
      api.getVentesParJour(),
      api.getPanierMoyen(),
      api.getVentesParCategorie(),
      api.getStatistiquesGenerales()
    ]);

    setStatsData({
      ventesParJour: ventesParJour.data.data || [],
      panierMoyen: panierMoyen.data.data || [],
      ventesParCategorie: ventesParCategorie.data.data || [],
      statistiquesGenerales: statistiquesGenerales.data.data || {}
    });
  } catch (error) {
    console.error("Erreur chargement statistiques:", error);
    setError("Erreur lors du chargement des statistiques");
  } finally {
    setStatsLoading(false);
  }
};

// Fonction pour afficher/masquer les statistiques
const handleToggleStats = () => {
  if (!showStats) {
    loadStatistics();
  }
  setShowStats(!showStats);
};

// Fonction pour formater les montants
const formatCurrency = (amount) => {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR'
  }).format(amount || 0);
};

// Fonction pour formater les dates
const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString('fr-FR');
};

// Composant pour les barres de l'histogramme
const BarChart = ({ data, valueKey, labelKey, title, color = "#007bff" }) => {
  if (!data || data.length === 0) {
    return (
      <div style={{ textAlign: "center", padding: "40px", color: "#666" }}>
        <p>Aucune donnée disponible pour {title}</p>
      </div>
    );
  }

  const maxValue = Math.max(...data.map(item => parseFloat(item[valueKey]) || 0));
  
  return (
    <div style={{ padding: "20px" }}>
      <h4 style={{ textAlign: "center", marginBottom: "20px", color: "#495057" }}>{title}</h4>
      <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
        {data.slice(0, 10).map((item, index) => {
          const value = parseFloat(item[valueKey]) || 0;
          const percentage = maxValue > 0 ? (value / maxValue) * 100 : 0;
          
          return (
            <div key={index} style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <div style={{ 
                minWidth: "80px", 
                fontSize: "12px", 
                textAlign: "right",
                color: "#6c757d"
              }}>
                {labelKey === 'date_vente' || labelKey === 'date_commande' 
                  ? formatDate(item[labelKey]) 
                  : item[labelKey]}
              </div>
              <div style={{ 
                flex: 1, 
                height: "25px", 
                backgroundColor: "#f8f9fa",
                borderRadius: "3px",
                position: "relative",
                overflow: "hidden"
              }}>
                <div style={{
                  width: `${percentage}%`,
                  height: "100%",
                  backgroundColor: color,
                  borderRadius: "3px",
                  transition: "width 0.5s ease"
                }}></div>
              </div>
              <div style={{ 
                minWidth: "80px", 
                fontSize: "12px", 
                fontWeight: "bold",
                color: "#495057"
              }}>
                {valueKey.includes('chiffre') || valueKey.includes('panier') 
                  ? formatCurrency(value)
                  : Math.round(value)}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// Composant pour le camembert
const PieChart = ({ data, valueKey, labelKey, title }) => {
  if (!data || data.length === 0) {
    return (
      <div style={{ textAlign: "center", padding: "40px", color: "#666" }}>
        <p>Aucune donnée disponible pour {title}</p>
      </div>
    );
  }

  const total = data.reduce((sum, item) => sum + (parseFloat(item[valueKey]) || 0), 0);
  const colors = ["#007bff", "#28a745", "#ffc107", "#dc3545", "#6f42c1", "#20c997", "#fd7e14", "#e83e8c"];
  
  let currentAngle = 0;
  const center = 100;
  const radius = 80;

  return (
    <div style={{ padding: "20px" }}>
      <h4 style={{ textAlign: "center", marginBottom: "20px", color: "#495057" }}>{title}</h4>
      <div style={{ display: "flex", alignItems: "center", gap: "30px", justifyContent: "center" }}>
        <svg width="200" height="200" style={{ flexShrink: 0 }}>
          {data.map((item, index) => {
            const value = parseFloat(item[valueKey]) || 0;
            const angle = (value / total) * 360;
            const startAngle = (currentAngle * Math.PI) / 180;
            const endAngle = ((currentAngle + angle) * Math.PI) / 180;
            
            const x1 = center + radius * Math.cos(startAngle);
            const y1 = center + radius * Math.sin(startAngle);
            const x2 = center + radius * Math.cos(endAngle);
            const y2 = center + radius * Math.sin(endAngle);
            
            const largeArcFlag = angle > 180 ? 1 : 0;
            
            const pathData = [
              `M ${center} ${center}`,
              `L ${x1} ${y1}`,
              `A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2}`,
              'Z'
            ].join(' ');
            
            currentAngle += angle;
            
            return (
              <path
                key={index}
                d={pathData}
                fill={colors[index % colors.length]}
                stroke="#fff"
                strokeWidth="2"
              />
            );
          })}
        </svg>
        
        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          {data.map((item, index) => {
            const value = parseFloat(item[valueKey]) || 0;
            const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : 0;
            
            return (
              <div key={index} style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <div style={{
                  width: "12px",
                  height: "12px",
                  backgroundColor: colors[index % colors.length],
                  borderRadius: "2px"
                }}></div>
                <span style={{ fontSize: "14px", color: "#495057" }}>
                  {item[labelKey]} ({percentage}%)
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

  // Fonction améliorée pour obtenir les IDs de produits et leurs quantités
  const getProduitDetails = (commande) => {
    try {
      // Journaliser les données brutes pour débogage
      console.log(`Commande ${commande.id} - données brutes:`, commande);
      
      // 1. Si nous avons des détails de produits déjà analysés
      if (commande.produitsDetails) {
        // Si c'est un objet {id: qty, id2: qty2}
        if (typeof commande.produitsDetails === 'object' && !Array.isArray(commande.produitsDetails)) {
          return Object.entries(commande.produitsDetails).map(([id, qty]) => ({
            id,
            quantite: parseInt(qty, 10) || 1
          }));
        }
        
        // Si c'est un tableau d'objets
        if (Array.isArray(commande.produitsDetails)) {
          return commande.produitsDetails.map(item => {
            // Si l'élément est un objet avec un id
            if (typeof item === 'object' && item !== null && item.id) {
              // Vérifier toutes les propriétés possibles pour la quantité
              const quantity = item.quantity || item.quantite || item.qty || 1;
              console.log(`Produit ID ${item.id} - quantité extraite: ${quantity}`);
              
              return {
                id: item.id.toString(),
                quantite: parseInt(quantity, 10) || 1
              };
            }
            // Si l'élément est juste un ID
            return { id: item.toString(), quantite: 1 };
          });
        }
      }
      
      // 2. Tentative de parsing du format JSON
      if (typeof commande.produits === 'string') {
        if (commande.produits.trim().startsWith('{') || commande.produits.trim().startsWith('[')) {
          try {
            const produitsObj = JSON.parse(commande.produits);
            console.log(`Commande ${commande.id} - JSON parsé:`, produitsObj);
            
            // Objet {id: qty}
            if (typeof produitsObj === 'object' && !Array.isArray(produitsObj)) {
              return Object.entries(produitsObj).map(([id, qty]) => ({
                id,
                quantite: parseInt(qty, 10) || 1
              }));
            }
            
            // Tableau d'objets ou d'IDs
            if (Array.isArray(produitsObj)) {
              return produitsObj.map(item => {
                if (typeof item === 'object' && item !== null && item.id) {
                  const quantity = item.quantity || item.quantite || item.qty || 1;
                  return {
                    id: item.id.toString(),
                    quantite: parseInt(quantity, 10) || 1
                  };
                }
                return { id: item.toString(), quantite: 1 };
              });
            }
          } catch (e) {
            console.error(`Erreur parsing JSON commande ${commande.id}:`, e);
          }
        }
        
        //  Format "id:qty,id2:qty2"
        if (commande.produits.includes(':')) {
          const result = commande.produits.split(',').map(item => {
            const parts = item.split(':');
            const id = parts[0].trim();
            const quantite = parseInt(parts[1], 10) || 1;
            console.log(`Format id:qty - ID: ${id}, Quantité: ${quantite}`);
            return { id, quantite };
          });
          return result;
        }
        
        //  Format simple "id1,id2,id3"
        return commande.produits.split(',').map(id => ({
          id: id.trim(), 
          quantite: 1
        }));
      }
      
      //  Si c'est un tableau natif
      if (Array.isArray(commande.produits)) {
        return commande.produits.map(item => {
          if (typeof item === 'object' && item !== null && item.id) {
            const quantity = item.quantity || item.quantite || item.qty || 1;
            return {
              id: item.id.toString(),
              quantite: parseInt(quantity, 10) || 1
            };
          }
          return { id: item.toString(), quantite: 1 };
        });
      }
      
      console.warn(`Format de données inconnu pour la commande ${commande.id}`);
      return [];
    } catch (e) {
      console.error("Erreur extraction produits:", e, commande);
      return [];
    }
  };

  // Suppression utilisateur
  const handleDeleteUser = (id) => {
    if (window.confirm("Supprimer cet utilisateur ?")) {
      api.deleteUser(id).then(() => {
        setUtilisateurs(utilisateurs.filter(u => u.id !== id));
        if (selectedUser === id) {
          setSelectedUser(null);
          setCommandes([]);
        }
      });
    }
  };

  // Suppression commande
  const handleDeleteCommande = (id) => {
    if (window.confirm("Supprimer cette commande ?")) {
      api.deleteCommande(id).then(() => {
        setCommandes(commandes.filter(c => c.id !== id));
      });
    }
  };

  // Suppression produit
  const handleDeleteProduit = (id) => {
    if (window.confirm("Supprimer ce produit ?")) {
      api.deleteProduit(id).then(() => {
        setProduits(produits.filter(p => p.id !== id));
        // Mettre à jour le map des produits
        const newMap = {...produitsMap};
        delete newMap[id];
        setProduitsMap(newMap);
      });
    }
  };

  // Fonction pour formater la date et l'heure
  const formatDateTime = (dateString) => {
    if (!dateString) return "Date inconnue";
    
    try {
      // Tenter de parser la date
      const date = new Date(dateString);
      
      // Vérifier si la date est valide
      if (isNaN(date.getTime())) return dateString;
      
      // Formater en DD/MM/YYYY HH:MM
      const day = String(date.getDate()).padStart(2, '0');
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const year = date.getFullYear();
      const hours = String(date.getHours()).padStart(2, '0');
      const minutes = String(date.getMinutes()).padStart(2, '0');
      
      return `${day}/${month}/${year} ${hours}:${minutes}`;
    } catch (e) {
      console.error("Erreur de formatage de date:", e);
      return dateString;
    }
  };

  // Gérer le changement de statut d'une commande
  const handleChangeStatutCommande = (id, newStatut) => {
    // Indiquer quelle commande est en cours de mise à jour
    setStatusUpdating(id);
    
    // Appel à l'API pour mettre à jour le statut dans la base de données
    api.updateCommandeStatut(id, newStatut)
      .then(res => {
        if (res.data && res.data.success) {
          // Mise à jour réussie, mettre à jour l'état local
          setCommandes(commandes.map(cmd => 
            cmd.id === id ? {...cmd, statutPaiement: newStatut} : cmd
          ));
        } else {
          // En cas d'erreur dans la réponse
          setError(res.data?.message || "Erreur lors de la mise à jour du statut");
        }
      })
      .catch(() => {
        setError("Erreur de communication avec le serveur");
      })
      .finally(() => {
        // Fin de la mise à jour, quelle que soit l'issue
        setStatusUpdating(null);
      });
  };

  // Redirection vers la fiche produit
  const goToProductPage = (id) => {
    window.location.href = `/produit/${id}`;
  };

  // Gérer l'affichage du formulaire d'ajout de produit
  const handleShowAddProductForm = () => {
    if (showAddProductForm) {
      resetForm();
    }
    setShowAddProductForm(!showAddProductForm);
  };

  // Afficher/masquer la fiche produit détaillée
  const handleToggleProductDetails = (product) => {
    setSelectedProduct(selectedProduct && selectedProduct.id === product.id ? null : product);
  };

  // Gérer les changements dans le formulaire - AMÉLIORÉ pour la validation d'URL
  const handleProductInputChange = (e) => {
    const { name, value } = e.target;
    
    // Vérification spéciale pour les URL d'images
    if (name === 'image' && value) {
      if (!isValidImageUrl(value)) {
        console.warn("L'URL saisie ne semble pas être une image valide");
        // On peut continuer à accepter l'URL même si elle n'est pas reconnue comme image
      }
    }
    
    setNewProduct({
      ...newProduct,
      [name]: value
    });
  };

  // Fonction utilitaire pour ajouter un nouveau produit à l'état
  const ajouterNouveauProduit = (nouveauProduit) => {
    setProduits(prevProduits => [...prevProduits, nouveauProduit]);
    
    // Mettre à jour la map des produits
    setProduitsMap(prev => ({
      ...prev,
      [nouveauProduit.id]: nouveauProduit
    }));
    
    // Réinitialiser le formulaire
    resetForm();
    setShowAddProductForm(false);
    
    // Message de succès temporaire
    setError(`Produit "${nouveauProduit.nom}" ajouté avec succès!`);
    setTimeout(() => setError(""), 3000);
  };

  // Ajouter un nouveau produit - Version corrigée pour inclure categorie_id
const handleAddProduct = (e) => {
  e.preventDefault();
  
  // Validation des données
  if (!newProduct.nom.trim()) {
    setError("Le nom du produit est requis");
    return;
  }

  if (!newProduct.prix || isNaN(parseFloat(newProduct.prix)) || parseFloat(newProduct.prix) <= 0) {
    setError("Le prix doit être un nombre positif");
    return;
  }

  setError("");
  setIsSubmitting(true);
  
  // Préparer les données du produit AVEC categorie_id
  const productData = {
    nom: newProduct.nom,
    prix: parseFloat(newProduct.prix),
    description: newProduct.description || "",
    image: newProduct.image || "",
    quantite: parseInt(newProduct.quantite) || 0,
    categorie_id: newProduct.categorie_id || null // ← AJOUTER CETTE LIGNE
  };
  
  console.log("Envoi du produit avec catégorie:", productData);
  
  // Appel à l'API avec les credentials pour assurer l'authentification
  api.addProduit(productData)
    .then(res => {
      console.log("Réponse du serveur:", res.data);
      
      if (res.data && res.data.success) {
        // Succès: ajouter à la liste des produits
        const nouveauProduit = res.data.produit;
        ajouterNouveauProduit(nouveauProduit);
        
        // Afficher un message de succès
        setError(`✅ Produit "${nouveauProduit.nom}" ajouté avec succès à la base de données!`);
        setTimeout(() => setError(""), 3000);
        
        // Rafraîchir la liste des produits
        api.getAdminProduits()
          .then(res => {
            if (res.data.success) {
              setProduits(res.data.produits);
              // Mettre à jour le map des produits
              const map = {};
              res.data.produits.forEach(prod => {
                map[prod.id] = prod;
              });
              setProduitsMap(map);
            }
          })
          .catch(err => console.error("Erreur lors du rafraîchissement des produits:", err));
      } else {
        // Erreur de l'API avec un message
        setError(`❌ ${res.data?.message || "Erreur lors de l'ajout du produit"}`);
      }
    })
    .catch(err => {
      console.error("Erreur lors de l'ajout du produit:", err);
      
      if (err.response) {
        // Erreur de réponse du serveur
        setError(`❌ Erreur ${err.response.status}: ${err.response.data?.message || "Problème lors de l'ajout du produit"}`);
      } else if (err.request) {
        // Pas de réponse reçue
        setError("❌ Le serveur n'a pas répondu. Vérifiez votre connexion.");
      } else {
        // Autre erreur
        setError(`❌ Erreur: ${err.message}`);
      }
    })
    .finally(() => {
      setIsSubmitting(false);
    });
};

  // Fonction de débogage pour afficher les détails d'un produit
  const debugProduct = (prodId) => {
    console.log("Détails produit", prodId, ":", produitsMap[prodId]);
    return produitsMap[prodId] ? 
      `${produitsMap[prodId].nom} (${produitsMap[prodId].prix}€) - Image: ${produitsMap[prodId].image ? "Oui" : "Non"}` : 
      "Produit non trouvé";
  };

  // Constantes pour le style commun
  const containerStyle = {
    maxWidth: "1200px",
    margin: "0 auto",
    padding: "0 20px"
  };

  return (
    <div style={containerStyle}>
      <h1
        style={{
          textAlign: "center",
          color: "#007bff",
          marginBottom: "32px"
        }}
      >
        Tableau de bord administrateur
      </h1>
      {error && <p style={{ color: "red", textAlign: "center" }}>{error}</p>}

      {/* Tableau des utilisateurs - MODIFIÉ: Réduction de taille */}
      <table
        border="1"
        cellPadding="8"
        style={{
          borderCollapse: "collapse",
          width: "90%", /* Réduit de 100% à 90% */
          margin: "0 auto 20px auto", /* Centré avec marge auto */
          tableLayout: "fixed",
          maxWidth: "1000px" /* Limitation de la largeur maximale */
        }}
      >
        <thead>
  <tr style={{ background: "#007bff", color: "#fff" }}>
    <th style={{ width: "25%" }}>Nom</th>
    <th style={{ width: "35%" }}>Email</th>
    <th style={{ width: "40%" }}>
      <div style={{ 
        display: "flex", 
        justifyContent: "space-between", 
        alignItems: "center" 
      }}>
        <span>Actions</span>
        <div style={{ 
          display: "flex", 
          gap: "5px", 
          alignItems: "center",
          width: "180px",
         // background: "#f0f0f0",
          padding: "3px 8px",
          borderRadius: "5px"
        }}>
          <input
            type="text"
            placeholder="Rechercher utilisateurs..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              padding: "4px",
              borderRadius: "4px",
              border: "1px solid #ccc",
              width: "100%",
              fontSize: "13px"
            }}
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm("")}
              style={{
                background: "transparent",
                color: "#666",
                border: "none",
                padding: "2px 5px",
                cursor: "pointer",
                fontSize: "14px"
              }}
            >
              ×
            </button>
          )}
        </div>
      </div>
    </th>
  </tr>
</thead>
        <tbody>
          {filteredUsers.length > 0 ? (
            filteredUsers.map((user, idx) => (
              <tr
                key={user.id}
                style={{
                  background: idx % 2 === 0 ? "#f2f2f2" : "#e6e6e6"
                }}
              >
                <td>{user.nom}</td>
                <td>{user.email}</td>
                <td style={{ textAlign: "left" }}> {/* Alignement à gauche pour éviter les chevauchements */}
                  <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}> {/* Flexbox avec espace entre boutons */}
                    <button
                      style={{
                        background: selectedUser === user.id ? "#b7202e" : "#24973f",
                        color: "#fff",
                        border: "none",
                        padding: "8px 12px", /* Légère réduction de la taille horizontale */
                        borderRadius: "5px",
                        cursor: "pointer",
                        whiteSpace: "nowrap" /* Empêche le texte de se couper sur plusieurs lignes */
                      }}
                      onClick={() => handleShowCommandes(user.id)}
                    >
                      {selectedUser === user.id ? "Fermer commandes" : "Voir commandes"}
                    </button>
                    <button
                      style={{
                        background: "#b7202e",
                        color: "#fff",
                        border: "none",
                        padding: "8px 12px",
                        borderRadius: "5px",
                        cursor: "pointer",
                      }}
                      onClick={() => handleDeleteUser(user.id)}
                    >
                      Supprimer
                    </button>
                  </div>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="3" style={{ textAlign: "center", padding: "15px" }}>
                {searchTerm ? (
                  <div>
                    <p>Aucun utilisateur ne correspond à votre recherche.</p>
                    <button
                      onClick={() => setSearchTerm("")}
                      style={{
                        background: "#6c757d",
                        color: "#fff",
                        border: "none",
                        padding: "8px 16px",
                        borderRadius: "5px",
                        cursor: "pointer",
                        marginTop: "10px",
                        marginLeft: "2%",
                      }}
                    >
                      Afficher tous les utilisateurs
                    </button>
                  </div>
                ) : (
                  "Aucun utilisateur disponible."
                )}
              </td>
            </tr>
          )}
        </tbody>
      </table>
      {/* Section des commandes d'un utilisateur */}
      {selectedUser && (
        <div style={{ marginTop: "25px", marginBottom: "25px" }}>
          <h2 style={{ 
  color: "#007bff", 
  textAlign: "center", 
  marginTop: "10px",
  marginBottom: "15px"
}}>
  Commandes de {getUserNameById(selectedUser)}
</h2>
<table
  border="1"
  cellPadding="8"
  style={{
    borderCollapse: "collapse",
    width: "95%",
    margin: "0 auto 20px auto",
    tableLayout: "fixed"
  }}
>
  <thead>
    <tr style={{ background: "#007bff", color: "#fff" }}>
      <th style={{ width: "15%" }}>Reférences</th> {/* Élargi de 6% à 8% */}
      <th style={{ width: "15%" }}>Date</th> {/* Suppression du paddingLeft dans l'en-tête */}
      <th style={{ width: "40%" }}>Produits</th> {/* Réduit de 42% à 40% */}
      <th style={{ width: "20%" }}>Statut paiement</th>
      <th style={{ width: "18%" }}>Actions</th>
    </tr>
  </thead>
  <tbody>
    {commandes.map((cmd, idx) => (
      <tr
        key={cmd.id}
        style={{
          background: idx % 2 === 0 ? "#f2f2f2" : "#e6e6e6"
        }}
      >
        <td style={{ 
          textAlign: "center", 
          
        }}>
          {cmd.id}
        </td>
        <td style={{ 
          paddingLeft: "12px" /* Padding légèrement réduit mais maintenu pour l'espacement */
          
        }}>
          {formatDateTime(cmd.date)}
        </td>
        <td>
          <div style={{ 
            display: "flex", 
            flexDirection: "column", 
            gap: "10px",
            maxHeight: "250px",
            overflowY: "auto"
          }}>
            {getProduitDetails(cmd).map(({id: prodId, quantite}) => {
              const produit = produitsMap[prodId];
              return (
                <div 
                  key={prodId} 
                  style={{ 
                    display: "flex", 
                    alignItems: "center", 
                    gap: "10px",
                    backgroundColor: "rgba(255,255,255,0.5)",
                    borderRadius: "5px",
                    padding: "5px"
                  }}
                >
                  <div 
                    onClick={() => goToProductPage(prodId)}
                    style={{ 
                      cursor: "pointer", 
                      position: "relative" 
                    }}
                    title={`Voir le produit: ${produit?.nom || 'Produit inconnu'}`}
                  >
                    <img 
                      src={produit?.image || "https://via.placeholder.com/50?text=No+Image"} 
                      alt={`${produit?.nom || 'Produit'} #${prodId}`}
                      style={{ 
                        width: "50px", 
                        height: "50px", 
                        objectFit: "cover",
                        borderRadius: "5px",
                        border: "1px solid #ddd",
                        transition: "transform 0.2s, box-shadow 0.2s"
                      }}
                      onMouseOver={(e) => {
                        e.currentTarget.style.transform = "scale(1.1)";
                        e.currentTarget.style.boxShadow = "0 0 5px rgba(0,0,0,0.3)";
                      }}
                      onMouseOut={(e) => {
                        e.currentTarget.style.transform = "scale(1)";
                        e.currentTarget.style.boxShadow = "none";
                      }}
                    />
                    <div 
                      style={{ 
                        position: "absolute", 
                        top: "-5px", 
                        right: "-5px", 
                        backgroundColor: "#dc3545", 
                        color: "white", 
                        borderRadius: "50%", 
                        width: "22px", 
                        height: "22px",
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        fontSize: "12px",
                        fontWeight: "bold",
                        border: "1px solid white"
                      }}
                    >
                      {quantite}
                    </div>
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: "500" }}>
                      {produit ? produit.nom : `Produit #${prodId} (indisponible)`}
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <span style={{ color: "#28a745", fontWeight: "bold" }}>
                        {produit ? `${produit.prix}€` : "N/A"}
                      </span>
                      <span style={{ 
                        color: "#6c757d", 
                        fontSize: "14px", 
                        backgroundColor: "#e9ecef",
                        padding: "2px 6px",
                        borderRadius: "3px"
                      }}>
                        Qté: {quantite}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </td>
        <td>
          <div style={{ position: "relative" }}>
            <select 
              value={cmd.statutPaiement || "En attente"} 
              onChange={(e) => handleChangeStatutCommande(cmd.id, e.target.value)}
              style={{
                padding: "6px",
                borderRadius: "4px",
                border: "1px solid #ccc",
                backgroundColor: getStatutColor(cmd.statutPaiement),
                color: cmd.statutPaiement === "En attente" ? "#000" : "#fff",
                width: "100%",
                cursor: statusUpdating === cmd.id ? "wait" : "pointer",
                opacity: statusUpdating === cmd.id ? 0.7 : 1
              }}
              disabled={statusUpdating === cmd.id}
            >
              <option value="En attente" style={{ backgroundColor: "#fff", color: "#000" }}>En attente</option>
              <option value="Payé" style={{ backgroundColor: "#fff", color: "#000" }}>Payé</option>
              <option value="Commande en cours" style={{ backgroundColor: "#fff", color: "#000" }}>Commande en cours</option>
              <option value="Expédition de la commande" style={{ backgroundColor: "#fff", color: "#000" }}>Expédition de la commande</option>
              <option value="Livré" style={{ backgroundColor: "#fff", color: "#000" }}>Livré</option>
            </select>
            {statusUpdating === cmd.id && (
              <div style={{
                position: "absolute",
                top: "50%",
                right: "8px",
                transform: "translateY(-50%)",
                width: "16px",
                height: "16px",
                borderRadius: "50%",
                border: "2px solid transparent",
                borderTopColor: "#fff",
                animation: "spin 1s linear infinite"
              }}>
                <style>{`
                  @keyframes spin {
                    0% { transform: translateY(-50%) rotate(0deg); }
                    100% { transform: translateY(-50%) rotate(360deg); }
                  }
                `}</style>
              </div>
            )}
          </div>
        </td>
        <td>
          <button
            style={{
              background: "#b7202e",
              color: "#fff",
              border: "none",
              padding: "8px 16px",
              borderRadius: "5px",
              cursor: "pointer"
            }}
            onClick={() => handleDeleteCommande(cmd.id)}
          >
            Supprimer
          </button>
        </td>
      </tr>
    ))}
  </tbody>
</table>
        </div>
      )}

      {/* Bouton pour afficher/masquer la liste des produits */}
      <div style={{ textAlign: "center", margin: "25px 0" }}>
        <button
          style={{
            background: showProduits ? "#b7202e" : "#24973f",
            color: "#fff",
            border: "none",
            padding: "10px 20px",
            borderRadius: "5px",
            cursor: "pointer"
          }}
          onClick={handleToggleProduits}
        >
          {showProduits ? "Fermer la liste des produits" : "Voir tous les produits"}
        </button>
      </div>

      {/* Section des produits */}
      {showProduits && produits.length >= 0 && (
        <div>
          <div style={{ textAlign: "center", marginBottom: "20px" }}>
            <button
              style={{
                background: showAddProductForm ? "#b7202e" : "#24973f",
                color: "#fff",
                border: "none",
                padding: "10px 20px",
                borderRadius: "5px",
                cursor: "pointer"
              }}
              onClick={handleShowAddProductForm}
            >
              {showAddProductForm ? "Annuler" : "Ajouter un produit"}
            </button>
          </div>

          {/* Formulaire d'ajout de produit */}
          {showAddProductForm && (
            <div style={{ 
              border: "1px solid #ddd", 
              padding: "20px", 
              borderRadius: "5px",
              marginBottom: "20px",
              backgroundColor: "#f9f9f9",
              maxHeight: "600px",
              overflowY: "auto"
            }}>
              <h3 style={{ color: "#28a745", textAlign: "center", marginTop: 0 }}>Nouveau produit</h3>
              <form onSubmit={handleAddProduct}>
                <div style={{ marginBottom: "15px" }}>
                  <label style={{ display: "block", marginBottom: "5px" }}>Nom du produit:</label>
                  <input
                    type="text"
                    name="nom"
                    value={newProduct.nom}
                    onChange={handleProductInputChange}
                    style={{ width: "100%", padding: "8px" }}
                    required
                  />
                </div>
                
                <div style={{ marginBottom: "15px" }}>
                  <label style={{ display: "block", marginBottom: "5px" }}>Prix:</label>
                  <input
                    type="number"
                    name="prix"
                    value={newProduct.prix}
                    onChange={handleProductInputChange}
                    style={{ width: "100%", padding: "8px" }}
                    step="0.01"
                    min="0"
                    required
                  />
                </div>
                
                {/* Champ pour la quantité */}
                <div style={{ marginBottom: "15px" }}>
                  <label style={{ display: "block", marginBottom: "5px" }}>Quantité en stock:</label>
                  <input
                    type="number"
                    name="quantite"
                    value={newProduct.quantite}
                    onChange={handleProductInputChange}
                    style={{ width: "100%", padding: "8px" }}
                    min="0"
                    step="1"
                  />
                  <small style={{ color: "#6c757d", fontSize: "12px" }}>
                    Nombre d'articles disponibles en stock
                  </small>
                </div>
                
                {/* Description du produit */}
                <div style={{ marginBottom: "15px" }}>
                  <label style={{ display: "block", marginBottom: "5px" }}>Description du produit:</label>
                  <textarea
                    name="description"
                    value={newProduct.description}
                    onChange={handleProductInputChange}
                    style={{ 
                      width: "100%", 
                      padding: "8px",
                      minHeight: "100px",
                      resize: "vertical"
                    }}
                    placeholder="Entrez une description détaillée du produit..."
                  />
                </div>
                
                {/* Champ pour la catégorie */}
                <div style={{ marginBottom: "15px" }}>
                  <label style={{ display: "block", marginBottom: "5px" }}>Catégorie:</label>
                  <select
                    name="categorie_id"
                    value={newProduct.categorie_id || ""}
                    onChange={handleProductInputChange}
                    style={{ width: "100%", padding: "8px" }}
                  >
                    <option value="">Sélectionnez une catégorie</option>
                    {categories.map(cat => (
                      <option key={cat.id} value={cat.id}>
                        {cat.nom}
                      </option>
                    ))}
                  </select>
                  <small style={{ color: "#6c757d", fontSize: "12px" }}>
                    Choisissez une catégorie pour ce produit
                  </small>
                </div>
                
                {/* Champ pour l'URL de l'image */}
                <div style={{ marginBottom: "15px" }}>
                  <label style={{ display: "block", marginBottom: "5px" }}>URL de l'image:</label>
                  <div style={{ display: "flex" }}>
                    <input
                      type="text" 
                      name="image"
                      value={newProduct.image}
                      onChange={handleProductInputChange}
                      style={{ 
                        width: "100%", 
                        padding: "8px",
                        borderTopRightRadius: newProduct.image ? "0" : "4px",
                        borderBottomRightRadius: newProduct.image ? "0" : "4px"
                      }}
                      placeholder="https://example.com/image.jpg"
                    />
                    {newProduct.image && (
                      <button
                        type="button"
                        onClick={() => setNewProduct({...newProduct, image: ""})}
                        style={{
                          background: "#dc3545",
                          color: "#fff",
                          border: "none",
                          borderTopRightRadius: "4px",
                          borderBottomRightRadius: "4px",
                          padding: "0 10px",
                          cursor: "pointer"
                        }}
                        title="Effacer l'URL"
                      >
                        ×
                      </button>
                    )}
                  </div>
                  
                  {/* Prévisualisation d'image */}
                  {newProduct.image && (
                    <div style={{ 
                      marginTop: "10px", 
                      textAlign: "center", 
                      border: "1px dashed #ddd",
                      padding: "10px",
                      borderRadius: "5px",
                      backgroundColor: "#f9f9f9"
                    }}>
                      <p style={{ fontSize: "14px", color: "#666", marginBottom: "8px" }}>
                        Prévisualisation de l'image:
                      </p>
                      <div style={{ position: "relative", display: "inline-block" }}>
                        <img 
                          src={newProduct.image} 
                          alt="Prévisualisation" 
                          style={{ 
                            maxWidth: "100%", 
                            maxHeight: "200px",
                            borderRadius: "5px",
                            border: "1px solid #ddd"
                          }} 
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = "https://via.placeholder.com/200x150?text=URL+invalide";
                            e.target.style.opacity = "0.7";
                          }}
                        />
                        <div style={{ 
                          position: "absolute", 
                          bottom: "5px", 
                          right: "5px", 
                          backgroundColor: "rgba(0,0,0,0.6)",
                          color: "white",
                          padding: "3px 8px",
                          fontSize: "12px",
                          borderRadius: "3px"
                        }}>
                          {newProduct.image.length > 30 
                            ? newProduct.image.substring(0, 27) + "..." 
                            : newProduct.image}
                        </div>
                      </div>
                      <p style={{ 
                        fontSize: "12px", 
                        color: "#888", 
                        marginTop: "8px",
                        fontStyle: "italic"
                      }}>
                        Si l'image ne s'affiche pas correctement, vérifiez l'URL ou utilisez une autre source
                      </p>
                      <div style={{ display: "flex", justifyContent: "center", gap: "10px", marginTop: "8px" }}>
                        <button 
                          type="button"
                          onClick={() => setNewProduct({
                            ...newProduct, 
                            image: "https://picsum.photos/300/200?random=" + Math.floor(Math.random() * 1000)
                          })}
                          style={{
                            padding: "5px 10px",
                            background: "#17a2b8",
                            color: "white",
                            border: "none",
                            borderRadius: "4px",
                            fontSize: "12px",
                            cursor: "pointer"
                          }}
                        >
                          Image aléatoire
                        </button>
                        <button 
                          type="button"
                          onClick={() => setNewProduct({...newProduct, image: ""})}
                          style={{
                            padding: "5px 10px",
                            background: "#6c757d",
                            color: "white",
                            border: "none",
                            borderRadius: "4px",
                            fontSize: "12px",
                            cursor: "pointer"
                          }}
                        >
                          Effacer
                        </button>
                      </div>
                    </div>
                  )}
                </div>
                
                <button
                  type="submit"
                  style={{
                    background: isSubmitting ? "#6c757d" : "#28a745",
                    color: "#fff",
                    border: "none",
                    padding: "10px 20px",
                    borderRadius: "5px",
                    cursor: isSubmitting ? "not-allowed" : "pointer",
                    width: "100%",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center"
                  }}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <span style={{ marginRight: "10px" }}>Enregistrement en cours...</span>
                      <div style={{
                        width: "20px",
                        height: "20px",
                        borderRadius: "50%",
                        border: "3px solid 24973f",
                        borderTopColor: "#fff",
                        animation: "spin 1s linear infinite"
                      }}></div>
                    </>
                  ) : (
                    "Enregistrer le produit"
                  )}
                </button>
              </form>
            </div>
          )}
          
          <h2 style={{ color: "#007bff", textAlign: "center" }}>Liste des produits</h2>
          
{/* Barre de recherche de produits */}
<div style={{ 
  width: "90%", 
  maxWidth: "800px", 
  margin: "15px auto",
  display: "flex", 
  flexDirection: "column",
  gap: "10px"
}}>
  {/* Ligne 1: Recherche par nom */}
  <div style={{ 
    display: "flex", 
    gap: "5px", 
    alignItems: "center", 
    width: "100%",
    padding: "5px 10px",
    borderRadius: "5px"
  }}>
    <input
      type="text"
      placeholder="Rechercher par nom de produit..."
      value={productSearchTerm}
      onChange={(e) => setProductSearchTerm(e.target.value)}
      style={{
        padding: "8px",
        borderRadius: "4px",
        border: "1px solid #ccc",
        width: "100%",
        fontSize: "14px"
      }}
    />
    {productSearchTerm && (
      <button
        onClick={() => setProductSearchTerm("")}
        style={{
          background: "transparent",
          color: "#666",
          border: "none",
          padding: "5px",
          cursor: "pointer",
          fontSize: "16px"
        }}
      >
        ×
      </button>
    )}
  </div>

  {/* Ligne 2: Filtre par catégorie */}
  <div style={{ 
    display: "flex", 
    gap: "10px", 
    alignItems: "center", 
    justifyContent: "center",
    flexWrap: "wrap"
  }}>
    <label style={{ fontWeight: "bold", color: "#495057", fontSize: "14px" }}>Filtrer par catégorie:</label>
    <select
      value={categoryFilter}
      onChange={(e) => setCategoryFilter(e.target.value)}
      style={{
        padding: "8px",
        borderRadius: "4px",
        border: "1px solid #ccc",
        fontSize: "14px",
        minWidth: "200px"
      }}
    >
      <option value="">Toutes les catégories</option>
      {categories.map(cat => (
        <option key={cat.id} value={cat.id}>
          {cat.nom}
        </option>
      ))}
    </select>
    
    {/* Bouton pour réinitialiser tous les filtres */}
    {(productSearchTerm || categoryFilter) && (
      <button
        onClick={() => {
          setProductSearchTerm("");
          setCategoryFilter("");
        }}
        style={{
          background: "#6c757d",
          color: "#fff",
          border: "none",
          padding: "8px 12px",
          borderRadius: "4px",
          cursor: "pointer",
          fontSize: "12px"
        }}
      >
        Réinitialiser filtres
      </button>
    )}
  </div>
</div>

{/* Affichage amélioré du nombre de produits */}
<div style={{ textAlign: "center", margin: "0 0 15px 0", color: "#666" }}>
  <p style={{ margin: "0 0 5px 0" }}>
    {filteredProducts.length} produit{filteredProducts.length !== 1 ? 's' : ''} affiché{filteredProducts.length !== 1 ? 's' : ''}
    {(productSearchTerm || categoryFilter) && (
      <span> sur {produits.length} produit{produits.length !== 1 ? 's' : ''} au total</span>
    )}
  </p>
  
  {/* Affichage des filtres actifs */}
  {(productSearchTerm || categoryFilter) && (
    <div style={{ fontSize: "12px", color: "#868e96", marginTop: "5px" }}>
      Filtres actifs: 
      {productSearchTerm && (
        <span style={{ 
          backgroundColor: "#e9ecef", 
          padding: "2px 6px", 
          borderRadius: "3px", 
          marginLeft: "5px" 
        }}>
          Recherche: "{productSearchTerm}"
        </span>
      )}
      {categoryFilter && (
        <span style={{ 
          backgroundColor: "#e9ecef", 
          padding: "2px 6px", 
          borderRadius: "3px", 
          marginLeft: "5px" 
        }}>
          Catégorie: {categories.find(cat => cat.id === categoryFilter)?.nom || 'Inconnue'}
        </span>
      )}
    </div>
  )}
  
  {/* Message si aucun produit trouvé */}
  {filteredProducts.length === 0 && produits.length > 0 && (
    <p style={{ color: "#dc3545", fontStyle: "italic", marginTop: "10px" }}>
      Aucun produit ne correspond aux critères de recherche.
    </p>
  )}
</div>

<div style={{ 
  display: "grid", 
  gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))", 
  gap: "25px",
  marginTop: "20px",
  maxHeight: "500px",
  overflowY: "auto",
  paddingRight: "10px"
}}>
  
  {filteredProducts.map(prod => (
    <div key={prod.id} style={{ 
      border: "1px solid #ddd", 
      borderRadius: "5px",
      padding: "10px",
      backgroundColor: "#f9f9f9",
      display: "flex",
      flexDirection: "column",
      alignItems: "center"
    }}>
      <div style={{
        display: "flex", 
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "space-between",
        width: "100%",
        height: "100%"
      }}>
        <div 
          onClick={() => handleToggleProductDetails(prod)}
          style={{ 
            display: "flex", 
            flexDirection: "column", 
            alignItems: "center",
            width: "100%",
            cursor: "pointer",
            transition: "transform 0.2s",
            padding: "5px",
            borderRadius: "4px"
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.transform = "translateY(-3px)";
            e.currentTarget.style.backgroundColor = "#f0f0f0";
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.transform = "translateY(0)";
            e.currentTarget.style.backgroundColor = "transparent";
          }}
        >
          <img 
            src={prod.image || "https://via.placeholder.com/100?text=Pas+d'image"} 
            alt={`${prod.nom} - ${prod.prix}€`}
            title={`${prod.nom} - ${prod.prix}€ - Cliquez pour voir le détail`}
            style={{ 
              width: "80px", 
              height: "80px", 
              objectFit: "cover",
              borderRadius: "5px",
              marginBottom: "8px",
              transition: "transform 0.2s, box-shadow 0.2s"
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.transform = "scale(1.1)";
              e.currentTarget.style.boxShadow = "0 0 5px rgba(0,0,0,0.3)";
              e.stopPropagation(); // Pour éviter de déclencher deux animations en même temps
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.transform = "scale(1)";
              e.currentTarget.style.boxShadow = "none";
              e.stopPropagation(); // Pour éviter de déclencher deux animations en même temps
            }}
          />
          <div style={{ textAlign: "center", width: "100%" }}>
            <h3 style={{ margin: "3px 0", fontSize: "14px" }}>Référence: {prod.id}</h3>
            <p style={{ 
              margin: "3px 0", 
              fontSize: "14px", 
              fontWeight: "500", 
              height: "40px",
              overflow: "hidden",
              display: "-webkit-box",
              WebkitLineClamp: "2",
              WebkitBoxOrient: "vertical"
            }}>
              {prod.nom}
            </p>
            <p style={{ 
              margin: "3px 0",
              fontSize: "12px", 
              color: parseInt(prod.quantite) <= 5 ? "#dc3545" : "#198754",
            }}>
              {parseInt(prod.quantite) <= 0 ? "Rupture de stock" : 
              `En stock: ${prod.quantite}`}
            </p>
            <p style={{ 
              margin: "5px 0 10px 0",
              fontSize: "16px", 
              color: "#28a745", 
              fontWeight: "bold",
              position: "relative",
              bottom: "0"
            }}>
              {prod.prix}€
            </p>
          </div>
        </div>
        
        <div style={{ display: "flex", width: "100%", marginTop: "auto", gap: "5px" }}>
          <button
            style={{
              flex: 1,
              background: "#0d6efd",
              color: "#fff",
              border: "none",
              padding: "6px 12px",
              borderRadius: "5px",
              cursor: "pointer",
              fontSize: "14px"
            }}
            onClick={(e) => {
              e.stopPropagation();
              handleToggleProductDetails(prod);
            }}
          >
            Détails
          </button>
          <button
            style={{
              flex: 1,
              background: "#b7202e",
              color: "#fff",
              border: "none",
              padding: "6px 12px",
              borderRadius: "5px",
              cursor: "pointer",
              fontSize: "14px"
            }}
            onClick={(e) => {
              e.stopPropagation();
              handleDeleteProduit(prod.id);
            }}
          >
            Supprimer
          </button>
        </div>
      </div>
    </div>
  ))}
</div>
</div>
)}

      {/* Modal pour afficher les détails d'un produit */}
      {selectedProduct && (
        <div style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          backgroundColor: "rgba(0,0,0,0.5)",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          zIndex: 1000
        }}
        onClick={() => setSelectedProduct(null)}
        >
          <div 
            style={{
              backgroundColor: "#fff",
              borderRadius: "8px",
              padding: "20px",
              width: "80%",
              maxWidth: "600px",
              maxHeight: "90vh",
              overflow: "auto",
              position: "relative"
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <button 
              style={{
                position: "absolute",
                top: "10px",
                right: "10px",
                background: "#dc3545",
                color: "#fff",
                border: "none",
                borderRadius: "50%",
                width: "30px",
                height: "30px",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                cursor: "pointer",
                fontSize: "18px"
              }}
              onClick={() => setSelectedProduct(null)}
            >
              &times;
            </button>

            <div style={{ textAlign: "center", marginBottom: "20px" }}>
              <h2 style={{ color: "#007bff", marginTop: 0 }}>{selectedProduct.nom}</h2>
              <p style={{ fontSize: "20px", color: "#28a745", fontWeight: "bold" }}>
                {selectedProduct.prix}€
              </p>
            </div>

            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginBottom: "20px" }}>
              <img 
                src={selectedProduct.image || "https://via.placeholder.com/300?text=Pas+d'image"} 
                alt={selectedProduct.nom}
                style={{ 
                  maxWidth: "100%", 
                  maxHeight: "300px", 
                  objectFit: "contain",
                  borderRadius: "5px",
                  boxShadow: "0 2px 5px rgba(0,0,0,0.1)"
                }} 
              />
            </div>

            <div style={{ marginBottom: "20px" }}>
              <h3 style={{ color: "#495057", borderBottom: "1px solid #dee2e6", paddingBottom: "10px" }}>Description</h3>
              <p style={{ color: "#6c757d", lineHeight: "1.6" }}>
                {selectedProduct.description || "Aucune description disponible pour ce produit."}
              </p>
            </div>

            <div style={{ marginBottom: "20px" }}>
              <h3 style={{ color: "#495057", borderBottom: "1px solid #dee2e6", paddingBottom: "10px" }}>Détails</h3>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <tbody>
                  <tr>
                    <td style={{ padding: "8px", borderBottom: "1px solid #dee2e6", fontWeight: "bold" }}>Reférence</td>
                    <td style={{ padding: "8px", borderBottom: "1px solid #dee2e6" }}>{selectedProduct.id}</td>
                  </tr>
                  <tr>
                    <td style={{ padding: "8px", borderBottom: "1px solid #dee2e6", fontWeight: "bold" }}>Nom</td>
                    <td style={{ padding: "8px", borderBottom: "1px solid #dee2e6" }}>{selectedProduct.nom}</td>
                  </tr>
                  <tr>
                    <td style={{ padding: "8px", borderBottom: "1px solid #dee2e6", fontWeight: "bold" }}>Prix</td>
                    <td style={{ padding: "8px", borderBottom: "1px solid #dee2e6" }}>{selectedProduct.prix}€</td>
                  </tr>
                  <tr>
                    <td style={{ padding: "8px", borderBottom: "1px solid #dee2e6", fontWeight: "bold" }}>Quantité en stock</td>
                    <td style={{ padding: "8px", borderBottom: "1px solid #dee2e6" }}>
                      {selectedProduct.quantite || "0"}
                      <span style={{ 
                        color: parseInt(selectedProduct.quantite) <= 5 ? "#dc3545" : "#198754", 
                        marginLeft: "10px", 
                        fontSize: "13px" 
                      }}>
                        {parseInt(selectedProduct.quantite) <= 0 ? "(Rupture de stock)" : 
                         parseInt(selectedProduct.quantite) <= 5 ? "(Stock faible)" : ""}
                      </span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <button
                style={{
                  flex: 1,
                  marginRight: "10px",
                  background: "#28a745",
                  color: "#fff",
                  border: "none",
                  padding: "10px 20px",
                  borderRadius: "5px",
                  cursor: "pointer"
                }}
                onClick={() => goToProductPage(selectedProduct.id)}
              >
                Voir page produit
              </button>
              <button
                style={{
                  flex: 1,
                  background: "#b7202e",
                  color: "#fff",
                  border: "none",
                  padding: "10px 20px",
                  borderRadius: "5px",
                  cursor: "pointer"
                }}
                onClick={() => {
                  if (window.confirm(`Supprimer le produit "${selectedProduct.nom}" ?`)) {
                    handleDeleteProduit(selectedProduct.id);
                    setSelectedProduct(null);
                  }
                }}
              >
                Supprimer
              </button>
            </div>
          </div>
        </div>
)}
      {/* Section de gestion des catégories */}
      <div style={{ textAlign: "center", margin: "25px 0" }}>
        <button
          style={{
            background: showCategories ? "#b7202e" : "#17a2b8",
            color: "#fff",
            border: "none",
            padding: "10px 20px",
            borderRadius: "5px",
            cursor: "pointer"
          }}
          onClick={handleToggleCategories}
        >
          {showCategories ? "Fermer la gestion des catégories" : "Gérer les catégories"}
        </button>
      </div>

      {showCategories && (
        <div>
          <div style={{ textAlign: "center", marginBottom: "20px" }}>
            <button
              style={{
                background: showAddCategoryForm ? "#b7202e" : "#28a745",
                color: "#fff",
                border: "none",
                padding: "10px 20px",
                borderRadius: "5px",
                cursor: "pointer"
              }}
              onClick={handleShowAddCategoryForm}
            >
              {showAddCategoryForm ? "Annuler" : (editingCategory ? "Modifier la catégorie" : "Ajouter une catégorie")}
            </button>
          </div>

          {showAddCategoryForm && (
            <div style={{ 
              border: "1px solid #ddd", 
              padding: "20px", 
              borderRadius: "5px",
              marginBottom: "20px",
              backgroundColor: "#f9f9f9"
            }}>
              <h3 style={{ color: editingCategory ? "#007bff" : "#28a745", textAlign: "center", marginTop: 0 }}>
                {editingCategory ? `Modifier la catégorie "${editingCategory.nom}"` : "Nouvelle catégorie"}
              </h3>
              <form onSubmit={editingCategory ? handleUpdateCategory : handleAddCategory}>
                <div style={{ marginBottom: "15px" }}>
                  <label style={{ display: "block", marginBottom: "5px" }}>Nom de la catégorie:</label>
                  <input
                    type="text"
                    name="nom"
                    value={newCategory.nom}
                    onChange={handleCategoryInputChange}
                    style={{ width: "100%", padding: "8px" }}
                    placeholder="Ex: Smartphones, Ordinateurs portables..."
                    required
                  />
                </div>
                
                <div style={{ marginBottom: "15px" }}>
                  <label style={{ display: "block", marginBottom: "5px" }}>Description (optionnelle):</label>
                  <textarea
                    name="description"
                    value={newCategory.description}
                    onChange={handleCategoryInputChange}
                    style={{ 
                      width: "100%", 
                      padding: "8px",
                      minHeight: "80px",
                      resize: "vertical"
                    }}
                    placeholder="Description de la catégorie..."
                  />
                </div>
                
                <div style={{ display: "flex", gap: "10px" }}>
                  <button
                    type="submit"
                    style={{
                      background: isSubmitting ? "#6c757d" : (editingCategory ? "#007bff" : "#28a745"),
                      color: "#fff",
                      border: "none",
                      padding: "10px 20px",
                      borderRadius: "5px",
                      cursor: isSubmitting ? "not-allowed" : "pointer",
                      flex: 1
                    }}
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? "En cours..." : (editingCategory ? "Modifier" : "Ajouter")}
                  </button>
                  
                  {editingCategory && (
                    <button
                      type="button"
                      onClick={() => {
                        resetCategoryForm();
                        setShowAddCategoryForm(false);
                      }}
                      style={{
                        background: "#6c757d",
                        color: "#fff",
                        border: "none",
                        padding: "10px 20px",
                        borderRadius: "5px",
                        cursor: "pointer"
                      }}
                    >
                      Annuler
                    </button>
                  )}
                </div>
              </form>
            </div>
          )}
          
          <h2 style={{ color: "#007bff", textAlign: "center" }}>Liste des catégories</h2>
          
          <div style={{ textAlign: "center", margin: "0 0 15px 0", color: "#666" }}>
            <p>{categories.length} catégorie{categories.length !== 1 ? 's' : ''} disponible{categories.length !== 1 ? 's' : ''}</p>
          </div>

          {categories.length === 0 ? (
            <div style={{ textAlign: "center", padding: "40px", color: "#666" }}>
              <p>Aucune catégorie disponible.</p>
              <p>Commencez par ajouter votre première catégorie !</p>
            </div>
          ) : (
            <div style={{ 
              display: "grid", 
              gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", 
              gap: "20px",
              marginTop: "20px"
            }}>
              {categories.map(category => (
                <div key={category.id} style={{ 
                  border: "1px solid #ddd", 
                  borderRadius: "8px",
                  padding: "15px",
                  backgroundColor: "#fff",
                  boxShadow: "0 2px 4px rgba(0,0,0,0.1)"
                }}>
                  <div style={{ marginBottom: "10px" }}>
                    <h4 style={{ 
                      margin: "0 0 5px 0", 
                      color: "#007bff",
                      fontSize: "18px"
                    }}>
                      {category.nom}
                    </h4>
                    <p style={{ 
                      margin: 0, 
                      color: "#6c757d", 
                      fontSize: "14px",
                      minHeight: "40px"
                    }}>
                      {category.description || "Aucune description"}
                    </p>
                  </div>
                  
                  <div style={{ display: "flex", gap: "10px", marginTop: "15px" }}>
                    <button
                      style={{
                        flex: 1,
                        background: "#007bff",
                        color: "#fff",
                        border: "none",
                        padding: "8px 12px",
                        borderRadius: "5px",
                        cursor: "pointer",
                        fontSize: "14px"
                      }}
                      onClick={() => handleEditCategory(category)}
                    >
                      Modifier
                    </button>
                    <button
                      style={{
                        flex: 1,
                        background: "#dc3545",
                        color: "#fff",
                        border: "none",
                        padding: "8px 12px",
                        borderRadius: "5px",
                        cursor: "pointer",
                        fontSize: "14px"
                      }}
                      onClick={() => handleDeleteCategory(category)}
                    >
                      Supprimer
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
{/* Section des statistiques de ventes */}
      <div style={{ textAlign: "center", margin: "25px 0" }}>
        <button
          style={{
            background: showStats ? "#b7202e" : "#6f42c1",
            color: "#fff",
            border: "none",
            padding: "10px 20px",
            borderRadius: "5px",
            cursor: "pointer"
          }}
          onClick={handleToggleStats}
        >
          {showStats ? "Fermer les statistiques" : "Voir les statistiques de ventes"}
        </button>
      </div>

      {showStats && (
        <div style={{ marginTop: "20px" }}>
          <h2 style={{ color: "#007bff", textAlign: "center", marginBottom: "30px" }}>
            📊 Statistiques de ventes
          </h2>
          
          {statsLoading ? (
            <div style={{ textAlign: "center", padding: "40px" }}>
              <div style={{
                display: "inline-block",
                width: "40px",
                height: "40px",
                borderRadius: "50%",
                border: "4px solid #f3f3f3",
                borderTopColor: "#007bff",
                animation: "spin 1s linear infinite"
              }}></div>
              <p style={{ marginTop: "10px", color: "#666" }}>Chargement des statistiques...</p>
              <style>{`
                @keyframes spin {
                  0% { transform: rotate(0deg); }
                  100% { transform: rotate(360deg); }
                }
              `}</style>
            </div>
          ) : (
            <>
              {/* Statistiques générales */}
              <div style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
                gap: "20px",
                marginBottom: "40px",
                padding: "0 20px"
              }}>
                <div style={{
                  backgroundColor: "#e3f2fd",
                  padding: "20px",
                  borderRadius: "8px",
                  textAlign: "center",
                  border: "1px solid #bbdefb"
                }}>
                  <h4 style={{ margin: "0 0 10px 0", color: "#1976d2" }}>Total Commandes</h4>
                  <p style={{ fontSize: "24px", fontWeight: "bold", margin: 0, color: "#0d47a1" }}>
                    {statsData.statistiquesGenerales.totalCommandes || 0}
                  </p>
                </div>
                
                <div style={{
                  backgroundColor: "#e8f5e8",
                  padding: "20px",
                  borderRadius: "8px",
                  textAlign: "center",
                  border: "1px solid #c8e6c9"
                }}>
                  <h4 style={{ margin: "0 0 10px 0", color: "#388e3c" }}>Chiffre d'Affaires</h4>
                  <p style={{ fontSize: "24px", fontWeight: "bold", margin: 0, color: "#1b5e20" }}>
                    {formatCurrency(statsData.statistiquesGenerales.chiffreAffairesTotal)}
                  </p>
                </div>
                
                <div style={{
                  backgroundColor: "#fff3e0",
                  padding: "20px",
                  borderRadius: "8px",
                  textAlign: "center",
                  border: "1px solid #ffcc02"
                }}>
                  <h4 style={{ margin: "0 0 10px 0", color: "#f57c00" }}>Total Utilisateurs</h4>
                  <p style={{ fontSize: "24px", fontWeight: "bold", margin: 0, color: "#e65100" }}>
                    {statsData.statistiquesGenerales.totalUtilisateurs || 0}
                  </p>
                </div>
                
                <div style={{
                  backgroundColor: "#fce4ec",
                  padding: "20px",
                  borderRadius: "8px",
                  textAlign: "center",
                  border: "1px solid #f8bbd9"
                }}>
                  <h4 style={{ margin: "0 0 10px 0", color: "#c2185b" }}>Total Produits</h4>
                  <p style={{ fontSize: "24px", fontWeight: "bold", margin: 0, color: "#880e4f" }}>
                    {statsData.statistiquesGenerales.totalProduits || 0}
                  </p>
                </div>
              </div>

              {/* Graphiques */}
              <div style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(400px, 1fr))",
                gap: "30px",
                padding: "0 20px"
              }}>
                {/* Histogramme des ventes par jour */}
                <div style={{
                  backgroundColor: "#fff",
                  border: "1px solid #ddd",
                  borderRadius: "8px",
                  boxShadow: "0 2px 4px rgba(0,0,0,0.1)"
                }}>
                  <BarChart
                    data={statsData.ventesParJour}
                    valueKey="chiffre_affaires"
                    labelKey="date_vente"
                    title="Chiffre d'affaires par jour (30 derniers jours)"
                    color="#28a745"
                  />
                </div>

                {/* Histogramme du panier moyen */}
                <div style={{
                  backgroundColor: "#fff",
                  border: "1px solid #ddd",
                  borderRadius: "8px",
                  boxShadow: "0 2px 4px rgba(0,0,0,0.1)"
                }}>
                  <BarChart
                    data={statsData.panierMoyen}
                    valueKey="panier_moyen"
                    labelKey="date_commande"
                    title="Panier moyen par jour"
                    color="#ffc107"
                  />
                </div>
              </div>

              {/* Camembert des ventes par catégorie */}
              <div style={{
                marginTop: "30px",
                padding: "0 20px"
              }}>
                <div style={{
                  backgroundColor: "#fff",
                  border: "1px solid #ddd",
                  borderRadius: "8px",
                  boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                  maxWidth: "600px",
                  margin: "0 auto"
                }}>
                  <PieChart
                    data={statsData.ventesParCategorie}
                    valueKey="chiffre_affaires"
                    labelKey="categorie"
                    title="Répartition des ventes par catégorie"
                  />
                </div>
              </div>

              {/* Tableau détaillé */}
              <div style={{ marginTop: "40px", padding: "0 20px" }}>
                <h3 style={{ color: "#495057", textAlign: "center", marginBottom: "20px" }}>
                  📈 Détails des ventes par catégorie
                </h3>
                
                {statsData.ventesParCategorie.length > 0 ? (
                  <table style={{
                    width: "100%",
                    maxWidth: "800px",
                    margin: "0 auto",
                    borderCollapse: "collapse",
                    backgroundColor: "#fff",
                    boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                    borderRadius: "8px",
                    overflow: "hidden"
                  }}>
                    <thead>
                      <tr style={{ backgroundColor: "#007bff", color: "#fff" }}>
                        <th style={{ padding: "12px", textAlign: "left" }}>Catégorie</th>
                        <th style={{ padding: "12px", textAlign: "center" }}>Commandes</th>
                        <th style={{ padding: "12px", textAlign: "right" }}>Chiffre d'affaires</th>
                      </tr>
                    </thead>
                    <tbody>
                      {statsData.ventesParCategorie.map((item, index) => (
                        <tr key={index} style={{
                          backgroundColor: index % 2 === 0 ? "#f8f9fa" : "#fff"
                        }}>
                          <td style={{ padding: "12px", fontWeight: "500" }}>
                            {item.categorie}
                          </td>
                          <td style={{ padding: "12px", textAlign: "center" }}>
                            {item.nombre_commandes}
                          </td>
                          <td style={{ padding: "12px", textAlign: "right", fontWeight: "bold", color: "#28a745" }}>
                            {formatCurrency(item.chiffre_affaires)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <div style={{ textAlign: "center", padding: "40px", color: "#666" }}>
                    <p>Aucune vente enregistrée pour le moment.</p>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      )}

    </div>
  );
};
 
// Fonction utilitaire pour obtenir la couleur de fond en fonction du statut
function getStatutColor(statut) {
  switch(statut) {
    case "Payé":
      return "#198754"; // vert
    case "Commande en cours":
      return "#0d6efd"; // bleu
    case "Expédition de la commande":
      return "#cf5f02"; // orange
    case "Livré": 
      return "#1ba77e"; // vert turquoise
    case "En attente":
    default:
      return "#dea700"; // jaune
  }
}

export default AdminDashboard;