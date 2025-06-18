const express = require('express');
const router = express.Router();

const { authorized, adminOnly, authorizedRole } = require("../middleware/auth");
const validateUUID = require('../middleware/uuidValidation.js');

//controllers de commandes
const afficherAll = require('../controllers/commandes/afficherAll');
const afficher = require('../controllers/commandes/afficher.js');
const afficherParClient = require('../controllers/commandes/afficherparclient');
const ajouter = require('../controllers/commandes/ajouter');
const supprimer = require('../controllers/commandes/supprimer');
const modifier = require('../controllers/commandes/modifier');

router.get('/afficherAll', adminOnly, afficherAll);
router.get('/afficher/:uuid', authorized, validateUUID, afficher);
router.get('/afficherparclient/:uuid', validateUUID, authorized, afficherParClient);
router.post('/ajouter', ajouter);
router.put('/modifier/:uuid', adminOnly, validateUUID, modifier);
router.delete('/supprimer/:uuid', adminOnly, validateUUID, supprimer);

/**
 * @swagger
 * /commande/afficher:
 *   get:
 *     summary: Afficher toutes les commandes
 *     description: Récupère la liste complète des commandes avec les produits associés à chacune d'elles, triées par date de création décroissante
 *     tags:
 *       - Commandes
 *     responses:
 *       200:
 *         description: Liste des commandes récupérée avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 count:
 *                   type: integer
 *                   description: Nombre total de commandes
 *                   example: 3
 *                 data:
 *                   type: array
 *                   description: Liste des commandes
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                         format: uuid
 *                         description: Identifiant de la commande
 *                         example: 32db04f8-dd06-49bb-9215-613a18b3d20b
 *                       created_at:
 *                         type: string
 *                         format: date-time
 *                         description: Date de création
 *                         example: "2025-06-04T07:00:54.299Z"
 *                       id_client:
 *                         type: string
 *                         format: uuid
 *                         description: Identifiant du client
 *                         example: 550e8400-e29b-41d4-a716-446655440000
 *                       statut:
 *                         type: string
 *                         description: Statut de la commande
 *                         example: "payee"
 *                       montant:
 *                         type: number
 *                         format: float
 *                         description: Montant total de la commande
 *                         example: 95.75
 *                       mode_paiement:
 *                         type: string
 *                         description: Mode de paiement
 *                         example: "virement"
 *                       produits:
 *                         type: array
 *                         description: Produits associés à la commande
 *                         items:
 *                           type: object
 *                           properties:
 *                             id:
 *                               type: integer
 *                               description: Identifiant de la ligne produit
 *                               example: 5
 *                             id_commande:
 *                               type: string
 *                               format: uuid
 *                               description: UUID de la commande associée
 *                               example: 32db04f8-dd06-49bb-9215-613a18b3d20b
 *                             id_prod:
 *                               type: string
 *                               format: uuid
 *                               description: Identifiant du produit
 *                               example: 999e8888-e89b-12d3-a456-426614174003
 *                             quantite:
 *                               type: integer
 *                               description: Quantité commandée
 *                               example: 2
 *       500:
 *         description: Erreur serveur interne
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Erreur serveur"
 */


/**
 * @swagger
 * /commande/afficher/{uuid}:
 *   get:
 *     summary: Afficher une commande par UUID
 *     description: Récupère les détails d'une commande spécifique ainsi que ses produits associés, en utilisant son identifiant UUID
 *     tags:
 *       - Commandes
 *     parameters:
 *       - in: path
 *         name: uuid
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: L'identifiant unique de la commande
 *         example: 32db04f8-dd06-49bb-9215-613a18b3d20b
 *     responses:
 *       200:
 *         description: Commande trouvée avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       format: uuid
 *                       description: Identifiant de la commande
 *                       example: 32db04f8-dd06-49bb-9215-613a18b3d20b
 *                     created_at:
 *                       type: string
 *                       format: date-time
 *                       description: Date de création de la commande
 *                       example: "2025-06-04T07:00:54.299Z"
 *                     id_client:
 *                       type: string
 *                       format: uuid
 *                       description: Identifiant du client
 *                       example: 550e8400-e29b-41d4-a716-446655440000
 *                     statut:
 *                       type: string
 *                       description: Statut de la commande
 *                       example: "payee"
 *                     montant:
 *                       type: number
 *                       format: float
 *                       description: Montant total de la commande
 *                       example: 95.75
 *                     mode_paiement:
 *                       type: string
 *                       description: Mode de paiement utilisé
 *                       example: "virement"
 *                     produits:
 *                       type: array
 *                       description: Liste des produits de la commande
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: integer
 *                             description: Identifiant de l'entrée produit dans la commande
 *                             example: 5
 *                           id_commande:
 *                             type: string
 *                             format: uuid
 *                             description: Identifiant de la commande
 *                             example: 32db04f8-dd06-49bb-9215-613a18b3d20b
 *                           id_prod:
 *                             type: string
 *                             format: uuid
 *                             description: Identifiant du produit
 *                             example: 999e8888-e89b-12d3-a456-426614174003
 *                           quantite:
 *                             type: integer
 *                             description: Quantité du produit commandée
 *                             example: 1
 *       400:
 *         description: UUID invalide
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "UUID invalide"
 *       404:
 *         description: Commande non trouvée
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Commande non trouvée"
 *       500:
 *         description: Erreur serveur interne
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Erreur serveur"
 */

