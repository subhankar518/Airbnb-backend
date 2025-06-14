import { Router } from "express";
import { signUp } from "../controllers/user.controller.js";

const userRouter = Router();

userRouter.route("/register").post(signUp);

export default userRouter;