import { Request, Response, RequestHandler, NextFunction } from "express";
import mongoose from "mongoose";
import Category from "../models/Category.model";
import Product from "../models/Product.model";

// @desc    Create a new category
// @route   POST /api/categories
// @access  Private/Admin
const createCategory: RequestHandler = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { name, slug, description, parentCategory, isActive, isFeatured } =
      req.body;

    // Validation du nom
    if (!name || name.trim() === "") {
      res.status(400).json({
        success: false,
        message: "Le nom de la catégorie ne peut pas être vide",
      });
      return;
    }

    if (typeof name !== "string") {
      res.status(400).json({
        success: false,
        message: "Le nom de la catégorie doit être une chaîne de caractères",
        received: {
          type: typeof name,
          value: name,
        },
      });
      return;
    }

    if (name.length > 100) {
      res.status(400).json({
        success: false,
        message: "Le nom de la catégorie ne peut pas dépasser 100 caractères",
        received: {
          length: name.length,
          maxLength: 100,
        },
      });
      return;
    }

    // Validation de la catégorie parente si elle est fournie
    if (parentCategory) {
      if (!mongoose.Types.ObjectId.isValid(parentCategory)) {
        res.status(400).json({
          success: false,
          message: "ID de catégorie parente invalide",
        });
        return;
      }

      const parentExists = await Category.findById(parentCategory);
      if (!parentExists) {
        res.status(400).json({
          success: false,
          message: "La catégorie parente n'existe pas",
        });
        return;
      }

      // Vérifier si la catégorie parente est active
      if (!parentExists.isActive) {
        res.status(400).json({
          success: false,
          message: "La catégorie parente n'est pas active",
        });
        return;
      }
    }

    // Validation du slug
    if (slug !== undefined) {
      if (typeof slug !== "string") {
        res.status(400).json({
          success: false,
          message: "Le slug doit être une chaîne de caractères",
          received: {
            type: typeof slug,
            value: slug,
          },
        });
        return;
      }

      if (slug.trim() === "") {
        res.status(400).json({
          success: false,
          message: "Le slug ne peut pas être vide",
        });
        return;
      }

      // Vérifier le format du slug
      if (!/^[a-z0-9-]+$/.test(slug)) {
        res.status(400).json({
          success: false,
          message:
            "Le slug ne peut contenir que des lettres minuscules, des chiffres et des tirets",
          errors: [
            {
              field: "slug",
              message:
                "Le slug ne peut contenir que des lettres minuscules, des chiffres et des tirets",
            },
          ],
          received: slug,
        });
        return;
      }

      // Vérifier la longueur du slug
      if (slug.length > 100) {
        res.status(400).json({
          success: false,
          message: "Le slug ne peut pas dépasser 100 caractères",
          received: {
            length: slug.length,
            maxLength: 100,
          },
        });
        return;
      }

      // Le slug sera défini lors de la création de la catégorie
    }

    // Vérifier si une catégorie avec le même slug existe déjà
    const existingCategory = await Category.findOne({
      slug: slug || name.toLowerCase().replace(/\s+/g, "-"),
    });
    if (existingCategory) {
      res.status(400).json({
        success: false,
        message: "Une catégorie avec ce slug existe déjà",
      });
      return;
    }

    const category = new Category({
      name,
      slug: slug || name.toLowerCase().replace(/\s+/g, "-"),
      description,
      parentCategory,
      isActive,
      isFeatured,
    });

    try {
      await category.save();
      res.status(201).json({
        success: true,
        data: category,
      });
    } catch (saveError) {
      if (saveError instanceof mongoose.Error.ValidationError) {
        res.status(400).json({
          success: false,
          message: "Le nom de la catégorie ne peut pas être vide",
          errors: Object.values(saveError.errors).map(err => err.message),
        });
        return;
      }
      if (saveError instanceof mongoose.Error.CastError) {
        res.status(400).json({
          success: false,
          message: "Format de données invalide",
          field: saveError.path,
          value: saveError.value,
        });
        return;
      }
      if (
        saveError instanceof Error &&
        saveError.message.includes("Database error")
      ) {
        res.status(500).json({
          success: false,
          message: "Database error",
        });
        return;
      }
      throw saveError;
    }
  } catch (error) {
    // console.error("Error in createCategory:", error);
    if (error instanceof mongoose.Error.ValidationError) {
      res.status(400).json({
        success: false,
        message: "Le nom de la catégorie ne peut pas être vide",
        errors: Object.values(error.errors).map(err => err.message),
      });
      return;
    }
    if (error instanceof mongoose.Error.CastError) {
      res.status(400).json({
        success: false,
        message: "Format de données invalide",
        field: error.path,
        value: error.value,
      });
      return;
    }
    if (error instanceof Error && error.message.includes("Database error")) {
      res.status(500).json({
        success: false,
        message: "Database error",
      });
      return;
    }
    res.status(500).json({
      success: false,
      message: "Erreur lors de la création de la catégorie",
    });
  }
};

