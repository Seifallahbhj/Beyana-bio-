import { Request, Response, NextFunction } from "express";
import mongoose from "mongoose";

interface MongoError extends Error {
  code?: number;
  keyPattern?: { [key: string]: number };
  keyValue?: { [key: string]: string | number | boolean };
}

export const notFound = (req: Request, res: Response, next: NextFunction) => {
  const error = new Error(`Not Found - ${req.originalUrl}`);
  res.status(404);
  next(error);
};

export const errorHandler = (
  err: Error,
  _req: Request,
  res: Response,
  next: NextFunction
) => {
  // console.error("Error:", err);

  if (res.headersSent) {
    return next(err);
  }

  // CastError (ObjectId invalide) - Retourner 404 pour les ressources non trouvées
  if (err.name === "CastError") {
    return res.status(404).json({
      success: false,
      message: "Resource not found or invalid ID",
    });
  }

  // ValidationError (Mongoose validation)
  if (err.name === "ValidationError") {
    const messages = Object.values(
      (err as mongoose.Error.ValidationError).errors
    ).map(
      (error: mongoose.Error.ValidatorError | mongoose.Error.CastError) =>
        error.message
    );
    return res.status(400).json({
      success: false,
      message: messages.join(", "),
    });
  }

  // MongoError (Duplicate key, etc.)
  if (err.name === "MongoError" || err.name === "MongoServerError") {
    const mongoError = err as MongoError;

    // Duplicate key error
    if (mongoError.code === 11000) {
      const field = Object.keys(mongoError.keyPattern || {})[0];
      const value = mongoError.keyValue?.[field];
      return res.status(400).json({
        success: false,
        message: `${field} already exists with value: ${value}`,
      });
    }
  }

  // JWT Errors
  if (err.name === "JsonWebTokenError") {
    return res.status(401).json({
      success: false,
      message: "Invalid token",
    });
  }

  if (err.name === "TokenExpiredError") {
    return res.status(401).json({
      success: false,
      message: "Token expired",
    });
  }

  // Default error
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  res.status(statusCode).json({
    success: false,
    message: err.message || "Internal Server Error",
    stack: process.env.NODE_ENV === "production" ? null : err.stack,
  });
};
