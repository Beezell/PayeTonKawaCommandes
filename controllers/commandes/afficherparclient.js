const commandeService = require('../../services/CommandeService');

const afficherCommandesParClient = async (req, res) => {
    try {
        const { idClient } = req.params;

        const commandes = await prisma.commandes.findMany({
            where: {
                id_client: idClient
            },
            include: {
                produits: true  // inclure les produits associés à chaque commande
            }
        });

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
        res.status(404).json({
            success: false,
            message: error.message
        });
    }
};

module.exports = afficherCommandesParClient;
