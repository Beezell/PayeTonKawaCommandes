const commandeService = require('../../services/CommandeService');

const supprimerCommande = async (req, res) => {
    try {
        const { uuid } = req.params;
        
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
            message: 'Commande supprimée avec succès'
        });
    } catch (error) {
        res.status(404).json({
            success: false,
            message: error.message
        });
    }
};

module.exports = supprimerCommande;