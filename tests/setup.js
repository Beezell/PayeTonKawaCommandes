require('dotenv').config();

jest.setTimeout(10000);

process.env.NODE_ENV = 'test';
process.env.PORT = '3001';
process.env.RABBITMQ_URL = 'amqp://admin:admin@localhost:5672';

global.next = jest.fn();

afterEach(() => {
    jest.clearAllMocks();
    global.next.mockClear();
});

global.console = {
    ...console, 
    log: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
    info: jest.fn(),
    debug: jest.fn(),
}; 

// Mock du service RabbitMQ
jest.mock('../services/rabbitmqService', () => ({
    connect: jest.fn().mockResolvedValue(true),
    close: jest.fn().mockResolvedValue(true),
    publishOrderCreated: jest.fn().mockResolvedValue(true),
    publishOrderUpdated: jest.fn().mockResolvedValue(true),
    publishOrderDeleted: jest.fn().mockResolvedValue(true),
    consumeMessages: jest.fn().mockResolvedValue(true)
}));

// Mock du service de commande
jest.mock('../services/CommandeService', () => ({
    getCommandesByClientId: jest.fn(),
    getCommandeById: jest.fn(),
    getAllCommandes: jest.fn(),
    validateCommandeData: jest.fn(),
    createCommande: jest.fn(),
    updateCommande: jest.fn(),
    deleteCommande: jest.fn()
}));

// Mock de Prisma
jest.mock('@prisma/client', () => {
    const mockPrisma = {
        produit: {
            create: jest.fn(),
            findUnique: jest.fn(),
            findMany: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
        },
        $connect: jest.fn(),
        $disconnect: jest.fn(),
    };
    return {
        PrismaClient: jest.fn(() => mockPrisma),
    };
}); 