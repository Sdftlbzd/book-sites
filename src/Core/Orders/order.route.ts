import { Router } from "express";
import { useAuth} from "../../DAL/middlewares/auth.middleware";
import { OrderController } from "./order.controller";

export const orderRoutes = Router();
const controller = OrderController();

orderRoutes.post('/buy/book', useAuth, controller.buyABook)
orderRoutes.get('/book/sale/list', useAuth, controller.bookSaleList)