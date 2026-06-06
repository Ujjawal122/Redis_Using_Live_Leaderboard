import e from "express";
import { updateScore, getTopPlayers, getPlayerRank } from "../controllers/leaderboard.controller.js";
import { protect } from "../middlewares/auth.middleware.js";

const router = e.Router();

router.get("/top", getTopPlayers);               // public — anyone can view
router.get("/rank/:username", getPlayerRank);    // public — anyone can view a rank

router.post("/score", protect, updateScore);     // protected — must be logged in to submit

export default router;