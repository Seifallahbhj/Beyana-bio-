import jwt from "jsonwebtoken";
import User from "../models/User.model";
import { Request, Response, NextFunction } from "express";
import { IUser } from "../models/User.model";

// Étendre l'interface Request d'Express pour inclure la propriété user
export interface AuthenticatedRequest extends Request {
  user?: Omit<IUser, "password" | "comparePassword">;
}

const protect = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      // Obtenir le token du header
      token = req.headers.authorization.split(" ")[1];

      // Vérifier le token
      const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as {
        id: string;
      };

      // Obtenir l'utilisateur depuis le token
      const userFound = await User.findById(decoded.id).select("-password");

      if (!userFound) {
        res.status(401).json({
          success: false,
          message: "Not authorized, user not found",
        });
        return;
      }

      req.user = userFound;
      next();
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        res.status(401).json({
          success: false,
          message: "token expired",
        });
        return;
      } else if (error instanceof jwt.JsonWebTokenError) {
        res.status(401).json({
          success: false,
          message: "Not authorized, token failed",
        });
        return;
      } else {
        res.status(401).json({
          success: false,
          message: "Not authorized, no token",
        });
        return;
      }
    }
  } else {
    res.status(401).json({
      success: false,
      message: "Not authorized, no token",
    });
    return;
  }
};

// Middleware pour vérifier le rôle admin
const admin = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  if (req.user && req.user.isAdmin) {
    next();
  } else {
    res.status(403).json({
      success: false,
      message: "Not authorized as an admin",
    });
    return;
  }
};

export { protect, admin };
