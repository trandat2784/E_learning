import express, {Router} from "express";
import {
    addNewAdmin,
    getAllAdmins,
    getAllCustomizations,
    getAllEvents,
    getAllProducts,
    getAllProfessor,
    getAllUsers
} from "../controllers/admin.controller";
import isAuthenticated from "../../../../packages/middlewares/isAuthenticated";
import {isAdmin} from "../../../../packages/middlewares/authorizeRoles";

const router: Router = express.Router();
router.get("/get-all-courses", isAuthenticated, isAdmin, getAllProducts);
router.get("/get-all-events", isAuthenticated, isAdmin, getAllEvents);
router.get("/get-all-admins", isAuthenticated, isAdmin, getAllAdmins);
router.get("/get-all-users", isAuthenticated, isAdmin, getAllUsers);
router.get("/get-all-professors", isAuthenticated, isAdmin, getAllProfessor);
router.get("/add-new-admin", isAuthenticated, isAdmin, addNewAdmin);
router.get("/get-all", getAllCustomizations);


export default router;