import { Schema, model, Document, Types } from "mongoose";
import bcrypt from "bcryptjs";

// Interface pour une Adresse
export interface IAddress extends Document {
  address: string;
  addressLine2?: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  phoneNumber?: string;
  isDefaultShipping?: boolean;
  isDefaultBilling?: boolean;
}

export const AddressSchema = new Schema<IAddress>(
  {
    address: { type: String, required: [true, "Address is required"] },
    addressLine2: { type: String },
    city: { type: String, required: true },
    state: { type: String, required: true },
    zipCode: { type: String, required: true },
    country: { type: String, required: true, default: "France" },
    phoneNumber: { type: String },
    isDefaultShipping: { type: Boolean, default: false },
    isDefaultBilling: { type: Boolean, default: false },
  },
  { _id: false }
);

// Interface pour un Utilisateur
export interface IUser extends Document {
  _id: Types.ObjectId; // Explicitly define _id type
  firstName: string;
  lastName: string;
  email: string;
  password?: string; // Optionnel car il ne sera pas toujours retourné
  role: "customer" | "admin" | "editor";
  addresses: Types.DocumentArray<IAddress>;
  phoneNumber?: string;
  wishlist: Types.ObjectId[]; // Références aux IDs des produits
  // orderHistory: Types.ObjectId[]; // Références aux IDs des commandes (sera ajouté plus tard)
  isEmailVerified: boolean;
  name: string; // Virtual property
  isAdmin: boolean; // Virtual property
  verificationToken?: string;
  resetPasswordToken?: string;
  resetPasswordExpires?: Date;
  avatar?: string;
  comparePassword(candidatePassword: string): Promise<boolean>;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    firstName: {
      type: String,
      required: [true, "First name is required"],
      trim: true,
    },
    lastName: {
      type: String,
      required: [true, "Last name is required"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      trim: true,
      lowercase: true,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        "Please fill a valid email address",
      ],
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [8, "Password must be at least 8 characters long"],
      select: false, // Ne pas retourner le mot de passe par défaut
    },
    role: {
      type: String,
      enum: ["customer", "admin", "editor"],
      default: "customer",
    },
    addresses: [AddressSchema],
    phoneNumber: {
      type: String,
      trim: true,
    },
    wishlist: [
      {
        type: Schema.Types.ObjectId,
        ref: "Product", // Référence au modèle Product (à créer)
      },
    ],
    // orderHistory: [{
    //   type: Schema.Types.ObjectId,
    //   ref: 'Order', // Référence au modèle Order (à créer)
    // }],
    isEmailVerified: {
      type: Boolean,
      default: false,
    },
    verificationToken: String,
    resetPasswordToken: String,
    resetPasswordExpires: Date,
    avatar: {
      type: String,
      default: undefined,
    },
  },
  {
    timestamps: true, // Ajoute createdAt et updatedAt
    toJSON: { virtuals: true }, // Ensure virtuals are included in toJSON output
    toObject: { virtuals: true }, // Ensure virtuals are included in toObject output
  }
);

// Virtual for full name
UserSchema.virtual("name").get(function (this: IUser) {
  return `${this.firstName} ${this.lastName}`.trim();
});

// Virtual for isAdmin
UserSchema.virtual("isAdmin").get(function (this: IUser) {
  return this.role === "admin";
});

// Middleware pre-save pour hacher le mot de passe
UserSchema.pre<IUser>("save", async function (next) {
  // Se déclenche seulement si le mot de passe a été modifié (y compris à la création)
  if (!this.isModified("password")) {
    return next();
  }

  // S'assure que this.password n'est pas undefined
  if (!this.password) {
    return next();
  }

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error: unknown) {
    if (error instanceof Error) {
      next(error);
    } else {
      next(new Error("An unknown error occurred during password hashing"));
    }
  }
});

// Méthode pour comparer le mot de passe candidat avec le mot de passe haché
UserSchema.methods.comparePassword = async function (
  candidatePassword: string
): Promise<boolean> {
  if (!this.password) {
    return false;
  }
  return bcrypt.compare(candidatePassword, this.password);
};

const User = model<IUser>("User", UserSchema);

export default User;
