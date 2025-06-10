const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

// Afficher toutes les commandes d’un client par son ID
const afficherParClient = async (req, res) => {
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
        console.error('Erreur:', error);
        res.status(500).json({
            success: false,
            message: 'Erreur serveur'
        });
    }
};

module.exports = afficherParClient;
