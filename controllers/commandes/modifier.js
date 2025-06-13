const commandeService = require('../../services/CommandeService');
const rabbitmq = require('../../services/rabbitmqService');

const modifierCommande = async (req, res) => {
    try {
        const { uuid_commande } = req.params;
        const commandeData = req.body;

        await commandeService.validateCommandeData(commandeData);

        const commande = await commandeService.updateCommande(uuid_commande, commandeData);

        if (!commande) {
            return res.status(404).json({
                success: false,
                message: 'Commande non trouvée'
            });
        }

        await rabbitmq.publishOrderUpdated(commande);

        if (commandeData.statut && commandeData.statut !== commande.statut) {
            await rabbitmq.publishOrderStatusChanged({
                orderId: uuid_commande,
                oldStatus: commande.statut,
                newStatus: commandeData.statut
            });
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