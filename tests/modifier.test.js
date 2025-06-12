const modifierCommande = require("../controllers/commandes/modifier");
const commandeService = require("../services/CommandeService");

jest.mock("../services/CommandeService");

describe("modifierCommande Controller", () => {
  let req, res;

  beforeEach(() => {
    req = {
      params: { uuid_commande: "123e4567-e89b-12d3-a456-426614174000" },
      body: {},
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    jest.clearAllMocks();
  });

  it("devrait modifier une commande avec succès", async () => {
    const mockData = {
      statut: "payee",
      mode_paiement: "paypal",
      uuid_client: "11111111-1111-1111-1111-111111111111",
      produits: [
        { uuid_produit: "22222222-2222-2222-2222-222222222222", quantite: 2 },
      ],
    };

    req.body = mockData;

    commandeService.validateCommandeData.mockResolvedValue(true);
    commandeService.updateCommande.mockResolvedValue({
      uuid: req.params.uuid_commande,
      ...mockData,
      produits: mockData.produits,
    });

    await modifierCommande(req, res);

    expect(commandeService.validateCommandeData).toHaveBeenCalledWith(mockData);
    expect(commandeService.updateCommande).toHaveBeenCalledWith(
      req.params.uuid_commande,
      mockData
    );
    expect(res.status).not.toHaveBeenCalled();
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      data: expect.objectContaining({ uuid: req.params.uuid_commande }),
    });
  });

  it("devrait retourner status 400 avec message en cas d'erreur", async () => {
    const error = new Error("UUID invalide");
    commandeService.validateCommandeData.mockRejectedValue(error);

    await modifierCommande(req, res);

    expect(commandeService.validateCommandeData).toHaveBeenCalled();
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
      uuid_client: "11111111-1111-1111-1111-111111111111",
      produits: [
        { uuid_produit: "22222222-2222-2222-2222-222222222222", quantite: 2 },
      ],
    };
    req.body = validData;

    commandeService.validateCommandeData.mockResolvedValue(true);
    commandeService.updateCommande.mockRejectedValue(
      new Error("Erreur lors de la mise à jour")
    );

    await modifierCommande(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: "Erreur lors de la mise à jour",
    });
  });
});
