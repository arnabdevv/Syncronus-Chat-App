import { Router } from "express";
import {
  addProfileImage,
  getUserInfo,
  login,
  logOut,
  removeProfileImage,
  signup,
  updateProfile,
} from "../controllers/AuthController.js";
import { verifyToken } from "../middlewares/AuthMiddleware.js";
import { validate } from "../middlewares/validate.js";
import {
  signupSchema,
  loginSchema,
  updateProfileSchema,
} from "../validators/authSchemas.js";
import multer from "multer";

const authRoutes = Router();
const upload = multer({ dest: "uploads/profiles/" });

authRoutes.post("/signup", validate(signupSchema), signup);
authRoutes.post("/login", validate(loginSchema), login);
authRoutes.get("/user-info", verifyToken, getUserInfo);
authRoutes.post("/update-profile", verifyToken, validate(updateProfileSchema), updateProfile);
authRoutes.post(
  "/add-profile-image",
  verifyToken,
  upload.single("profile-image"),
  addProfileImage,
);
authRoutes.delete("/remove-profile-image", verifyToken, removeProfileImage);
authRoutes.post("/logout", logOut);

export default authRoutes;
