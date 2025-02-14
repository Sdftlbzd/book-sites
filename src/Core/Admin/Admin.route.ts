import { Router } from "express";
import { AdminController } from "./Admin.controller";
import { useAuth } from "../../DAL/middlewares/auth.middleware";
import { roleCheck } from "../../DAL/middlewares/auth.middleware";
import { ERoleType } from "../../DAL/models/User.model";

export const adminRoutes = Router();
const controller = AdminController();

adminRoutes.post("/create", useAuth, roleCheck([ERoleType.ADMIN]), controller.userCreate);
adminRoutes.put('/update/:id', useAuth, roleCheck([ERoleType.ADMIN]), controller.userEdit)
adminRoutes.delete('/delete/:id', useAuth, roleCheck([ERoleType.ADMIN]), controller.userDelete)
adminRoutes.get('/list', useAuth, roleCheck([ERoleType.ADMIN]), controller.adminList)
adminRoutes.get('/users/list', useAuth, roleCheck([ERoleType.ADMIN]), controller.userList)
adminRoutes.get('/role/list', useAuth, roleCheck([ERoleType.ADMIN]), controller.RoleList)