// @desc    Get all categories
// @route   GET /api/categories
// @access  Public
const getCategories: RequestHandler = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { page = 1, limit = 10, sort } = req.query;
    const pageNum = Math.max(1, Number(page));
    const limitNum = Math.max(1, Number(limit));

    const query = Category.find({ isActive: true });
    const total = await Category.countDocuments({ isActive: true });

    if (sort) {
      const sortFields = (sort as string).split(",");
      const sortOptions: { [key: string]: 1 | -1 } = {};
      sortFields.forEach(field => {
        const order = field.startsWith("-") ? -1 : 1;
        const fieldName = field.replace(/^-/, "");
        sortOptions[fieldName] = order;
      });
      query.sort(sortOptions);
    }

    const categories = await query
      .skip((pageNum - 1) * limitNum)
      .limit(limitNum)
      .populate("parentCategory", "name")
      .lean();

    res.json({
      success: true,
      data: {
        categories,
        currentPage: pageNum,
        totalPages: Math.ceil(total / limitNum),
        total,
        limit: limitNum,
      },
    });
  } catch {
    // console.error("Error in getCategories:", _error);
    res.status(500).json({
      success: false,
      message: "Erreur lors de la récupération des catégories",
    });
  }
};

// @desc    Get a single category by ID or slug
// @route   GET /api/categories/:idOrSlug
// @access  Public
const getCategoryByIdOrSlug: RequestHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { idOrSlug } = req.params;
    let category;

    if (mongoose.Types.ObjectId.isValid(idOrSlug)) {
      category = await Category.findById(idOrSlug);
    } else {
      category = await Category.findOne({ slug: idOrSlug });
    }

    if (!category) {
      res.status(404).json({
        success: false,
        message: "Catégorie non trouvée",
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: category,
    });
  } catch (error) {
    // console.error("Error in getCategoryByIdOrSlug:", error);
    next(error);
  }
};

