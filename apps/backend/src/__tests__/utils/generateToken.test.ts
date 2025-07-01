import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import generateToken from "../../utils/generateToken";

describe("generateToken Utility", () => {
  const originalJWTSecret = process.env.JWT_SECRET;

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
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as {
      id: string;
      iat: number;
      exp: number;
    };

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
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as {
      id: string;
      iat: number;
      exp: number;
    };

    expect(decoded.iat).toBeDefined();
    expect(typeof decoded.iat).toBe("number");
  });
});
