const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");

describe("generateToken Utility", () => {
  let generateToken;
  const originalJWTSecret = process.env.JWT_SECRET;

  beforeAll(async () => {
    // Importer la fonction après la configuration
    generateToken = require("../../utils/generateToken").default;
  });

  beforeEach(() => {
    // S'assurer que JWT_SECRET est défini pour les tests
    process.env.JWT_SECRET = "test-secret-key";
  });

  afterEach(() => {
    // Restaurer la valeur originale
    if (originalJWTSecret) {
      process.env.JWT_SECRET = originalJWTSecret;
    } else {
      delete process.env.JWT_SECRET;
    }
  });

  it("should be defined", () => {
    expect(generateToken).toBeDefined();
  });

  it("should generate a valid JWT token", () => {
    const id = new mongoose.Types.ObjectId();
    const token = generateToken(id);

    expect(typeof token).toBe("string");

    // Verify the token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    expect(decoded).toBeInstanceOf(Object);
    expect(decoded.id).toBe(id.toHexString());
  });

  it("should throw an error if JWT_SECRET is not defined", () => {
    delete process.env.JWT_SECRET; // Simulate missing secret

    const id = new mongoose.Types.ObjectId();

    expect(() => generateToken(id)).toThrow("JWT_SECRET must be defined");
  });

  it("should contain an expiration date (iat)", () => {
    const id = new mongoose.Types.ObjectId();
    const token = generateToken(id);
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    expect(decoded.iat).toBeDefined();
    expect(typeof decoded.iat).toBe("number");
  });

  it("should generate different tokens for different user IDs", () => {
    const userId1 = new mongoose.Types.ObjectId();
    const userId2 = new mongoose.Types.ObjectId();

    const token1 = generateToken(userId1);
    const token2 = generateToken(userId2);

    expect(token1).not.toBe(token2);
  });
});
