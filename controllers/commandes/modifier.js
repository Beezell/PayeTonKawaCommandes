const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

// Modifier une commande
const modifier = async (req, res) => {
    try {
        const { uuid } = req.params;
        const { id_client, statut, montant, mode_paiement, produits } = req.body;
        console.log("Modifier la commande:", uuid, req.body);
        
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
        
        // Validation de l'UUID client
        if (id_client && !uuidRegex.test(id_client)) {
            return res.status(400).json({
                success: false,
                message: 'UUID du client invalide'
            });
        }
        
        // Validation du tableau produits
        if (produits && !Array.isArray(produits)) {
            return res.status(400).json({
                success: false,
                message: 'Le champ produits doit être un tableau'
            });
        }
        
        // Préparer les données à mettre à jour
        const dataToUpdate = {};
        if (id_client !== undefined) dataToUpdate.id_client = id_client;
        if (statut !== undefined) dataToUpdate.statut = statut;
        if (montant !== undefined) dataToUpdate.montant = parseFloat(montant);
        if (mode_paiement !== undefined) dataToUpdate.mode_paiement = mode_paiement;
        
        // Modification avec transaction
        const result = await prisma.$transaction(async (prisma) => {
            // Mettre à jour la commande
            const commandeModifiee = await prisma.commandes.update({
                where: { id: uuid },
                data: dataToUpdate
            });
            
            // Gérer les produits si fournis
            if (produits !== undefined) {
                // Supprimer tous les anciens produits de la commande
                await prisma.produits_Commandes.deleteMany({
                    where: {
                        id_commande: uuid
                    }
                });
                
                // Ajouter les nouveaux produits si le tableau n'est pas vide
                if (produits.length > 0) {
                    const produitsCommande = produits.map(produit => ({
                        id_commande: uuid,
                        id_prod: produit.id_prod,
                        quantite: parseInt(produit.quantite) || 1
                    }));
                    
                    await prisma.produits_Commandes.createMany({
                        data: produitsCommande
                    });
                }
            }
            
            // Retourner la commande mise à jour avec ses produits
            return await prisma.commandes.findUnique({
                where: { id: uuid },
                include: {
                    produits: true
                }
            });
        });
        
        res.json({
            success: true,
            data: result,
            message: 'Commande modifiée avec succès'
        });
        
    } catch (error) {
        console.error('Erreur lors de la modification:', error);
        
        // Gestion d'erreurs spécifiques
        if (error.code === 'P2025') {
            return res.status(404).json({
                success: false,
                message: 'Commande non trouvée'
            });
        }
        
        if (error.code === 'P2002') {
            return res.status(409).json({
                success: false,
                message: 'Conflit de données (contrainte unique violée)'
            });
        }
        
        res.status(500).json({
            success: false,
            message: 'Erreur serveur lors de la modification'
        });
    }
};

module.exports = modifier;