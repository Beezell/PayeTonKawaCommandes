const commandeService = require('../../services/CommandeService');

const modifierCommande = async (req, res) => {
    try {
        const { uuid } = req.params;
        const commandeData = req.body;

        await commandeService.validateCommandeData(commandeData);
        const commandeModifiee = await commandeService.updateCommande(uuid, commandeData);

        res.json({
            success: true,
            data: commandeModifiee
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

module.exports = modifierCommande;