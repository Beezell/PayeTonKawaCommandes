const supprimer = require("../../controllers/commandes/supprimer");
const commandeService = require("../../services/CommandeService");
const rabbitmq = require("../../services/rabbitmqService");

jest.mock("../../services/CommandeService");
jest.mock("../../services/rabbitmqService");

describe("supprimer Commande Controller", () => {
  let req, res;

  beforeEach(() => {
    req = { params: { uuid_commande: "550e8400-e29b-41d4-a716-446655440000" } };
    res = {
      json: jest.fn(),
      status: jest.fn().mockReturnThis(),
    };
    jest.clearAllMocks();
  });

  it("devrait supprimer une commande existante avec succès", async () => {
    commandeService.deleteCommande.mockResolvedValue(true);
    rabbitmq.publishOrderDeleted.mockResolvedValue(true);

    await supprimer(req, res);

    expect(commandeService.deleteCommande).toHaveBeenCalledWith(
      req.params.uuid
    );
    expect(rabbitmq.publishOrderDeleted).toHaveBeenCalledWith(req.params.uuid);
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      message: "Commande supprimée avec succès",
    });
  });

  it("devrait retourner 400 pour un UUID invalide", async () => {
    req.params.uuid = "invalid-uuid";
    commandeService.deleteCommande.mockRejectedValue(
      new Error("UUID invalide")
    );

    await supprimer(req, res);

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

    await supprimer(req, res);

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

    await supprimer(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: "Erreur inconnue",
    });
  });
});
