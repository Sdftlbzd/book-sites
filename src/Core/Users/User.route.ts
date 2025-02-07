import { Router } from "express";
import { UserController } from "./User.controller";
import { useAuth, roleCheck } from "../../DAL/middlewares/auth.middleware";
import { ERoleType } from "../../DAL/models/User.model";

export const userRoutes = Router();
const controller = UserController();

userRoutes.post("/register", controller.registerUser);
userRoutes.post("/register/author", controller.registerAuthor);
userRoutes.post('/login', controller.login);
userRoutes.get('/author/booklist', useAuth, roleCheck([ERoleType.AUTHOR]),controller.AuthorBookList);
userRoutes.post('/buy/book', useAuth, controller.buyABook)