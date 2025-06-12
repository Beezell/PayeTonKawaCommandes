const supprimerCommande = require("../controllers/commandes/supprimer");
const commandeService = require("../services/CommandeService");

jest.mock("../services/CommandeService");

describe("supprimer Commande Controller", () => {
  let req, res;

  beforeEach(() => {
    req = { params: { uuid_commande: "123e4567-e89b-12d3-a456-426614174000" } };
    res = {
      json: jest.fn(),
      status: jest.fn().mockReturnThis(),
    };
    jest.clearAllMocks();
  });

  it("devrait supprimer une commande existante avec succès", async () => {
    commandeService.deleteCommande.mockResolvedValue();

    await supprimerCommande(req, res);

    expect(commandeService.deleteCommande).toHaveBeenCalledWith(
      req.params.uuid_commande
    );
    expect(res.status).not.toHaveBeenCalled();
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      message: "Commande supprimée avec succès",
    });
  });

  it("devrait retourner 400 pour un UUID invalide", async () => {
    req.params.uuid_commande = "invalid-uuid";
    commandeService.deleteCommande.mockRejectedValue(
      new Error("UUID invalide")
    );

    await supprimerCommande(req, res);

    expect(commandeService.deleteCommande).toHaveBeenCalledWith("invalid-uuid");
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: "UUID invalide",
    });
  });

  it("devrait retourner 404 si la commande est introuvable", async () => {
    commandeService.deleteCommande.mockRejectedValue(
      new Error("Commande non trouvée")
    );

    await supprimerCommande(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: "Commande non trouvée",
    });
  });

  it("devrait retourner 404 pour une autre erreur", async () => {
    commandeService.deleteCommande.mockRejectedValue(
      new Error("Erreur inconnue")
    );

    await supprimerCommande(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: "Erreur inconnue",
    });
  });
});
