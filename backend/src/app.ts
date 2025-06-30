import dotenv from "dotenv";
dotenv.config();
import express, { Express, Request, Response, NextFunction } from "express";
import cors from "cors";
import helmet from "helmet";
import compression from "compression";
import morgan from "morgan";
import userRoutes from "./routes/userRoutes"; // Importer les routes utilisateur
import productRoutes from "./routes/productRoutes";
import categoryRoutes from "./routes/categoryRoutes"; // Importer les routes des catégories
import orderRoutes from "./routes/orderRoutes"; // Importer les routes des commandes
import uploadRoutes from "./routes/uploadRoutes"; // Importer les routes d'upload
import stripeRoutes from "./routes/stripeRoutes";
import adminRoutes from "./routes/adminRoutes";
import { notFound, errorHandler } from "./middleware/errorMiddleware"; // AJOUT: Importer les middlewares d'erreur
import mongoose from "mongoose";
import { handleWebhook } from "./controllers/stripeController";

// Declaration merging to add rawBody to Request interface
declare module "express" {
  interface Request {
    rawBody?: Buffer;
  }
}

// Log pour vérifier le chargement des variables
// console.log(
//   "Stripe Secret Key:",
//   process.env.STRIPE_SECRET_KEY ? "✅ Loaded" : "❌ Not loaded"
// );
// console.log(
//   "Stripe Publishable Key:",
//   process.env.STRIPE_PUBLISHABLE_KEY ? "✅ Loaded" : "❌ Not loaded"
// );
// console.log(
//   "Stripe Webhook Secret:",
//   process.env.STRIPE_WEBHOOK_SECRET ? "✅ Loaded" : "❌ Not loaded"
// );

const app: Express = express();
const port = process.env.PORT || 5000;
const mongoUri = process.env.MONGO_URI;

// Middleware de base
app.use(
  cors({
    origin: [
      "http://localhost:3000", // Frontend
      "http://127.0.0.1:3000", // Frontend (alternative)
      "http://localhost:3001", // Admin
      "http://127.0.0.1:3001", // Admin (alternative)
    ],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);
app.use(helmet());
app.use(compression());
app.use(morgan("dev"));

// Webhook Stripe (handler direct)
app.post(
  "/api/payment/webhook",
  express.raw({ type: "application/json" }),
  handleWebhook
);

// Autres routes Stripe
app.use("/api/payment", express.json(), stripeRoutes);

// Middleware de parsing pour les autres routes
app.use(express.json()); // AJOUT: Middleware JSON pour parser les requêtes JSON
app.use(express.urlencoded({ extended: true }));

// Simple route for testing
app.get("/", (req: Request, res: Response) => {
  res.send("BEYANA Backend API is running!");
});

// AJOUT: Utiliser les routes utilisateur
app.use("/api/users", userRoutes);
app.use("/api/products", productRoutes);
app.use("/api/categories", categoryRoutes); // Monter les routes des catégories
app.use("/api/orders", orderRoutes); // Monter les routes des commandes
app.use("/api/upload", uploadRoutes); // Monter les routes d'upload
app.use("/api/admin", adminRoutes);

// Middlewares de gestion des erreurs (doivent être en dernier)
app.use(notFound);
app.use(errorHandler as express.ErrorRequestHandler);

app.use((err: Error, req: Request, res: Response, _next: NextFunction) => {
  res
    .status(500)
    .json({ success: false, message: err.message || "Erreur serveur" });
});

// AJOUT: Fonction de connexion à MongoDB
const connectDB = async () => {
  if (!mongoUri) {
    // console.error("MONGO_URI is not defined in .env file");
    process.exit(1); // Arrêter l'application si l'URI n'est pas définie
  }
  try {
    await mongoose.connect(mongoUri);
    // console.log("[database]: MongoDB Connected...");
  } catch (err: unknown) {
    if (err instanceof Error) {
      // console.error("[database]: MongoDB connection error:", err.message);
    } else {
      // console.error("[database]: MongoDB connection error:", err);
    }
    // Quitter le processus avec une erreur
    process.exit(1);
  }
};

// AJOUT: Fonction pour démarrer le serveur
const startServer = async () => {
  if (process.env.NODE_ENV !== "test") {
    await connectDB(); // Se connecter à la DB avant de démarrer le serveur
  }
  app.listen(port, () => {
    // console.log(`[server]: Server is running at http://localhost:${port}`);
  });
};

if (process.env.NODE_ENV !== "test") {
  startServer();
}

export default app;

// AJOUT: Exporter la fonction startServer pour les tests si nécessaire, bien que normalement l'application ne soit pas démarrée de cette manière en production
