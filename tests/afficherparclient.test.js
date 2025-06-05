const afficherParClient = require('../controllers/commandes/afficherparclient');
const { PrismaClient } = require('@prisma/client');

// Mock Prisma
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

describe('afficherParClient Commande Controller', () => {
  let req, res;

  beforeEach(() => {
    req = { params: {} };
    res = {
      json: jest.fn(),
      status: jest.fn().mockReturnThis(),
    };

    jest.clearAllMocks();
  });

  it('devrait retourner les commandes du client avec leurs produits', async () => {
    const mockCommandes = [
      {
        id: 'uuid-commande-1',
        produits: [
          { id: 1, id_prod: 'prod1', quantite: 2 },
          { id: 2, id_prod: 'prod2', quantite: 1 },
        ],
      },
      {
        id: 'uuid-commande-2',
        produits: [
          { id: 3, id_prod: 'prod3', quantite: 4 },
        ],
      },
    ];

    req.params.idClient = '550e8400-e29b-41d4-a716-446655440000';
    prisma.commandes.findMany.mockResolvedValue(mockCommandes);

    await afficherParClient(req, res);

    expect(prisma.commandes.findMany).toHaveBeenCalledWith({
      where: { id_client: '550e8400-e29b-41d4-a716-446655440000' },
      include: { produits: true },
    });

    expect(res.json).toHaveBeenCalledWith({
      success: true,
      data: mockCommandes,
    });
  });

  it('devrait retourner 400 pour un UUID client invalide', async () => {
    req.params.idClient = 'invalid-uuid';

    await afficherParClient(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: 'UUID client invalide',
    });
  });

  it("devrait retourner 404 si aucune commande n'est trouvée", async () => {
    req.params.idClient = '550e8400-e29b-41d4-a716-446655440000';
    prisma.commandes.findMany.mockResolvedValue([]);

    await afficherParClient(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: 'Aucune commande trouvée pour ce client',
    });
  });

  it("devrait retourner 500 en cas d'erreur serveur", async () => {
    req.params.idClient = '550e8400-e29b-41d4-a716-446655440000';
    prisma.commandes.findMany.mockRejectedValue(new Error('Erreur BDD'));

    await afficherParClient(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: 'Erreur serveur',
    });
  });
});
