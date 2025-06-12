const commandeService = require('../../services/CommandeService');

const afficherCommande = async (req, res) => {
    try {
        const { uuid_commande } = req.params;
        const commande = await commandeService.getCommandeById(uuid_commande);
        
        res.json({
            success: true,
            data: commande
        });
    } catch (error) {
        res.status(404).json({
            success: false,
            message: error.message
        });
    }
};

module.exports = afficherCommande;