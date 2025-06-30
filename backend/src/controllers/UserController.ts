import { Response, Request as ExpressRequest } from "express"; // Renommer Request pour éviter les conflits, au cas où il est nécessaire ailleurs pour les routes non authentifiées
import { AuthenticatedRequest } from "../middleware/authMiddleware";
import { User } from "../models";
import generateToken from "../utils/generateToken";
import asyncHandler from "express-async-handler";
import mongoose from "mongoose";

// @desc    Register a new user
// @route   POST /api/users/register
// @access  Public
const registerUser = asyncHandler(
  async (req: ExpressRequest, res: Response) => {
    const { firstName, lastName, email, password } = req.body;

    if (!firstName || !lastName || !email || !password) {
      res.status(400);
      throw new Error(
        "Please provide firstName, lastName, email, and password"
      );
    }

    const userExists = await User.findOne({ email });

    if (userExists) {
      res.status(400);
      throw new Error("User already exists");
    }

    try {
      // Le mot de passe est haché automatiquement par le middleware pre-save du modèle User
      const user = await User.create({
        firstName,
        lastName,
        email,
        password,
      });

      if (user) {
        const token = generateToken(user._id);
        const userObject = user.toObject();
        // Le champ password est déjà exclu par défaut grâce à `select: false` dans le schéma

        res.status(201).json({
          success: true,
          data: {
            user: userObject,
            token,
          },
        });
      } else {
        res.status(400);
        throw new Error("Invalid user data");
      }
    } catch (error) {
      if (error instanceof mongoose.Error.ValidationError) {
        res.status(400);
        throw new Error("Validation error: " + error.message);
      }
      throw error;
    }
  }
);

// @desc    Authenticate user & get token
// @route   POST /api/users/login
// @access  Public
const loginUser = asyncHandler(async (req: ExpressRequest, res: Response) => {
  const { email, password } = req.body;

  if (!email || !password) {
    res.status(400);
    throw new Error("Please provide email and password");
  }

  const user = await User.findOne({ email }).select("+password");

  if (user && (await user.comparePassword(password))) {
    const token = generateToken(user._id);
    const userObject = user.toObject();
    delete userObject.password; // Le mot de passe a été sélectionné, il faut le supprimer explicitement

    res.json({
      success: true,
      data: {
        user: userObject,
        token,
      },
    });
  } else {
    res.status(401);
    throw new Error("Invalid email or password");
  }
});

// @desc    Authenticate admin & get token
// @route   POST /api/admin/login
// @access  Public
const loginAdmin = asyncHandler(async (req: ExpressRequest, res: Response) => {
  const { email, password } = req.body;

  if (!email || !password) {
    res.status(400);
    throw new Error("Please provide email and password");
  }

  const user = await User.findOne({ email }).select("+password");

  if (user && (await user.comparePassword(password))) {
    if (user.role !== "admin") {
      res.status(403);
      throw new Error("Access denied: not an admin");
    }
    const token = generateToken(user._id);
    const userObject = user.toObject();
    delete userObject.password;
    res.json({
      success: true,
      data: {
        user: userObject,
        token,
      },
    });
  } else {
    res.status(401);
    throw new Error("Invalid email or password");
  }
});

// @desc    Get user profile
// @route   GET /api/users/profile
// @access  Private (nécessitera une authentification)
const getUserProfile = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    const user = req.user; // req.user est défini par le middleware 'protect'

    if (user) {
      // Renvoyer les informations de l'utilisateur stockées dans req.user par le middleware
      // Ces informations ont déjà le mot de passe exclu.
      res.json({
        _id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        name: user.name, // Le virtual 'name' devrait être disponible si toJSON est bien configuré
        email: user.email,
        role: user.role,
        isAdmin: user.isAdmin, // Le virtual 'isAdmin' devrait être disponible
        addresses: user.addresses,
        phoneNumber: user.phoneNumber,
        wishlist: user.wishlist,
        isEmailVerified: user.isEmailVerified,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      });
    } else {
      // Ce cas ne devrait normalement pas arriver si 'protect' fonctionne correctement
      res.status(404);
      throw new Error("User not found");
    }
  }
);

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
const updateUserProfile = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    // req.user est défini par le middleware 'protect' et contient l'ID de l'utilisateur et d'autres infos (sans le mot de passe)
    // Nous devons récupérer l'instance complète du modèle User pour la modifier et la sauvegarder
    const user = await User.findById(req.user?._id);

    if (user) {
      user.firstName = req.body.firstName || user.firstName;
      user.lastName = req.body.lastName || user.lastName;

      // Gérer la mise à jour de l'email avec précaution (vérification d'unicité, etc.)
      // Pour l'instant, simple mise à jour. Une vérification d'unicité serait nécessaire en production.
      if (req.body.email && req.body.email !== user.email) {
        const emailExists = await User.findOne({ email: req.body.email });
        if (emailExists && emailExists._id.toString() !== user._id.toString()) {
          res.status(400);
          throw new Error("Email already in use by another account");
        }
        user.email = req.body.email;
      }

      user.phoneNumber = req.body.phoneNumber || user.phoneNumber;
      // TODO: Gérer la mise à jour des adresses et de la wishlist plus en détail si nécessaire

      if (req.body.password) {
        // Le mot de passe sera haché par le middleware pre-save du modèle User
        user.password = req.body.password;
      }

      try {
        const updatedUser = await user.save();
        const token = generateToken(updatedUser._id);
        const userObject = updatedUser.toObject();

        res.json({
          success: true,
          data: {
            user: userObject,
            token: token,
          },
        });
      } catch (error) {
        if (error instanceof mongoose.Error.ValidationError) {
          res.status(400);
          throw new Error("Validation error: " + error.message);
        }
        throw error;
      }
    } else {
      res.status(404);
      throw new Error("User not found");
    }
  }
);

