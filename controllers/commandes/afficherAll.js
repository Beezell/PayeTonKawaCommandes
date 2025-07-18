const commandeService = require('../../services/CommandeService');

const afficherAll = async (req, res) => {

  try {
    const commandes = await commandeService.getAllCommandes();
    
    res.json({
      success: true,
      data: commandes,
      count: commandes.length
    });
  } catch (error) {
    console.error('Erreur:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

module.exports = afficherAll;