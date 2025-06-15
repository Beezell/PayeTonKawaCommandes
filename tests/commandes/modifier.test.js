const modifier = require("../../controllers/commandes/modifier");
const commandeService = require("../../services/CommandeService");
const rabbitmq = require("../../services/rabbitmqService");

jest.mock("../../services/CommandeService");
jest.mock("../../services/rabbitmqService");

describe("modifierCommande Controller", () => {
  let req, res;

  beforeEach(() => {
    req = {
      params: { uuid: "550e8400-e29b-41d4-a716-446655440000" },
      body: {
        uuid: "11111111-1111-1111-1111-111111111111",
        produits: [
          { id_prod: "22222222-2222-2222-2222-222222222222", quantite: 2 }
        ],
        mode_paiement: "paypal",
        statut: "payee"
      }
    };
    res = {
      json: jest.fn(),
      status: jest.fn().mockReturnThis(),
    };

    // Reset all mocks
    jest.clearAllMocks();
    
    // Setup default mock implementations
    commandeService.validateCommandeData = jest.fn();
    commandeService.updateCommande = jest.fn();
    rabbitmq.publishOrderUpdated = jest.fn();
    rabbitmq.publishOrderStatusChanged = jest.fn();
  });

  it("devrait modifier une commande avec succès", async () => {
    const mockData = req.body;
    const mockCommandeModifiee = {
      uuid: req.params.uuid,
      ...mockData
    };

    commandeService.validateCommandeData.mockResolvedValue(true);
    commandeService.updateCommande.mockResolvedValue(mockCommandeModifiee);
    rabbitmq.publishOrderUpdated.mockResolvedValue(true);

    await modifier(req, res);

    expect(commandeService.validateCommandeData).toHaveBeenCalledWith(mockData);
    expect(commandeService.updateCommande).toHaveBeenCalledWith(
      req.params.uuid,
      mockData
    );
    expect(rabbitmq.publishOrderUpdated).toHaveBeenCalledWith(mockCommandeModifiee);
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      data: mockCommandeModifiee,
      message: 'Commande modifiée avec succès'
    });
  });

  it("devrait retourner 404 si la commande n'est pas trouvée", async () => {
    commandeService.validateCommandeData.mockResolvedValue(true);
    commandeService.updateCommande.mockResolvedValue(null);

    await modifier(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: 'Commande non trouvée'
    });
  });

  it("devrait publier un événement de changement de statut", async () => {
    // Simuler une commande existante avec un statut différent
    const mockCommandeExistante = {
      uuid: req.params.uuid,
      statut: "payee",
      mode_paiement: "paypal",
      id_client: "11111111-1111-1111-1111-111111111111",
      produits: [
        { id_prod: "22222222-2222-2222-2222-222222222222", quantite: 2 }
      ]
    };

    // Simuler la nouvelle donnée avec un statut différent
    const mockData = {
      ...req.body,
      statut: "en_preparation"
    };

    commandeService.validateCommandeData.mockResolvedValue(true);
    // La commande retournée doit avoir l'ancien statut pour que la condition soit vraie
    commandeService.updateCommande.mockResolvedValue(mockCommandeExistante);
    rabbitmq.publishOrderUpdated.mockResolvedValue(true);
    rabbitmq.publishOrderStatusChanged.mockResolvedValue(true);

    req.body = mockData;
    await modifier(req, res);

    expect(rabbitmq.publishOrderStatusChanged).toHaveBeenCalledWith({
      orderId: req.params.uuid,
      oldStatus: "payee",
      newStatus: "en_preparation"
    });
  });

  it("devrait retourner status 400 avec message en cas d'erreur", async () => {
    const error = new Error("UUID invalide");
    commandeService.validateCommandeData.mockRejectedValue(error);

    await modifier(req, res);

    expect(commandeService.validateCommandeData).toHaveBeenCalledWith(req.body);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: "UUID invalide",
    });
  });

  it("devrait propager l'erreur de updateCommande", async () => {
    const validData = {
      statut: "payee",
      mode_paiement: "paypal",
      uuid: "11111111-1111-1111-1111-111111111111",
      produits: [
        { id_prod: "22222222-2222-2222-2222-222222222222", quantite: 2 },
      ],
    };
    req.body = validData;

    commandeService.validateCommandeData.mockResolvedValue(true);
    commandeService.updateCommande.mockRejectedValue(
      new Error("Erreur lors de la mise à jour")
    );

    await modifier(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: "Erreur lors de la mise à jour",
    });
  });
});
