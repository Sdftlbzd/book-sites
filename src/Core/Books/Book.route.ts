import { Router } from "express";
import { BookController } from "./Book.controller";
import { roleCheck, useAuth } from "../../DAL/middlewares/auth.middleware";
import { ERoleType } from "../../DAL/models/User.model";

export const bookRoutes = Router();
const controller = BookController();

bookRoutes.post("/create", useAuth, roleCheck([ERoleType.AUTHOR, ERoleType.ADMIN]), controller.Create);
bookRoutes.get('/list', useAuth, roleCheck([ERoleType.ADMIN]), controller.BookList)
bookRoutes.put('/edit/:id', useAuth, roleCheck([ERoleType.ADMIN, ERoleType.AUTHOR]), controller.BookEdit)
bookRoutes.post('/delete/:id', useAuth, roleCheck([ERoleType.ADMIN, ERoleType.AUTHOR]), controller.BookDelete)
bookRoutes.get('/:id', useAuth, roleCheck([ERoleType.ADMIN, ERoleType.AUTHOR]), controller.GetById)