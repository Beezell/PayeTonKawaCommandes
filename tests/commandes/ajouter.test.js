const ajouter = require("../../controllers/commandes/ajouter");
const commandeService = require("../../services/CommandeService");
const rabbitmq = require("../../services/rabbitmqService");

jest.mock("../../services/CommandeService");
jest.mock("../../services/rabbitmqService");

describe("ajouter - Contrôleur de commande", () => {
  let req, res;

  beforeEach(() => {
    req = {
      body: {
        uuid_client: "550e8400-e29b-41d4-a716-446655440000",
        produits: [
          { uuid_produit: "prod1", quantite: 2 },
          { uuid_produit: "prod2", quantite: 1 },
        ],
        mode_paiement: "carte",
        statut: "en_attente",
      },
    };
    res = {
      json: jest.fn(),
      status: jest.fn().mockReturnThis(),
    };

    jest.clearAllMocks();
  });

  it("crée une commande avec produits avec succès", async () => {
    const mockCommandeCreee = {
      uuid: "new-commande-uuid",
      ...req.body,
    };

    commandeService.validateCommandeData.mockResolvedValue(true);
    commandeService.createCommande.mockResolvedValue(mockCommandeCreee);
    rabbitmq.publishOrderCreated.mockResolvedValue(true);

    await ajouter(req, res);

    expect(commandeService.validateCommandeData).toHaveBeenCalledWith(req.body);
    expect(commandeService.createCommande).toHaveBeenCalledWith(req.body);
    expect(rabbitmq.publishOrderCreated).toHaveBeenCalledWith(mockCommandeCreee);
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      data: mockCommandeCreee,
    });
  });

  it("retourne 400 si validation des données échoue", async () => {
    req.body = {
      id_client: "uuid-invalide",
      statut: "payée",
      mode_paiement: "CB",
    };

    // Simule une erreur de validation
    commandeService.validateCommandeData.mockRejectedValue(
      new Error("UUID du client invalide")
    );

    await ajouter(req, res);

    expect(commandeService.validateCommandeData).toHaveBeenCalledWith(req.body);
    expect(commandeService.createCommande).not.toHaveBeenCalled();

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: "UUID du client invalide",
    });
  });

  it("retourne 400 si création de la commande échoue", async () => {
    req.body = {
      id_client: "123e4567-e89b-12d3-a456-426614174000",
      statut: "payée",
      mode_paiement: "CB",
    };

    commandeService.validateCommandeData.mockResolvedValue();
    commandeService.createCommande.mockRejectedValue(
      new Error("Erreur lors de la création")
    );

    await ajouter(req, res);

    expect(commandeService.validateCommandeData).toHaveBeenCalledWith(req.body);
    expect(commandeService.createCommande).toHaveBeenCalledWith(req.body);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: "Erreur lors de la création",
    });
  });
});
