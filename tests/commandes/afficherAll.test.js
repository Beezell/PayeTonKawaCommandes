const afficherAll = require("../../controllers/commandes/afficherAll");
const commandeService = require("../../services/CommandeService");

jest.mock("../../services/CommandeService");

describe("afficherAll Commandes Controller", () => {
  let req, res;

  beforeEach(() => {
    req = {};
    res = {
      json: jest.fn(),
      status: jest.fn().mockReturnThis(),
    };

    jest.clearAllMocks();
  });

  it("devrait retourner toutes les commandes avec leurs produits", async () => {
    const mockCommandes = [
      {
        uuid: "commande-1",
        created_at: new Date(),
        produits: [
          { id: 1, nom: "Produit A", prix: 10 },
          { id: 2, nom: "Produit B", prix: 20 },
        ],
      },
      {
        uuid: "commande-2",
        created_at: new Date(),
        produits: [],
      },
    ];

    commandeService.getAllCommandes.mockResolvedValue(mockCommandes);

    await afficherAll(req, res);

    expect(commandeService.getAllCommandes).toHaveBeenCalled();

    expect(res.json).toHaveBeenCalledWith({
      success: true,
      data: mockCommandes,
      count: mockCommandes.length,
    });
  });

  it("devrait retourner 500 en cas d'erreur serveur", async () => {
    const mockError = new Error("Erreur serveur");
    commandeService.getAllCommandes.mockRejectedValue(mockError);

    await afficherAll(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: "Erreur serveur",
    });
  });
});
