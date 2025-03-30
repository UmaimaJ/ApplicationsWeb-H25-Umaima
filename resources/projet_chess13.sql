-- MySQL Workbench Forward Engineering

SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0;
SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0;
SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION';

-- -----------------------------------------------------
-- Schema mydb
-- -----------------------------------------------------
-- -----------------------------------------------------
-- Schema projet_chess
-- -----------------------------------------------------
DROP SCHEMA IF EXISTS `projet_chess` ;

-- -----------------------------------------------------
-- Schema projet_chess
-- -----------------------------------------------------
CREATE SCHEMA IF NOT EXISTS `projet_chess` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci ;
USE `projet_chess` ;

-- -----------------------------------------------------
-- Table `projet_chess`.`groupeprivileges`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `projet_chess`.`groupeprivileges` (
  `id` INT NOT NULL AUTO_INCREMENT COMMENT 'Le id du groupe.',
  `nom` VARCHAR(45) NULL DEFAULT NULL COMMENT 'Le nom du groupe qui va s\'afficher sur le site.',
  `id_usagercreation` INT NULL DEFAULT NULL COMMENT 'L\'id de l\'usager qui a créé ce groupe.',
  `datecreation` DATETIME NULL DEFAULT NULL COMMENT 'La date de la création du groupe.',
  PRIMARY KEY (`id`),
  INDEX `usagercreation_idx` (`id_usagercreation` ASC) VISIBLE,
  CONSTRAINT `groupeprivileges_usagercreation`
    FOREIGN KEY (`id_usagercreation`)
    REFERENCES `projet_chess`.`usager` (`id`))
ENGINE = InnoDB
DEFAULT CHARACTER SET = utf8mb4
COLLATE = utf8mb4_0900_ai_ci
COMMENT = 'Table décrivant les différentes groupes de privilèges intégrées dans le système d\'administration d\'accès du site.';


-- -----------------------------------------------------
-- Table `projet_chess`.`usager`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `projet_chess`.`usager` (
  `id` INT NOT NULL AUTO_INCREMENT COMMENT 'L\'id du compte usager.',
  `compte` VARCHAR(45) NULL DEFAULT NULL COMMENT 'Le nom d\'utilisateur.',
  `motdepasse` VARCHAR(45) NULL DEFAULT NULL COMMENT 'Le mot de passe haché.',
  `id_groupeprivileges` INT NULL DEFAULT NULL COMMENT 'Le groupe de privilèges dont apartient l\'utilisateur.',
  `datecreation` DATETIME NULL DEFAULT NULL COMMENT 'La date de création de l\'utilisateur.',
  `courriel` VARCHAR(45) NULL DEFAULT NULL COMMENT 'Le courriel de l\'usager en valeur varchar.',
  `pays` VARCHAR(2) NULL DEFAULT NULL,
  `sessionid` VARCHAR(256) NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  INDEX `usager_groupeprivileges_idx` (`id_groupeprivileges` ASC) VISIBLE,
  CONSTRAINT `usager_groupeprivileges`
    FOREIGN KEY (`id_groupeprivileges`)
    REFERENCES `projet_chess`.`groupeprivileges` (`id`))
ENGINE = InnoDB
AUTO_INCREMENT = 4
DEFAULT CHARACTER SET = utf8mb4
COLLATE = utf8mb4_0900_ai_ci
COMMENT = 'Table décrivant les comptes des usagers.';


-- -----------------------------------------------------
-- Table `projet_chess`.`profiljeu`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `projet_chess`.`profiljeu` (
  `id` INT NOT NULL AUTO_INCREMENT COMMENT 'L\'id du profil de jeu.',
  `id_usager` INT NULL DEFAULT NULL COMMENT 'L\'id de l\'usager à qui apartient ce profil.',
  `points` INT NULL DEFAULT NULL COMMENT 'Les points de monnaie fictive.',
  `elo` INT NULL DEFAULT NULL COMMENT 'La cote elo de l\'usager qui sera utilisée pour rendre possible la mise en rangs de celui-ci.',
  `datedernierjeu` DATETIME NULL DEFAULT NULL COMMENT 'La date du dernier jeu joué par l\'utilisateur.',
  PRIMARY KEY (`id`),
  UNIQUE INDEX `id_usager_UNIQUE` (`id_usager` ASC) VISIBLE,
  CONSTRAINT `profiljeu`
    FOREIGN KEY (`id_usager`)
    REFERENCES `projet_chess`.`usager` (`id`))
