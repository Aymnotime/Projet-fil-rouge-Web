-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Hôte : 127.0.0.1
-- Généré le : jeu. 12 juin 2025 à 15:22
-- Version du serveur : 10.4.32-MariaDB
-- Version de PHP : 8.2.12

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
  `date` datetime NOT NULL,
  `payment_intent_id` varchar(255) DEFAULT NULL,
  `montant_total` decimal(10,2) DEFAULT NULL,
  `statut_paiement` enum('en_attente','payé','confirmé','échoué','remboursé') DEFAULT 'en_attente'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Déchargement des données de la table `commande`
--

INSERT INTO `commande` (`id`, `id_utilisateur`, `produits`, `date`, `payment_intent_id`, `montant_total`, `statut_paiement`) VALUES
('12df200c-ef07-4775-8ca8-52e2de434c28', 24, '[{\"id\":4,\"quantity\":2}]', '2025-06-11 08:23:12', NULL, NULL, 'en_attente'),
('2486506d-2df2-45d5-b152-5cab6453712d', 24, '[{\"id\":3,\"quantity\":2}]', '2025-06-11 08:20:53', NULL, NULL, 'en_attente'),
('27425fec-6fc3-4ca3-9041-d265531894f5', 23, '[{\"id\":1,\"quantity\":2}]', '2025-06-11 07:15:11', NULL, NULL, 'en_attente'),
('2be411cd-8bca-484b-85ff-cb2b18237aef', 24, '[{\"id\":2,\"quantity\":2}]', '2025-06-11 08:05:53', NULL, NULL, 'en_attente'),
('2e3c6fd7-6864-41a7-8e7e-8efa8a0afb76', 25, '[{\"id\":4,\"quantity\":2}]', '2025-06-11 13:12:44', NULL, NULL, 'en_attente'),
('323ad7d3-8d59-4d62-a57e-0ca6b95b611a', 25, '[{\"id\":6,\"quantity\":2}]', '2025-06-11 13:04:42', NULL, NULL, 'en_attente'),
('4076090b-b547-475a-aa90-289a83f829da', 2, '[{\"id\":1,\"quantity\":4},{\"id\":3,\"quantity\":2}]', '2023-12-08 15:00:16', NULL, NULL, 'en_attente'),
('40f5d12a-3d4b-4f65-b74e-280c386386cf', 20, '[{\"id\":3,\"quantity\":1},{\"id\":4,\"quantity\":1}]', '2025-06-10 10:00:12', NULL, NULL, 'en_attente'),
('4ac6f796-640e-4130-b2cf-e1d6c08ed12e', 25, '[{\"id\":4,\"quantity\":2}]', '2025-06-11 13:39:14', NULL, NULL, 'en_attente'),
('4dba895f-5acb-4538-b32b-922e2dcf8004', 20, '[{\"id\":2,\"quantity\":3}]', '2025-06-10 13:53:06', NULL, NULL, 'en_attente'),
('4dd40987-384d-4886-b95a-10430cbe61ec', 23, '[{\"id\":2,\"quantity\":2}]', '2025-06-11 07:53:58', NULL, NULL, 'en_attente'),
('5261739b-a98d-4617-bdcc-3b0f72ec1345', 20, '[{\"id\":2,\"quantity\":2}]', '2025-06-10 13:30:34', NULL, NULL, 'en_attente'),
('55c77245-016a-45bf-8880-f7e50c0acc7d', 22, '[{\"id\":2,\"quantity\":1},{\"id\":3,\"quantity\":1}]', '2025-06-10 14:18:21', NULL, NULL, 'en_attente'),
('6808b6ab-92e5-49d5-9510-058cbe04391a', 25, '[{\"id\":4,\"quantity\":2}]', '2025-06-11 13:14:38', NULL, NULL, 'en_attente'),
('6a29b5b1-9b33-4cee-8136-a1adc361c3af', 21, '[{\"id\":2,\"quantity\":2}]', '2025-06-10 13:53:49', NULL, NULL, 'en_attente'),
('8f497e4d-8593-4195-bf82-3c35d98932cb', 20, '[{\"id\":2,\"quantity\":1},{\"id\":3,\"quantity\":1},{\"id\":4,\"quantity\":1},{\"id\":5,\"quantity\":1},{\"id\":10,\"quantity\":1}]', '2025-06-10 08:24:49', NULL, NULL, 'en_attente'),
('9ba56d34-5cef-43ae-a22a-4a79907dd2d2', 25, '[{\"id\":1,\"quantity\":2}]', '2025-06-11 13:02:45', NULL, NULL, 'en_attente'),
('d660ca37-0e2e-40ca-ba6e-c8d74ee56a61', 21, '[{\"id\":2,\"quantity\":2},{\"id\":3,\"quantity\":1},{\"id\":1,\"quantity\":1}]', '2025-06-10 14:08:16', NULL, NULL, 'en_attente'),
('e6137d03-6b28-4011-b83b-462d057af516', 24, '[{\"id\":2,\"quantity\":2}]', '2025-06-11 08:23:21', NULL, NULL, 'en_attente'),
('f513d477-cfce-4ea4-be2f-a893c69b4df8', 24, '[{\"id\":1,\"quantity\":2}]', '2025-06-11 08:03:16', NULL, NULL, 'en_attente');

-- --------------------------------------------------------

