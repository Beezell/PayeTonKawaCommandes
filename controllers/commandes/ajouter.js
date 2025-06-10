const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

// Ajouter une commande
const ajouter = async (req, res) => {
    
    try {
        const { id_client, statut, montant, mode_paiement, produits } = req.body;
        
        // Validation des champs requis
        if (!id_client || !statut || !mode_paiement) {
            return res.status(400).json({
                success: false,
                message: 'id_client, statut et mode_paiement sont requis'
            });
        }
        
        // Validation de l'UUID du client
        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
        if (!uuidRegex.test(id_client)) {
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
        
        // Création de la commande avec transaction pour assurer la cohérence
        const result = await prisma.$transaction(async (prisma) => {
            // Créer la commande
            const nouvelleCommande = await prisma.commandes.create({
                data: {
                    id_client,
                    statut,
                    montant: parseFloat(montant) || 0.0,
                    mode_paiement
                }
            });
            
            // Ajouter les produits à la commande si ils sont fournis
            if (produits && produits.length > 0) {
                const produitsCommande = produits.map(produit => ({
                    id_commande: nouvelleCommande.id,
                    id_prod: produit.id_prod,
                    quantite: parseInt(produit.quantite) || 1
                }));
                
                await prisma.produits_Commandes.createMany({
                    data: produitsCommande
                });
            }
            
            // Retourner la commande avec ses produits
            return await prisma.commandes.findUnique({
                where: { id: nouvelleCommande.id },
                include: {
                    produits: true
                }
            });
        });
        
        res.status(201).json({
            success: true,
            data: result,
            message: 'Commande créée avec succès'
        });
        
    } catch (error) {
        console.error('Erreur:', error);
        res.status(500).json({
            success: false,
            message: 'Erreur serveur'
        });
    }
};

module.exports = ajouter;