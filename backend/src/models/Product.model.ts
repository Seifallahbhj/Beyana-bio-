import { Schema, model, Document, Types } from "mongoose";
import slugify from "slugify"; // Nous devrons installer cette dépendance

// Interface pour les valeurs nutritionnelles (exemple simple)
export interface INutritionalValue {
  name: string; // ex: Calories, Protéines, Lipides
  value: string; // ex: 100kcal, 10g, 5g
  unit?: string; // ex: kcal, g, mg
}

const NutritionalValueSchema = new Schema<INutritionalValue>(
  {
    name: { type: String, required: true },
    value: { type: String, required: true },
    unit: { type: String },
  },
  { _id: false }
);

// Interface pour les dimensions
export interface IDimensions {
  length: number;
  width: number;
  height: number;
  unit: string; // ex: cm, mm
}

const DimensionsSchema = new Schema<IDimensions>(
  {
    length: { type: Number, required: true },
    width: { type: Number, required: true },
    height: { type: Number, required: true },
    unit: { type: String, required: true, default: "cm" },
  },
  { _id: false }
);

// Interface pour les options de requête de produits
interface IProductQueryOptions {
  sort?: { [key: string]: 1 | -1 };
  skip?: number;
  limit?: number;
}

export interface IProduct extends Document {
  name: string;
  slug: string;
  descriptionShort: string;
  descriptionDetailed: string;
  price: number;
  promotionalPrice?: number;
  images: string[];
  category: Types.ObjectId;
  subCategory?: Types.ObjectId;
  brand?: string;
  sku?: string;
  stockQuantity: number;
  certifications: string[];
  ingredients?: string[];
  nutritionalValues?: INutritionalValue[];
  origin?: string;
  weight?: number; // en grammes par exemple
  weightUnit?: string; // ex: g, kg
  dimensions?: IDimensions;
  isFeatured: boolean;
  tags?: string[];
  averageRating: number;
  numReviews: number;
  isActive: boolean;
  attributes: string[];
}

