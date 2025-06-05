const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

// Afficher toutes les commandes d’un client par son ID
const afficherParClient = async (req, res) => {
    try {
        const { idClient } = req.params;
        console.log("ID du client à afficher:", idClient);

        // Validation de l'UUID
        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
        if (!uuidRegex.test(idClient)) {
            return res.status(400).json({
                success: false,
                message: 'UUID client invalide'
            });
        }

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
