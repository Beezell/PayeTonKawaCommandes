const express = require('express');
const router = express.Router();

const authorized = require('../middleware/auth');

//controllers de commandes
const afficherAll = require('../controllers/commandes/afficherAll');
const afficher = require('../controllers/commandes/afficher.js');
const ajouter = require('../controllers/commandes/ajouter');
const supprimer = require('../controllers/commandes/supprimer');
const modifier = require('../controllers/commandes/modifier');

router.get('/afficherAll', authorized, afficherAll);
router.get('/afficher/:uuid', authorized , afficher);
router.post('/ajouter', authorized, ajouter);
router.put('/modifier/:uuid', authorized, modifier);
router.delete('/supprimer/:uuid', authorized, supprimer);

module.exports = router;