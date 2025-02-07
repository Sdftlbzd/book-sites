import { Router } from "express";
import { bookRoutes } from "../Core/Books/Book.route";
import { userRoutes } from "../Core/Users/User.route";
import { adminRoutes } from "../Core/Admin/Admin.route";

export const v1Routes = Router();

v1Routes.use("/book", bookRoutes);
v1Routes.use("/user", userRoutes);
v1Routes.use("/admin", adminRoutes);