import express, {Router} from "express";
import isAuthenticated from "../../../../packages/middlewares/isAuthenticated";
import {getAdminOrder} from "../controllers/order.controller";
import {isAdmin} from "../../../../packages/middlewares/authorizeRoles";

const router: Router = express.Router();
router.get("/get-admin-order", isAuthenticated, isAdmin, getAdminOrder);
export default router;
