const commandeService = require('../../services/CommandeService');

const afficherCommandesParClient = async (req, res) => {
    try {
        const { uuid_client } = req.params;
        const commandes = await commandeService.getCommandesByClientId(uuid_client);
        
        res.json({
            success: true,
            data: commandes
        });
    } catch (error) {
        res.status(404).json({
            success: false,
            message: error.message
        });
    }
};

module.exports = afficherCommandesParClient;