ENGINE = InnoDB
AUTO_INCREMENT = 4
DEFAULT CHARACTER SET = utf8mb4
COLLATE = utf8mb4_0900_ai_ci
COMMENT = 'Table décrivant les profils de jeu des utilisateurs en liaison one-to-one avec la table d\'usagers.';


-- -----------------------------------------------------
-- Table `projet_chess`.`partie`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `projet_chess`.`partie` (
  `id` INT NOT NULL AUTO_INCREMENT COMMENT 'L\'id de la partie.',
  `id_joueur1` INT NOT NULL COMMENT 'L\'id du joueur blanc.(-1 pour robot)',
  `id_joueur2` INT NOT NULL COMMENT 'L\'id du joueur noir.(-1 pour robot)',
  `historiquetables` LONGTEXT NULL DEFAULT NULL COMMENT 'En format json, nous persistons l\'historique des tables jouées par la partie dans le cas d\'un jeu en cours et même fini.',
  `statut` INT NOT NULL COMMENT 'Statut de la partie: pas débutée(0), en cours(1), finie(2).',
  `id_gagnant` INT NULL DEFAULT NULL COMMENT 'L\'id de l\'usager qui a gagné la partie.',
  `datedebut` DATETIME NULL DEFAULT NULL COMMENT 'La date de début de la partie.',
  `datefin` DATETIME NULL DEFAULT NULL COMMENT 'La date de la fin de la partie.',
  `id_joueurcourant` INT NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  INDEX `partie_joueur1_idx` (`id_joueur1` ASC) VISIBLE,
  INDEX `partie_joueur2_idx` (`id_joueur2` ASC) VISIBLE,
  INDEX `partie_gagnant_idx` (`id_gagnant` ASC) VISIBLE,
  INDEX `partie_joueurcourant_idx` (`id_joueurcourant` ASC) VISIBLE,
  CONSTRAINT `partie_gagnant`
    FOREIGN KEY (`id_gagnant`)
    REFERENCES `projet_chess`.`profiljeu` (`id`),
  CONSTRAINT `partie_joueur1`
    FOREIGN KEY (`id_joueur1`)
    REFERENCES `projet_chess`.`profiljeu` (`id`),
  CONSTRAINT `partie_joueur2`
    FOREIGN KEY (`id_joueur2`)
    REFERENCES `projet_chess`.`profiljeu` (`id`),
  CONSTRAINT `partie_joueurcourant`
    FOREIGN KEY (`id_joueurcourant`)
    REFERENCES `projet_chess`.`profiljeu` (`id`))
ENGINE = InnoDB
AUTO_INCREMENT = 5
DEFAULT CHARACTER SET = utf8mb4
COLLATE = utf8mb4_0900_ai_ci
COMMENT = 'Table décrivant les parties en cours de jeu et jouées dans le passé.';


-- -----------------------------------------------------
-- Table `projet_chess`.`completioncours`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `projet_chess`.`completioncours` (
  `id` INT NOT NULL AUTO_INCREMENT COMMENT 'L\'id de la completion du cours.',
  `id_cours` INT NULL DEFAULT NULL COMMENT 'L\'id du cours dont on essaie de compléter.',
  `id_partie` INT NULL DEFAULT NULL COMMENT 'L\'id de la partie qui décrit le statut de l\'examen du cours.',
  `etat` INT NULL DEFAULT NULL COMMENT 'L\'état de la complétion de ce cours. (0 pas débuté, 1 en cours, 3 complétée)',
  `noteexamen` FLOAT NULL DEFAULT NULL COMMENT 'La note résultat pour l\'examen du cours.',
  `datedebut` DATETIME NULL DEFAULT NULL COMMENT 'La date de début pour l\'examen du cours.',
  `datecompletion` DATETIME NULL DEFAULT NULL COMMENT 'La date de complétion pour l\'examen du cours.',
  PRIMARY KEY (`id`),
  INDEX `completioncours_partie_idx` (`id_partie` ASC) VISIBLE,
  CONSTRAINT `completioncours_partie`
    FOREIGN KEY (`id_partie`)
    REFERENCES `projet_chess`.`partie` (`id`))
