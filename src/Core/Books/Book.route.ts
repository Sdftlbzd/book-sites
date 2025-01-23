import { Router } from "express";
import { BookController } from "./Book.controller";
import { useAuth } from "../../DAL/middlewares/auth.middleware";
import { Author } from "../../DAL/models/Author.model";

export const bookRoutes = Router();
const controller = BookController();

bookRoutes.post("/create", useAuth, controller.Create);
bookRoutes.get('/list', useAuth, controller.BookList)
bookRoutes.put('/edit/:id', useAuth, controller.BookEdit)
bookRoutes.post('/delete/:id', useAuth, controller.BookDelete)
bookRoutes.get('/:id', useAuth, controller.GetById)