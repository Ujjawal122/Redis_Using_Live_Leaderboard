import e from "express";
import { createPlayer,getPlayer,updatePlayer,deletePlayer } from "../controllers/player.controller.js";

const router =e.Router()

router.post("/",createPlayer)
router.get("/:id",getPlayer)
router.put("/:id",updatePlayer)
router.delete("/:id",deletePlayer)

export default router;