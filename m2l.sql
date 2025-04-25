-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Hôte : 127.0.0.1
-- Généré le : ven. 25 avr. 2025 à 10:34
-- Version du serveur : 10.4.32-MariaDB
-- Version de PHP : 8.0.30

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Base de données : `m2l`
--

-- --------------------------------------------------------

--
-- Structure de la table `article`
--

CREATE TABLE `article` (
  `id` int(255) NOT NULL,
  `titre` varchar(255) NOT NULL,
  `image` varchar(255) NOT NULL,
  `texte` varchar(255) NOT NULL,
  `auteur` varchar(255) NOT NULL,
  `date` datetime(6) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Déchargement des données de la table `article`
--

INSERT INTO `article` (`id`, `titre`, `image`, `texte`, `auteur`, `date`) VALUES
(1, 'Les secrets de l\'entraînement des athlètes olympiques', 'https://source.unsplash.com/featured/?olympics&sig=101', 'Une plongée dans les routines d\'entraînement rigoureuses des athlètes olympiques...', 'Lucie Bernard', '2023-01-01 00:00:00.000000'),
(2, 'Le football féminin gagne en popularité mondiale', 'https://source.unsplash.com/featured/?womens-football&sig=102', 'Le football féminin attire de plus en plus de fans et de jeunes joueuses...', 'Amir Khan', '2023-01-05 00:00:00.000000'),
(3, 'Nutrition sportive : Manger pour la performance', 'https://source.unsplash.com/featured/?sports-nutrition&sig=103', 'L\'importance d\'une alimentation équilibrée pour les athlètes de haut niveau...', 'Emily Johnson', '2023-01-10 00:00:00.000000'),
(4, 'L\'évolution des équipements de sport', 'https://source.unsplash.com/featured/?sports-equipment&sig=104', 'Comment la technologie change-t-elle les équipements sportifs utilisés par les athlètes...', 'Carlos Diaz', '2023-01-15 00:00:00.000000'),
(5, 'Yoga pour athlètes : Bénéfices et pratiques', 'https://source.unsplash.com/featured/?yoga&sig=105', 'Le yoga comme complément essentiel à l\'entraînement des athlètes...', 'Sophie Martin', '2023-01-20 00:00:00.000000'),
(6, 'Les marathons les plus difficiles du monde', 'https://source.unsplash.com/featured/?marathon&sig=106', 'Découvrez les marathons qui défient les limites de l\'endurance humaine...', 'Mohamed El Fassi', '2023-01-25 00:00:00.000000'),
(7, 'Le boom du fitness en ligne', 'https://source.unsplash.com/featured/?online-fitness&sig=107', 'Comment le fitness en ligne révolutionne-t-il nos routines d\'exercices...', 'Lisa Wong', '2023-01-30 00:00:00.000000'),
(8, 'Psychologie du sport : la mentalité de la victoire', 'https://source.unsplash.com/featured/?sports-psychology&sig=108', 'Explorer l\'impact de la psychologie sur les performances sportives...', 'David Smith', '2023-02-03 00:00:00.000000'),
(9, 'Les femmes qui changent le visage du sport', 'https://source.unsplash.com/featured/?women-in-sports&sig=109', 'Portrait de femmes influentes dans le monde du sport...', 'Amina Khatib', '2023-02-07 00:00:00.000000'),
(10, 'L\'essor du sport électronique dans le monde', 'https://source.unsplash.com/featured/?esports&sig=110', 'Le sport électronique, un phénomène mondial en pleine expansion...', 'Julien Moreau', '2023-02-11 00:00:00.000000'),
(11, 'La montée des arts martiaux mixtes', 'https://source.unsplash.com/featured/?mma&sig=111', 'Un regard sur la popularité croissante des arts martiaux mixtes...', 'Alex Durand', '2023-02-15 00:00:00.000000'),
(12, 'Les défis du cyclisme professionnel', 'https://source.unsplash.com/featured/?cycling&sig=112', 'Exploration des épreuves et des victoires du cyclisme professionnel...', 'Chloé Dubois', '2023-02-18 00:00:00.000000'),
(13, 'Le tennis moderne : Entre tradition et innovation', 'https://source.unsplash.com/featured/?tennis&sig=113', 'Analyse de l\'évolution du tennis au fil des ans...', 'Rafael Nunez', '2023-02-21 00:00:00.000000'),
(14, 'L\'équipe de basketball qui a changé le jeu', 'https://source.unsplash.com/featured/?basketball&sig=114', 'Retour sur une équipe de basketball qui a marqué l\'histoire...', 'Michael Jordan', '2023-02-25 00:00:00.000000'),
(15, 'Les plus grands moments des Jeux Olympiques', 'https://source.unsplash.com/featured/?olympics&sig=115', 'Un récapitulatif des moments les plus mémorables des Jeux Olympiques...', 'Olivia Martin', '2023-03-01 00:00:00.000000'),
(16, 'La natation compétitive : Techniques et entraînements', 'https://source.unsplash.com/featured/?swimming&sig=116', 'Découverte des techniques d\'entraînement en natation compétitive...', 'Nathan Phelps', '2023-03-05 00:00:00.000000'),
(17, 'Le golf : Plus qu\'un sport, un art de vivre', 'https://source.unsplash.com/featured/?golf&sig=117', 'Exploration de la culture et de l\'influence du golf...', 'Tiger Woods', '2023-03-10 00:00:00.000000'),
(18, 'L\'ascension du skateboard comme sport olympique', 'https://source.unsplash.com/featured/?skateboarding&sig=118', 'Analyse de la popularité croissante du skateboard...', 'Tony Hawk', '2023-03-15 00:00:00.000000'),
(19, 'Le badminton : un sport rapide et stratégique', 'https://source.unsplash.com/featured/?badminton&sig=119', 'Découverte du badminton, un sport à la fois rapide et tactique...', 'Lin Dan', '2023-03-20 00:00:00.000000'),
(20, 'La révolution du parkour en milieu urbain', 'https://source.unsplash.com/featured/?parkour&sig=120', 'Exploration de la montée du parkour dans les environnements urbains...', 'David Belle', '2023-03-25 00:00:00.000000'),
(21, 'Le surf : Surfer sur la vague de l\'extrême', 'https://source.unsplash.com/featured/?surfing&sig=121', 'Plongée dans le monde excitant du surf...', 'Kelly Slater', '2023-03-30 00:00:00.000000'),
(22, 'L\'escalade sportive : Défier les hauteurs', 'https://source.unsplash.com/featured/?climbing&sig=122', 'Un aperçu du monde de l\'escalade sportive...', 'Adam Ondra', '2023-04-04 00:00:00.000000'),
(23, 'L\'aviron : Synchronisation et endurance', 'https://source.unsplash.com/featured/?rowing&sig=123', 'Exploration des défis et de la beauté de l\'aviron...', 'Mahe Drysdale', '2023-04-08 00:00:00.000000'),
(24, 'Le cricket : un sport avec une histoire riche', 'https://source.unsplash.com/featured/?cricket&sig=124', 'Découverte de l\'histoire et des traditions du cricket...', 'Sachin Tendulkar', '2023-04-12 00:00:00.000000'),
(25, 'La boxe : Un sport de combat et de stratégie', 'https://source.unsplash.com/featured/?boxing&sig=125', 'Une analyse de la boxe en tant que sport de combat stratégique...', 'Muhammad Ali', '2023-04-16 00:00:00.000000'),
(26, 'Le handball : Un sport d\'équipe dynamique', 'https://source.unsplash.com/featured/?handball&sig=126', 'Examen du handball, un sport d\'équipe rapide et passionnant...', 'Nikola Karabatic', '2023-04-20 00:00:00.000000'),
(27, 'L\'athlétisme : Le fondement du sport compétitif', 'https://source.unsplash.com/featured/?athletics&sig=127', 'Exploration des différentes disciplines de l\'athlétisme...', 'Usain Bolt', '2023-04-24 00:00:00.000000'),
(28, 'Le hockey sur glace : Rapidité et adresse', 'https://source.unsplash.com/featured/?ice-hockey&sig=128', 'Découverte du hockey sur glace, un sport rapide et technique...', 'Wayne Gretzky', '2023-04-28 00:00:00.000000'),
(29, 'Le ski alpin : Descente à haute vitesse', 'https://source.unsplash.com/featured/?skiing&sig=129', 'Un aperçu du monde exaltant du ski alpin...', 'Lindsey Vonn', '2023-05-02 00:00:00.000000'),
(30, 'La plongée sous-marine : Explorer les profondeurs', 'https://source.unsplash.com/featured/?scubadiving&sig=130', 'Exploration du monde fascinant de la plongée sous-marine...', 'Jacques Cousteau', '2023-05-06 00:00:00.000000');

-- --------------------------------------------------------

--
-- Structure de la table `categorie`
--

CREATE TABLE `categorie` (
  `id` int(11) NOT NULL,
  `nom` varchar(100) NOT NULL,
  `description` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Structure de la table `commande`
--

CREATE TABLE `commande` (
  `id` varchar(64) NOT NULL,
  `id_utilisateur` int(11) NOT NULL,
  `produits` varchar(256) NOT NULL,
  `date` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Déchargement des données de la table `commande`
--

INSERT INTO `commande` (`id`, `id_utilisateur`, `produits`, `date`) VALUES
('4076090b-b547-475a-aa90-289a83f829da', 2, '[{\"id\":1,\"quantity\":4},{\"id\":3,\"quantity\":2}]', '2023-12-08 15:00:16');

-- --------------------------------------------------------

--
-- Structure de la table `stock`
--

CREATE TABLE `stock` (
  `id` int(255) NOT NULL,
  `nom` varchar(100) NOT NULL,
  `quantite` int(10) NOT NULL,
  `prix` int(100) NOT NULL,
  `description` varchar(255) NOT NULL,
  `image` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Déchargement des données de la table `stock`
--

INSERT INTO `stock` (`id`, `nom`, `quantite`, `prix`, `description`, `image`) VALUES
(1, 'SAMSUNG Galaxy A54 5G Smartphone Noir 128 Go', 80, 229, 'Profitez d\'une expérience mobile fluide avec le Samsung Galaxy A54 5G, un smartphone élégant et performant. Équipé d\'un écran Super AMOLED de 6,4 pouces, d\'une caméra principale de 50 MP, et d\'une batterie de 5000 mAh pour une autonomie prolongée. ', 'https://www.cdiscount.com/pdt2/6/7/4/3/400x400/aaaar64674/rw/samsung-galaxy-a54-5g-smartphone-noir-128-go.jpg'),
(2, 'PC Portable LENOVO IdeaPad 1 15ALC7 ', 23, 192, 'Le Lenovo IdeaPad 1 15ALC7 est un PC portable puissant et performant, idéal pour une utilisation quotidienne. ', 'https://www.cdiscount.com/pdt2/m/f/r/1/700x700/82r400jmfr/rw/pc-portable-lenovo-ideapad-1-15alc7-sans-windows.jpg'),
(3, 'Ecran PC - ACER - EK251QEbi - 24,5\" FHD', 326, 147, 'Points forts :\r\nTaille d\'écran24,5\"\r\nInterfaces1x VGA|1x HDMI \'1.4)\r\nRésolution nativeFHD (1920x1080)\r\nTemps de réponse4ms (GTG) / 1ms(VRB)', 'https://www.cdiscount.com/pdt2/6/9/0/1/700x700/ace1712368330690/rw/ecran-pc-acer-ek251qebi-24-5-fhd-dalle-ip.jpg'),
(4, 'Imprimante multifonctions CANON PIXMA TS3350', 53, 53, 'Points forts :\r\nImprimante multifonctions 3-en-1\r\nImpression / Copie / Numérisation\r\nJet d\'encre - Couleur\r\nWi-Fi, écran LCD de 3,8 cm mono, connexion sans fil', 'https://www.cdiscount.com/pdt2/8/6/7/1/700x700/can4549292143867/rw/imprimante-multifonctions-canon-pixma-ts3350-3-e.jpg'),
(5, 'PC Portable Chromebook LENOVO IdeaPad 3 14M868 ', 23, 192, 'Points forts :\r\nTaille de l\'écran14 \" - Ecran FHD\r\nProcesseurMediaTek Kompanio 520 (8C, 2x A76 @2.05GHz + 6x A55 @2.0GHz)\r\nRAM8GB LPDDR4x-3600 soudée\r\nProcesseur graphiqueArm Mali-G52 2EE MC2 GPU intégré', 'https://www.cdiscount.com/pdt2/y/f/r/1/700x700/82xj003yfr/rw/pc-portable-chromebook-lenovo-ideapad-3-14m868-c.jpg'),
(6, 'PC portable MEDION - E15223 MD62644 ', 52, 239, 'Points forts :\r\nTaille de l\'écran15,6\" FHD\r\nProcesseur CPU Intel N100 3.4G 6W SRMDM\r\nRAM4Go\r\nStockage principal128Go UFS', 'https://www.cdiscount.com/pdt2/1/6/1/1/700x700/30038161/rw/pc-portable-medion-e15223-md62644-windows-11.jpg'),
(7, 'PC Portable Gamer ASUS TUF Gaming A15', 91, 699, 'Points forts :\r\nTaille de l\'écran15.6\" IPS\r\nProcesseur AMD Ryzen 7 7435HS / 3.1 GHz\r\nRAM16 Go (2 x 8 Go)\r\nStockage principal512 Go SSD M.2 PCIe 4.0 - NVM Express', 'https://www.cdiscount.com/pdt2/0/0/6/1/700x700/tuf506ncrhn006/rw/pc-portable-gamer-asus-tuf-gaming-a15-sans-windo.jpg'),
(8, 'PC Portable LENOVO Ideapad 3 17ALC6', 85, 429, 'Points forts :\r\nTaille de l\'écran17.3\" HD+\r\nProcesseur AMD SoC Platform\r\nRAM12 Go\r\nStockage principal512 Go', 'https://www.cdiscount.com/pdt2/m/f/r/1/700x700/82kv00lmfr/rw/pc-portable-lenovo-ideapad-3-17alc6-sans-windows.jpg'),
(9, 'PC portable Gamer ERAZER - DEPUTY P60i', 92, 859, 'Points forts :\r\nTaille de l\'écran15,6 \"\r\nProcesseur Intel® Core™ i5-12450H (3,3GHz - 45W)\r\nRAM16 Go\r\nStockage principal512 Go', 'https://www.cdiscount.com/pdt2/0/6/1/1/700x700/30038061/rw/pc-portable-gamer-erazer-deputy-p60i-livre-sans.jpg'),
(10, 'Casque Meta Quest 3S 256 Go-Accessoire-PC', 4, 486, 'Découvrez la magie de Meta Quest 3S et préparez-vous à voir vos applications préférées sous un nouveau jour.', 'https://www.cdiscount.com/pdt2/9/7/8/1/700x700/exe1730887615978/rw/casque-meta-quest-3s-256-go.jpg');

-- --------------------------------------------------------

--
-- Structure de la table `utilisateur`
--

CREATE TABLE `utilisateur` (
  `id` int(255) NOT NULL,
  `nom` varchar(50) NOT NULL,
  `prenom` varchar(50) NOT NULL,
  `email` varchar(100) NOT NULL,
  `mdp` varchar(100) NOT NULL,
  `fonction` varchar(100) NOT NULL,
  `derniere_connexion` datetime DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Déchargement des données de la table `utilisateur`
--

INSERT INTO `utilisateur` (`id`, `nom`, `prenom`, `email`, `mdp`, `fonction`, `derniere_connexion`) VALUES
(2, 'Test', 'Test', 'test@gmail.com', '$2b$10$2g8Kh9Mb1AvP1bYOj0VZJumPdgRGZSgSkY0rsjnP9ErDDLU7e.KPS', 'joueur', '2025-04-25 09:29:46'),
(3, 'Test', 'Test', 'test@gmail.com', '$2b$10$.O4HwtAzcAnuUySsCKeAVObZCzjag2GbvnwjBo8fbGqfxH6RpXlSG', 'joueur', '2025-04-25 09:29:46'),
(4, 'Test', 'Test', 'test@gmail.com', '$2b$10$E/oc.2VHPZhJsIZGK7Tqi.VR0K8edPp176J9d5LzIk1N.aVQgt.Ce', 'joueur', '2025-04-25 09:29:46'),
(8, 'test', 'test', 'test@cyna.com', '$2b$10$brX0BelZJgfMwf.XrDY1retwr8oUykN19cIAmNeRdaJgCDoQLqL/q', 'joueur', '2025-04-25 09:29:46');

-- --------------------------------------------------------

--
-- Structure de la table `utilisateur_archive`
--

CREATE TABLE `utilisateur_archive` (
  `id` int(11) NOT NULL,
  `nom` varchar(50) DEFAULT NULL,
  `prenom` varchar(50) DEFAULT NULL,
  `email` varchar(100) DEFAULT NULL,
  `mdp` varchar(100) DEFAULT NULL,
  `fonction` varchar(100) DEFAULT NULL,
  `derniere_connexion` datetime DEFAULT NULL,
  `date_archivage` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Déchargement des données de la table `utilisateur_archive`
--

INSERT INTO `utilisateur_archive` (`id`, `nom`, `prenom`, `email`, `mdp`, `fonction`, `derniere_connexion`, `date_archivage`) VALUES
(12, 'Dupont', 'Jean', 'jean.dupont@example.com', 'password123', 'Manager', '2024-01-01 00:00:00', '2025-04-25 10:15:01'),
(13, 'Martin', 'Marie', 'marie.martin@example.com', 'password456', 'Developer', '2024-06-01 00:00:00', '2025-04-25 10:15:01'),
(14, 'Durand', 'Pierre', 'pierre.durand@example.com', 'password789', 'Designer', '2023-09-15 00:00:00', '2025-04-25 10:15:01'),
(15, 'Lemoine', 'Sophie', 'sophie.lemoine@example.com', 'password000', 'Analyst', '2023-11-15 00:00:00', '2025-04-25 10:15:01'),
(16, 'Dupont', 'Jean', 'jean.dupoddd@example.com', 'password123', 'Manager', '2024-01-01 00:00:00', '2025-04-25 10:15:50'),
(17, 'Martin', 'Marie', 'marie.martddddn@example.com', 'password456', 'Developer', '2024-06-01 00:00:00', '2025-04-25 10:15:50'),
(18, 'Durand', 'Pierre', 'pierre.duraddd@example.com', 'password789', 'Designer', '2023-09-15 00:00:00', '2025-04-25 10:15:50'),
(19, 'Lemoine', 'Sophie', 'sophie.lemddd@example.com', 'password000', 'Analyst', '2023-11-15 00:00:00', '2025-04-25 10:15:50');

--
-- Index pour les tables déchargées
--

--
-- Index pour la table `categorie`
--
ALTER TABLE `categorie`
  ADD PRIMARY KEY (`id`);

--
-- Index pour la table `commande`
--
ALTER TABLE `commande`
  ADD PRIMARY KEY (`id`),
  ADD KEY `id_utilisateur` (`id_utilisateur`);

--
-- Index pour la table `stock`
--
ALTER TABLE `stock`
  ADD PRIMARY KEY (`id`);

--
-- Index pour la table `utilisateur`
--
ALTER TABLE `utilisateur`
  ADD PRIMARY KEY (`id`);

--
-- Index pour la table `utilisateur_archive`
--
ALTER TABLE `utilisateur_archive`
  ADD PRIMARY KEY (`id`);

--
-- AUTO_INCREMENT pour les tables déchargées
--

--
-- AUTO_INCREMENT pour la table `categorie`
--
ALTER TABLE `categorie`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT pour la table `stock`
--
ALTER TABLE `stock`
  MODIFY `id` int(255) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=79;

--
-- AUTO_INCREMENT pour la table `utilisateur`
--
ALTER TABLE `utilisateur`
  MODIFY `id` int(255) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=20;

--
-- Contraintes pour les tables déchargées
--

--
-- Contraintes pour la table `commande`
--
ALTER TABLE `commande`
  ADD CONSTRAINT `commande_ibfk_1` FOREIGN KEY (`id_utilisateur`) REFERENCES `utilisateur` (`id`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
