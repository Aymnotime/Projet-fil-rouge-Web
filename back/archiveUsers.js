    const mysql = require('mysql');
    require('dotenv').config({ path: './.env' });  

    const pool = mysql.createPool({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD || '', 
        database: process.env.DB_NAME,
    });


    function archiverEtSupprimer() {
    const maintenant = new Date();
    const sixMoisAvant = new Date();
    sixMoisAvant.setMonth(maintenant.getMonth() - 6);

    const unAnAvant = new Date();
    unAnAvant.setFullYear(maintenant.getFullYear() - 1);

    const formatDate = (date) => date.toISOString().slice(0, 19).replace("T", " ");

    // 1️⃣ Archiver les utilisateurs inactifs depuis 6 mois
    const archiverQuery = `
        INSERT INTO utilisateur_archive (id, nom, prenom, email, mdp, fonction, derniere_connexion, date_archivage)
        SELECT id, nom, prenom, email, mdp, fonction, derniere_connexion, NOW()
        FROM utilisateur
        WHERE derniere_connexion < ? 
        AND id NOT IN (SELECT id FROM utilisateur_archive)
    `;

    pool.query(archiverQuery, [formatDate(sixMoisAvant)], (err, result) => {
        if (err) {
        console.error("Erreur archivage :", err);
        return;
        }

        // Suppression du log

        // 2️⃣ Supprimer les utilisateurs archivés de la table principale
        const deleteArchivedFromUser = `
        DELETE FROM utilisateur 
        WHERE id IN (SELECT id FROM utilisateur_archive)
        `;

        pool.query(deleteArchivedFromUser, (err2, result2) => {
        if (err2) {
            console.error("Erreur suppression utilisateur archivé :", err2);
            return;
        }

        // Suppression du log

        // 3️⃣ Supprimer ceux archivés depuis plus d’un an
        const deleteOldArchives = `
            DELETE FROM utilisateur_archive
            WHERE date_archivage < ?
        `;

        pool.query(deleteOldArchives, [formatDate(unAnAvant)], (err3, result3) => {
            if (err3) {
            console.error("Erreur suppression ancienne archive :", err3);
            return;
            }

            // Suppression du log
            pool.end();
        });
        });
    });
    }

    // Exécution
    archiverEtSupprimer();
