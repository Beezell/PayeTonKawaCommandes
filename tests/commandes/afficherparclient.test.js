const afficherParClient = require("../../controllers/commandes/afficherparclient");
const commandeService = require("../../services/CommandeService");

jest.mock("../../services/CommandeService");

describe("afficherParClient Commande Controller", () => {
  let req, res;

  beforeEach(() => {
    req = { params: { uuid: "550e8400-e29b-41d4-a716-446655440000" } };
    res = {
      json: jest.fn(),
      status: jest.fn().mockReturnThis(),
    };

    // Reset all mocks
    jest.clearAllMocks();
    
    // Setup default mock implementation
    commandeService.getCommandesByClientId = jest.fn();
  });

  it("devrait retourner les commandes du client avec leurs produits", async () => {
    const mockCommandes = [
      {
        uuid: "uuid-commande-1",
        produits: [
          { id: 1, id_prod: "prod1", quantite: 2 },
          { id: 2, id_prod: "prod2", quantite: 1 },
        ],
      },
      {
        uuid: "uuid-commande-2",
        produits: [{ id: 3, id_prod: "prod3", quantite: 4 }],
      },
    ];

    commandeService.getCommandesByClientId.mockResolvedValue(mockCommandes);

    await afficherParClient(req, res);

    expect(commandeService.getCommandesByClientId).toHaveBeenCalledWith(
      req.params.uuid
    );

    expect(res.json).toHaveBeenCalledWith({
      success: true,
      data: mockCommandes,
    });
  });

  it("devrait retourner 404 si aucune commande n'est trouvée", async () => {
    req.params.uuid = "550e8400-e29b-41d4-a716-446655440000";
    commandeService.getCommandesByClientId.mockResolvedValue([]);

    await afficherParClient(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: "Aucune commande trouvée pour ce client",
    });
  });

  it("devrait retourner 400 si UUID invalide (erreur spécifique)", async () => {
    req.params.uuid = "invalid-uuid";
    const error = new Error("UUID invalide");
    commandeService.getCommandesByClientId.mockRejectedValue(error);

    await afficherParClient(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: "UUID invalide",
    });
  });

  it("devrait retourner 404 en cas d'autre erreur", async () => {
    req.params.uuid = "550e8400-e29b-41d4-a716-446655440000";
    const error = new Error("Erreur inconnue");
    commandeService.getCommandesByClientId.mockRejectedValue(error);

    await afficherParClient(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: "Erreur inconnue",
    });
  });
});
