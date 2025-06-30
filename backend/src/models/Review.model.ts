import { Schema, model, Document, Types, Model } from "mongoose";

// Interface pour le modèle Review incluant les méthodes statiques
interface IReviewModel extends Model<IReview> {
  calculateAverageRating(productId: Types.ObjectId): Promise<void>;
}

export interface IReview extends Document {
  user: Types.ObjectId;
  product: Types.ObjectId;
  rating: number;
  comment?: string;
  title?: string;
  isApproved: boolean;
}

const ReviewSchema = new Schema<IReview>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User is required for a review"],
    },
    product: {
      type: Schema.Types.ObjectId,
      ref: "Product",
      required: [true, "Product is required for a review"],
    },
    rating: {
      type: Number,
      required: [true, "Rating is required"],
      min: [1, "Rating must be at least 1"],
      max: [5, "Rating must be at most 5"],
    },
    comment: {
      type: String,
      trim: true,
      maxlength: [1000, "Comment cannot be more than 1000 characters"],
    },
    title: {
      type: String,
      trim: true,
      maxlength: [100, "Title cannot be more than 100 characters"],
    },
    isApproved: {
      type: Boolean,
      default: true, // Ou false si modération par défaut
    },
  },
  {
    timestamps: true,
  }
);

// Index pour améliorer les recherches (par produit, par utilisateur)
ReviewSchema.index({ product: 1 });
ReviewSchema.index({ user: 1 });
ReviewSchema.index({ product: 1, user: 1 }, { unique: true }); // Un utilisateur ne peut laisser qu'un avis par produit

// Méthode statique pour calculer la note moyenne d'un produit
ReviewSchema.statics.calculateAverageRating = async function (
  productId: Types.ObjectId
) {
  const stats = await this.aggregate([
    {
      $match: { product: productId, isApproved: true }, // Seulement les avis approuvés
    },
    {
      $group: {
        _id: "$product",
        numReviews: { $sum: 1 },
        averageRating: { $avg: "$rating" },
      },
    },
  ]);

  try {
    const ProductModel = model("Product"); // Accéder au modèle Product
    if (stats.length > 0) {
      await ProductModel.findByIdAndUpdate(productId, {
        averageRating: Math.round(stats[0].averageRating * 10) / 10, // Arrondir à une décimale
        numReviews: stats[0].numReviews,
      });
    } else {
      // S'il n'y a plus d'avis (ou aucun approuvé), réinitialiser
      await ProductModel.findByIdAndUpdate(productId, {
        averageRating: 0,
        numReviews: 0,
      });
    }
  } catch {
    // console.error("Error updating product rating:", error);
  }
};

// Hook post-save pour mettre à jour la note moyenne après la sauvegarde d'un avis
ReviewSchema.post<IReview>("save", async function () {
  await (this.constructor as IReviewModel).calculateAverageRating(this.product);
});

// Hook pour document.deleteOne()
ReviewSchema.post<IReview>(
  "deleteOne",
  { document: true, query: false },
  async function () {
    // 'this' est le document qui a été supprimé
    await (this.constructor as IReviewModel).calculateAverageRating(
      this.product
    );
  }
);

// Pour findOneAndDelete et findOneAndUpdate (query middleware)
ReviewSchema.post(
  /^findOneAnd/,
  async function (doc: IReview | null, next: (error?: Error | null) => void) {
    if (doc) {
      // doc est le document qui a été affecté
      await (doc.constructor as IReviewModel).calculateAverageRating(
        doc.product
      );
    }
    next();
  }
);

const Review = model<IReview, IReviewModel>("Review", ReviewSchema);

export default Review;
