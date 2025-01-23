import { Router } from "express";
import { authorRoutes } from "../Core/Authors/Author.route";
import { bookRoutes } from "../Core/Books/Book.route";

export const v1Routes = Router();

v1Routes.use("/author", authorRoutes);
v1Routes.use("/book", bookRoutes);
