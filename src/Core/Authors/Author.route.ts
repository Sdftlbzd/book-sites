import { Router } from "express";
import { AuthorController } from "./Author.controller"; 

export const authorRoutes = Router();
const controller = AuthorController();

authorRoutes.post("/register", controller.Register);
authorRoutes.post('/login', controller.login)