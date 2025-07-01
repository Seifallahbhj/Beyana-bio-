import mongoose, { Schema, Document, Types, Model } from "mongoose";

export interface ICategoryAncestor {
  _id: Types.ObjectId;
  name: string;
  slug: string;
}

export interface ICategory extends Document {
  name: string;
  slug: string;
  description?: string;
  isActive: boolean;
  isFeatured: boolean;
  parentCategory?: Types.ObjectId;
  ancestors: ICategoryAncestor[];
  createdAt: Date;
  updatedAt: Date;
}

// Fonction utilitaire pour générer un slug propre (sans accents, espaces, caractères spéciaux)
function slugify(str: string): string {
  return str
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // retire les accents
    .replace(/&/g, "et")
    .replace(/[^\w\s-]/g, "") // retire les caractères spéciaux
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .toLowerCase();
}

const CategorySchema = new Schema<ICategory>(
  {
    name: {
      type: String,
      required: [true, "Le nom de la catégorie est requis"],
      trim: true,
      maxlength: [100, "Le nom ne peut pas dépasser 100 caractères"],
    },
    slug: {
      type: String,
      required: false,
      unique: true,
      lowercase: true,
      trim: true,
      validate: {
        validator: function (v: string) {
          return /^[a-z0-9-]+$/.test(v);
        },
        message:
          "Le slug doit contenir uniquement des lettres minuscules, chiffres et tirets",
      },
    },
    description: {
      type: String,
      trim: true,
      maxlength: [500, "La description ne peut pas dépasser 500 caractères"],
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    isFeatured: {
      type: Boolean,
      default: false,
    },
    parentCategory: {
      type: Schema.Types.ObjectId,
      ref: "Category",
      default: null,
    },
    ancestors: [
      {
        _id: {
          type: Schema.Types.ObjectId,
          ref: "Category",
          required: true,
        },
        name: {
          type: String,
          required: true,
        },
        slug: {
          type: String,
          required: true,
        },
      },
    ],
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Index pour améliorer les performances des requêtes
CategorySchema.index({ parentCategory: 1 });
CategorySchema.index({ "ancestors._id": 1 });

// Génération automatique du slug à la sauvegarde
CategorySchema.pre("save", function (next) {
  if (this.isModified("name") || !this.slug) {
    this.slug = slugify(this.name);
  }
  next();
});

// Middleware pre-save pour générer automatiquement le slug
CategorySchema.pre("save", async function (next) {
  if (this.isModified("name") || this.isNew) {
    // Générer le slug à partir du nom
    this.slug = this.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");

    // Vérifier si le slug existe déjà
    try {
      const CategoryModel = this.constructor as Model<ICategory>;
      const existingCategory = await CategoryModel.findOne({
        slug: this.slug,
        _id: { $ne: this._id }, // Exclure l'utilisateur actuel
      });

      if (existingCategory) {
        // Ajouter un suffixe numérique au slug
        let counter = 1;
        let newSlug = this.slug;
        while (
          await CategoryModel.findOne({ slug: newSlug, _id: { $ne: this._id } })
        ) {
          newSlug = `${this.slug}-${counter}`;
          counter++;
        }
        this.slug = newSlug;
      }
    } catch (error) {
      return next(error as Error);
    }
  }

  // Gérer les catégories ancêtres
  if (this.isModified("parentCategory")) {
    if (this.parentCategory) {
      const CategoryModel = this.constructor as Model<ICategory>;
      const parent = await CategoryModel.findById(this.parentCategory);
      if (parent) {
        const ancestor: ICategoryAncestor = {
          _id: parent._id as Types.ObjectId,
          name: parent.name,
          slug: parent.slug,
        };
        this.ancestors = [...parent.ancestors, ancestor];
      }
    } else {
      this.ancestors = [];
    }
  }

  next();
});

// Virtual pour les sous-catégories
CategorySchema.virtual("subcategories", {
  ref: "Category",
  localField: "_id",
  foreignField: "parentCategory",
});

const Category = mongoose.model<ICategory>("Category", CategorySchema);

export default Category;
