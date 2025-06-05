const modifier = require('../controllers/commandes/modifier');
const { PrismaClient } = require('@prisma/client');

jest.mock('@prisma/client', () => {
  const mockPrismaClient = {
    commandes: {
      findUnique: jest.fn(),
      update: jest.fn(),
    },
    produits_Commandes: {
      deleteMany: jest.fn(),
      createMany: jest.fn(),
    },
    $transaction: jest.fn(),
  };
  return {
    PrismaClient: jest.fn(() => mockPrismaClient),
  };
});

const prisma = new PrismaClient();

describe('modifier Commande Controller', () => {
  let req, res;

  beforeEach(() => {
    req = {
      params: {},
      body: {},
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    jest.clearAllMocks();
  });

  it('devrait modifier une commande existante avec produits', async () => {
    const uuid = '123e4567-e89b-12d3-a456-426614174000';

    req.params.uuid = uuid;
    req.body = {
      statut: 'payee',
      montant: 150,
      mode_paiement: 'paypal',
      produits: [
        { id_prod: 'prod-1', quantite: 2 },
        { id_prod: 'prod-2', quantite: 1 },
      ],
    };

    const mockCommandeBefore = {
      id: uuid,
      produits: [],
    };
    const mockCommandeAfter = {
      id: uuid,
      statut: 'payee',
      montant: 150,
      mode_paiement: 'paypal',
      produits: [
        { id: 1, id_prod: 'prod-1', quantite: 2 },
        { id: 2, id_prod: 'prod-2', quantite: 1 },
      ],
    };

    prisma.commandes.findUnique.mockResolvedValue(mockCommandeBefore);
    prisma.$transaction.mockImplementation(async (callback) => await callback(prisma));
    prisma.commandes.update.mockResolvedValue({});
    prisma.commandes.findUnique.mockResolvedValue(mockCommandeAfter);

    await modifier(req, res);

    expect(res.json).toHaveBeenCalledWith({
      success: true,
      data: mockCommandeAfter,
      message: 'Commande modifiée avec succès',
    });
  });

  it('devrait retourner 400 si l\'UUID est invalide', async () => {
    req.params.uuid = 'invalid-uuid';

    await modifier(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: 'UUID invalide',
    });
  });

  it('devrait retourner 404 si la commande n\'existe pas', async () => {
    const uuid = '123e4567-e89b-12d3-a456-426614174000';
    req.params.uuid = uuid;

    prisma.commandes.findUnique.mockResolvedValue(null);

    await modifier(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: 'Commande non trouvée',
    });
  });

  it('devrait retourner 400 si produits n\'est pas un tableau', async () => {
    const uuid = '123e4567-e89b-12d3-a456-426614174000';
    req.params.uuid = uuid;
    req.body.produits = 'not-an-array';

    prisma.commandes.findUnique.mockResolvedValue({ id: uuid, produits: [] });

    await modifier(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: 'Le champ produits doit être un tableau',
    });
  });

  it('devrait retourner 400 si id_client est invalide', async () => {
    const uuid = '123e4567-e89b-12d3-a456-426614174000';
    req.params.uuid = uuid;
    req.body = {
      id_client: 'invalid-uuid',
    };

    prisma.commandes.findUnique.mockResolvedValue({ id: uuid, produits: [] });

    await modifier(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: 'UUID du client invalide',
    });
  });

  it('devrait retourner 409 si une contrainte unique est violée', async () => {
    const uuid = '123e4567-e89b-12d3-a456-426614174000';
    req.params.uuid = uuid;

    prisma.commandes.findUnique.mockResolvedValue({ id: uuid, produits: [] });
    prisma.$transaction.mockRejectedValue({ code: 'P2002' });

    await modifier(req, res);

    expect(res.status).toHaveBeenCalledWith(409);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: 'Conflit de données (contrainte unique violée)',
    });
  });

  it('devrait retourner 500 en cas d\'erreur inconnue', async () => {
    const uuid = '123e4567-e89b-12d3-a456-426614174000';
    req.params.uuid = uuid;

    prisma.commandes.findUnique.mockResolvedValue({ id: uuid, produits: [] });
    prisma.$transaction.mockRejectedValue(new Error('Erreur inconnue'));

    await modifier(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: 'Erreur serveur lors de la modification',
    });
  });
});
