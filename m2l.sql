-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Hôte : 127.0.0.1
-- Généré le : lun. 21 juil. 2025 à 19:09
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
-- Structure de la table `adresse_utilisateur`
--

CREATE TABLE `adresse_utilisateur` (
  `id` int(255) NOT NULL,
  `id_utilisateur` int(255) NOT NULL,
  `telephone` varchar(20) DEFAULT NULL,
  `adresse` text DEFAULT NULL,
  `complement_adresse` text DEFAULT NULL,
  `code_postal` varchar(10) DEFAULT NULL,
  `ville` varchar(100) DEFAULT NULL,
  `pays` varchar(100) DEFAULT 'France',
  `par_defaut` tinyint(1) DEFAULT 1,
  `date_creation` datetime DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Déchargement des données de la table `adresse_utilisateur`
--

INSERT INTO `adresse_utilisateur` (`id`, `id_utilisateur`, `telephone`, `adresse`, `complement_adresse`, `code_postal`, `ville`, `pays`, `par_defaut`, `date_creation`) VALUES
(1, 33, '+33785618116', '78 avenue du tigre', '', '13000', 'marseille', 'France', 1, '2025-07-19 19:21:04');

-- --------------------------------------------------------

--
-- Structure de la table `avis`
--

CREATE TABLE `avis` (
  `id` int(11) NOT NULL,
  `id_produit` int(255) NOT NULL,
  `id_utilisateur` int(255) NOT NULL,
  `note` int(11) NOT NULL CHECK (`note` >= 1 and `note` <= 5),
  `titre` varchar(255) DEFAULT NULL,
  `commentaire` text DEFAULT NULL,
  `date_creation` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Structure de la table `categorie`
--

CREATE TABLE `categorie` (
  `id` int(11) NOT NULL,
  `nom` varchar(100) NOT NULL,
  `description` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Déchargement des données de la table `categorie`
--

INSERT INTO `categorie` (`id`, `nom`, `description`) VALUES
(1, 'PC Portable', NULL),
(2, 'Casque VR', NULL),
(3, 'Ecran', NULL),
(4, 'Smartphone', NULL);

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
  `montant_total` decimal(10,2) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Déchargement des données de la table `commande`
--

INSERT INTO `commande` (`id`, `id_utilisateur`, `produits`, `date`, `payment_intent_id`, `montant_total`) VALUES
('0d1407af-4cd2-4b8f-a8fe-e455416e4636', 29, '[{\"id\":1,\"quantity\":1}]', '2025-06-13 10:28:48', NULL, NULL),
('10ecd4a1-dcc0-482a-a206-13599b95390d', 30, '[{\"id\":1,\"quantity\":53}]', '2025-06-13 11:11:04', NULL, NULL),
('1eda9b15-5485-457c-90d1-44ad7f1369d4', 30, '[{\"id\":1,\"quantity\":1},{\"id\":2,\"quantity\":1}]', '2025-06-13 11:22:30', NULL, NULL),
('208065f4-a983-473e-a85c-1254dc2d2beb', 30, '[{\"id\":6,\"quantity\":1}]', '2025-06-13 11:13:00', NULL, NULL),
('4076090b-b547-475a-aa90-289a83f829da', 2, '[{\"id\":1,\"quantity\":4},{\"id\":3,\"quantity\":2}]', '2023-12-08 15:00:16', NULL, NULL),
('4ea28ac9-1d5f-4fd6-858b-0ce98d869429', 24, '[{\"id\":1,\"quantity\":1}]', '2025-04-25 09:42:07', NULL, NULL),
('7d3b44e0-d3da-4326-8228-b59b140bc54c', 24, '[{\"id\":1,\"quantity\":1},{\"id\":2,\"quantity\":1}]', '2025-04-25 12:22:27', NULL, NULL),
('e623105f-aef9-438f-b652-9bcea672833c', 24, '[{\"id\":2,\"quantity\":1}]', '2025-04-25 09:46:16', NULL, NULL),
('e9d9a8ed-c90c-4dd3-a11a-bd06a3c5a694', 30, '[{\"id\":6,\"quantity\":1}]', '2025-06-13 10:24:02', NULL, NULL);

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
('625b18f5-f901-45ec-86df-9a405420494d', 'pi_3RZUmPFRMHKEhCil0YPxqzgH', 'e9d9a8ed-c90c-4dd3-a11a-bd06a3c5a694', 239.00, 'EUR', 'pending', '2025-06-13 10:24:13', '2025-06-13 10:24:13'),
('46ff85dd-47e2-4d7e-8953-dc43baaa17c0', 'pi_3RZUmPFRMHKEhCil0LzZc9nm', 'e9d9a8ed-c90c-4dd3-a11a-bd06a3c5a694', 239.00, 'EUR', 'pending', '2025-06-13 10:24:13', '2025-06-13 10:24:13'),
('1c70db17-6021-4917-8107-6bd73a97f1d9', 'pi_3RZUplFRMHKEhCil1oP51tvn', 'e9d9a8ed-c90c-4dd3-a11a-bd06a3c5a694', 239.00, 'EUR', 'pending', '2025-06-13 10:27:42', '2025-06-13 10:27:42'),
('bfd76777-e4b9-4744-92e9-a532a866095f', 'pi_3RZUplFRMHKEhCil1ACo8pmk', 'e9d9a8ed-c90c-4dd3-a11a-bd06a3c5a694', 239.00, 'EUR', 'pending', '2025-06-13 10:27:42', '2025-06-13 10:27:42'),
('18b2e49a-8a8b-477b-8e01-84af06a9118a', 'pi_3RZUquFRMHKEhCil0AxRbwIA', '0d1407af-4cd2-4b8f-a8fe-e455416e4636', 229.00, 'EUR', 'pending', '2025-06-13 10:28:52', '2025-06-13 10:28:52'),
('fae5d759-2a77-4152-b0b4-a130999bcc4d', 'pi_3RZUquFRMHKEhCil1kqj0ELc', '0d1407af-4cd2-4b8f-a8fe-e455416e4636', 229.00, 'EUR', 'pending', '2025-06-13 10:28:52', '2025-06-13 10:28:52'),
('8a5267eb-3b5f-468b-a771-101f16761902', 'pi_3RZVVnFRMHKEhCil118zf1OR', 'e9d9a8ed-c90c-4dd3-a11a-bd06a3c5a694', 239.00, 'EUR', 'pending', '2025-06-13 11:11:08', '2025-06-13 11:11:08'),
('f4e3a4e6-2a9e-46ac-8adc-080e18502b49', 'pi_3RZVVnFRMHKEhCil1G5d5fNI', '10ecd4a1-dcc0-482a-a206-13599b95390d', 12137.00, 'EUR', 'pending', '2025-06-13 11:11:08', '2025-06-13 11:11:08'),
('fdde301a-9568-428f-87e8-e5fe7f8b7b5b', 'pi_3RZVVnFRMHKEhCil0FKLktx9', 'e9d9a8ed-c90c-4dd3-a11a-bd06a3c5a694', 239.00, 'EUR', 'pending', '2025-06-13 11:11:08', '2025-06-13 11:11:08'),
('8fd72628-e55e-4fce-9af7-3033cd2f67ad', 'pi_3RZVVnFRMHKEhCil14b9s3Xj', '10ecd4a1-dcc0-482a-a206-13599b95390d', 12137.00, 'EUR', 'pending', '2025-06-13 11:11:08', '2025-06-13 11:11:08'),
('f48954a4-05cd-4d46-a266-a1fa18826496', 'pi_3RZVXeFRMHKEhCil0slqlhOJ', 'e9d9a8ed-c90c-4dd3-a11a-bd06a3c5a694', 239.00, 'EUR', 'pending', '2025-06-13 11:13:03', '2025-06-13 11:13:03'),
('6e1037d3-b2a1-4ba7-9e01-7015bbc07f2c', 'pi_3RZVXeFRMHKEhCil1JcGnjsz', '208065f4-a983-473e-a85c-1254dc2d2beb', 239.00, 'EUR', 'pending', '2025-06-13 11:13:03', '2025-06-13 11:13:03'),
('fb691ceb-1c2b-4ea8-9497-42bd638f78c3', 'pi_3RZVXeFRMHKEhCil1MvKsCv8', 'e9d9a8ed-c90c-4dd3-a11a-bd06a3c5a694', 239.00, 'EUR', 'pending', '2025-06-13 11:13:03', '2025-06-13 11:13:03'),
('759ff3df-bd5f-45b3-9e52-adae4a49b56c', 'pi_3RZVXeFRMHKEhCil1rT6auYD', '208065f4-a983-473e-a85c-1254dc2d2beb', 239.00, 'EUR', 'pending', '2025-06-13 11:13:03', '2025-06-13 11:13:03'),
('28524dd3-75f4-4328-bfff-5d6da0ce24db', 'pi_3RZVXeFRMHKEhCil1SYNr20G', '10ecd4a1-dcc0-482a-a206-13599b95390d', 12137.00, 'EUR', 'pending', '2025-06-13 11:13:03', '2025-06-13 11:13:03'),
('ffdfdcd4-0c8c-41ee-9df7-7f15603b86ab', 'pi_3RZVXeFRMHKEhCil0NXp75Gf', '10ecd4a1-dcc0-482a-a206-13599b95390d', 12137.00, 'EUR', 'pending', '2025-06-13 11:13:03', '2025-06-13 11:13:03'),
('cf503de3-541e-4cc6-a0e4-3d2d307628b7', 'pi_3RZVfCFRMHKEhCil1IMzz72E', '10ecd4a1-dcc0-482a-a206-13599b95390d', 12137.00, 'EUR', 'pending', '2025-06-13 11:20:51', '2025-06-13 11:20:51'),
('99a08e8c-c0b5-44af-bde1-807672cf328a', 'pi_3RZVfCFRMHKEhCil0HW4CRmW', '208065f4-a983-473e-a85c-1254dc2d2beb', 239.00, 'EUR', 'pending', '2025-06-13 11:20:51', '2025-06-13 11:20:51'),
('1b94110b-f2e9-4cc1-8d61-dc0b84334ca8', 'pi_3RZVfCFRMHKEhCil1p6Q7GmM', 'e9d9a8ed-c90c-4dd3-a11a-bd06a3c5a694', 239.00, 'EUR', 'pending', '2025-06-13 11:20:51', '2025-06-13 11:20:51'),
('1e039977-ceb6-4939-b91a-86c4c1b28b10', 'pi_3RZVfCFRMHKEhCil1dH4lJGF', '208065f4-a983-473e-a85c-1254dc2d2beb', 239.00, 'EUR', 'pending', '2025-06-13 11:20:51', '2025-06-13 11:20:51'),
('be7e182f-d5f8-4d90-8b6b-8d488c2ec705', 'pi_3RZVfCFRMHKEhCil1Ixpk2zu', 'e9d9a8ed-c90c-4dd3-a11a-bd06a3c5a694', 239.00, 'EUR', 'pending', '2025-06-13 11:20:51', '2025-06-13 11:20:51'),
('693dbc3f-67aa-4379-bd7c-a39192749cdd', 'pi_3RZVfCFRMHKEhCil1MNv842X', '10ecd4a1-dcc0-482a-a206-13599b95390d', 12137.00, 'EUR', 'pending', '2025-06-13 11:20:51', '2025-06-13 11:20:51'),
('6cfeb7b6-8160-4917-8abe-f973afaae615', 'pi_3RZVghFRMHKEhCil1FXREYqL', 'e9d9a8ed-c90c-4dd3-a11a-bd06a3c5a694', 239.00, 'EUR', 'pending', '2025-06-13 11:22:24', '2025-06-13 11:22:24'),
('6e49ce72-95f9-4274-92dd-fcf6d9be5634', 'pi_3RZVghFRMHKEhCil0gCqUqCB', '10ecd4a1-dcc0-482a-a206-13599b95390d', 12137.00, 'EUR', 'pending', '2025-06-13 11:22:24', '2025-06-13 11:22:24'),
('10553dcd-d67b-4891-8b53-faf39e2ba2c3', 'pi_3RZVghFRMHKEhCil1uRD4kkj', '208065f4-a983-473e-a85c-1254dc2d2beb', 239.00, 'EUR', 'pending', '2025-06-13 11:22:24', '2025-06-13 11:22:24'),
('790d5ca2-5fbe-4a1e-9ecb-bf5d37f670a0', 'pi_3RZVghFRMHKEhCil0GW123NV', 'e9d9a8ed-c90c-4dd3-a11a-bd06a3c5a694', 239.00, 'EUR', 'pending', '2025-06-13 11:22:24', '2025-06-13 11:22:24'),
('98810967-2672-45df-a384-bae328ecc378', 'pi_3RZVghFRMHKEhCil0X10uxG0', '208065f4-a983-473e-a85c-1254dc2d2beb', 239.00, 'EUR', 'pending', '2025-06-13 11:22:24', '2025-06-13 11:22:24'),
('25a78dce-69ce-490b-8e0c-63cd1ed1eb37', 'pi_3RZVghFRMHKEhCil0DYzfv5p', '10ecd4a1-dcc0-482a-a206-13599b95390d', 12137.00, 'EUR', 'pending', '2025-06-13 11:22:24', '2025-06-13 11:22:24'),
('3e25a121-5fa8-451b-8aae-47f403933f00', 'pi_3RZVgqFRMHKEhCil0qrhAcbU', '208065f4-a983-473e-a85c-1254dc2d2beb', 239.00, 'EUR', 'pending', '2025-06-13 11:22:32', '2025-06-13 11:22:32'),
('ba2896d8-f64e-4240-a46d-6e2338b817d8', 'pi_3RZVgqFRMHKEhCil1uF5WWYN', '10ecd4a1-dcc0-482a-a206-13599b95390d', 12137.00, 'EUR', 'pending', '2025-06-13 11:22:32', '2025-06-13 11:22:32'),
('ccde7a98-944b-4d03-994d-cf5864aea4db', 'pi_3RZVgqFRMHKEhCil02HmegzQ', '1eda9b15-5485-457c-90d1-44ad7f1369d4', 421.00, 'EUR', 'pending', '2025-06-13 11:22:32', '2025-06-13 11:22:32'),
('21073b5f-aaad-486e-87c5-94bb23fd4526', 'pi_3RZVgqFRMHKEhCil0cXrXeU8', '1eda9b15-5485-457c-90d1-44ad7f1369d4', 421.00, 'EUR', 'pending', '2025-06-13 11:22:32', '2025-06-13 11:22:32'),
('e8fbd907-70e2-4ee1-9010-e185d050d8d8', 'pi_3RZVgqFRMHKEhCil1A2QkjcE', '10ecd4a1-dcc0-482a-a206-13599b95390d', 12137.00, 'EUR', 'pending', '2025-06-13 11:22:32', '2025-06-13 11:22:32'),
('557d20d5-bd29-4734-bfca-6d5ef41bcbf5', 'pi_3RZVgqFRMHKEhCil0ddAE12N', 'e9d9a8ed-c90c-4dd3-a11a-bd06a3c5a694', 239.00, 'EUR', 'pending', '2025-06-13 11:22:32', '2025-06-13 11:22:32'),
('76d81449-0c19-4d43-8247-58b3aaebe9e8', 'pi_3RZVgqFRMHKEhCil1fvpAAjS', 'e9d9a8ed-c90c-4dd3-a11a-bd06a3c5a694', 239.00, 'EUR', 'pending', '2025-06-13 11:22:33', '2025-06-13 11:22:33'),
('a47d1bc2-d31b-4135-9c50-aa4b035c7ea3', 'pi_3RZVgqFRMHKEhCil1PIJXwPZ', '208065f4-a983-473e-a85c-1254dc2d2beb', 239.00, 'EUR', 'pending', '2025-06-13 11:22:33', '2025-06-13 11:22:33'),
('88a5f2e5-7bf9-4bc9-b509-dfce5c8ff5cf', 'pi_3RZViJFRMHKEhCil1NC0DsdP', '10ecd4a1-dcc0-482a-a206-13599b95390d', 12137.00, 'EUR', 'pending', '2025-06-13 11:24:04', '2025-06-13 11:24:04'),
('24fb1d53-4128-4632-9d60-3e9442dd0e89', 'pi_3RZViJFRMHKEhCil140xfMhy', '10ecd4a1-dcc0-482a-a206-13599b95390d', 12137.00, 'EUR', 'pending', '2025-06-13 11:24:04', '2025-06-13 11:24:04'),
('803fe8ec-83c5-4120-b0f5-089c53a136c8', 'pi_3RZViJFRMHKEhCil04wmQmHr', '208065f4-a983-473e-a85c-1254dc2d2beb', 239.00, 'EUR', 'pending', '2025-06-13 11:24:04', '2025-06-13 11:24:04'),
('18e8691b-049d-404c-a7a8-f9ccad265aec', 'pi_3RZViJFRMHKEhCil06bxvj8O', '1eda9b15-5485-457c-90d1-44ad7f1369d4', 421.00, 'EUR', 'pending', '2025-06-13 11:24:04', '2025-06-13 11:24:04'),
('1a1e41a2-6313-4888-ba77-cb72c3f297ff', 'pi_3RZViJFRMHKEhCil1kL0bWiv', 'e9d9a8ed-c90c-4dd3-a11a-bd06a3c5a694', 239.00, 'EUR', 'pending', '2025-06-13 11:24:04', '2025-06-13 11:24:04'),
('a7aa965a-9245-4c80-8b0f-202ab0c6eaf2', 'pi_3RZViJFRMHKEhCil0UXK563b', '1eda9b15-5485-457c-90d1-44ad7f1369d4', 421.00, 'EUR', 'pending', '2025-06-13 11:24:04', '2025-06-13 11:24:04'),
('950d1aaf-4c40-41a8-92e8-417cd23e098a', 'pi_3RZViJFRMHKEhCil1VP6cIfw', 'e9d9a8ed-c90c-4dd3-a11a-bd06a3c5a694', 239.00, 'EUR', 'pending', '2025-06-13 11:24:04', '2025-06-13 11:24:04'),
('698d3453-8fcb-4568-93bc-98eff5d98b56', 'pi_3RZViJFRMHKEhCil0RsggOLs', '208065f4-a983-473e-a85c-1254dc2d2beb', 239.00, 'EUR', 'pending', '2025-06-13 11:24:04', '2025-06-13 11:24:04'),
('ce498328-4dad-484b-81ca-05d99a4bccd8', 'pi_3RZViYFRMHKEhCil1hIUQCZQ', '1eda9b15-5485-457c-90d1-44ad7f1369d4', 421.00, 'EUR', 'pending', '2025-06-13 11:24:18', '2025-06-13 11:24:18'),
('368f3f3a-9dd0-4e72-8e9e-c5797c8542a5', 'pi_3RZViYFRMHKEhCil1B0pBds8', '10ecd4a1-dcc0-482a-a206-13599b95390d', 12137.00, 'EUR', 'pending', '2025-06-13 11:24:18', '2025-06-13 11:24:18'),
('3b3028e4-3e8c-425f-bdd5-27e6d66291bd', 'pi_3RZViYFRMHKEhCil0Ib3so3c', '208065f4-a983-473e-a85c-1254dc2d2beb', 239.00, 'EUR', 'pending', '2025-06-13 11:24:18', '2025-06-13 11:24:18'),
('acf23ba3-e344-434c-a8dc-a2a7e066388b', 'pi_3RZViYFRMHKEhCil0MSWhQSz', '208065f4-a983-473e-a85c-1254dc2d2beb', 239.00, 'EUR', 'pending', '2025-06-13 11:24:18', '2025-06-13 11:24:18'),
('4c13a5b8-5f65-4b7a-8246-3ceeb1e5029d', 'pi_3RZViYFRMHKEhCil0YBH2taw', 'e9d9a8ed-c90c-4dd3-a11a-bd06a3c5a694', 239.00, 'EUR', 'pending', '2025-06-13 11:24:18', '2025-06-13 11:24:18'),
('c47abdbd-0338-4ee2-bd82-2432f5afe693', 'pi_3RZViYFRMHKEhCil0yXQdxKw', '10ecd4a1-dcc0-482a-a206-13599b95390d', 12137.00, 'EUR', 'pending', '2025-06-13 11:24:18', '2025-06-13 11:24:18'),
('8a0d785a-2da8-4df3-a1cd-71208ef4aaac', 'pi_3RZViYFRMHKEhCil0Fc6cl6H', 'e9d9a8ed-c90c-4dd3-a11a-bd06a3c5a694', 239.00, 'EUR', 'pending', '2025-06-13 11:24:19', '2025-06-13 11:24:19'),
('ce0c4af3-758e-4d08-a72d-9d965340e863', 'pi_3RZViYFRMHKEhCil1VtBlsMo', '1eda9b15-5485-457c-90d1-44ad7f1369d4', 421.00, 'EUR', 'pending', '2025-06-13 11:24:19', '2025-06-13 11:24:19');

-- --------------------------------------------------------

--
-- Structure de la table `panier`
--

CREATE TABLE `panier` (
  `id` int(11) NOT NULL,
  `id_utilisateur` int(255) NOT NULL,
  `id_produit` int(255) NOT NULL,
  `quantite` int(10) NOT NULL DEFAULT 1,
  `date_ajout` datetime DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Déchargement des données de la table `panier`
--

INSERT INTO `panier` (`id`, `id_utilisateur`, `id_produit`, `quantite`, `date_ajout`) VALUES
(4, 31, 3, 3, '2025-06-18 23:07:57'),
(5, 31, 10, 1, '2025-06-18 23:11:27'),
(22, 33, 6, 1, '2025-07-20 20:52:53');

-- --------------------------------------------------------

--
-- Structure de la table `produits`
--

CREATE TABLE `produits` (
  `id` int(255) NOT NULL,
  `nom` varchar(100) NOT NULL,
  `brand_name` varchar(100) DEFAULT NULL,
  `quantite` int(10) NOT NULL,
  `prix` int(100) NOT NULL,
  `prix_promo` decimal(10,2) DEFAULT NULL,
  `description` varchar(255) NOT NULL,
  `image` varchar(255) NOT NULL,
  `isBestSeller` tinyint(1) DEFAULT 0,
  `isFlashSale` tinyint(1) DEFAULT 0,
  `isNew` tinyint(1) DEFAULT 0,
  `isPopular` tinyint(1) DEFAULT 0,
  `categorie_id` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Déchargement des données de la table `produits`
--

INSERT INTO `produits` (`id`, `nom`, `brand_name`, `quantite`, `prix`, `prix_promo`, `description`, `image`, `isBestSeller`, `isFlashSale`, `isNew`, `isPopular`, `categorie_id`) VALUES
(1, 'SAMSUNG Galaxy A54 5G Smartphone Noir 128 Go', 'SAMSUNG ', 80, 229, NULL, 'Profitez d\'une expérience mobile fluide avec le Samsung Galaxy A54 5G, un smartphone élégant et performant. Équipé d\'un écran Super AMOLED de 6,4 pouces, d\'une caméra principale de 50 MP, et d\'une batterie de 5000 mAh pour une autonomie prolongée. ', 'https://www.cdiscount.com/pdt2/6/7/4/3/400x400/aaaar64674/rw/samsung-galaxy-a54-5g-smartphone-noir-128-go.jpg', 1, 0, 0, 1, 4),
(2, 'PC Portable LENOVO IdeaPad 1 15ALC7 ', 'LENOVO', 23, 192, NULL, 'Le Lenovo IdeaPad 1 15ALC7 est un PC portable puissant et performant, idéal pour une utilisation quotidienne. ', 'https://www.cdiscount.com/pdt2/m/f/r/1/700x700/82r400jmfr/rw/pc-portable-lenovo-ideapad-1-15alc7-sans-windows.jpg', 0, 1, 0, 0, 1),
(3, 'Ecran PC - ACER - EK251QEbi - 24,5\" FHD', 'ACER', 20, 147, NULL, 'Points forts :\r\nTaille d\'écran24,5\"\r\nInterfaces1x VGA|1x HDMI \'1.4)\r\nRésolution nativeFHD (1920x1080)\r\nTemps de réponse4ms (GTG) / 1ms(VRB)', 'https://www.cdiscount.com/pdt2/6/9/0/1/700x700/ace1712368330690/rw/ecran-pc-acer-ek251qebi-24-5-fhd-dalle-ip.jpg', 1, 0, 1, 1, 3),
(5, 'PC Portable Chromebook LENOVO IdeaPad 3 14M868 ', 'LENOVO', 23, 192, 149.99, 'Points forts :\r\nTaille de l\'écran14 \" - Ecran FHD\r\nProcesseurMediaTek Kompanio 520 (8C, 2x A76 @2.05GHz + 6x A55 @2.0GHz)\r\nRAM8GB LPDDR4x-3600 soudée\r\nProcesseur graphiqueArm Mali-G52 2EE MC2 GPU intégré', 'https://www.cdiscount.com/pdt2/y/f/r/1/700x700/82xj003yfr/rw/pc-portable-chromebook-lenovo-ideapad-3-14m868-c.jpg', 0, 1, 0, 1, 1),
(6, 'PC portable MEDION - E15223 MD62644 ', 'MEDION', 52, 239, 180.00, 'Points forts :\r\nTaille de l\'écran15,6\" FHD\r\nProcesseur CPU Intel N100 3.4G 6W SRMDM\r\nRAM4Go\r\nStockage principal128Go UFS', 'https://www.cdiscount.com/pdt2/1/6/1/1/700x700/30038161/rw/pc-portable-medion-e15223-md62644-windows-11.jpg', 1, 1, 0, 1, 1),
(7, 'PC Portable Gamer ASUS TUF Gaming A15', 'ASUS', 91, 699, NULL, 'Points forts :\r\nTaille de l\'écran15.6\" IPS\r\nProcesseur AMD Ryzen 7 7435HS / 3.1 GHz\r\nRAM16 Go (2 x 8 Go)\r\nStockage principal512 Go SSD M.2 PCIe 4.0 - NVM Express', 'https://www.cdiscount.com/pdt2/0/0/6/1/700x700/tuf506ncrhn006/rw/pc-portable-gamer-asus-tuf-gaming-a15-sans-windo.jpg', 1, 0, 0, 1, 1),
(8, 'PC Portable LENOVO Ideapad 3 17ALC6', 'LENOVO', 85, 429, NULL, 'Points forts :\r\nTaille de l\'écran17.3\" HD+\r\nProcesseur AMD SoC Platform\r\nRAM12 Go\r\nStockage principal512 Go', 'https://www.cdiscount.com/pdt2/m/f/r/1/700x700/82kv00lmfr/rw/pc-portable-lenovo-ideapad-3-17alc6-sans-windows.jpg', 0, 1, 1, 0, 1),
(9, 'PC portable Gamer ERAZER - DEPUTY P60i', 'ERAZER', 92, 859, NULL, 'Points forts :\r\nTaille de l\'écran15,6 \"\r\nProcesseur Intel® Core™ i5-12450H (3,3GHz - 45W)\r\nRAM16 Go\r\nStockage principal512 Go', 'https://www.cdiscount.com/pdt2/0/6/1/1/700x700/30038061/rw/pc-portable-gamer-erazer-deputy-p60i-livre-sans.jpg', 1, 1, 0, 0, 1),
(10, 'Casque Meta Quest 3S 256 Go-Accessoire-PC', 'Meta Quest', 4, 486, NULL, 'Découvrez la magie de Meta Quest 3S et préparez-vous à voir vos applications préférées sous un nouveau jour.', 'https://www.cdiscount.com/pdt2/9/7/8/1/700x700/exe1730887615978/rw/casque-meta-quest-3s-256-go.jpg', 1, 0, 1, 0, 2);

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
(2, 'Test', 'Test', 'test@gmail.com', '$2b$10$2g8Kh9Mb1AvP1bYOj0VZJumPdgRGZSgSkY0rsjnP9ErDDLU7e.KPS', 'administrateur', '2025-04-25 09:29:46'),
(3, 'Test', 'Test', 'test@gmail.com', '$2b$10$.O4HwtAzcAnuUySsCKeAVObZCzjag2GbvnwjBo8fbGqfxH6RpXlSG', 'administrateur', '2025-04-25 09:29:46'),
(4, 'Test', 'Test', 'test@gmail.com', '$2b$10$E/oc.2VHPZhJsIZGK7Tqi.VR0K8edPp176J9d5LzIk1N.aVQgt.Ce', 'administrateur', '2025-04-25 09:29:46'),
(8, 'test', 'test', 'test@cyna.com', '$2b$10$brX0BelZJgfMwf.XrDY1retwr8oUykN19cIAmNeRdaJgCDoQLqL/q', 'administrateur', '2025-04-25 09:29:46'),
(24, 'aa', 'aa', 'aa@a.com', '$2b$10$84loYa22b6cmYS8r8WI4XuvbMB7L2AcUfA6IbsM33hFCeHymDP2Wy', 'client', '2025-04-25 14:21:55'),
(28, 'shinjuku', 'mobile', 'test@mobile.com', '$2b$10$rC7ktBfOYLzqjWFGBr4nkOJoH4b3Mn0tkwI9OrR8xCOQc1cCrTcfm', 'client', '2025-06-13 11:58:55'),
(29, 'testmobile', 'oui', 'oui@mobile.com', '$2b$10$kUBiOHOWpMWo9ktiHny83eTEPGo6KYJHK/DAwmTtcMOIg8wTYSIcu', 'client', '2025-06-13 12:57:04'),
(30, 'test', 'crack', 'test@zzz.com', '1', 'admin', '2025-06-14 12:22:04'),
(31, 'test', 'tester', 'tester@dgfg.com', '$2b$10$m.msdKsCADWCFCVtm4RCne6kugBNvu3jMDMujTKQm0e2yN4H/8Pu6', 'client', '2025-06-18 23:10:56'),
(32, 'test', 'mobile', 'aymen.mobile@gmail.com', '$2b$10$boVoCwy0Fu2BCEs.IuFC8uwHZW7tciGQAzImqyLTxxMEo0juFl.li', 'client', '2025-06-13 13:18:15'),
(33, 'Atif', 'Aym', 'thearmy@shinujuk.com', '$2b$10$WXBaX2zESI7SFVsxqj0LVeLv1hPVWF17DU5fMVTumWn/RN40K95ES', 'client', '2025-07-21 09:42:47');

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
(19, 'Lemoine', 'Sophie', 'sophie.lemddd@example.com', 'password000', 'Analyst', '2023-11-15 00:00:00', '2025-04-25 10:15:50'),
(22, 'Utilisateur', 'Test1', 'test1@example.com', 'password1', 'analyste', '2024-01-01 00:00:00', '2025-04-25 11:39:23'),
(23, 'Utilisateur', 'Test2', 'test2@example.com', 'password2', 'administrateur', '2024-06-01 00:00:00', '2025-04-25 11:39:23'),
(26, 'Utilisateur', 'Test1', 'test1@example.com', 'password1', 'analyste', '2024-01-01 00:00:00', '2025-04-25 14:19:41'),
(27, 'Utilisateur', 'Test2', 'test2@example.com', 'password2', 'administrateur', '2024-06-01 00:00:00', '2025-04-25 14:19:41');

--
-- Index pour les tables déchargées
--

--
-- Index pour la table `adresse_utilisateur`
--
ALTER TABLE `adresse_utilisateur`
  ADD PRIMARY KEY (`id`),
  ADD KEY `id_utilisateur` (`id_utilisateur`);

--
-- Index pour la table `avis`
--
ALTER TABLE `avis`
  ADD PRIMARY KEY (`id`),
  ADD KEY `id_produit` (`id_produit`),
  ADD KEY `id_utilisateur` (`id_utilisateur`);

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
-- Index pour la table `panier`
--
ALTER TABLE `panier`
  ADD PRIMARY KEY (`id`),
  ADD KEY `id_utilisateur` (`id_utilisateur`),
  ADD KEY `id_produit` (`id_produit`);

--
-- Index pour la table `produits`
--
ALTER TABLE `produits`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_categorie` (`categorie_id`);

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
-- AUTO_INCREMENT pour la table `adresse_utilisateur`
--
ALTER TABLE `adresse_utilisateur`
  MODIFY `id` int(255) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT pour la table `avis`
--
ALTER TABLE `avis`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT pour la table `categorie`
--
ALTER TABLE `categorie`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT pour la table `panier`
--
ALTER TABLE `panier`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=23;

--
-- AUTO_INCREMENT pour la table `produits`
--
ALTER TABLE `produits`
  MODIFY `id` int(255) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=79;

--
-- AUTO_INCREMENT pour la table `utilisateur`
--
ALTER TABLE `utilisateur`
  MODIFY `id` int(255) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=34;

--
-- Contraintes pour les tables déchargées
--

--
-- Contraintes pour la table `adresse_utilisateur`
--
ALTER TABLE `adresse_utilisateur`
  ADD CONSTRAINT `adresse_utilisateur_ibfk_1` FOREIGN KEY (`id_utilisateur`) REFERENCES `utilisateur` (`id`) ON DELETE CASCADE;

--
-- Contraintes pour la table `avis`
--
ALTER TABLE `avis`
  ADD CONSTRAINT `avis_ibfk_1` FOREIGN KEY (`id_produit`) REFERENCES `produits` (`id`),
  ADD CONSTRAINT `avis_ibfk_2` FOREIGN KEY (`id_utilisateur`) REFERENCES `utilisateur` (`id`);

--
-- Contraintes pour la table `commande`
--
ALTER TABLE `commande`
  ADD CONSTRAINT `commande_ibfk_1` FOREIGN KEY (`id_utilisateur`) REFERENCES `utilisateur` (`id`);

--
-- Contraintes pour la table `panier`
--
ALTER TABLE `panier`
  ADD CONSTRAINT `panier_ibfk_1` FOREIGN KEY (`id_utilisateur`) REFERENCES `utilisateur` (`id`),
  ADD CONSTRAINT `panier_ibfk_2` FOREIGN KEY (`id_produit`) REFERENCES `produits` (`id`);

--
-- Contraintes pour la table `produits`
--
ALTER TABLE `produits`
  ADD CONSTRAINT `fk_categorie` FOREIGN KEY (`categorie_id`) REFERENCES `categorie` (`id`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