const ProductSchema = new Schema<IProduct>(
  {
    name: {
      type: String,
      required: [true, "Product name is required"],
      trim: true,
      maxlength: [150, "Product name cannot be more than 150 characters"],
    },
    slug: {
      type: String,
      unique: true,
      lowercase: true,
    },
    descriptionShort: {
      type: String,
      required: [true, "Short description is required"],
      trim: true,
      maxlength: [500, "Short description cannot be more than 500 characters"],
    },
    descriptionDetailed: {
      type: String,
      required: [true, "Detailed description is required"],
      trim: true,
    },
    price: {
      type: Number,
      required: [true, "Price is required"],
      min: [0, "Price cannot be negative"],
    },
    promotionalPrice: {
      type: Number,
      min: [0, "Promotional price cannot be negative"],
      validate: {
        validator: function (this: IProduct, value: number): boolean {
          // 'this' fait référence au document actuel
          return value < this.price;
        },
        message: "Promotional price must be less than regular price",
      },
    },
    images: {
      type: [String],
      required: [true, "At least one product image is required"],
      validate: [
        (val: string[]) => val.length > 0,
        "At least one product image is required",
      ],
    },
    category: {
      type: Schema.Types.ObjectId,
      ref: "Category",
      required: [true, "Product category is required"],
    },
    subCategory: {
      type: Schema.Types.ObjectId,
      ref: "Category",
    },
    brand: {
      type: String,
      trim: true,
    },
    sku: {
      type: String,
      trim: true,
      unique: true,
      sparse: true, // Permet plusieurs documents avec sku=null/undefined
    },
    stockQuantity: {
      type: Number,
      required: [true, "Stock quantity is required"],
      min: [0, "Stock quantity cannot be negative"],
      default: 0,
    },
    certifications: {
      type: [String],
      default: [],
    },
    ingredients: {
      type: [String],
      default: [],
    },
    nutritionalValues: [NutritionalValueSchema],
    origin: {
      type: String,
      trim: true,
    },
    weight: {
      type: Number,
      min: [0, "Weight cannot be negative"],
    },
    weightUnit: {
      type: String,
      default: "g",
    },
    dimensions: DimensionsSchema,
    isFeatured: {
      type: Boolean,
      default: false,
    },
    tags: {
      type: [String],
      default: [],
    },
    averageRating: {
      type: Number,
      default: 0,
      min: [0, "Average rating cannot be less than 0"],
      max: [5, "Average rating cannot be more than 5"],
      set: (val: number) => Math.round(val * 10) / 10, // Arrondir à une décimale
    },
    numReviews: {
      type: Number,
      default: 0,
      min: [0, "Number of reviews cannot be negative"],
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    attributes: {
      type: [String],
      default: [],
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Index pour améliorer les performances de recherche et de filtrage
ProductSchema.index({ name: "text", descriptionShort: "text", tags: "text" });
ProductSchema.index({ price: 1, category: 1 });
ProductSchema.index({ isFeatured: 1 });
ProductSchema.index({ isActive: 1 });

// Middleware pre-save pour générer le slug
ProductSchema.pre<IProduct>("save", function (next) {
  if (this.isModified("name") || this.isNew) {
    this.slug = slugify(this.name, {
      lower: true,
      strict: true,
      remove: /[*+~.()'!:@]/g,
      locale: "fr", // Support du français
    });
  }

  // Validation supplémentaire du prix promotionnel
  if (this.isModified("promotionalPrice") && this.promotionalPrice) {
    if (this.promotionalPrice >= this.price) {
      next(
        new Error("Le prix promotionnel doit être inférieur au prix normal")
      );
      return;
    }
  }

  next();
});

// Méthode statique pour trouver les produits actifs d'une catégorie
ProductSchema.statics.findActiveByCategory = function (
  categoryId: Types.ObjectId,
  options: IProductQueryOptions = {}
) {
  return this.find({
    category: categoryId,
    isActive: true,
  })
    .sort(options.sort || { name: 1 })
    .skip(options.skip || 0)
    .limit(options.limit || 10)
    .populate("category", "name slug")
    .lean()
    .exec();
};

// Ajout de méthodes statiques pour améliorer la couverture
ProductSchema.statics.findBySlug = function (slug: string) {
  return this.findOne({ slug, isActive: true })
    .populate("category", "name slug")
    .populate("subCategory", "name slug")
    .lean()
    .exec();
};

ProductSchema.statics.findFeatured = function (limit: number = 10) {
  return this.find({ isFeatured: true, isActive: true })
    .sort({ createdAt: -1 })
    .limit(limit)
    .populate("category", "name slug")
    .lean()
    .exec();
};

ProductSchema.statics.findByCategory = function (
  categoryId: Types.ObjectId,
  options: IProductQueryOptions = {}
) {
  const query = {
    category: categoryId,
    isActive: true,
  };

  return this.find(query)
    .sort(options.sort || { name: 1 })
    .skip(options.skip || 0)
    .limit(options.limit || 10)
    .populate("category", "name slug")
    .populate("subCategory", "name slug")
    .lean()
    .exec();
};

// Amélioration de la validation du prix promotionnel
ProductSchema.path("promotionalPrice").validate(function (
  this: IProduct,
  value: number
) {
  if (value === undefined || value === null) return true;
  return value < this.price;
},
"Le prix promotionnel doit être inférieur au prix normal");

// Amélioration de la validation des images
ProductSchema.path("images").validate(function (images: string[]) {
  return images && images.length > 0;
}, "Au moins une image est requise");

// Amélioration de la validation du stock
ProductSchema.path("stockQuantity").validate(function (quantity: number) {
  return quantity >= 0;
}, "La quantité en stock ne peut pas être négative");

// Amélioration de la validation de la note moyenne
ProductSchema.path("averageRating").validate(function (rating: number) {
  return rating >= 0 && rating <= 5;
}, "La note moyenne doit être comprise entre 0 et 5");

const Product = model<IProduct>("Product", ProductSchema);

export default Product;
