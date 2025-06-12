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
            if (!this.isValidUUID(uuid)) {
                throw new Error('UUID invalide');
            }

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

    async getCommandesByClientId(clientUuid) {
        try {
            if (!this.isValidUUID(clientUuid)) {
                throw new Error('UUID du client invalide');
            }

            return await prisma.commandes.findMany({
                where: { id_client: clientUuid },
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

            if (!this.isValidUUID(commandeInfo.id_client)) {
                throw new Error('UUID du client invalide');
            }

            if (produits) {
                for (const produit of produits) {
                    if (!this.isValidUUID(produit.id_prod)) {
                        throw new Error('UUID de produit invalide');
                    }
                }
            }
            
            return await prisma.commandes.create({
                data: {
                    ...commandeInfo,
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
            if (!this.isValidUUID(uuid)) {
                throw new Error('UUID invalide');
            }

            const { produits, ...commandeInfo } = commandeData;

            if (commandeInfo.id_client && !this.isValidUUID(commandeInfo.id_client)) {
                throw new Error('UUID du client invalide');
            }

            if (produits) {
                for (const produit of produits) {
                    if (!this.isValidUUID(produit.id_prod)) {
                        throw new Error('UUID de produit invalide');
                    }
                }
            }

            await this.getCommandeById(uuid);

            return await prisma.commandes.update({
                where: { id: uuid },
                data: {
                    ...commandeInfo,
                    produits: produits ? {
                        deleteMany: {},
                        create: produits.map(produit => ({
                            id_prod: produit.id_prod,
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

    async deleteCommande(uuid) {
        try {
            if (!this.isValidUUID(uuid)) {
                throw new Error('UUID invalide');
            }

            await this.getCommandeById(uuid);

            await prisma.commandes.delete({
                where: { id: uuid }
            });

            return true;
        } catch (error) {
            throw new Error(`Erreur lors de la suppression de la commande: ${error.message}`);
        }
    }

    async validateCommandeData(commandeData) {
        const { id_client, statut, mode_paiement, produits } = commandeData;

        if (!id_client || !statut || !mode_paiement) {
            throw new Error('id_client, statut et mode_paiement sont requis');
        }

        if (!this.isValidUUID(id_client)) {
            throw new Error('UUID du client invalide');
        }

        if (!produits || !Array.isArray(produits) || produits.length === 0) {
            throw new Error('La commande doit contenir au moins un produit');
        }

        for (const produit of produits) {
            if (!produit.id_prod || !this.isValidUUID(produit.id_prod)) {
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