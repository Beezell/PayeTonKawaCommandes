const express = require('express');
const router = express.Router();

const authorized = require('../middleware/auth');

//controllers de commandes
const afficherAll = require('../controllers/commandes/afficherAll');

router.get('/afficherAll', authorized, afficherAll);

module.exports = router;