// @desc    Update a category
// @route   PUT /api/categories/:id
// @access  Private/Admin
const updateCategory: RequestHandler = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;
    const { name, description, parentCategory, isActive, isFeatured } =
      req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      res.status(404).json({
        success: false,
        message: "ID de catégorie invalide",
      });
      return;
    }

    const category = await Category.findById(id);
    if (!category) {
      res.status(404).json({
        success: false,
        message: "Catégorie non trouvée",
      });
      return;
    }

    // Mettre à jour uniquement les champs fournis
    if (name !== undefined) {
      if (typeof name !== "string") {
        res.status(400).json({
          success: false,
          message: "Le nom de la catégorie doit être une chaîne de caractères",
          received: {
            type: typeof name,
            value: name,
          },
        });
        return;
      }

      if (name.trim() === "") {
        res.status(400).json({
          success: false,
          message: "Le nom de la catégorie ne peut pas être vide",
        });
        return;
      }

      if (name.length > 100) {
        res.status(400).json({
          success: false,
          message: "Le nom de la catégorie ne peut pas dépasser 100 caractères",
          received: {
            length: name.length,
            maxLength: 100,
          },
        });
        return;
      }

      // Ne mettre à jour le slug que s'il est explicitement fourni
      if (req.body.slug !== undefined) {
        const newSlug = req.body.slug;

        // Validation du format du slug
        if (!/^[a-z0-9-]+$/.test(newSlug)) {
          res.status(400).json({
            success: false,
            message:
              "Le slug ne peut contenir que des lettres minuscules, des chiffres et des tirets",
            errors: [
              {
                field: "slug",
                message:
                  "Le slug ne peut contenir que des lettres minuscules, des chiffres et des tirets",
              },
            ],
          });
          return;
        }

        // Vérifier si le nouveau slug existe déjà
        const existingCategory = await Category.findOne({
          slug: newSlug,
          _id: { $ne: id },
        });

        if (existingCategory) {
          res.status(400).json({
            success: false,
            message: "Une catégorie avec ce slug existe déjà",
          });
          return;
        }

        category.slug = newSlug;
      }

      if (name !== undefined) {
        category.name = name.trim();
      }
    }

    if (description !== undefined) {
      if (typeof description !== "string") {
        res.status(400).json({
          success: false,
          message: "La description doit être une chaîne de caractères",
          receivedType: typeof description,
          receivedValue: description,
        });
        return;
      }

      const trimmedDescription = description.trim();

      // Validation de la longueur de la description
      if (trimmedDescription.length > 1000) {
        res.status(400).json({
          success: false,
          message: "La description ne peut pas dépasser 1000 caractères",
          maxLength: 1000,
          currentLength: trimmedDescription.length,
        });
        return;
      }

      // Validation du contenu de la description
      if (trimmedDescription === "") {
        res.status(400).json({
          success: false,
          message: "La description ne peut pas être vide",
        });
        return;
      }

      // Validation des caractères spéciaux
      const invalidChars = trimmedDescription.match(/[<>{}]/g);
      if (invalidChars) {
        res.status(400).json({
          success: false,
          message: "La description contient des caractères non autorisés",
          invalidChars: [...new Set(invalidChars)],
        });
        return;
      }

      category.description = trimmedDescription;
    }

    // Validation de isActive
    if (isActive !== undefined) {
      if (typeof isActive !== "boolean") {
        res.status(400).json({
          success: false,
          message: "Le champ isActive doit être un booléen",
          received: {
            type: typeof isActive,
            value: isActive,
          },
        });
        return;
      }

      // Si on désactive une catégorie, vérifier qu'elle n'a pas de produits actifs
      if (!isActive) {
        const activeProductsCount = await Product.countDocuments({
          category: id,
          isActive: true,
        });

        if (activeProductsCount > 0) {
          res.status(400).json({
            success: false,
            message:
              "Impossible de désactiver une catégorie avec des produits actifs",
            activeProductsCount,
            categoryId: id,
            categoryName: category.name,
          });
          return;
        }

        // Vérifier qu'elle n'a pas de sous-catégories actives
        const activeSubCategoriesCount = await Category.countDocuments({
          parentCategory: id,
          isActive: true,
        });

        if (activeSubCategoriesCount > 0) {
          res.status(400).json({
            success: false,
            message:
              "Impossible de désactiver une catégorie avec des sous-catégories actives",
            activeSubCategoriesCount,
            categoryId: id,
            categoryName: category.name,
          });
          return;
        }
      }

      category.isActive = isActive;
    }

    if (isFeatured !== undefined) {
      if (typeof isFeatured !== "boolean") {
        res.status(400).json({
          success: false,
          message: "Le champ isFeatured doit être un booléen",
          receivedType: typeof isFeatured,
          receivedValue: isFeatured,
        });
        return;
      }

      // Si on met en avant une catégorie, vérifier qu'elle est active
      if (isFeatured && !category.isActive) {
        res.status(400).json({
          success: false,
          message: "Impossible de mettre en avant une catégorie inactive",
          categoryId: id,
          categoryName: category.name,
        });
        return;
      }

      // Si on met en avant une catégorie, vérifier qu'elle a des produits actifs
      if (isFeatured && !category.isFeatured) {
        const activeProductsCount = await Product.countDocuments({
          category: id,
          isActive: true,
        });

        if (activeProductsCount === 0) {
          res.status(400).json({
            success: false,
            message:
              "Impossible de mettre en avant une catégorie sans produits actifs",
            categoryId: id,
            categoryName: category.name,
          });
          return;
        }
      }

      category.isFeatured = isFeatured;
    }

    // Validation de la catégorie parente si elle est fournie
    if (parentCategory !== undefined) {
      if (parentCategory === null) {
        category.parentCategory = undefined;
      } else {
        if (typeof parentCategory !== "string") {
          res.status(400).json({
            success: false,
            message:
              "L'ID de la catégorie parente doit être une chaîne de caractères",
            receivedType: typeof parentCategory,
            receivedValue: parentCategory,
          });
          return;
        }

        if (!mongoose.Types.ObjectId.isValid(parentCategory)) {
          res.status(400).json({
            success: false,
            message: "ID de catégorie parente invalide",
            receivedValue: parentCategory,
            expectedFormat: "ObjectId valide (24 caractères hexadécimaux)",
          });
          return;
        }

        // Vérifier que la catégorie parente n'est pas la catégorie elle-même
        if (parentCategory === id) {
          res.status(400).json({
            success: false,
            message: "Une catégorie ne peut pas être sa propre parente",
            categoryId: id,
            parentId: parentCategory,
          });
          return;
        }

        // Vérifier l'existence de la catégorie parente
        const parentExists = await Category.findById(parentCategory);
        if (!parentExists) {
          res.status(404).json({
            success: false,
            message: "La catégorie parente n'existe pas",
            parentId: parentCategory,
          });
          return;
        }

        // Vérifier si la catégorie parente est active
        if (!parentExists.isActive) {
          res.status(400).json({
            success: false,
            message: "La catégorie parente n'est pas active",
            parentId: parentCategory,
            parentName: parentExists.name,
            parentStatus: {
              isActive: parentExists.isActive,
              isFeatured: parentExists.isFeatured,
            },
          });
          return;
        }

        // Vérifier si la catégorie parente a des produits actifs
        const parentActiveProductsCount = await Product.countDocuments({
          category: parentCategory,
          isActive: true,
        });

        if (parentActiveProductsCount === 0) {
          res.status(400).json({
            success: false,
            message: "La catégorie parente n'a pas de produits actifs",
            parentId: parentCategory,
            parentName: parentExists.name,
            activeProductsCount: parentActiveProductsCount,
          });
          return;
        }

        // Vérifier si la catégorie parente a des sous-catégories actives
        const parentActiveSubCategoriesCount = await Category.countDocuments({
          parentCategory: parentCategory,
          isActive: true,
        });

        if (parentActiveSubCategoriesCount === 0) {
          res.status(400).json({
            success: false,
            message: "La catégorie parente n'a pas de sous-catégories actives",
            parentId: parentCategory,
            parentName: parentExists.name,
            activeSubCategoriesCount: parentActiveSubCategoriesCount,
          });
          return;
        }

        category.parentCategory = new mongoose.Types.ObjectId(parentCategory);
      }
    }

    try {
      // Si on ne change que le nom sans le slug, utiliser updateOne pour éviter le middleware pre-save
      if (
        name !== undefined &&
        req.body.slug === undefined &&
        description === undefined &&
        isActive === undefined &&
        isFeatured === undefined &&
        parentCategory === undefined
      ) {
        const updateData: {
          name: string;
        } = { name: name.trim() };

        const updatedCategory = await Category.findByIdAndUpdate(
          id,
          updateData,
          { new: true, runValidators: true }
        );

        if (!updatedCategory) {
          res.status(404).json({
            success: false,
            message: "Catégorie non trouvée",
          });
          return;
        }

        res.status(200).json({
          success: true,
          data: updatedCategory,
        });
      } else {
        // Si on change le slug ou d'autres champs complexes, utiliser save
        await category.save();
        res.status(200).json({
          success: true,
          data: category,
        });
      }
    } catch (saveError) {
      if (saveError instanceof mongoose.Error.ValidationError) {
        res.status(400).json({
          success: false,
          message: "Le nom de la catégorie ne peut pas être vide",
          errors: Object.values(saveError.errors).map(err => err.message),
        });
        return;
      }
      if (saveError instanceof mongoose.Error.CastError) {
        res.status(400).json({
          success: false,
          message: "Format de données invalide",
          field: saveError.path,
          value: saveError.value,
        });
        return;
      }
      if (
        saveError instanceof Error &&
        saveError.message.includes("Database error")
      ) {
        res.status(500).json({
          success: false,
          message: "Database error",
        });
        return;
      }
      throw saveError;
    }
  } catch (error) {
    // console.error("Error in updateCategory:", error);
    if (error instanceof mongoose.Error.ValidationError) {
      res.status(400).json({
        success: false,
        message: "Le nom de la catégorie ne peut pas être vide",
        errors: Object.values(error.errors).map(err => err.message),
      });
      return;
    }
    if (error instanceof mongoose.Error.CastError) {
      res.status(400).json({
        success: false,
        message: "Format de données invalide",
        field: error.path,
        value: error.value,
      });
      return;
    }
    if (error instanceof Error && error.message.includes("Database error")) {
      res.status(500).json({
        success: false,
        message: "Database error",
      });
      return;
    }
    res.status(500).json({
      success: false,
      message: "Erreur lors de la mise à jour de la catégorie",
    });
  }
};

