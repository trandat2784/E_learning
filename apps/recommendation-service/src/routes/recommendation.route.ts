import express from "express";
import isAuthenticated from "../../../../packages/middlewares/isAuthenticated";
import {getRecommenedCourses} from "../controllers/recommendation-controller";

const router = express.Router();
router.get("/get-recommendation-courses", isAuthenticated, getRecommenedCourses)
export default router;