/**
 * @swagger
 * /commandes/client/{idClient}:
 *   get:
 *     summary: Afficher toutes les commandes d'un client
 *     description: Récupère l'ensemble des commandes associées à un client spécifique, en utilisant son identifiant UUID. Chaque commande inclut les produits commandés.
 *     tags:
 *       - Commandes
 *     parameters:
 *       - in: path
 *         name: idClient
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: L'identifiant unique du client
 *         example: 550e8400-e29b-41d4-a716-446655440000
 *     responses:
 *       200:
 *         description: Commandes trouvées avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                         format: uuid
 *                         example: 32db04f8-dd06-49bb-9215-613a18b3d20b
 *                       created_at:
 *                         type: string
 *                         format: date-time
 *                         example: "2025-06-04T07:00:54.299Z"
 *                       id_client:
 *                         type: string
 *                         format: uuid
 *                         example: 550e8400-e29b-41d4-a716-446655440000
 *                       statut:
 *                         type: string
 *                         example: "en_attente"
 *                       montant:
 *                         type: number
 *                         format: float
 *                         example: 120.5
 *                       mode_paiement:
 *                         type: string
 *                         example: "carte"
 *                       produits:
 *                         type: array
 *                         items:
 *                           type: object
 *                           properties:
 *                             id:
 *                               type: integer
 *                               example: 1
 *                             id_commande:
 *                               type: string
 *                               format: uuid
 *                               example: 32db04f8-dd06-49bb-9215-613a18b3d20b
 *                             id_prod:
 *                               type: string
 *                               format: uuid
 *                               example: 999e8888-e89b-12d3-a456-426614174003
 *                             quantite:
 *                               type: integer
 *                               example: 2
 *       400:
 *         description: UUID client invalide
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "UUID client invalide"
 *       404:
 *         description: Aucune commande trouvée pour ce client
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Aucune commande trouvée pour ce client"
 *       500:
 *         description: Erreur serveur interne
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Erreur serveur"
 */


/**
 * @swagger
 * /commande/ajouter:
 *   post:
 *     summary: Ajouter une commande
 *     description: Crée une nouvelle commande avec ses produits associés si fournis
 *     tags:
 *       - Commandes
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - id_client
 *               - statut
 *               - mode_paiement
 *             properties:
 *               id_client:
 *                 type: string
 *                 format: uuid
 *                 description: "UUID du client passant la commande"
 *                 example: 550e8400-e29b-41d4-a716-446655440000
 *               statut:
 *                 type: string
 *                 description: "Statut de la commande (ex: \"en_attente\", \"payee\", \"annulee\")"
 *                 example: payee
 *               montant:
 *                 type: number
 *                 format: float
 *                 description: "Montant total de la commande"
 *                 example: 95.75
 *               mode_paiement:
 *                 type: string
 *                 description: "Mode de paiement utilisé (ex: \"carte\", \"virement\", \"espèces\")"
 *                 example: virement
 *               produits:
 *                 type: array
 *                 description: "Liste des produits associés à la commande"
 *                 items:
 *                   type: object
 *                   required:
 *                     - id_prod
 *                     - quantite
 *                   properties:
 *                     id_prod:
 *                       type: string
 *                       format: uuid
 *                       description: "UUID du produit commandé"
 *                       example: 999e8888-e89b-12d3-a456-426614174003
 *                     quantite:
 *                       type: integer
 *                       description: "Quantité commandée du produit"
 *                       example: 2
 *     responses:
 *       201:
 *         description: "Commande créée avec succès"
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Commande créée avec succès"
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       format: uuid
 *                       example: 32db04f8-dd06-49bb-9215-613a18b3d20b
 *                     created_at:
 *                       type: string
 *                       format: date-time
 *                       example: "2025-06-04T07:00:54.299Z"
 *                     id_client:
 *                       type: string
 *                       format: uuid
 *                       example: 550e8400-e29b-41d4-a716-446655440000
 *                     statut:
 *                       type: string
 *                       example: "payee"
 *                     montant:
 *                       type: number
 *                       format: float
 *                       example: 95.75
 *                     mode_paiement:
 *                       type: string
 *                       example: "virement"
 *                     produits:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: integer
 *                             example: 5
 *                           id_commande:
 *                             type: string
 *                             format: uuid
 *                             example: 32db04f8-dd06-49bb-9215-613a18b3d20b
 *                           id_prod:
 *                             type: string
 *                             format: uuid
 *                             example: 999e8888-e89b-12d3-a456-426614174003
 *                           quantite:
 *                             type: integer
 *                             example: 2
 *       400:
 *         description: "Requête invalide (UUID mal formé ou champs requis manquants)"
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "id_client, statut et mode_paiement sont requis"
 *       500:
 *         description: "Erreur serveur interne"
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Erreur serveur"
 */

