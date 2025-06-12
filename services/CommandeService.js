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

    async getCommandeById(uuid_commande) {
        try {
            if (!this.isValidUUID(uuid_commande)) {
                throw new Error('UUID invalide');
            }

            const commande = await prisma.commandes.findUnique({
                where: { uuid: uuid_commande },
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

    async getCommandesByClientId(uuid_client) {
        try {
            if (!this.isValidUUID(uuid_client)) {
                throw new Error('UUID du client invalide');
            }

            return await prisma.commandes.findMany({
                where: { uuid_client: uuid_client },
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

            if (!this.isValidUUID(commandeInfo.uuid_client)) {
                throw new Error('UUID du client invalide');
            }

            if (produits) {
                for (const produit of produits) {
                    if (!this.isValidUUID(produit.uuid_produit)) {
                        throw new Error('UUID de produit invalide');
                    }
                }
            }
        
            return await prisma.commandes.create({
                data: {
                  mode_paiement: commandeInfo.mode_paiement,
                  statut: commandeInfo.statut,
                  id_client: commandeInfo.uuid_client,
                  produits: {
                    create: produits.map(produit => ({
                      id_prod: produit.uuid_produit,
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

    async updateCommande(uuid_commande, commandeData) {
        try {
            if (!this.isValidUUID(uuid_commande)) {
                throw new Error('UUID invalide');
            }

            const { produits, ...commandeInfo } = commandeData;

            if (commandeInfo.uuid_client && !this.isValidUUID(commandeInfo.uuid_client)) {
                throw new Error('UUID du client invalide');
            }

            if (produits) {
                for (const produit of produits) {
                    if (!this.isValidUUID(produit.uuid_produit)) {
                        throw new Error('UUID de produit invalide');
                    }
                }
            }

            await this.getCommandeById(uuid_commande);

            return await prisma.commandes.update({
                where: { uuid: uuid_commande },
                data: {
                    ...commandeInfo,
                    produits: produits ? {
                        deleteMany: {},
                        create: produits.map(produit => ({
                            uuid_produit: produit.uuid_produit,
                            quantite: parseInt(produit.quantite) || 1
                        }))
                    } : undefined
                },
                include: {
                    produits: true
                }
            });
        } catch (error) {
            throw new Error(`Erreur lors de la mise à jour de la commande: ${error.message}`);
        }
    }

    async deleteCommande(uuid_commande) {
        try {
            if (!this.isValidUUID(uuid_commande)) {
                throw new Error('UUID invalide');
            }

            await this.getCommandeById(uuid_commande);

            await prisma.commandes.delete({
                where: { uuid: uuid_commande }
            });

            return true;
        } catch (error) {
            throw new Error(`Erreur lors de la suppression de la commande: ${error.message}`);
        }
    }

    async validateCommandeData(commandeData) {
        const { uuid_client, statut, mode_paiement, produits } = commandeData;

        if (!uuid_client || !statut || !mode_paiement) {
            throw new Error('uuid_client, statut et mode_paiement sont requis');
        }

        if (!this.isValidUUID(uuid_client)) {
            throw new Error('UUID du client invalide');
        }

        if (!produits || !Array.isArray(produits) || produits.length === 0) {
            throw new Error('La commande doit contenir au moins un produit');
        }

        for (const produit of produits) {
            if (!produit.uuid_produit || !this.isValidUUID(produit.uuid_produit)) {
                throw new Error('UUID de produit invalide');
            }
            if (!produit.quantite || parseInt(produit.quantite) <= 0) {
                throw new Error('La quantité doit être un nombre positif');
            }
        }

        return true;
    }

    isValidUUID(uuid) {
        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
        return uuidRegex.test(uuid);
    }
}

module.exports = new CommandeService(); 