// @desc    Delete a category
// @route   DELETE /api/categories/:id
// @access  Private/Admin
const deleteCategory: RequestHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      res.status(400).json({
        success: false,
        message: "ID de catégorie invalide",
      });
      return;
    }

    // Vérifier si la catégorie existe
    const category = await Category.findById(id);
    if (!category) {
      res.status(404).json({
        success: false,
        message: "Catégorie non trouvée",
      });
      return;
    }

    // Vérifier si la catégorie a des sous-catégories
    const hasSubCategories = await Category.exists({ parentCategory: id });
    if (hasSubCategories) {
      res.status(400).json({
        success: false,
        message:
          "Impossible de supprimer la catégorie car elle contient des sous-catégories",
      });
      return;
    }

    // Vérifier si la catégorie a des produits associés
    const productCount = await Product.countDocuments({
      category: id,
      isActive: true,
    });

    if (productCount > 0) {
      res.status(400).json({
        success: false,
        message: `Impossible de supprimer la catégorie car elle contient ${productCount} produit(s) actif(s)`,
        productCount,
      });
      return;
    }

    try {
      await Category.findByIdAndDelete(id);
      res.status(200).json({
        success: true,
        message: "Catégorie supprimée avec succès",
      });
    } catch (deleteError) {
      if (deleteError instanceof Error) {
        if (
          deleteError.name === "MongoError" ||
          deleteError.name === "MongoServerError"
        ) {
          res.status(500).json({
            success: false,
            message: "Database error",
          });
          return;
        }
      }
      throw deleteError;
    }
  } catch (error) {
    // console.error("Error in deleteCategory:", error);
    if (error instanceof Error) {
      if (error.name === "MongoError" || error.name === "MongoServerError") {
        res.status(500).json({
          success: false,
          message: "Database error",
        });
        return;
      }
    }
    next(error);
  }
};

