const ajouter = require('../controllers/commandes/ajouter');
const { PrismaClient } = require('@prisma/client');

// Mock Prisma
jest.mock('@prisma/client', () => {
  const mockPrismaClient = {
    commandes: {
      create: jest.fn(),
      findUnique: jest.fn(),
    },
    produits_Commandes: {
      createMany: jest.fn(),
    },
    $transaction: jest.fn((cb) => cb(mockPrismaClient)),
  };
  return {
    PrismaClient: jest.fn(() => mockPrismaClient),
  };
});

const prisma = new PrismaClient();

describe('ajouter Commande Controller', () => {
  let req, res;

  beforeEach(() => {
    req = {
      body: {},
    };
    res = {
      json: jest.fn(),
      status: jest.fn().mockReturnThis(),
    };

    jest.clearAllMocks();
  });

  it('devrait créer une commande avec produits associés', async () => {
    req.body = {
      id_client: '123e4567-e89b-12d3-a456-426614174000',
      statut: 'payée',
      montant: 59.99,
      mode_paiement: 'CB',
      produits: [
        { id_prod: 1, quantite: 2 },
        { id_prod: 2, quantite: 1 },
      ],
    };

    const mockCommande = { id: 'cmd-uuid-1' };

    prisma.commandes.create.mockResolvedValue(mockCommande);
    prisma.produits_Commandes.createMany.mockResolvedValue();
    prisma.commandes.findUnique.mockResolvedValue({
      ...mockCommande,
      produits: req.body.produits,
    });

    await ajouter(req, res);

    expect(prisma.commandes.create).toHaveBeenCalledWith({
      data: {
        id_client: req.body.id_client,
        statut: req.body.statut,
        montant: req.body.montant,
        mode_paiement: req.body.mode_paiement,
      },
    });

    expect(prisma.produits_Commandes.createMany).toHaveBeenCalledWith({
      data: [
        { id_commande: mockCommande.id, id_prod: 1, quantite: 2 },
        { id_commande: mockCommande.id, id_prod: 2, quantite: 1 },
      ],
    });

    expect(prisma.commandes.findUnique).toHaveBeenCalledWith({
      where: { id: mockCommande.id },
      include: { produits: true },
    });

    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      data: expect.any(Object),
      message: 'Commande créée avec succès',
    });
  });

  it('devrait retourner 400 si un champ obligatoire est manquant', async () => {
    req.body = {
      statut: 'payée',
      mode_paiement: 'CB',
    };

    await ajouter(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: 'id_client, statut et mode_paiement sont requis',
    });
  });

  it('devrait retourner 400 si le UUID est invalide', async () => {
    req.body = {
      id_client: 'invalid-uuid',
      statut: 'en attente',
      mode_paiement: 'CB',
    };

    await ajouter(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: 'UUID du client invalide',
    });
  });

  it('devrait retourner 400 si produits n\'est pas un tableau', async () => {
    req.body = {
      id_client: '123e4567-e89b-12d3-a456-426614174000',
      statut: 'en cours',
      mode_paiement: 'CB',
      produits: 'pas-un-tableau',
    };

    await ajouter(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: 'Le champ produits doit être un tableau',
    });
  });

  it('devrait retourner 500 en cas d\'erreur serveur', async () => {
    req.body = {
      id_client: '123e4567-e89b-12d3-a456-426614174000',
      statut: 'payée',
      mode_paiement: 'CB',
      montant: 99.99,
    };

    prisma.commandes.create.mockRejectedValue(new Error('Erreur DB'));

    await ajouter(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: 'Erreur serveur',
    });
  });
});