ENGINE = InnoDB
DEFAULT CHARACTER SET = utf8mb4
COLLATE = utf8mb4_0900_ai_ci
COMMENT = 'Table qui marque la complétion d\'un cours ou l\'état de celle-ci.';


-- -----------------------------------------------------
-- Table `projet_chess`.`cours`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `projet_chess`.`cours` (
  `dateajout` DATETIME NOT NULL COMMENT 'La date d\'ajout sur le site.',
  `niveau` INT NULL DEFAULT NULL COMMENT 'Le niveau de difficulté du cours de 1 à 3.',
  `id_video` VARCHAR(256) NULL DEFAULT NULL COMMENT 'L\'id du vidéo du cours.',
  `cout` INT NOT NULL COMMENT 'Le coût du cours en points monnaie fictive.',
  `pagecontenu` LONGTEXT NULL DEFAULT NULL COMMENT 'La page en format markup du contenu du cours.',
  `id` INT NOT NULL AUTO_INCREMENT,
  `id_nom` VARCHAR(256) NOT NULL,
  PRIMARY KEY (`id`, `id_nom`),
  UNIQUE INDEX `nom_UNIQUE` (`id` ASC) VISIBLE,
  INDEX `videocours_idx` (`id_video` ASC) VISIBLE)
ENGINE = InnoDB
AUTO_INCREMENT = 7
DEFAULT CHARACTER SET = utf8mb4
COLLATE = utf8mb4_0900_ai_ci
COMMENT = 'Table décrivant les cours qui sont disponnibles à être consultés.';


-- -----------------------------------------------------
-- Table `projet_chess`.`privilege`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `projet_chess`.`privilege` (
  `id` INT NOT NULL AUTO_INCREMENT COMMENT 'L\'id du privilège.',
  `nom` VARCHAR(45) NULL DEFAULT NULL COMMENT 'Le nom unique du privilège.',
  PRIMARY KEY (`id`),
  UNIQUE INDEX `nom_UNIQUE` (`nom` ASC) VISIBLE)
ENGINE = InnoDB
DEFAULT CHARACTER SET = utf8mb4
COLLATE = utf8mb4_0900_ai_ci
COMMENT = 'Table qui décrit les privilèges disponnibles à être utilisées par le système afin de déterminer les accès des utilisateurs.';


-- -----------------------------------------------------
-- Table `projet_chess`.`groupeprivileges_privilege`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `projet_chess`.`groupeprivileges_privilege` (
  `id_groupeprivileges` INT NOT NULL COMMENT 'L\'id du groupe(many).',
  `id_privilege` INT NOT NULL COMMENT 'L\'id du privilège(many).',
  `id_usagerajout` INT NOT NULL COMMENT 'L\'id de l\'usager qui a décidé cet ajout de privilège.',
  `dateajout` DATETIME NOT NULL COMMENT 'La date qui marque le moment de l\'ajout du privilège.',
  PRIMARY KEY (`id_groupeprivileges`, `id_privilege`),
  INDEX `liaison_privilege_idx` (`id_privilege` ASC) VISIBLE,
  INDEX `usagerajout_idx` (`id_usagerajout` ASC) VISIBLE,
  CONSTRAINT `groupeprivileges_privilege_groupeprivileges`
    FOREIGN KEY (`id_groupeprivileges`)
    REFERENCES `projet_chess`.`groupeprivileges` (`id`),
  CONSTRAINT `groupeprivileges_privilege_privilege`
    FOREIGN KEY (`id_privilege`)
    REFERENCES `projet_chess`.`privilege` (`id`),
  CONSTRAINT `groupeprivileges_privilege_usagerajout`
    FOREIGN KEY (`id_usagerajout`)
    REFERENCES `projet_chess`.`usager` (`id`))
ENGINE = InnoDB
DEFAULT CHARACTER SET = utf8mb4
COLLATE = utf8mb4_0900_ai_ci
COMMENT = 'Table de liaison many-to-many pour marquer quels privilèges appartiennent à quel groupe.';


