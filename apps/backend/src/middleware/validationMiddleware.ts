import { Request, Response, NextFunction } from "express";
import { validationResult, ValidationError } from "express-validator";
import { body } from "express-validator";

export const handleValidationErrors = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({
      success: false,
      message: errors.array()[0].msg,
      errors: errors.array().map((err: ValidationError) => ({
        field: err.type === "field" ? err.path : "unknown",
        message: err.msg,
      })),
    });
    return;
  }
  next();
};

// Règles de validation pour la création de catégorie
export const categoryValidationRules = [
  body("name")
    .trim()
    .notEmpty()
    .withMessage("Le nom de la catégorie ne peut pas être vide")
    .isLength({ max: 100 })
    .withMessage("Le nom de la catégorie ne peut pas dépasser 100 caractères"),
  body("slug")
    .optional()
    .matches(/^[a-z0-9-]+$/)
    .withMessage(
      "Le slug ne peut contenir que des lettres minuscules, des chiffres et des tirets"
    ),
  body("description")
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage("La description ne peut pas dépasser 500 caractères"),
  body("image")
    .optional()
    .trim()
    .isURL()
    .withMessage("L'image doit être une URL valide"),
  body("parentCategory")
    .optional({ nullable: true, checkFalsy: true })
    .isMongoId()
    .withMessage("ID de catégorie parent invalide"),
  body("isFeatured")
    .optional()
    .isBoolean()
    .withMessage("isFeatured doit être un booléen"),
  body("isActive")
    .optional()
    .isBoolean()
    .withMessage("isActive doit être un booléen"),
];

// Règles de validation pour la mise à jour de catégorie
export const categoryUpdateValidationRules = [
  body("name")
    .optional()
    .trim()
    .notEmpty()
    .withMessage("Le nom de la catégorie ne peut pas être vide")
    .isLength({ max: 100 })
    .withMessage("Le nom de la catégorie ne peut pas dépasser 100 caractères"),
  body("slug")
    .optional()
    .matches(/^[a-z0-9-]+$/)
    .withMessage(
      "Le slug ne peut contenir que des lettres minuscules, des chiffres et des tirets"
    ),
  body("description")
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage("La description ne peut pas dépasser 500 caractères"),
  body("image")
    .optional()
    .trim()
    .isURL()
    .withMessage("L'image doit être une URL valide"),
  body("parentCategory")
    .optional({ nullable: true, checkFalsy: true })
    .isMongoId()
    .withMessage("ID de catégorie parent invalide"),
  body("isFeatured")
    .optional()
    .isBoolean()
    .withMessage("isFeatured doit être un booléen"),
  body("isActive")
    .optional()
    .isBoolean()
    .withMessage("isActive doit être un booléen"),
];
