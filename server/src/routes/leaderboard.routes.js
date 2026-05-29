import e from "express";
import { updateScore,getTopPlayers,getPlayerRank } from "../controllers/leaderboard.controller.js";

const router=e.Router()

router.post("/score",updateScore)
router.get("/top",getTopPlayers)
router.get("/rank/:username",getPlayerRank)

export default router