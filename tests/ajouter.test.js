const ajouterCommande = require("../controllers/commandes/ajouter");
const commandeService = require("../services/CommandeService");

jest.mock("../services/CommandeService");

describe("ajouter - Contrôleur de commande", () => {
  let req, res;

  beforeEach(() => {
    req = { body: {} };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    jest.clearAllMocks();
  });

  it("crée une commande avec produits avec succès", async () => {
    req.body = {
      id_client: "123e4567-e89b-12d3-a456-426614174000",
      statut: "payée",
      montant: 59.99,
      mode_paiement: "CB",
      produits: [
        { id_prod: 1, quantite: 2 },
        { id_prod: 2, quantite: 1 },
      ],
    };

    const mockCommandeCreee = {
      id: "cmd-uuid-1",
      ...req.body,
    };

    commandeService.validateCommandeData.mockResolvedValue(); // Pas de return, juste validation OK
    commandeService.createCommande.mockResolvedValue(mockCommandeCreee);

    await ajouterCommande(req, res);

    expect(commandeService.validateCommandeData).toHaveBeenCalledWith(req.body);
    expect(commandeService.createCommande).toHaveBeenCalledWith(req.body);

    expect(res.status).toHaveBeenCalledWith(200);
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

    await ajouterCommande(req, res);

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

    await ajouterCommande(req, res);

    expect(commandeService.validateCommandeData).toHaveBeenCalledWith(req.body);
    expect(commandeService.createCommande).toHaveBeenCalledWith(req.body);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: "Erreur lors de la création",
    });
  });
});