-- -----------------------------------------------------
-- Table `projet_chess`.`modedepaiement`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `projet_chess`.`modedepaiement` (
  `id` INT NOT NULL AUTO_INCREMENT COMMENT 'L\'id du mode de paiement.',
  `id_usagerparent` INT NOT NULL COMMENT 'L\'id de l\'usager à qui apartient ce mode de paiement.',
  `dateajout` DATETIME NOT NULL COMMENT 'La date de l\'ajout du mode de paiement.',
  `type` INT NOT NULL COMMENT 'Le type du mode de paiement: débit(1), crédit(2) et paypal(3).',
  `carte` VARCHAR(45) NOT NULL COMMENT 'L\'information de la carte(débit ou crédit) ou du courriel paypal.',
  `cvv` VARCHAR(3) NULL DEFAULT NULL COMMENT 'Dans le cas d\'une carte, le code de sécurité de 3 chifres.',
  `dateexpiration` DATETIME NULL DEFAULT NULL COMMENT 'Dans le cas d\'une carte, la date d\'expiration écrite sur la carte.',
  PRIMARY KEY (`id`),
  INDEX `usagerpaiement_idx` (`id_usagerparent` ASC) VISIBLE,
  CONSTRAINT `modedepaiement_usagerparent`
    FOREIGN KEY (`id_usagerparent`)
    REFERENCES `projet_chess`.`usager` (`id`))
ENGINE = InnoDB
DEFAULT CHARACTER SET = utf8mb4
COLLATE = utf8mb4_0900_ai_ci
COMMENT = 'Table qui décrit les modes de paiement ajoutés par l\'usager dans son compte.';


-- -----------------------------------------------------
-- Table `projet_chess`.`transaction`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `projet_chess`.`transaction` (
  `id` INT NOT NULL AUTO_INCREMENT COMMENT 'L\'id de la transaction.',
  `id_usager` INT NOT NULL COMMENT 'L\'id de l\'usager qui a effectué la transaction.',
  `montant` FLOAT NOT NULL COMMENT 'Le montant payé de la transaction en dollars canadiens.',
  `dateinitialisation` DATETIME NULL DEFAULT NULL COMMENT 'La date de l\'initialisation de la transaction.',
  `dateconfirmation` DATETIME NULL DEFAULT NULL COMMENT 'La date de confirmation de la transaction.',
  `id_modedepaiement` INT NOT NULL COMMENT 'L\'id du mode de paiement dans le compte de l\'usager pour pouvoir confirmer la transaction.',
  `id_cours` INT NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  INDEX `transaction_usager_idx` (`id_usager` ASC) VISIBLE,
  INDEX `transaction_modedepaiement_idx` (`id_modedepaiement` ASC) VISIBLE,
  CONSTRAINT `transaction_modedepaiement`
    FOREIGN KEY (`id_modedepaiement`)
    REFERENCES `projet_chess`.`modedepaiement` (`id`),
  CONSTRAINT `transaction_usager`
    FOREIGN KEY (`id_usager`)
    REFERENCES `projet_chess`.`usager` (`id`))
ENGINE = InnoDB
DEFAULT CHARACTER SET = utf8mb4
COLLATE = utf8mb4_0900_ai_ci
COMMENT = 'Table décrivant les différentes transactions effectuées par les usagers.';


-- -----------------------------------------------------
-- Table `projet_chess`.`video`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `projet_chess`.`video` (
  `id` VARCHAR(256) NOT NULL COMMENT 'L\'id de la vidéo.',
  `uri` VARCHAR(128) NULL DEFAULT NULL COMMENT 'L\'uri local pour trouver le fichier vidéo dans la persistence hdd.',
  `titre` VARCHAR(45) NOT NULL COMMENT 'Le titre de la vidéo.',
  `id_usagerajout` INT NOT NULL COMMENT 'L\'id de l\'usager qui a fait l\'ajout de la vidéo.',
  `dateajout` DATETIME NOT NULL COMMENT 'La date d\'ajout de la vidéo dans les ressources.',
  PRIMARY KEY (`id`),
  INDEX `video_usagerajout_idx` (`id_usagerajout` ASC) VISIBLE,
  CONSTRAINT `video_usagerajout`
    FOREIGN KEY (`id_usagerajout`)
    REFERENCES `projet_chess`.`usager` (`id`))
ENGINE = InnoDB
DEFAULT CHARACTER SET = utf8mb4
COLLATE = utf8mb4_0900_ai_ci
COMMENT = 'Table décrivant les donnés des vidéos stoqués par le controlleur de ressources.';


