import e from "express";
import { protect } from "../middlewares/auth.middleware.js";
import {
  getMe,
  getPlayer,
  updateMe,
  deleteMe,
} from "../controllers/player.controller.js";

const router = e.Router();

// All player routes require a valid JWT cookie
router.use(protect);

router.get("/me", getMe);           // own profile
router.get("/:id", getPlayer);      // any player by MongoDB id
router.put("/me", updateMe);        // update own profile
router.delete("/me", deleteMe);     // delete own account

export default router;
