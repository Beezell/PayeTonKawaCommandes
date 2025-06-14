const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

class CommandeService {
    async getAllCommandes() {
        try {
            return await prisma.commandes.findMany({
                include: {
                    produits: true
                },
                orderBy: {
                    created_at: 'desc'
                }
            });
        } catch (error) {
            throw new Error(`Erreur lors de la récupération des commandes: ${error.message}`);
        }
    }

    async getCommandeById(uuid) {
        try {

            const commande = await prisma.commandes.findUnique({
                where: { id: uuid },
                include: {
                    produits: true
                }
            });

            if (!commande) {
                throw new Error('Commande non trouvée');
            }

            return commande;
        } catch (error) {
            throw new Error(`Erreur lors de la récupération de la commande: ${error.message}`);
        }
    }

    async getCommandesByClientId(uuid) {
        try {
            return await prisma.commandes.findMany({
                where: { id_client: uuid },
                include: {
                    produits: true
                },
                orderBy: {
                    created_at: 'desc'
                }
            });
        } catch (error) {
            throw new Error(`Erreur lors de la récupération des commandes du client: ${error.message}`);
        }
    }

    async createCommande(commandeData) {
        try {
            const { produits, ...commandeInfo } = commandeData;
        
            return await prisma.commandes.create({
                data: {
                  mode_paiement: commandeInfo.mode_paiement,
                  statut: commandeInfo.statut,
                  montant: parseFloat(commandeInfo.montant) || 0,
                  id_client: commandeInfo.uuid,
                  produits: {
                    create: produits.map(produit => ({
                      id_prod: produit.id_prod,
                      quantite: parseInt(produit.quantite) || 1
                    }))
                  }
                },
                include: {
                  produits: true
                }
              });              
        } catch (error) {
            throw new Error(`Erreur lors de la création de la commande: ${error.message}`);
        }
    }

async updateCommande(uuid, commandeData) {
    try {
        const { produits, ...commandeInfo } = commandeData;

        await this.getCommandeById(uuid);

        const validCommandeFields = {};
        const allowedFields = ['id_client', 'statut', 'montant', 'mode_paiement'];
        
        allowedFields.forEach(field => {
            if (commandeInfo[field] !== undefined) {
                validCommandeFields[field] = commandeInfo[field];
            }
        });

        const updateData = {
            ...validCommandeFields
        };

        if (produits) {
            updateData.produits = {
                deleteMany: {},
                create: produits.map(produit => ({
                    id_prod: produit.id_prod || produit.uuid_produit,
                    quantite: parseInt(produit.quantite) || 1
                }))
            };
        }

        return await prisma.commandes.update({
            where: { id: uuid },
            data: updateData,
            include: {
                produits: true
            }
        });
    } catch (error) {
        throw new Error(`Erreur lors de la mise à jour de la commande: ${error.message}`);
    }
}

async deleteCommande(uuid) {
    try {
        await this.getCommandeById(uuid);

        const result = await prisma.$transaction(async (prisma) => {
            await prisma.produits_Commandes.deleteMany({
                where: {
                    id_commande: uuid
                }
            });

            await prisma.commandes.delete({
                where: {
                    id: uuid
                }
            });

            return { message: 'Commande supprimée avec succès' };
        });

        return result;
    } catch (error) {
        throw new Error(`Erreur lors de la suppression de la commande: ${error.message}`);
    }
}

    async validateCommandeData(commandeData) {
        const { uuid, statut, mode_paiement, produits } = commandeData;

        if (!uuid || !statut || !mode_paiement) {
            throw new Error('uuid, statut et mode_paiement sont requis');
        }


        if (!produits || !Array.isArray(produits) || produits.length === 0) {
            throw new Error('La commande doit contenir au moins un produit');
        }

        for (const produit of produits) {
            if (!produit.quantite || parseInt(produit.quantite) <= 0) {
                throw new Error('La quantité doit être un nombre positif');
            }
        }

        return true;
    }
}

module.exports = new CommandeService(); 