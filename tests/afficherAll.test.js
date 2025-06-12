const afficherAll = require('../controllers/commandes/afficherAll');
const { PrismaClient } = require('@prisma/client');

jest.mock('@prisma/client', () => {
  const mockPrismaClient = {
    commandes: {
      findMany: jest.fn(),
    },
  };
  return {
    PrismaClient: jest.fn(() => mockPrismaClient),
  };
});

const prisma = new PrismaClient();

describe('afficherAll Commandes Controller', () => {
  let req, res;

  beforeEach(() => {
    req = {}; 
    res = {
      json: jest.fn(),
      status: jest.fn().mockReturnThis(),
    };

    jest.clearAllMocks();
  });

  it('devrait retourner toutes les commandes avec leurs produits', async () => {
    const mockCommandes = [
      {
        id: 'commande-1',
        created_at: new Date(),
        produits: [
          { id: 1, nom: 'Produit A', prix: 10 },
          { id: 2, nom: 'Produit B', prix: 20 },
        ],
      },
      {
        id: 'commande-2',
        created_at: new Date(),
        produits: [],
      },
    ];

    prisma.commandes.findMany.mockResolvedValue(mockCommandes);

    await afficherAll(req, res);

    expect(prisma.commandes.findMany).toHaveBeenCalledWith({
      include: { produits: true },
      orderBy: { created_at: 'desc' },
    });

    expect(res.json).toHaveBeenCalledWith({
      success: true,
      data: mockCommandes,
      count: mockCommandes.length,
    });
  });

  it("devrait retourner 500 en cas d'erreur serveur", async () => {
    const mockError = new Error('DB error');
    prisma.commandes.findMany.mockRejectedValue(mockError);

    await afficherAll(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: 'Erreur serveur',
    });
  });
});
