const commandeService = require('../../services/CommandeService');

const afficherCommandesParClient = async (req, res) => {
    try {
        const { uuid } = req.params;
        const commandes = await commandeService.getCommandesByClientId(uuid);
        
        if (commandes.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Aucune commande trouvée pour ce client'
            });
        }

        res.json({
            success: true,
            data: commandes
        });
    } catch (error) {
        res.status(error.message.includes('UUID invalide') ? 400 : 404).json({
            success: false,
            message: error.message
        });
    }
};

module.exports = afficherCommandesParClient;
