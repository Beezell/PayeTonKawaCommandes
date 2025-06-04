const afficher = require('../controllers/commandes/afficher');
const { PrismaClient } = require('@prisma/client');

// Mock Prisma
jest.mock('@prisma/client', () => {
  const mockPrismaClient = {
    commandes: {
      findUnique: jest.fn(),
    },
  };
  return {
    PrismaClient: jest.fn(() => mockPrismaClient),
  };
});

const prisma = new PrismaClient();

describe('afficher Commande Controller', () => {
  let req, res;

  beforeEach(() => {
    req = { params: {} };
    res = {
      json: jest.fn(),
      status: jest.fn().mockReturnThis(),
    };

    jest.clearAllMocks();
  });

  it('devrait retourner une commande existante avec ses produits', async () => {
    const mockCommande = {
      id: '123e4567-e89b-12d3-a456-426614174000',
      produits: [
        { id: 1, nom: 'Produit A', prix: 10 },
        { id: 2, nom: 'Produit B', prix: 20 },
      ],
    };

    req.params.uuid = '123e4567-e89b-12d3-a456-426614174000';
    prisma.commandes.findUnique.mockResolvedValue(mockCommande);

    await afficher(req, res);

    expect(prisma.commandes.findUnique).toHaveBeenCalledWith({
      where: { id: '123e4567-e89b-12d3-a456-426614174000' },
      include: { produits: true },
    });

    expect(res.json).toHaveBeenCalledWith({
      success: true,
      data: mockCommande,
    });
  });

  it('devrait retourner 400 pour un UUID invalide', async () => {
    req.params.uuid = 'invalid-uuid';

    await afficher(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: 'UUID invalide',
    });
  });

  it('devrait retourner 404 si la commande est introuvable', async () => {
    req.params.uuid = '123e4567-e89b-12d3-a456-426614174000';
    prisma.commandes.findUnique.mockResolvedValue(null);

    await afficher(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: 'Commande non trouvée',
    });
  });

  it("devrait retourner 500 en cas d'erreur serveur", async () => {
    const mockError = new Error('DB error');
    req.params.uuid = '123e4567-e89b-12d3-a456-426614174000';
    prisma.commandes.findUnique.mockRejectedValue(mockError);

    await afficher(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: 'Erreur serveur',
    });
  });
});
