import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import dotenv from "dotenv";
import { Request, Response, NextFunction } from "express";

// Charger les variables d'environnement
dotenv.config({ path: ".env.test" });

// Mock Cloudinary et multer-storage-cloudinary
jest.mock("cloudinary", () => ({
  v2: {
    config: jest.fn(),
    uploader: {
      upload: jest.fn().mockImplementation(() => {
        // Simuler un upload réussi immédiatement
        return Promise.resolve({
          secure_url:
            "https://res.cloudinary.com/test/image/upload/v1234567890/test-image.jpg",
          public_id: "test-image",
          width: 800,
          height: 600,
          format: "jpg",
        });
      }),
    },
  },
}));

// Mock multer-storage-cloudinary
jest.mock("multer-storage-cloudinary", () => ({
  CloudinaryStorage: jest.fn().mockImplementation(() => ({
    _handleFile: jest.fn().mockImplementation((req, file, callback) => {
      // Simuler un upload réussi immédiatement
      const mockFile = {
        fieldname: file.fieldname,
        originalname: file.originalname,
        encoding: "7bit",
        mimetype: file.mimetype,
        size: file.size || 1024,
        destination: "/tmp",
        filename: "test-file.jpg",
        path: "/tmp/test-file.jpg",
        buffer: Buffer.from("test"),
      };

      // Ajouter le fichier à req.files ou req.file
      if (req.files) {
        if (Array.isArray(req.files)) {
          req.files.push(mockFile);
        } else {
          req.files[file.fieldname] = mockFile;
        }
      } else {
        req.file = mockFile;
      }

      callback(null, mockFile);
    }),
    _removeFile: jest.fn().mockImplementation((req, file, callback) => {
      callback(null);
    }),
  })),
}));

// Mock multer pour les tests
jest.mock("multer", () => {
  const mockMiddleware = (req: Request, res: Response, next: NextFunction) => {
    // Simuler le traitement multer immédiatement
    next();
  };

  const mockMulter = jest.fn().mockImplementation(() => mockMiddleware);

  // Ajouter les méthodes statiques
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (mockMulter as any).single = jest
    .fn()
    .mockImplementation(() => mockMiddleware);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (mockMulter as any).array = jest
    .fn()
    .mockImplementation(() => mockMiddleware);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (mockMulter as any).fields = jest
    .fn()
    .mockImplementation(() => mockMiddleware);

  return mockMulter;
});

// Map globale pour simuler la correspondance paymentIntentId <-> orderId dans le mock Stripe
const paymentIntentOrderMap = new Map();

// Mock Stripe
jest.mock("stripe", () => {
  // Stripe constructeur mocké
  return function Stripe() {
    return {
      paymentIntents: {
        create: jest.fn().mockImplementation(params => {
          // Simule une erreur pour les montants négatifs
          if (params.amount < 0) {
            const error = new Error(
              "This value must be greater than or equal to 1."
            ) as Error & { type: string };
            error.type = "StripeInvalidRequestError";
            throw error;
          }
          // Stocke la correspondance paymentIntentId <-> orderId
          const paymentIntentId = "pi_test_1234567890";
          if (params.metadata && params.metadata.orderId) {
            paymentIntentOrderMap.set(paymentIntentId, params.metadata.orderId);
          }
          return Promise.resolve({
            id: paymentIntentId,
            client_secret: "pi_test_secret_1234567890",
            amount: params.amount,
            currency: params.currency,
            status: "requires_payment_method",
            metadata: params.metadata || {},
            receipt_email: params.receipt_email || undefined,
          });
        }),
        retrieve: jest.fn().mockImplementation(id => {
          // Récupère l'orderId associé à ce paymentIntentId
          const orderId =
            paymentIntentOrderMap.get(id) ||
            new mongoose.Types.ObjectId().toHexString();
          return {
            id: id || "pi_test_1234567890",
            status: "succeeded",
            metadata: { orderId },
            receipt_email: "test@example.com",
            object: "payment_intent",
          };
        }),
      },
      webhooks: {
        constructEvent: jest.fn().mockImplementation((payload, signature) => {
          // Vérifier si la signature est invalide
          if (signature === "t=123456,v1=invalid_signature_hash") {
            const error = new Error("Invalid signature");
            throw error;
          }

          // Vérifier si la signature est invalide (pour le test "unknown webhook verification error")
          if (signature === "invalid_signature") {
            throw "Unknown error";
          }

          // Parser le payload Buffer en JSON
          let eventData;
          try {
            if (Buffer.isBuffer(payload)) {
              eventData = JSON.parse(payload.toString());
            } else {
              eventData = payload;
            }
          } catch {
            // Si le parsing échoue, retourner un événement par défaut
            eventData = {
              id: "evt_test_generic",
              type: "payment_intent.succeeded",
              data: {
                object: {
                  id: "pi_test_1234567890",
                  status: "succeeded",
                  metadata: {
                    orderId: new mongoose.Types.ObjectId().toHexString(),
                  },
                  receipt_email: "test@example.com",
                  object: "payment_intent",
                },
              },
            };
          }

          // Retourner exactement les données du payload
          return eventData;
        }),
      },
    };
  };
});

// Configuration de la base de données de test
let mongoServer: MongoMemoryServer;

beforeAll(async () => {
  // Démarrer le serveur MongoDB en mémoire
  mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();

  // Connecter à la base de données de test
  await mongoose.connect(mongoUri);
  // console.log("✅ Base de données de test connectée");
});

afterAll(async () => {
  // Fermer la connexion et arrêter le serveur
  await mongoose.disconnect();
  await mongoServer.stop();
  // console.log("✅ Base de données de test déconnectée");
});

// Nettoyer la base de données et la Map Stripe entre les tests
beforeEach(async () => {
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    const collection = collections[key];
    await collection.deleteMany({});
  }
  // Nettoyer la Map Stripe
  paymentIntentOrderMap.clear();
});

// Augmenter le timeout pour les tests
jest.setTimeout(30000);

// Gestion des erreurs non capturées
process.on("unhandledRejection", error => {
  console.error("❌ Erreur non gérée:", error);
  process.exit(1);
});