-- -----------------------------------------------------
-- Data for table `projet_chess`.`usager`
-- -----------------------------------------------------
START TRANSACTION;
USE `projet_chess`;
INSERT INTO `projet_chess`.`usager` (`id`, `compte`, `motdepasse`, `id_groupeprivileges`, `datecreation`, `courriel`, `pays`, `sessionid`) VALUES (-1, 'Robot', 'robot', NULL, NULL, 'robot@test.test', NULL, NULL);
INSERT INTO `projet_chess`.`usager` (`id`, `compte`, `motdepasse`, `id_groupeprivileges`, `datecreation`, `courriel`, `pays`, `sessionid`) VALUES (1, 'Gabriel', 'gabriel', NULL, NULL, 'gabriel@test.test', 'CA', NULL);
INSERT INTO `projet_chess`.`usager` (`id`, `compte`, `motdepasse`, `id_groupeprivileges`, `datecreation`, `courriel`, `pays`, `sessionid`) VALUES (2, 'Pro', 'pro', NULL, NULL, 'pro@test.test', 'CA', NULL);
INSERT INTO `projet_chess`.`usager` (`id`, `compte`, `motdepasse`, `id_groupeprivileges`, `datecreation`, `courriel`, `pays`, `sessionid`) VALUES (3, 'Noob', 'noob', NULL, NULL, 'noob@test.test', 'CA', NULL);

COMMIT;


-- -----------------------------------------------------
-- Data for table `projet_chess`.`profiljeu`
-- -----------------------------------------------------
START TRANSACTION;
USE `projet_chess`;
INSERT INTO `projet_chess`.`profiljeu` (`id`, `id_usager`, `points`, `elo`, `datedernierjeu`) VALUES (-1, -1, 0, 0, NULL);
INSERT INTO `projet_chess`.`profiljeu` (`id`, `id_usager`, `points`, `elo`, `datedernierjeu`) VALUES (1, 1, 100, 1200, NULL);
INSERT INTO `projet_chess`.`profiljeu` (`id`, `id_usager`, `points`, `elo`, `datedernierjeu`) VALUES (2, 2, 150, 1400, NULL);
INSERT INTO `projet_chess`.`profiljeu` (`id`, `id_usager`, `points`, `elo`, `datedernierjeu`) VALUES (3, 3, 200, 1500, NULL);

COMMIT;


-- -----------------------------------------------------
-- Data for table `projet_chess`.`partie`
-- -----------------------------------------------------
START TRANSACTION;
USE `projet_chess`;
INSERT INTO `projet_chess`.`partie` (`id`, `id_joueur1`, `id_joueur2`, `historiquetables`, `statut`, `id_gagnant`, `datedebut`, `datefin`, `id_joueurcourant`) VALUES (1, -1, 1, NULL, 0, NULL, NULL, NULL, -1);
INSERT INTO `projet_chess`.`partie` (`id`, `id_joueur1`, `id_joueur2`, `historiquetables`, `statut`, `id_gagnant`, `datedebut`, `datefin`, `id_joueurcourant`) VALUES (2, 1, 2, NULL, 0, NULL, NULL, NULL, 1);
INSERT INTO `projet_chess`.`partie` (`id`, `id_joueur1`, `id_joueur2`, `historiquetables`, `statut`, `id_gagnant`, `datedebut`, `datefin`, `id_joueurcourant`) VALUES (3, 2, 3, NULL, 0, NULL, NULL, NULL, 2);
INSERT INTO `projet_chess`.`partie` (`id`, `id_joueur1`, `id_joueur2`, `historiquetables`, `statut`, `id_gagnant`, `datedebut`, `datefin`, `id_joueurcourant`) VALUES (4, 3, -1, NULL, 0, NULL, NULL, NULL, 3);

COMMIT;


