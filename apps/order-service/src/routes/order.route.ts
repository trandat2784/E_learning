import express, {Router} from "express";
import isAuthenticated from "../../../../packages/middlewares/isAuthenticated";
import {deleteLivestream, getAdminOrder, livestream} from "../controllers/order.controller";
import {isAdmin, isProfessor} from "../../../../packages/middlewares/authorizeRoles";

const router: Router = express.Router();
router.get("/get-admin-order", isAuthenticated, isAdmin, getAdminOrder);
router.post("/livestream", isAuthenticated, isProfessor, livestream);
router.delete("/delete-livestream", isAuthenticated, isProfessor, deleteLivestream);

export default router;
