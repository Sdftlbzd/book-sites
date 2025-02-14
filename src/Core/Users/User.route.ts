import { Router } from "express";
import { UserController } from "./User.controller";
import { useAuth, roleCheck } from "../../DAL/middlewares/auth.middleware";
import { ERoleType } from "../../DAL/models/User.model";

export const userRoutes = Router();
const controller = UserController();

userRoutes.post("/register", controller.register);
userRoutes.post('/login', controller.login);
userRoutes.put('/update',useAuth, controller.userEdit);
userRoutes.delete('/delete',useAuth, controller.userDelete);
userRoutes.get('/author/books/:id', useAuth, controller.AuthorBooks);