const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

// Afficher toutes les commandes
const afficherAll = async (req, res) => {
    console.log("Afficher toutes les commande", req);


  try {
    const commandes = await prisma.commandes.findMany({
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