import express from "express";
import {
  getUsers,
  login,
  signup,
  updateUser,
  logout,
  verify,
  promoteToAdmin,
  debugUser,
} from "../controllers/user.js";

import { authenticate } from "../middlewares/auth.js";
const router = express.Router();

router.post("/update-user", authenticate, updateUser);
router.get("/users", authenticate, getUsers);
router.get("/verify", authenticate, verify);
router.post("/promote-admin", authenticate, promoteToAdmin);
router.get("/debug", authenticate, debugUser);

// Test route to check if routes are working
router.get("/test", (req, res) => {
  res.json({ message: "User routes are working!" });
});

router.post("/signup", signup);
router.post("/login", login);
router.post("/logout", logout);

export default router;