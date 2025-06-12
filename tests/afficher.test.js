const afficher = require("../controllers/commandes/afficher");
const commandeService = require("../services/CommandeService");

jest.mock("../services/CommandeService");

describe("afficher Commande Controller", () => {
  let req, res;

  beforeEach(() => {
    req = { params: {} };
    res = {
      json: jest.fn(),
      status: jest.fn().mockReturnThis(),
    };

    jest.clearAllMocks();
  });

  it("devrait retourner une commande existante avec ses produits", async () => {
    const mockCommande = {
      uuid: "123e4567-e89b-12d3-a456-426614174000",
      produits: [
        { id: 1, nom: "Produit A", prix: 10 },
        { id: 2, nom: "Produit B", prix: 20 },
      ],
    };

    req.params.uuid_commande = "123e4567-e89b-12d3-a456-426614174000";
    commandeService.getCommandeById.mockResolvedValue(mockCommande);

    await afficher(req, res);

    expect(commandeService.getCommandeById).toHaveBeenCalledWith(
      "123e4567-e89b-12d3-a456-426614174000"
    );

    expect(res.json).toHaveBeenCalledWith({
      success: true,
      data: mockCommande,
    });
  });

  it("devrait retourner 404 pour un UUID invalide", async () => {
    req.params.uuid_commande = "invalid-uuid";
    commandeService.getCommandeById.mockRejectedValue(
      new Error("UUID invalide")
    );

    await afficher(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: "UUID invalide",
    });
  });

  it("devrait retourner 404 si la commande est introuvable", async () => {
    req.params.uuid_commande = "123e4567-e89b-12d3-a456-426614174000";
    commandeService.getCommandeById.mockRejectedValue(
      new Error("Commande non trouvée")
    );

    await afficher(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: "Commande non trouvée",
    });
  });

  it("devrait retourner 404 en cas d'erreur serveur", async () => {
    const mockError = new Error("Erreur serveur");
    req.params.uuid_commande = "123e4567-e89b-12d3-a456-426614174000";
    commandeService.getCommandeById.mockRejectedValue(mockError);

    await afficher(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: "Erreur serveur",
    });
  });
});
