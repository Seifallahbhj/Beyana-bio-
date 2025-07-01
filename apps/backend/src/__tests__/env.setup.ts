// Configuration des variables d'environnement pour les tests
process.env.NODE_ENV = "test";
process.env.PORT = "5000";
process.env.MONGODB_URI = "mongodb://localhost:27017/beyana-bio-test";
process.env.JWT_SECRET = "test-jwt-secret-key-" + Date.now();
process.env.JWT_EXPIRES_IN = "1h";
process.env.STRIPE_SECRET_KEY =
  "sk_test_" + Math.random().toString(36).substring(7);
process.env.STRIPE_WEBHOOK_SECRET =
  "whsec_" + Math.random().toString(36).substring(7);
process.env.CLOUDINARY_CLOUD_NAME = "test-cloud";
process.env.CLOUDINARY_API_KEY = "test-api-key-" + Date.now();
process.env.CLOUDINARY_API_SECRET = "test-api-secret-" + Date.now();

// Vérification des variables d'environnement requises
const requiredEnvVars = [
  "NODE_ENV",
  "PORT",
  "MONGODB_URI",
  "JWT_SECRET",
  "JWT_EXPIRES_IN",
  "STRIPE_SECRET_KEY",
  "STRIPE_WEBHOOK_SECRET",
  "CLOUDINARY_CLOUD_NAME",
  "CLOUDINARY_API_KEY",
  "CLOUDINARY_API_SECRET",
];

requiredEnvVars.forEach(envVar => {
  if (!process.env[envVar]) {
    throw new Error(`Variable d'environnement manquante: ${envVar}`);
  }
});
