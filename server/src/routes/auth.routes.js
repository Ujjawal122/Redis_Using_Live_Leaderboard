import e from "express"

import {loginUser,registerUser} from "../controllers/auth.controller.js"

const router=e.Router();

router.post("/register",registerUser);
router.post("/login",loginUser);

export default router;