// @desc    Change user password
// @route   PUT /api/users/change-password
// @access  Private
const changePassword = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      res.status(400);
      throw new Error("Please provide current password and new password");
    }

    if (newPassword.length < 8) {
      res.status(400);
      throw new Error("New password must be at least 8 characters long");
    }

    // Récupérer l'utilisateur avec le mot de passe pour la vérification
    const user = await User.findById(req.user?._id).select("+password");

    if (!user) {
      res.status(404);
      throw new Error("User not found");
    }

    // Vérifier le mot de passe actuel
    const isCurrentPasswordValid = await user.comparePassword(currentPassword);
    if (!isCurrentPasswordValid) {
      res.status(401);
      throw new Error("Current password is incorrect");
    }

    // Mettre à jour le mot de passe
    user.password = newPassword;

    try {
      await user.save();
      const token = generateToken(user._id);
      const userObject = user.toObject();

      res.json({
        success: true,
        data: {
          user: userObject,
          token: token,
        },
        message: "Password changed successfully",
      });
    } catch (error) {
      if (error instanceof mongoose.Error.ValidationError) {
        res.status(400);
        throw new Error("Validation error: " + error.message);
      }
      throw error;
    }
  }
);

// GET /api/users/wishlist
const getWishlist = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    if (!req.user) {
      res.status(401);
      throw new Error("Not authenticated");
    }
    const user = await User.findById(req.user._id).populate("wishlist");
    res.json({ success: true, data: user?.wishlist || [] });
  }
);

// POST /api/users/wishlist/:productId
const addToWishlist = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    if (!req.user) {
      res.status(401);
      throw new Error("Not authenticated");
    }
    const user = await User.findById(req.user._id);
    const { productId } = req.params;
    if (!user) {
      res.status(404);
      throw new Error("User not found");
    }
    const productObjectId = new mongoose.Types.ObjectId(productId);
    if (
      !user.wishlist
        .map((id) => id.toString())
        .includes(productObjectId.toString())
    ) {
      user.wishlist.push(productObjectId);
      await user.save();
    }
    res.json({ success: true, message: "Produit ajouté aux favoris" });
  }
);

// DELETE /api/users/wishlist/:productId
const removeFromWishlist = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    if (!req.user) {
      res.status(401);
      throw new Error("Not authenticated");
    }
    const user = await User.findById(req.user._id);
    const { productId } = req.params;
    if (!user) {
      res.status(404);
      throw new Error("User not found");
    }
    const productObjectId = new mongoose.Types.ObjectId(productId);
    user.wishlist = user.wishlist.filter(
      (id) => id.toString() !== productObjectId.toString()
    );
    await user.save();
    res.json({ success: true, message: "Produit retiré des favoris" });
  }
);

// @desc    Update user avatar
// @route   PUT /api/users/avatar
// @access  Private
const updateUserAvatar = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const user = await User.findById(req.user?._id);
      if (!user) {
        res.status(404);
        throw new Error("User not found");
      }
      if (!req.file || !req.file.path) {
        res.status(400);
        throw new Error("No avatar image uploaded");
      }
      user.avatar = req.file.path;
      await user.save();
      res.json({
        success: true,
        data: {
          avatar: user.avatar,
          user: user.toObject(),
        },
      });
    } catch (err) {
      res.status(500).json({
        success: false,
        message:
          err instanceof Error
            ? err.message
            : "Erreur serveur lors de l'upload de l'avatar",
      });
    }
  }
);

export {
  registerUser,
  loginUser,
  loginAdmin,
  getUserProfile,
  updateUserProfile,
  changePassword,
  getWishlist,
  addToWishlist,
  removeFromWishlist,
  updateUserAvatar,
};
