const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

// Supprimer une commande avec suppression en cascade
const supprimer = async (req, res) => {
    try {
        const { uuid } = req.params;
        console.log("UUID de la commande à supprimer:", uuid);
        
        // Validation de l'UUID
        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
        if (!uuidRegex.test(uuid)) {
            return res.status(400).json({
                success: false,
                message: 'UUID invalide'
            });
        }
        
        // Vérifier si la commande existe
        const commandeExistante = await prisma.commandes.findUnique({
            where: { id: uuid },
            include: {
                produits: true
            }
        });
        
        if (!commandeExistante) {
            return res.status(404).json({
                success: false,
                message: 'Commande non trouvée'
            });
        }
        
        // Suppression en cascade avec transaction
        const result = await prisma.$transaction(async (prisma) => {
            //Suppression des produits associés à la commande
            await prisma.produits_Commandes.deleteMany({
                where: {
                    id_commande: uuid
                }
            });
            
            //Suppression de la commande
            const commandeSupprimee = await prisma.commandes.delete({
                where: {
                    id: uuid
                }
            });
            
            return commandeSupprimee;
        });
        
        res.json({
            success: true,
            data: result,
            message: `Commande supprimée avec succès (${commandeExistante.produits.length} produit(s) associé(s) également supprimé(s))`
        });
        
    } catch (error) {
        console.error('Erreur lors de la suppression:', error);
        
        // Gestion d'erreurs spécifiques
        if (error.code === 'P2025') {
            return res.status(404).json({
                success: false,
                message: 'Commande non trouvée'
            });
        }
        
        res.status(500).json({
            success: false,
            message: 'Erreur serveur lors de la suppression'
        });
    }
};

module.exports = supprimer;