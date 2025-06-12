const commandeService = require('../../services/CommandeService');

const supprimerCommande = async (req, res) => {
    try {
        const { uuid_commande } = req.params;
        await commandeService.deleteCommande(uuid_commande);
        
        res.json({
            success: true,
            message: 'Commande supprimée avec succès'
        });
    } catch (error) {
        res.status(error.message.includes('UUID invalide') ? 400 : 404).json({
            success: false,
            message: error.message
        });
    }
};

module.exports = supprimerCommande;