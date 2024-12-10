import express, { Router } from "express";
import { signup, signin } from "../controllers/user.controllers";

const userRouter: Router = express.Router();

// Signup route
userRouter.post("/signup", signup);

// Signin route
userRouter.post("/signin", signin);

export default userRouter;