--
-- Structure de la table `paiements`
--

CREATE TABLE `paiements` (
  `id` varchar(36) NOT NULL,
  `payment_intent_id` varchar(255) NOT NULL,
  `commande_id` varchar(36) DEFAULT NULL,
  `montant` decimal(10,2) NOT NULL,
  `devise` varchar(3) DEFAULT 'EUR',
  `statut` varchar(50) NOT NULL,
  `date_creation` timestamp NOT NULL DEFAULT current_timestamp(),
  `date_mise_a_jour` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Déchargement des données de la table `paiements`
--

INSERT INTO `paiements` (`id`, `payment_intent_id`, `commande_id`, `montant`, `devise`, `statut`, `date_creation`, `date_mise_a_jour`) VALUES
('002d5baa-f017-40ea-af7b-46124765ec28', 'pi_3RYSxZFRMHKEhCil0vdvkYMH', NULL, 20.00, 'EUR', 'pending', '2025-06-10 14:15:29', '2025-06-10 14:15:29'),
('030faa57-b5e0-4dde-8d01-e34b47b447be', 'pi_3RYiwNFRMHKEhCil1iqyAvN1', NULL, 20.00, 'EUR', 'pending', '2025-06-11 07:19:20', '2025-06-11 07:19:20'),
('03d9499a-34ac-4c62-8102-bf58d1805907', 'pi_3RYotMFRMHKEhCil070WwKJB', '6808b6ab-92e5-49d5-9510-058cbe04391a', 106.00, 'EUR', 'pending', '2025-06-11 13:40:37', '2025-06-11 13:40:37'),
('07ff8bd1-277c-43a7-911f-c19380cd97dd', 'pi_3RYjSxFRMHKEhCil0sjiLkNK', NULL, 20.00, 'EUR', 'pending', '2025-06-11 07:53:00', '2025-06-11 07:53:00'),
('0918cd0a-ffcf-4821-a2d5-06fa21770cc3', 'pi_3RYiwLFRMHKEhCil0Tv2U3PD', NULL, 20.00, 'EUR', 'pending', '2025-06-11 07:19:18', '2025-06-11 07:19:18'),
('0941fd0f-5309-4240-a53b-ec685d626e08', 'pi_3RYjcvFRMHKEhCil1wHUc5Yb', 'f513d477-cfce-4ea4-be2f-a893c69b4df8', 458.00, 'EUR', 'pending', '2025-06-11 08:03:18', '2025-06-11 08:03:18'),
('0a363278-d667-4f45-9ab0-e6bfb70fed60', 'pi_3RYivoFRMHKEhCil1ku1rg3R', NULL, 20.00, 'EUR', 'pending', '2025-06-11 07:18:45', '2025-06-11 07:18:45'),
('0c0a6097-e02d-47b6-a534-9cc4baac2534', 'pi_3RYjt0FRMHKEhCil053BGw5B', 'f513d477-cfce-4ea4-be2f-a893c69b4df8', 458.00, 'EUR', 'pending', '2025-06-11 08:19:55', '2025-06-11 08:19:55'),
('0d2c5f0c-bfd5-408f-a833-a31489accfee', 'pi_3RYivhFRMHKEhCil1p9Z8uzM', NULL, 20.00, 'EUR', 'pending', '2025-06-11 07:18:38', '2025-06-11 07:18:38'),
('0d3cdad8-e58d-489f-9890-18530e936d70', 'pi_3RYjcPFRMHKEhCil0KsKEwUh', '27425fec-6fc3-4ca3-9041-d265531894f5', 458.00, 'EUR', 'pending', '2025-06-11 08:02:46', '2025-06-11 08:02:46'),
('0d9683f9-85a4-425e-981c-f3956335affc', 'pi_3RYj1OFRMHKEhCil0vMuakrB', NULL, 20.00, 'EUR', 'pending', '2025-06-11 07:24:31', '2025-06-11 07:24:31'),
('0f3552b2-26ae-4374-adfa-ac3b56553d3b', 'pi_3RYjSxFRMHKEhCil0DL310yE', NULL, 20.00, 'EUR', 'pending', '2025-06-11 07:53:00', '2025-06-11 07:53:00'),
('0fc1154b-5d76-4339-b85b-5e57c59c9c41', 'pi_3RYjQZFRMHKEhCil0KTJfu2r', NULL, 20.00, 'EUR', 'pending', '2025-06-11 07:50:32', '2025-06-11 07:50:32'),
('1074ebdc-a4ea-4636-b905-97098a2f9339', 'pi_3RYj4hFRMHKEhCil0yPpRKiH', NULL, 20.00, 'EUR', 'pending', '2025-06-11 07:27:56', '2025-06-11 07:27:56'),
('137bdfba-20f0-4aa8-bf2a-feb79db4b8dd', 'pi_3RYjcPFRMHKEhCil0yBrCeYE', '4dd40987-384d-4886-b95a-10430cbe61ec', 384.00, 'EUR', 'pending', '2025-06-11 08:02:46', '2025-06-11 08:02:46'),
('150a71c8-37b9-4c5e-b62d-e1105d3b23eb', 'pi_3RYjfTFRMHKEhCil190eziNQ', 'f513d477-cfce-4ea4-be2f-a893c69b4df8', 458.00, 'EUR', 'pending', '2025-06-11 08:05:56', '2025-06-11 08:05:56'),
('1952b6f6-c89d-48af-ad5c-d8dce1e449df', 'pi_3RYj4hFRMHKEhCil1UtuswLZ', NULL, 20.00, 'EUR', 'pending', '2025-06-11 07:27:56', '2025-06-11 07:27:56'),
('1a0e3f81-08fd-4d81-921a-ae8a5ed36f0d', 'pi_3RYivtFRMHKEhCil1sYRsMoz', NULL, 20.00, 'EUR', 'pending', '2025-06-11 07:18:49', '2025-06-11 07:18:49'),
('1a64590c-388c-4fb6-8bcd-caeda9b71294', 'pi_3RYjcPFRMHKEhCil1Ye6Wpaw', '4dd40987-384d-4886-b95a-10430cbe61ec', 384.00, 'EUR', 'pending', '2025-06-11 08:02:46', '2025-06-11 08:02:46'),
('2b1cd149-1d9d-4850-bfc1-30df95934691', 'pi_3RYot9FRMHKEhCil0LXd6wvY', '2e3c6fd7-6864-41a7-8e7e-8efa8a0afb76', 106.00, 'EUR', 'pending', '2025-06-11 13:40:24', '2025-06-11 13:40:24'),
('2ceeed31-5afd-4134-b757-1c275d5a6bb3', 'pi_3RYjTxFRMHKEhCil0WUKpBLG', NULL, 20.00, 'EUR', 'pending', '2025-06-11 07:54:01', '2025-06-11 07:54:01'),
('2d42adc9-ad62-4310-b6ab-c7a56798fb01', 'pi_3RYot6FRMHKEhCil0PMP4ReX', '4ac6f796-640e-4130-b2cf-e1d6c08ed12e', 106.00, 'EUR', 'pending', '2025-06-11 13:40:21', '2025-06-11 13:40:21'),
('2f77e1de-1a7a-4b24-a985-ed762ab1a4f0', 'pi_3RYSxZFRMHKEhCil1By8ovtv', NULL, 20.00, 'EUR', 'pending', '2025-06-10 14:15:29', '2025-06-10 14:15:29'),
('30718e85-1293-4e62-8a7b-ae675725bc12', 'pi_3RYj4YFRMHKEhCil1CM0a9zY', NULL, 20.00, 'EUR', 'pending', '2025-06-11 07:27:47', '2025-06-11 07:27:47'),
('38c32380-00ba-455a-a975-704b028158d5', 'pi_3RYStrFRMHKEhCil0knrS3LN', NULL, 20.00, 'EUR', 'pending', '2025-06-10 14:11:39', '2025-06-10 14:11:39'),
('3b12656e-2011-4a27-9fc4-2a68fff659e7', 'pi_3RYiwLFRMHKEhCil0hoiyEg8', NULL, 20.00, 'EUR', 'pending', '2025-06-11 07:19:18', '2025-06-11 07:19:18'),
('3d486ef5-d7cc-42f2-826e-c5aa2a319326', 'pi_3RYjcPFRMHKEhCil0lbcoZOY', '27425fec-6fc3-4ca3-9041-d265531894f5', 458.00, 'EUR', 'pending', '2025-06-11 08:02:46', '2025-06-11 08:02:46'),
('3e6d31ff-2b33-49d8-90df-1ceae91d5e67', 'pi_3RYjkBFRMHKEhCil1azXfGhw', 'f513d477-cfce-4ea4-be2f-a893c69b4df8', 458.00, 'EUR', 'pending', '2025-06-11 08:10:48', '2025-06-11 08:10:48'),
('3f5810a3-6b26-4823-8d22-90cc837fd0f2', 'pi_3RYisPFRMHKEhCil0AORNwZF', NULL, 20.00, 'EUR', 'pending', '2025-06-11 07:15:13', '2025-06-11 07:15:13'),
('45765437-de2e-4100-b61a-82253795e604', 'pi_3RYj1HFRMHKEhCil0Goh1doB', NULL, 20.00, 'EUR', 'pending', '2025-06-11 07:24:24', '2025-06-11 07:24:24'),
('46e9fc07-b953-426d-9b31-f9e702b98c5c', 'pi_3RYot6FRMHKEhCil0UbtenCJ', '323ad7d3-8d59-4d62-a57e-0ca6b95b611a', 478.00, 'EUR', 'pending', '2025-06-11 13:40:21', '2025-06-11 13:40:21'),
('47c4f637-1e28-4116-9911-d47ab00d7678', 'pi_3RYot6FRMHKEhCil11GIjOuV', '4ac6f796-640e-4130-b2cf-e1d6c08ed12e', 106.00, 'EUR', 'pending', '2025-06-11 13:40:21', '2025-06-11 13:40:21'),
('48c97e8b-8875-4352-a3cd-3c14f82540ec', 'pi_3RYj4hFRMHKEhCil0ZVdILYd', NULL, 20.00, 'EUR', 'pending', '2025-06-11 07:27:56', '2025-06-11 07:27:56'),
('4ad663b9-9a7e-4ace-b86e-8cc37e4bc7d5', 'pi_3RYjTxFRMHKEhCil02D1nWMK', NULL, 20.00, 'EUR', 'pending', '2025-06-11 07:54:01', '2025-06-11 07:54:01'),
('4bf2812c-2f81-47f4-86fb-ca29f81ab029', 'pi_3RYot6FRMHKEhCil1WodQWrQ', '323ad7d3-8d59-4d62-a57e-0ca6b95b611a', 478.00, 'EUR', 'pending', '2025-06-11 13:40:21', '2025-06-11 13:40:21'),
('4c73071e-4987-41db-80be-8c702f94042a', 'pi_3RYSqdFRMHKEhCil0m9fqILt', NULL, 20.00, 'EUR', 'pending', '2025-06-10 14:08:19', '2025-06-10 14:08:19'),
('4d756ca7-6bf5-4efc-87c8-62299e06cba7', 'pi_3RYjkBFRMHKEhCil0Lep4kCf', '2be411cd-8bca-484b-85ff-cb2b18237aef', 384.00, 'EUR', 'pending', '2025-06-11 08:10:48', '2025-06-11 08:10:48'),
('4dab0a3f-5d21-4e3a-83fb-7725082d16bc', 'pi_3RYSqdFRMHKEhCil03RrHyj3', NULL, 20.00, 'EUR', 'pending', '2025-06-10 14:08:19', '2025-06-10 14:08:19'),
('528b4007-ca66-404e-8d10-14e32ad00519', 'pi_3RYj4YFRMHKEhCil0LK8dHwF', NULL, 20.00, 'EUR', 'pending', '2025-06-11 07:27:47', '2025-06-11 07:27:47'),
('54eea59a-43b4-4cf0-bfba-f5a0c3b24a2a', 'pi_3RYivhFRMHKEhCil0ArckVhV', NULL, 20.00, 'EUR', 'pending', '2025-06-11 07:18:38', '2025-06-11 07:18:38'),
('565d1514-b0be-4e23-aa2a-f20328538203', 'pi_3RYot6FRMHKEhCil1W0GyjtT', '9ba56d34-5cef-43ae-a22a-4a79907dd2d2', 458.00, 'EUR', 'pending', '2025-06-11 13:40:21', '2025-06-11 13:40:21'),
('5e808204-7996-4ead-8bd2-83b9a1a0faf5', 'pi_3RYotLFRMHKEhCil04VWpMhU', '2e3c6fd7-6864-41a7-8e7e-8efa8a0afb76', 106.00, 'EUR', 'pending', '2025-06-11 13:40:37', '2025-06-11 13:40:37'),
('6763f2e7-89ea-4737-a823-a76c39539034', 'pi_3RYjfTFRMHKEhCil0NNE8ICJ', '2be411cd-8bca-484b-85ff-cb2b18237aef', 384.00, 'EUR', 'succeeded', '2025-06-11 08:05:56', '2025-06-11 08:06:13'),
('689163b8-29a5-48e3-adcb-17569bfb947f', 'pi_3RYT0PFRMHKEhCil1jZqgzAI', NULL, 20.00, 'EUR', 'pending', '2025-06-10 14:18:25', '2025-06-10 14:18:25'),
('69983e12-3f79-4b81-9fe8-4bf7409e6025', 'pi_3RYStrFRMHKEhCil0d7Jptpm', NULL, 20.00, 'EUR', 'pending', '2025-06-10 14:11:39', '2025-06-10 14:11:39'),
('6a8cd6e7-498f-4c67-84f7-3dff51a7506c', 'pi_3RYjfTFRMHKEhCil0Bun2mRW', 'f513d477-cfce-4ea4-be2f-a893c69b4df8', 458.00, 'EUR', 'pending', '2025-06-11 08:05:56', '2025-06-11 08:05:56'),
('6ea6a2e9-14ba-44da-b7c8-44a92c40fb45', 'pi_3RYSztFRMHKEhCil0AfsNh3Y', NULL, 20.00, 'EUR', 'pending', '2025-06-10 14:17:53', '2025-06-10 14:17:53'),
('6f0db726-ca1f-42c6-b345-4c4c48a7b6ee', 'pi_3RYivoFRMHKEhCil1SRGcHnX', NULL, 20.00, 'EUR', 'pending', '2025-06-11 07:18:45', '2025-06-11 07:18:45'),
('7a1fd041-11d0-4faf-a923-9b7ad0b1dd1e', 'pi_3RYot9FRMHKEhCil0pq7luNM', '323ad7d3-8d59-4d62-a57e-0ca6b95b611a', 478.00, 'EUR', 'pending', '2025-06-11 13:40:24', '2025-06-11 13:40:24'),
('7b8028ac-c294-4096-84a7-77f21a519208', 'pi_3RYivfFRMHKEhCil1zU1oU3c', NULL, 20.00, 'EUR', 'pending', '2025-06-11 07:18:36', '2025-06-11 07:18:36'),
('7de554da-0d2f-4f96-bfb1-4dbf767feb28', 'pi_3RYisPFRMHKEhCil0973znAH', NULL, 20.00, 'EUR', 'pending', '2025-06-11 07:15:14', '2025-06-11 07:15:14'),
('7e46277e-30e0-492b-9ccc-81ef45ca355c', 'pi_3RYj1OFRMHKEhCil0fnStnw3', NULL, 20.00, 'EUR', 'pending', '2025-06-11 07:24:31', '2025-06-11 07:24:31'),
('8019b73e-e964-49e3-b772-a10d934817d7', 'pi_3RYSpSFRMHKEhCil00pIto0O', NULL, 20.00, 'EUR', 'pending', '2025-06-10 14:07:06', '2025-06-10 14:07:06'),
('80daea2a-ce79-4a67-b9a8-319334a3e171', 'pi_3RYotMFRMHKEhCil0SL6gsB9', '4ac6f796-640e-4130-b2cf-e1d6c08ed12e', 106.00, 'EUR', 'pending', '2025-06-11 13:40:37', '2025-06-11 13:40:37'),
('820789bc-be83-4e07-95d1-807573bfaefb', 'pi_3RYotLFRMHKEhCil1CMKi8ac', '9ba56d34-5cef-43ae-a22a-4a79907dd2d2', 458.00, 'EUR', 'pending', '2025-06-11 13:40:37', '2025-06-11 13:40:37'),
('85343ddc-25ce-4bd2-84cc-db064b10a118', 'pi_3RYot6FRMHKEhCil0MCoOWjx', '2e3c6fd7-6864-41a7-8e7e-8efa8a0afb76', 106.00, 'EUR', 'pending', '2025-06-11 13:40:21', '2025-06-11 13:40:21'),
('86582f44-0423-4c22-8748-1b7b0c45fd59', 'pi_3RYSqdFRMHKEhCil1j5BVow8', NULL, 20.00, 'EUR', 'pending', '2025-06-10 14:08:19', '2025-06-10 14:08:19'),
('870ec565-f434-4cb6-9cba-0f002569f9c9', 'pi_3RYot9FRMHKEhCil1hm41Sar', '2e3c6fd7-6864-41a7-8e7e-8efa8a0afb76', 106.00, 'EUR', 'pending', '2025-06-11 13:40:24', '2025-06-11 13:40:24'),
('87ee51e7-e6be-4934-9161-72876df21434', 'pi_3RYjTxFRMHKEhCil1sMkcCbB', NULL, 20.00, 'EUR', 'pending', '2025-06-11 07:54:02', '2025-06-11 07:54:02'),
('8dd55f69-e294-4993-9659-1eb04bfcd500', 'pi_3RYivfFRMHKEhCil0bQfYQ22', NULL, 20.00, 'EUR', 'pending', '2025-06-11 07:18:36', '2025-06-11 07:18:36'),
('906d98eb-e938-4d4c-b244-fbf6ef4ca5af', 'pi_3RYj4OFRMHKEhCil0vxZuydm', NULL, 20.00, 'EUR', 'pending', '2025-06-11 07:27:37', '2025-06-11 07:27:37'),
('90a25acc-3b7c-44da-9bda-f8a54d82fb74', 'pi_3RYotMFRMHKEhCil0XAOXqpn', '9ba56d34-5cef-43ae-a22a-4a79907dd2d2', 458.00, 'EUR', 'pending', '2025-06-11 13:40:37', '2025-06-11 13:40:37'),
('91d74c65-273d-40ae-80b8-96d9926996fe', 'pi_3RYjSxFRMHKEhCil0nsULDVs', NULL, 20.00, 'EUR', 'pending', '2025-06-11 07:53:00', '2025-06-11 07:53:00'),
('92c5e865-993f-4dff-97c6-0e2da8c28df2', 'pi_3RYStrFRMHKEhCil0WxE75zO', NULL, 20.00, 'EUR', 'pending', '2025-06-10 14:11:39', '2025-06-10 14:11:39'),
('952d8be5-ad23-4f05-b6a0-7e1547363883', 'pi_3RYStrFRMHKEhCil0JgWbdnn', NULL, 20.00, 'EUR', 'pending', '2025-06-10 14:11:39', '2025-06-10 14:11:39'),
('9668d2b0-1404-4a4a-be5a-af1036b5516a', 'pi_3RYjSsFRMHKEhCil1O9ycpHc', NULL, 20.00, 'EUR', 'pending', '2025-06-11 07:52:55', '2025-06-11 07:52:55'),
('9a2d5ea1-cb46-472e-b126-fdf7b365baa3', 'pi_3RYoKPFRMHKEhCil0q9UM6ox', '9ba56d34-5cef-43ae-a22a-4a79907dd2d2', 458.00, 'EUR', 'pending', '2025-06-11 13:04:30', '2025-06-11 13:04:30'),
('9b3f9b95-fc94-490a-8aa0-30ad3994a28d', 'pi_3RYotMFRMHKEhCil0RAuTe4n', '4ac6f796-640e-4130-b2cf-e1d6c08ed12e', 106.00, 'EUR', 'pending', '2025-06-11 13:40:37', '2025-06-11 13:40:37'),
('9cdb8b28-42f5-4bc6-92c1-0c008a9ea2f7', 'pi_3RYotMFRMHKEhCil0USLaygB', '323ad7d3-8d59-4d62-a57e-0ca6b95b611a', 478.00, 'EUR', 'pending', '2025-06-11 13:40:37', '2025-06-11 13:40:37'),
('9e77d364-f00a-425e-bac7-e1aa0e255fee', 'pi_3RYot9FRMHKEhCil0B8rWmKR', '4ac6f796-640e-4130-b2cf-e1d6c08ed12e', 106.00, 'EUR', 'pending', '2025-06-11 13:40:24', '2025-06-11 13:40:24'),
('a1e1aeab-acc3-4d3a-bade-a88b2568d73c', 'pi_3RYSxZFRMHKEhCil1wNPu8eW', NULL, 20.00, 'EUR', 'pending', '2025-06-10 14:15:29', '2025-06-10 14:15:29'),
('a207eb62-a285-472a-b07d-1be16eaac2c4', 'pi_3RYot9FRMHKEhCil1MQFJ3gv', '4ac6f796-640e-4130-b2cf-e1d6c08ed12e', 106.00, 'EUR', 'pending', '2025-06-11 13:40:24', '2025-06-11 13:40:24'),
('a3a75412-12ad-4f56-83f7-f3a204e15837', 'pi_3RYSxLFRMHKEhCil0eA9oHvz', NULL, 20.00, 'EUR', 'pending', '2025-06-10 14:15:15', '2025-06-10 14:15:15'),
('a6654f74-7732-4e50-93da-b3beada343e5', 'pi_3RYjcvFRMHKEhCil07S6G2Sq', 'f513d477-cfce-4ea4-be2f-a893c69b4df8', 458.00, 'EUR', 'succeeded', '2025-06-11 08:03:18', '2025-06-11 08:04:32'),
('ab2f4973-de3d-4550-b9d0-b01a58565ace', 'pi_3RYT0PFRMHKEhCil0WiNSd29', NULL, 20.00, 'EUR', 'pending', '2025-06-10 14:18:25', '2025-06-10 14:18:25'),
('abb7a6a1-540f-4752-a216-2e41505d6de8', 'pi_3RYotMFRMHKEhCil1vbPv4zS', '6808b6ab-92e5-49d5-9510-058cbe04391a', 106.00, 'EUR', 'pending', '2025-06-11 13:40:37', '2025-06-11 13:40:37'),
('ad8cb2b2-02fb-4d49-9815-159e7c09b94c', 'pi_3RYT0QFRMHKEhCil1jjwokFA', NULL, 20.00, 'EUR', 'pending', '2025-06-10 14:18:26', '2025-06-10 14:18:26'),
('add26bc3-3212-4895-a95a-876ba4248a63', 'pi_3RYot6FRMHKEhCil0ktyML6f', '6808b6ab-92e5-49d5-9510-058cbe04391a', 106.00, 'EUR', 'pending', '2025-06-11 13:40:21', '2025-06-11 13:40:21'),
('b033e5cc-0784-43f0-805e-b4ed65e4d004', 'pi_3RYjRdFRMHKEhCil1itgaYlP', NULL, 20.00, 'EUR', 'pending', '2025-06-11 07:51:38', '2025-06-11 07:51:38'),
('b0f8599b-7f20-4852-b3f7-6c1773f07394', 'pi_3RYjasFRMHKEhCil08z5seaf', NULL, 20.00, 'EUR', 'pending', '2025-06-11 08:01:11', '2025-06-11 08:01:11'),
('b6d01f5a-aee8-47cf-9eb0-bc68ed4d09a0', 'pi_3RYot6FRMHKEhCil0QyRZayn', '2e3c6fd7-6864-41a7-8e7e-8efa8a0afb76', 106.00, 'EUR', 'pending', '2025-06-11 13:40:21', '2025-06-11 13:40:21'),
('b9bae60a-b7f7-409e-9bb6-ec7894abbe79', 'pi_3RYoKPFRMHKEhCil1gPYtIzk', '9ba56d34-5cef-43ae-a22a-4a79907dd2d2', 458.00, 'EUR', 'pending', '2025-06-11 13:04:30', '2025-06-11 13:04:30'),
('bc7c69b5-0b08-4009-8c2f-41a50161704d', 'pi_3RYjTwFRMHKEhCil03yySoLN', NULL, 20.00, 'EUR', 'pending', '2025-06-11 07:54:01', '2025-06-11 07:54:01'),
('be6f00a8-82a5-4a54-8cb5-d9bd6f3fa101', 'pi_3RYot9FRMHKEhCil1aPldyz6', '6808b6ab-92e5-49d5-9510-058cbe04391a', 106.00, 'EUR', 'pending', '2025-06-11 13:40:24', '2025-06-11 13:40:24'),
('c1828e84-ad41-4b0a-bfe4-a11f87e86b2d', 'pi_3RYSqdFRMHKEhCil1Nj4ssWd', NULL, 20.00, 'EUR', 'pending', '2025-06-10 14:08:19', '2025-06-10 14:08:19'),
('c25d9964-0817-481b-9a81-6551dcdc6621', 'pi_3RYjTwFRMHKEhCil19RMqPU6', NULL, 20.00, 'EUR', 'pending', '2025-06-11 07:54:01', '2025-06-11 07:54:01'),
('c7582336-490a-477e-adba-4a83a6136759', 'pi_3RYot9FRMHKEhCil0e3UjqbP', '6808b6ab-92e5-49d5-9510-058cbe04391a', 106.00, 'EUR', 'pending', '2025-06-11 13:40:24', '2025-06-11 13:40:24'),
('cd4b1996-5480-4d4e-8016-e6d455ed469a', 'pi_3RYjTwFRMHKEhCil0WJ3puPG', NULL, 20.00, 'EUR', 'pending', '2025-06-11 07:54:01', '2025-06-11 07:54:01'),
('ce06c813-c065-4167-8799-663c34599b40', 'pi_3RYjasFRMHKEhCil0J70glcW', NULL, 20.00, 'EUR', 'pending', '2025-06-11 08:01:11', '2025-06-11 08:01:11'),
('d3062483-830d-4dde-82b8-8354e60d2914', 'pi_3RYj1PFRMHKEhCil1nI8jzd0', NULL, 20.00, 'EUR', 'pending', '2025-06-11 07:24:31', '2025-06-11 07:24:31'),
('d47e90da-7d94-423b-b74e-de678c3013ea', 'pi_3RYSxLFRMHKEhCil0KHnIaCX', NULL, 20.00, 'EUR', 'pending', '2025-06-10 14:15:15', '2025-06-10 14:15:15'),
('d63dc73e-5a89-43af-866d-47ffbe570605', 'pi_3RYjkBFRMHKEhCil0Un9sWQO', '2be411cd-8bca-484b-85ff-cb2b18237aef', 384.00, 'EUR', 'pending', '2025-06-11 08:10:48', '2025-06-11 08:10:48'),
('d9a1f749-35f3-49e3-b9f3-77dc062a6df9', 'pi_3RYSpSFRMHKEhCil1sKhPiTw', NULL, 20.00, 'EUR', 'pending', '2025-06-10 14:07:06', '2025-06-10 14:07:06'),
('deafe4f8-26eb-44a3-9e3c-4455c96dfd1a', 'pi_3RYjTwFRMHKEhCil1yKCPqcv', NULL, 20.00, 'EUR', 'pending', '2025-06-11 07:54:01', '2025-06-11 07:54:01'),
('df7c077b-27bf-430a-bab5-1eb38396a2c8', 'pi_3RYjfTFRMHKEhCil0DZzLAhO', '2be411cd-8bca-484b-85ff-cb2b18237aef', 384.00, 'EUR', 'pending', '2025-06-11 08:05:56', '2025-06-11 08:05:56'),
('dfb3253c-6935-4452-ad40-a7f259bba99f', 'pi_3RYotMFRMHKEhCil1LWhftG8', '323ad7d3-8d59-4d62-a57e-0ca6b95b611a', 478.00, 'EUR', 'pending', '2025-06-11 13:40:37', '2025-06-11 13:40:37'),
('e158dc04-39b1-4e97-8f30-06464f54bce7', 'pi_3RYot6FRMHKEhCil0wqz7g3y', '9ba56d34-5cef-43ae-a22a-4a79907dd2d2', 458.00, 'EUR', 'pending', '2025-06-11 13:40:21', '2025-06-11 13:40:21'),
('e30090ab-7065-4d4a-a9c9-a2e987abe175', 'pi_3RYot9FRMHKEhCil0UG9ClBX', '9ba56d34-5cef-43ae-a22a-4a79907dd2d2', 458.00, 'EUR', 'pending', '2025-06-11 13:40:24', '2025-06-11 13:40:24'),
('e4deeb5c-62bc-42ba-b067-b56865cdd586', 'pi_3RYjt0FRMHKEhCil0hFEes1R', '2be411cd-8bca-484b-85ff-cb2b18237aef', 384.00, 'EUR', 'pending', '2025-06-11 08:19:55', '2025-06-11 08:19:55'),
('e71db0d6-3eb4-4255-9c11-3eed484e9fef', 'pi_3RYj4hFRMHKEhCil0C2W8BlF', NULL, 20.00, 'EUR', 'pending', '2025-06-11 07:27:56', '2025-06-11 07:27:56'),
('e7c4afac-d3ec-4361-9993-14210b388624', 'pi_3RYjTxFRMHKEhCil057q9m8a', NULL, 20.00, 'EUR', 'pending', '2025-06-11 07:54:01', '2025-06-11 07:54:01'),
('e9061e8d-3e79-4446-801e-3c43c8d80720', 'pi_3RYot9FRMHKEhCil0G2iBAG6', '9ba56d34-5cef-43ae-a22a-4a79907dd2d2', 458.00, 'EUR', 'pending', '2025-06-11 13:40:24', '2025-06-11 13:40:24'),
('e9dd5744-e555-4863-8a34-8039fc8f982f', 'pi_3RYiwNFRMHKEhCil0MME0SFT', NULL, 20.00, 'EUR', 'pending', '2025-06-11 07:19:20', '2025-06-11 07:19:20'),
('eb6bf1b1-f697-454a-9da1-b4a822a048fe', 'pi_3RYotMFRMHKEhCil0NtDFVzq', '2e3c6fd7-6864-41a7-8e7e-8efa8a0afb76', 106.00, 'EUR', 'succeeded', '2025-06-11 13:40:37', '2025-06-11 13:40:55'),
('eb9911ea-aef0-48dc-8843-e2089fd2f986', 'pi_3RYjkBFRMHKEhCil12pivTVc', 'f513d477-cfce-4ea4-be2f-a893c69b4df8', 458.00, 'EUR', 'pending', '2025-06-11 08:10:48', '2025-06-11 08:10:48'),
('f4162184-8b95-4f6e-a3fc-83e284a0ccec', 'pi_3RYSxLFRMHKEhCil1BNeggbJ', NULL, 20.00, 'EUR', 'pending', '2025-06-10 14:15:15', '2025-06-10 14:15:15'),
('f75b8318-76a4-440f-b4fa-d6c9e2eb9519', 'pi_3RYot6FRMHKEhCil1wa923u3', '6808b6ab-92e5-49d5-9510-058cbe04391a', 106.00, 'EUR', 'pending', '2025-06-11 13:40:21', '2025-06-11 13:40:21'),
('f8f06f6f-3ce5-4a5c-aeaf-04b545aca4e2', 'pi_3RYot9FRMHKEhCil0EAubwY3', '323ad7d3-8d59-4d62-a57e-0ca6b95b611a', 478.00, 'EUR', 'pending', '2025-06-11 13:40:24', '2025-06-11 13:40:24'),
('f97cea37-f985-431e-8a76-93da2100b3cc', 'pi_3RYSztFRMHKEhCil1isYtiQ9', NULL, 20.00, 'EUR', 'pending', '2025-06-10 14:17:53', '2025-06-10 14:17:53'),
('fb0c49fe-7ecb-41fe-8bd8-3a7f5db96928', 'pi_3RYT0QFRMHKEhCil0I9FzlSj', NULL, 20.00, 'EUR', 'pending', '2025-06-10 14:18:26', '2025-06-10 14:18:26'),
('fb579448-4000-402d-8531-8a18507608c8', 'pi_3RYSxZFRMHKEhCil1vi6GXzK', NULL, 20.00, 'EUR', 'pending', '2025-06-10 14:15:29', '2025-06-10 14:15:29'),
('fb7c8a0e-b726-4461-b7fc-8079d983aec5', 'pi_3RYivtFRMHKEhCil1jI0lbn8', NULL, 20.00, 'EUR', 'pending', '2025-06-11 07:18:49', '2025-06-11 07:18:49'),
('fc449138-5b4f-4564-b1e9-b90896318f72', 'pi_3RYSxLFRMHKEhCil1HcXmiYH', NULL, 20.00, 'EUR', 'pending', '2025-06-10 14:15:15', '2025-06-10 14:15:15'),
('fdd80efe-f131-4bcd-b684-3f3bbd9b12d1', 'pi_3RYjSyFRMHKEhCil1ZGXlEqF', NULL, 20.00, 'EUR', 'succeeded', '2025-06-11 07:53:00', '2025-06-11 07:53:15'),
('fdd9ba81-9698-427b-8290-42170ee001ca', 'pi_3RYj1OFRMHKEhCil0Ht0UGCH', NULL, 20.00, 'EUR', 'pending', '2025-06-11 07:24:31', '2025-06-11 07:24:31');

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
(8, 'test', 'test', 'test@cyna.com', '$2b$10$brX0BelZJgfMwf.XrDY1retwr8oUykN19cIAmNeRdaJgCDoQLqL/q', 'joueur', '2025-04-25 09:29:46'),
(20, 'test21', 'test21', 'test21@test21.com', '$2b$10$ODh454tYC6BR0H7uncG6hukqYZeW0Xyv9vXE4GewXVH1t2mY3MM32', 'client', '2025-06-10 15:52:49'),
(21, 'test22', 'test22', 'test22@test22.com', '$2b$10$0WIdpk5O7ImrDQrKOYt61erxpY/NyUlH.Kr2baqcoQ5cT2APGM6Ha', 'client', '2025-06-10 16:07:03'),
(22, 'test23', 'test23', 'test23@test23.com', '$2b$10$RmIRBVDgADJulNNyp7XC8.BLFwuURj10opzHTsr8pBuA26.ccKzQu', 'client', '2025-06-10 16:18:15'),
(23, 'test24', 'test24', 'test24@test24.com', '$2b$10$JJ4GkQt9mcQ9.iQkcwdHauD2.9YgasKo5LVvP2TS6.1ZqmAz57GH.', 'client', '2025-06-11 09:15:03'),
(24, 'test25', 'test25', 'test25@test25.com', '$2b$10$67evcJUzIXG7ZKg8Fq2ziuqpPkbj6/EsuByxUrDQFl6Ni5vYo3RxC', 'client', '2025-06-11 10:03:11'),
(25, 'test26', 'test26', 'test26@test26.com', '$2b$10$JpOOvUxEXklmAQZXO18T8OIg0Vlj0xoiuxR88Qu2xoN2bRSxsYJU.', 'client', '2025-06-11 15:39:10');

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
  ADD KEY `id_utilisateur` (`id_utilisateur`),
  ADD KEY `idx_commande_payment_intent` (`payment_intent_id`),
  ADD KEY `idx_commande_statut_paiement` (`statut_paiement`);

--
-- Index pour la table `paiements`
--
ALTER TABLE `paiements`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `payment_intent_id` (`payment_intent_id`),
  ADD KEY `commande_id` (`commande_id`),
  ADD KEY `idx_paiements_payment_intent` (`payment_intent_id`);

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
  MODIFY `id` int(255) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=26;

--
-- Contraintes pour les tables déchargées
--

--
-- Contraintes pour la table `commande`
--
ALTER TABLE `commande`
  ADD CONSTRAINT `commande_ibfk_1` FOREIGN KEY (`id_utilisateur`) REFERENCES `utilisateur` (`id`);

--
-- Contraintes pour la table `paiements`
--
ALTER TABLE `paiements`
  ADD CONSTRAINT `paiements_ibfk_1` FOREIGN KEY (`commande_id`) REFERENCES `commande` (`id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
