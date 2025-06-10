const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

// Afficher une commande par id avec ses produits
const afficher = async (req, res) => {
    try {
        const { uuid } = req.params;

        const commande = await prisma.commandes.findUnique({
            where: {
                id: uuid
            },
            include: {
                produits: true  // on affiche aussi les produits associés à la commande
            }
        });

        if (!commande) {
            return res.status(404).json({
                success: false,
                message: 'Commande non trouvée'
            });
        }

        res.json({
            success: true,
            data: commande
        });
    } catch (error) {
        console.error('Erreur:', error);
        res.status(500).json({
            success: false,
            message: 'Erreur serveur'
        });
    }
};

module.exports = afficher;