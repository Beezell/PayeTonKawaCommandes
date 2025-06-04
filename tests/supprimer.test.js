const supprimer = require('../controllers/commandes/supprimer');
const { PrismaClient } = require('@prisma/client');

// Mock Prisma
jest.mock('@prisma/client', () => {
  const mockPrismaClient = {
    commandes: {
      findUnique: jest.fn(),
      delete: jest.fn(),
    },
    produits_Commandes: {
      deleteMany: jest.fn(),
    },
    $transaction: jest.fn((cb) => cb(mockPrismaClient)),
  };
  return {
    PrismaClient: jest.fn(() => mockPrismaClient),
  };
});

const prisma = new PrismaClient();

describe('supprimer Commande Controller', () => {
  let req, res;

  beforeEach(() => {
    req = { params: {} };
    res = {
      json: jest.fn(),
      status: jest.fn().mockReturnThis(),
    };
    jest.clearAllMocks();
  });

  it('devrait supprimer une commande existante avec ses produits', async () => {
    const uuid = '123e4567-e89b-12d3-a456-426614174000';
    req.params.uuid = uuid;

    const mockCommande = {
      id: uuid,
      produits: [{ id: 1 }, { id: 2 }],
    };

    const mockDeletedCommande = { id: uuid };

    prisma.commandes.findUnique.mockResolvedValue(mockCommande);
    prisma.produits_Commandes.deleteMany.mockResolvedValue();
    prisma.commandes.delete.mockResolvedValue(mockDeletedCommande);

    await supprimer(req, res);

    expect(prisma.commandes.findUnique).toHaveBeenCalledWith({
      where: { id: uuid },
      include: { produits: true },
    });

    expect(prisma.produits_Commandes.deleteMany).toHaveBeenCalledWith({
      where: { id_commande: uuid },
    });

    expect(prisma.commandes.delete).toHaveBeenCalledWith({
      where: { id: uuid },
    });

    expect(res.json).toHaveBeenCalledWith({
      success: true,
      data: mockDeletedCommande,
      message: 'Commande supprimée avec succès (2 produit(s) associé(s) également supprimé(s))',
    });
  });

  it('devrait retourner 400 pour un UUID invalide', async () => {
    req.params.uuid = 'invalid-uuid';

    await supprimer(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: 'UUID invalide',
    });
  });

  it('devrait retourner 404 si la commande est introuvable', async () => {
    const uuid = '123e4567-e89b-12d3-a456-426614174000';
    req.params.uuid = uuid;

    prisma.commandes.findUnique.mockResolvedValue(null);

    await supprimer(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: 'Commande non trouvée',
    });
  });

  it("devrait retourner 404 si Prisma retourne une erreur P2025", async () => {
    const uuid = '123e4567-e89b-12d3-a456-426614174000';
    req.params.uuid = uuid;

    const mockCommande = {
      id: uuid,
      produits: [],
    };

    prisma.commandes.findUnique.mockResolvedValue(mockCommande);

    prisma.$transaction.mockRejectedValue({ code: 'P2025' });

    await supprimer(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: 'Commande non trouvée',
    });
  });

  it("devrait retourner 500 en cas d'erreur serveur inconnue", async () => {
    const uuid = '123e4567-e89b-12d3-a456-426614174000';
    req.params.uuid = uuid;

    const mockCommande = {
      id: uuid,
      produits: [],
    };

    prisma.commandes.findUnique.mockResolvedValue(mockCommande);

    prisma.$transaction.mockRejectedValue(new Error('Unexpected Error'));

    await supprimer(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: 'Erreur serveur lors de la suppression',
    });
  });
});
