const commandeService = require('../../services/CommandeService');

const ajouterCommande = async (req, res) => {
    try {
        const commandeData = req.body;

        await commandeService.validateCommandeData(commandeData);

        const nouvelleCommande = await commandeService.createCommande(commandeData);

        res.status(200).json({
            success: true,
            data: nouvelleCommande
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

module.exports = ajouterCommande;