// @desc    Get products by category
// @route   GET /api/categories/:slug/products
// @access  Public
const getCategoryProducts: RequestHandler = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { slug } = req.params;
    const { page = "1", limit = "10", sort } = req.query;

    const category = await Category.findOne({ slug });
    if (!category) {
      res.status(404).json({
        success: false,
        message: "Catégorie non trouvée",
      });
      return;
    }

    // Validation des paramètres de pagination
    const pageNum = Math.max(1, parseInt(page as string, 10) || 1);
    const limitNum = Math.min(
      100,
      Math.max(1, parseInt(limit as string, 10) || 10)
    );

    const query = Product.find({ category: category._id, isActive: true });
    const total = await Product.countDocuments({
      category: category._id,
      isActive: true,
    });

    // Calcul du nombre total de pages
    const totalPages = Math.max(1, Math.ceil(total / limitNum));

    // Vérification si la page demandée existe
    if (pageNum > totalPages && total > 0) {
      res.status(400).json({
        success: false,
        message: `La page demandée n'existe pas. Nombre total de pages: ${totalPages}`,
      });
      return;
    }

    if (sort) {
      const sortFields = (sort as string).split(",");
      const sortOptions: { [key: string]: 1 | -1 } = {};
      sortFields.forEach(field => {
        const order = field.startsWith("-") ? -1 : 1;
        const fieldName = field.replace(/^-/, "");
        sortOptions[fieldName] = order;
      });
      query.sort(sortOptions);
    }

    const products = await query
      .skip((pageNum - 1) * limitNum)
      .limit(limitNum)
      .populate("category", "name slug")
      .lean();

    res.json({
      success: true,
      data: {
        products: products || [],
        currentPage: pageNum,
        totalPages: totalPages,
        total,
        limit: limitNum,
        isEmpty: products.length === 0,
      },
    });
  } catch (error) {
    // console.error("Error in product query:", error);
    if (error instanceof mongoose.Error.CastError) {
      res.status(404).json({
        success: false,
        message: "Catégorie non trouvée",
      });
      return;
    }
    if (error instanceof Error) {
      if (error.name === "MongoError" || error.name === "MongoServerError") {
        res.status(500).json({
          success: false,
          message: "Database error",
        });
        return;
      }
      if (error.message.includes("Database error")) {
        res.status(500).json({
          success: false,
          message: "Database error",
        });
        return;
      }
    }
    res.status(500).json({
      success: false,
      message: "Error retrieving products",
    });
  }
};

// Exporter toutes les fonctions
export {
  createCategory,
  getCategories,
  getCategoryByIdOrSlug,
  updateCategory,
  deleteCategory,
  getCategoryProducts,
};
