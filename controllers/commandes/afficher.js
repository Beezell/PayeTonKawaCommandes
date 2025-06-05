const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

// Afficher une commande par id avec ses produits
const afficher = async (req, res) => {
    try {
        const { uuid } = req.params;
        console.log("UUID de la commande à afficher:", uuid);
        
        // Validation de l'UUID
        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
        if (!uuidRegex.test(uuid)) {
            return res.status(400).json({
                success: false,
                message: 'UUID invalide'
            });
        }

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