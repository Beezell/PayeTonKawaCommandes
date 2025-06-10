const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

// Afficher toutes les commandes avec leurs produits
const afficherAll = async (req, res) => {

  try {
    const commandes = await prisma.commandes.findMany({
      include: {
        produits: true      // on affiche aussi les produits associés à chaque commande
      },
      orderBy: {
        created_at: 'desc'
      }
    });
    
    res.json({
      success: true,
      data: commandes,
      count: commandes.length
    });
  } catch (error) {
    console.error('Erreur:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur'
    });
  }
};

module.exports = afficherAll;