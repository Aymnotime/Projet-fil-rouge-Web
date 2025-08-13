const mysql = require('mysql');

const pool = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'm2l',
  connectionLimit: 10
});

console.log('📊 Correction des statistiques de ventes...\n');

// Fonction pour corriger les montants des commandes
function corrigerMontantsCommandes() {
  return new Promise((resolve, reject) => {
    // 1. Récupérer toutes les commandes sans montant
    pool.query('SELECT id, produits FROM commande WHERE montant_total IS NULL', (err, commandes) => {
      if (err) {
        reject(err);
        return;
      }

      console.log(`📋 ${commandes.length} commandes à corriger`);
      
      if (commandes.length === 0) {
        console.log('✅ Aucune commande à corriger');
        resolve({ corrigees: 0, echouees: 0 });
        return;
      }

      // 2. Récupérer tous les produits pour calculer les prix
      pool.query('SELECT id, prix FROM produits', (err, produits) => {
        if (err) {
          reject(err);
          return;
        }

        console.log(`📦 ${produits.length} produits trouvés\n`);
        
        let commandesCorrigees = 0;
        let commandesEchouees = 0;
        let commandesTraitees = 0;

        // 3. Traiter chaque commande
        commandes.forEach((commande) => {
          try {
            // Parser les produits de la commande
            const produitsParsed = JSON.parse(commande.produits);
            
            // Calculer le montant total
            let total = 0;
            produitsParsed.forEach((produitCommande) => {
              const produit = produits.find(p => p.id === produitCommande.id);
              if (produit) {
                // Gérer les différents formats de quantité
                const quantite = produitCommande.quantity || produitCommande.quantite || 1;
                const montantProduit = produit.prix * quantite;
                total += montantProduit;
              }
            });

            if (total > 0) {
              // 4. Mettre à jour la commande
              pool.query(
                'UPDATE commande SET montant_total = ? WHERE id = ?',
                [total.toFixed(2), commande.id],
                (err, result) => {
                  commandesTraitees++;
                  
                  if (err) {
                    console.error(`❌ Erreur commande ${commande.id}: ${err.message}`);
                    commandesEchouees++;
                  } else {
                    console.log(`✅ Commande corrigée: ${total.toFixed(2)}€`);
                    commandesCorrigees++;
                  }

                  // Vérifier si toutes les commandes ont été traitées
                  if (commandesTraitees === commandes.length) {
                    resolve({ corrigees: commandesCorrigees, echouees: commandesEchouees });
                  }
                }
              );
            } else {
              commandesTraitees++;
              commandesEchouees++;
              console.log(`⚠️ Montant zéro pour commande ${commande.id}`);
              
              if (commandesTraitees === commandes.length) {
                resolve({ corrigees: commandesCorrigees, echouees: commandesEchouees });
              }
            }

          } catch (error) {
            commandesTraitees++;
            commandesEchouees++;
            console.error(`❌ Erreur parsing commande ${commande.id}: ${error.message}`);
            
            if (commandesTraitees === commandes.length) {
              resolve({ corrigees: commandesCorrigees, echouees: commandesEchouees });
            }
          }
        });
      });
    });
  });
}

// Fonction pour afficher les statistiques finales
function afficherStatistiques() {
  return new Promise((resolve, reject) => {
    const queries = [
      {
        name: 'Total des commandes',
        sql: 'SELECT COUNT(*) as total FROM commande'
      },
      {
        name: 'Commandes payées',
        sql: "SELECT COUNT(*) as total FROM commande WHERE statut_paiement IN ('Payé', 'paye', 'Livré')"
      },
      {
        name: 'Chiffre d\'affaires total',
        sql: "SELECT COALESCE(SUM(montant_total), 0) as total FROM commande WHERE statut_paiement IN ('Payé', 'paye', 'Livré') AND montant_total > 0"
      },
      {
        name: 'Panier moyen',
        sql: "SELECT ROUND(AVG(montant_total), 2) as moyenne FROM commande WHERE statut_paiement IN ('Payé', 'paye', 'Livré') AND montant_total > 0"
      }
    ];

    let resultats = {};
    let queriesCompletes = 0;

    queries.forEach(query => {
      pool.query(query.sql, (err, rows) => {
        queriesCompletes++;
        
        if (err) {
          console.error(`❌ Erreur ${query.name}:`, err.message);
          resultats[query.name] = 'Erreur';
        } else {
          const valeur = rows[0].total || rows[0].moyenne || 0;
          resultats[query.name] = query.name.includes('affaires') || query.name.includes('moyen') 
            ? `${valeur}€` 
            : valeur;
        }

        if (queriesCompletes === queries.length) {
          console.log('\n📈 STATISTIQUES MISES À JOUR:');
          console.log('═'.repeat(40));
          Object.entries(resultats).forEach(([nom, valeur]) => {
            console.log(`${nom}: ${valeur}`);
          });
          resolve(resultats);
        }
      });
    });
  });
}

// Exécution principale
async function executerCorrection() {
  try {
    // 1. Corriger les montants
    const resultat = await corrigerMontantsCommandes();
    
    console.log('\n📊 RÉSUMÉ DE LA CORRECTION:');
    console.log('═'.repeat(40));
    console.log(`✅ Commandes corrigées: ${resultat.corrigees}`);
    console.log(`❌ Commandes échouées: ${resultat.echouees}`);
    
    // 2. Afficher les nouvelles statistiques
    await afficherStatistiques();
    
    pool.end();
    console.log('\n🎉 Correction terminée avec succès !');
    
  } catch (error) {
    console.error('❌ Erreur lors de la correction:', error);
    pool.end();
  }
}

// Lancer la correction
executerCorrection();