/**
 * @swagger
 * /commande/modifier/{uuid}:
 *   put:
 *     summary: Modifier une commande
 *     description: Met à jour une commande existante avec les champs fournis, et remplace les produits si spécifiés.
 *     tags:
 *       - Commandes
 *     parameters:
 *       - in: path
 *         name: uuid
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: "UUID de la commande à modifier"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               id_client:
 *                 type: string
 *                 format: uuid
 *                 description: "UUID du client (optionnel)"
 *                 example: "550e8400-e29b-41d4-a716-446655440000"
 *               statut:
 *                 type: string
 *                 description: "Statut mis à jour (ex: \"en_attente\", \"payee\", \"annulee\")"
 *                 example: "en_attente"
 *               montant:
 *                 type: number
 *                 format: float
 *                 description: "Montant mis à jour"
 *                 example: 120.50
 *               mode_paiement:
 *                 type: string
 *                 description: "Mode de paiement mis à jour (ex: \"carte\", \"virement\", \"espèces\")"
 *                 example: "carte"
 *               produits:
 *                 type: array
 *                 description: "Liste complète des produits à associer (remplace les anciens)"
 *                 items:
 *                   type: object
 *                   required:
 *                     - id_prod
 *                     - quantite
 *                   properties:
 *                     id_prod:
 *                       type: string
 *                       format: uuid
 *                       description: "UUID du produit"
 *                       example: "123e4567-e89b-12d3-a456-426614174000"
 *                     quantite:
 *                       type: integer
 *                       description: "Quantité du produit"
 *                       example: 3
 *     responses:
 *       200:
 *         description: "Commande modifiée avec succès"
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Commande modifiée avec succès"
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       format: uuid
 *                       example: "32db04f8-dd06-49bb-9215-613a18b3d20b"
 *                     id_client:
 *                       type: string
 *                       format: uuid
 *                       example: "550e8400-e29b-41d4-a716-446655440000"
 *                     statut:
 *                       type: string
 *                       example: "en_attente"
 *                     montant:
 *                       type: number
 *                       format: float
 *                       example: 120.50
 *                     mode_paiement:
 *                       type: string
 *                       example: "carte"
 *                     produits:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id_commande:
 *                             type: string
 *                             format: uuid
 *                             example: "32db04f8-dd06-49bb-9215-613a18b3d20b"
 *                           id_prod:
 *                             type: string
 *                             format: uuid
 *                             example: "123e4567-e89b-12d3-a456-426614174000"
 *                           quantite:
 *                             type: integer
 *                             example: 3
 *       400:
 *         description: "UUID invalide ou données mal formées"
 *       404:
 *         description: "Commande non trouvée"
 *       409:
 *         description: "Conflit de données (ex: contrainte unique violée)"
 *       500:
 *         description: "Erreur serveur lors de la modification"
 */

/**
 * @swagger
 * /commande/supprimer/{uuid}:
 *   delete:
 *     summary: Supprimer une commande
 *     description: Supprime une commande existante ainsi que tous les produits qui y sont associés (suppression en cascade).
 *     tags:
 *       - Commandes
 *     parameters:
 *       - in: path
 *         name: uuid
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: "UUID de la commande à supprimer"
 *     responses:
 *       200:
 *         description: "Commande supprimée avec succès"
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Commande supprimée avec succès (2 produit(s) associé(s) également supprimé(s))"
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       format: uuid
 *                       example: "32db04f8-dd06-49bb-9215-613a18b3d20b"
 *                     id_client:
 *                       type: string
 *                       format: uuid
 *                       example: "550e8400-e29b-41d4-a716-446655440000"
 *                     statut:
 *                       type: string
 *                       example: "payee"
 *                     montant:
 *                       type: number
 *                       format: float
 *                       example: 180.00
 *                     mode_paiement:
 *                       type: string
 *                       example: "carte"
 *       400:
 *         description: "UUID invalide"
 *       404:
 *         description: "Commande non trouvée"
 *       500:
 *         description: "Erreur serveur lors de la suppression"
 */



module.exports = router;