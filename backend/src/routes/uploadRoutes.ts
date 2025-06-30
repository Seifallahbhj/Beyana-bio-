import { Router } from "express";
import {
  uploadSingle,
  uploadMultiple,
  uploadAvatar,
} from "../middleware/uploadMiddleware";
import { protect } from "../middleware/authMiddleware";
import { Request, Response } from "express";
import asyncHandler from "express-async-handler";

// Extension des types Express pour inclure les fichiers
interface ExtendedRequest extends Request {
  file?: Express.Multer.File;
  files?:
    | Express.Multer.File[]
    | { [fieldname: string]: Express.Multer.File[] };
  fileValidationError?: string;
}

const router = Router();

// Route pour uploader une image de produit (uniquement pour les admins)
router.post(
  "/product-images",
  [protect, uploadSingle],
  asyncHandler(async (req: ExtendedRequest, res: Response) => {
    if (req.fileValidationError) {
      res.status(400);
      throw new Error(req.fileValidationError);
    }

    if (!req.file) {
      res.status(400);
      throw new Error("No file uploaded");
    }

    // Avec CloudinaryStorage, l'image est déjà uploadée sur Cloudinary
    // et req.file contient les informations de Cloudinary
    res.status(200).json({
      url: req.file.path, // CloudinaryStorage met l'URL dans path
      public_id: req.file.filename, // CloudinaryStorage met le public_id dans filename
    });
  })
);

// Route pour uploader plusieurs images de produit
router.post(
  "/product-images/multiple",
  [protect, uploadMultiple],
  asyncHandler(async (req: ExtendedRequest, res: Response) => {
    if (req.fileValidationError) {
      res.status(400);
      throw new Error(req.fileValidationError);
    }

    if (!req.files) {
      res.status(400);
      throw new Error("No files uploaded");
    }

    // Avec CloudinaryStorage, les images sont déjà uploadées sur Cloudinary
    const uploadedImages = (req.files as Express.Multer.File[]).map((file) => {
      return {
        url: file.path, // CloudinaryStorage met l'URL dans path
        public_id: file.filename, // CloudinaryStorage met le public_id dans filename
      };
    });

    res.status(200).json({ images: uploadedImages });
  })
);

// Route pour uploader l'avatar de l'utilisateur
router.post(
  "/avatar",
  [protect, uploadAvatar],
  asyncHandler(async (req: ExtendedRequest, res: Response) => {
    if (req.fileValidationError) {
      res.status(400);
      throw new Error(req.fileValidationError);
    }

    if (!req.file) {
      res.status(400);
      throw new Error("No file uploaded");
    }

    // Avec CloudinaryStorage, l'image est déjà uploadée sur Cloudinary
    res.status(200).json({
      url: req.file.path, // CloudinaryStorage met l'URL dans path
      public_id: req.file.filename, // CloudinaryStorage met le public_id dans filename
    });
  })
);

export default router;
