const commandeService = require('../../services/CommandeService');
const rabbitmq = require('../../services/rabbitmqService');

const supprimerCommande = async (req, res) => {
    try {
        const { uuid_commande } = req.params;
        await commandeService.deleteCommande(uuid_commande);

        await rabbitmq.publishOrderDeleted(uuid_commande);

        res.status(200).json({
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