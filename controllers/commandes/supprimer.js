const commandeService = require('../../services/CommandeService');

const supprimerCommande = async (req, res) => {
    try {
        const { uuid } = req.params;
        await commandeService.deleteCommande(uuid);

        res.json({
            success: true,
            message: 'Commande supprimée avec succès'
        });
    } catch (error) {
        res.status(404).json({
            success: false,
            message: error.message
        });
    }
};

module.exports = supprimerCommande;