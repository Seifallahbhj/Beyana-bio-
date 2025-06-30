import jwt from "jsonwebtoken";
import { Types } from "mongoose";

const generateToken = (id: Types.ObjectId): string => {
  const secret = process.env.JWT_SECRET;

  if (!secret) {
    // console.error("JWT_SECRET not defined in environment variables.");
    throw new Error("JWT_SECRET must be defined");
  }

  return jwt.sign({ id }, secret, {
    expiresIn: "30d", // Le token expirera dans 30 jours
  });
};

export default generateToken;