-- -----------------------------------------------------
-- Data for table `projet_chess`.`cours`
-- -----------------------------------------------------
START TRANSACTION;
USE `projet_chess`;
INSERT INTO `projet_chess`.`cours` (`dateajout`, `niveau`, `id_video`, `cout`, `pagecontenu`, `id`, `id_nom`) VALUES ('2025-03-19 00:00:00', 1, 'https://www.youtube.com/watch?v=_B3zJ9RZZqg', 0, 'When a game begins, each side starts with eight pawns. White\'s pawns are located on the second rank, while Black\'s pawns are located on the seventh rank. The pawn is the least powerful piece and is worth one point. If it is a pawn\'s first move, it can move forward one or two squares. If a pawn has already moved, then it can move forward just one square at a time. It attacks (or captures) each square diagonally to the left or right. In the following diagram, the pawn has just moved from the e2-square to the e4-square and attacks the squares d5 and f5.', 1, 'PAWN1');
INSERT INTO `projet_chess`.`cours` (`dateajout`, `niveau`, `id_video`, `cout`, `pagecontenu`, `id`, `id_nom`) VALUES ('2025-03-19 00:00:00', 1, 'https://www.youtube.com/watch?v=_y3eA21rD1w', 0, 'Each side starts with two bishops, one on a light square and one on a dark square. When a game begins, White\'s bishops are located on c1 and f1, while Black\'s bishops are located on c8 and f8. The bishop is considered a minor piece (like a knight) and is worth three points. A bishop can move diagonally as many squares as it likes, as long as it is not blocked by its own pieces or an occupied square. An easy way to remember how a bishop can move is that it moves like an \"X\" shape. It can capture an enemy piece by moving to the occupied square where the piece is located.', 2, 'BISHOP');
INSERT INTO `projet_chess`.`cours` (`dateajout`, `niveau`, `id_video`, `cout`, `pagecontenu`, `id`, `id_nom`) VALUES ('2025-03-19 00:00:00', 1, 'https://www.youtube.com/watch?v=VGoT8FR0O_8', 0, 'Each side starts with two knights—a king\'s knight and a queen\'s knight. When a game starts, White\'s knights are located on b1 and g1, while Black\'s knights are located on b8 and g8. The knight is considered a minor piece (like a bishop) and is worth three points. The knight is the only piece in chess that can jump over another piece! It moves one square left or right horizontally and then two squares up or down vertically, OR it moves two squares left or right horizontally and then one square up or down vertically—in other words, the knight moves in an \"L-shape.\" The knight can capture only what it lands on, not what it jumps over!', 3, 'KNIGHT');
INSERT INTO `projet_chess`.`cours` (`dateajout`, `niveau`, `id_video`, `cout`, `pagecontenu`, `id`, `id_nom`) VALUES ('2025-03-19 00:00:00', 1, 'https://www.youtube.com/watch?v=PlgnoYqsK-8', 0, 'Each side starts with two rooks, one on the queenside and one on the kingside. All four rooks are located in the corners of the board. White\'s rooks start the game on a1 and h1, while Black\'s rooks are located on a8 and h8. The rook is considered a major piece (like the queen) and is worth five points. It can move as many squares as it likes left or right horizontally, or as many squares as it likes up or down vertically (as long as it isn\'t blocked by other pieces). An easy way to remember how a rook can move is that it moves like a \"+\" sign.', 4, 'ROOK');
INSERT INTO `projet_chess`.`cours` (`dateajout`, `niveau`, `id_video`, `cout`, `pagecontenu`, `id`, `id_nom`) VALUES ('2025-03-19 00:00:00', 1, 'https://www.youtube.com/watch?v=vwgwI0wnULU', 0, 'The queen is the most powerful chess piece! When a game begins, each side starts with one queen. The white queen is located on d1, while the black queen is located on d8. The queen is considered a major piece (like a rook) and is worth nine points. It can move as many squares as it likes left or right horizontally, or as many squares as it likes up or down vertically (like a rook). The queen can also move as many squares as it likes diagonally (like a bishop). An easy way to remember how a queen can move is that it moves like a rook and a bishop combined!', 5, 'QUEEN');
INSERT INTO `projet_chess`.`cours` (`dateajout`, `niveau`, `id_video`, `cout`, `pagecontenu`, `id`, `id_nom`) VALUES ('2025-03-19 00:00:00', 1, 'https://www.youtube.com/watch?v=JWCbRxsybjg', 0, 'The king is the most important chess piece. Remember, the goal of a game of chess is to checkmate the king! When a game starts, each side has one king. White\'s king is located on e1, while Black\'s king starts on e8. The king is not a very powerful piece, as it can only move (or capture) one square in any direction. Please note that the king cannot be captured! When a king is attacked, it is called \"check.\"', 6, 'KING');

COMMIT;


SET SQL_MODE=@OLD_SQL_MODE;
SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS;
SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS;
