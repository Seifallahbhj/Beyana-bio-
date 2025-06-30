import express from "express";
import {
  registerUser,
  loginUser,
  getUserProfile,
  updateUserProfile,
  changePassword,
  getWishlist,
  addToWishlist,
  removeFromWishlist,
  updateUserAvatar,
  loginAdmin,
} from "../controllers/UserController";
import { protect } from "../middleware/authMiddleware";
import { uploadAvatar } from "../middleware/uploadMiddleware";

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.get("/profile", protect, getUserProfile);
router.put("/profile", protect, updateUserProfile);
router.put("/change-password", protect, changePassword);

// Wishlist routes
router.get("/wishlist", protect, getWishlist);
router.post("/wishlist/:productId", protect, addToWishlist);
router.delete("/wishlist/:productId", protect, removeFromWishlist);

router.put("/avatar", protect, uploadAvatar, updateUserAvatar);

router.post("/admin/login", loginAdmin);

export default router;
