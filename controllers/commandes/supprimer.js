const commandeService = require('../../services/CommandeService');
const rabbitmq = require('../../services/rabbitmqService');
const { messagesSent, messagesReceived } = require('../../metrics');

const supprimerCommande = async (req, res) => {
    try {
        const { uuid } = req.params;
        await commandeService.deleteCommande(uuid);

        await rabbitmq.publishOrderDeleted(uuid);
        messagesSent.inc({ queue: 'order.deleted' });

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