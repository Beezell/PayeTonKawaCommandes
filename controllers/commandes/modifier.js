const commandeService = require('../../services/CommandeService');
const rabbitmq = require('../../services/rabbitmqService');
const { messagesSent, messagesReceived } = require('../../metrics');

const modifierCommande = async (req, res) => {
    try {
        const { uuid } = req.params;
        const commandeData = req.body;

        await commandeService.validateCommandeData(commandeData);

        const commande = await commandeService.updateCommande(uuid, commandeData);

        if (!commande) {
            return res.status(404).json({
                success: false,
                message: 'Commande non trouvée'
            });
        }

        await rabbitmq.publishOrderUpdated(commande);
        messagesSent.inc({ queue: 'order.updated' });

        if (commandeData.statut && commandeData.statut !== commande.statut) {
            await rabbitmq.publishOrderStatusChanged({
                orderId: uuid,
                oldStatus: commande.statut,
                newStatus: commandeData.statut
            });
            messagesSent.inc({ queue: 'order.status.changed' });
        }

        res.status(200).json({
            success: true,
            data: commande,
            message: 'Commande modifiée avec succès'
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

module.exports = modifierCommande;