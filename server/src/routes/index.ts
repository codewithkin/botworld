import { Router } from "express";
import { getUserData } from "../controllers/data";

export const appRouter = Router();

// Register routes

// Data route
appRouter.get("/data", (req, res, next) => {
  Promise.resolve(getUserData(req, res)).catch(next);
});