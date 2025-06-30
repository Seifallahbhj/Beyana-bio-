import multer, { FileFilterCallback, StorageEngine } from "multer";
import { Request, Response, RequestHandler } from "express";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import * as cloudinary from "cloudinary";
import { Readable } from "stream";

// Types personnalisés
interface CloudinaryError extends Error {
  http_code?: number;
  name: string;
}

interface UploadError extends Error {
  code?: string;
  field?: string;
}

interface MulterError extends Error {
  code: string;
  field?: string;
}

// Type pour la requête avec fileValidationError
interface RequestWithValidation extends Request {
  fileValidationError?: string;
  file?: Express.Multer.File;
  files?: Express.Multer.File[];
}

// Définition locale de l'interface MulterFile
interface MulterFile {
  fieldname: string;
  originalname: string;
  encoding: string;
  mimetype: string;
  size: number;
  destination: string;
  filename: string;
  path: string;
  buffer?: Buffer;
  stream?: Readable;
}

// Configuration de Cloudinary
cloudinary.v2.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Validation des fichiers
const fileFilter = (
  req: Request,
  file: { mimetype: string; size: number },
  callback: FileFilterCallback
): void => {
  const reqWithValidation = req as RequestWithValidation;

  // Vérification du type MIME
  if (!file.mimetype.startsWith("image/")) {
    reqWithValidation.fileValidationError = "Only image files are allowed";
    return callback(null, false);
  }

  // Vérification de la taille minimale (100KB)
  if (file.size < 102400) {
    reqWithValidation.fileValidationError = "File size must be at least 100KB";
    return callback(null, false);
  }

  callback(null, true);
};

// Configuration du stockage Cloudinary
const cloudinaryStorage = new CloudinaryStorage({
  cloudinary: cloudinary.v2,
  params: async (req, file: MulterFile) => {
    let folderName = "beyana-bio/others";

    // Détermination du dossier en fonction de la route
    if (req.baseUrl.includes("products")) {
      folderName = "beyana-bio/products";
    } else if (req.baseUrl.includes("users") && file.fieldname === "avatar") {
      folderName = "beyana-bio/avatars";
    }

    // Nettoyage du nom de fichier
    const cleanFileName = file.originalname
      .replace(/[^a-zA-Z0-9]/g, "-")
      .toLowerCase();

    return {
      folder: folderName,
      format: "webp",
      public_id: `${file.fieldname}-${Date.now()}-${cleanFileName}`,
      transformation: [
        { width: 1000, height: 1000, crop: "limit" },
        { quality: "auto" },
        { fetch_format: "auto" },
      ],
    };
  },
});

// Configuration des limites
const limits = {
  fileSize: 10 * 1024 * 1024, // 10MB max
  files: 5, // Maximum 5 fichiers
};

// Création de l'instance multer avec type casting
let upload: ReturnType<typeof multer>;

// Vérifier si nous sommes en mode test
if (process.env.NODE_ENV === "test") {
  // Mock multer pour les tests
  const mockMiddleware = (
    req: RequestWithValidation,
    res: Response,
    next: () => void
  ) => {
    // En mode test, on simule toujours un succès pour les fichiers valides
    // Les erreurs sont gérées par les tests eux-mêmes
    if (req.path.includes("avatar")) {
      req.file = {
        fieldname: "avatar",
        originalname: "test-avatar.jpg",
        encoding: "7bit",
        mimetype: "image/jpeg",
        size: 1024000,
        destination: "/tmp",
        filename: "test-avatar.jpg",
        path: "/tmp/test-avatar.jpg",
        buffer: Buffer.from("fake-image-data"),
        stream: Readable.from([]),
      };
    } else if (req.path.includes("multiple")) {
      req.files = [
        {
          fieldname: "images",
          originalname: "test-image-1.jpg",
          encoding: "7bit",
          mimetype: "image/jpeg",
          size: 1024000,
          destination: "/tmp",
          filename: "test-image-1.jpg",
          path: "/tmp/test-image-1.jpg",
          buffer: Buffer.from("fake-image-data"),
          stream: Readable.from([]),
        },
        {
          fieldname: "images",
          originalname: "test-image-2.jpg",
          encoding: "7bit",
          mimetype: "image/jpeg",
          size: 1024000,
          destination: "/tmp",
          filename: "test-image-2.jpg",
          path: "/tmp/test-image-2.jpg",
          buffer: Buffer.from("fake-image-data"),
          stream: Readable.from([]),
        },
      ];
    } else {
      req.file = {
        fieldname: "image",
        originalname: "test-image.jpg",
        encoding: "7bit",
        mimetype: "image/jpeg",
        size: 1024000,
        destination: "/tmp",
        filename: "test-image.jpg",
        path: "/tmp/test-image.jpg",
        buffer: Buffer.from("fake-image-data"),
        stream: Readable.from([]),
      };
    }
    next();
  };

  upload = {
    single: () => mockMiddleware,
    array: () => mockMiddleware,
    fields: () => mockMiddleware,
    none: () => mockMiddleware,
    any: () => mockMiddleware,
  } as ReturnType<typeof multer>;
} else {
  // Multer réel pour la production
  upload = multer({
    storage: cloudinaryStorage as StorageEngine,
    fileFilter,
    limits,
  });
}

// Middlewares d'upload
export const uploadSingle: RequestHandler = upload.single("image");
export const uploadMultiple: RequestHandler = upload.array("images", 5);
export const uploadAvatar: RequestHandler = upload.single("avatar");

// Gestion des erreurs d'upload
export const handleUploadError = (
  err: Error | CloudinaryError | UploadError | MulterError,
  req: RequestWithValidation,
  res: Response
) => {
  // Erreurs de validation personnalisées
  if (req.fileValidationError) {
    if (req.fileValidationError === "Only image files are allowed") {
      return res.status(400).json({
        success: false,
        message: "Invalid file type",
        error: req.fileValidationError,
      });
    }
    if (req.fileValidationError === "File size must be at least 100KB") {
      return res.status(400).json({
        success: false,
        message: "File too small",
        error: req.fileValidationError,
      });
    }
    // Autre erreur de validation
    return res.status(400).json({
      success: false,
      message: "File validation error",
      error: req.fileValidationError,
    });
  }

  // Erreurs Multer
  if ("code" in err && err.code) {
    switch (err.code) {
      case "LIMIT_FILE_SIZE":
        return res.status(400).json({
          success: false,
          message: "File size limit exceeded",
          error: "Maximum file size is 10MB",
        });
      case "LIMIT_FILE_COUNT":
        return res.status(400).json({
          success: false,
          message: "Too many files",
          error: "Maximum 5 files allowed",
        });
      default:
        return res.status(400).json({
          success: false,
          message: "Upload error",
          error: err.message,
        });
    }
  }

  // Erreurs Cloudinary
  if ("name" in err && err.name === "CloudinaryError") {
    return res.status(500).json({
      success: false,
      message: "Cloud storage error",
      error: "Failed to upload file to cloud storage",
    });
  }

  // Erreurs générales
  return res.status(500).json({
    success: false,
    message: "Server error",
    error: "An unexpected error occurred during file upload",
  });
};
