import express, {Router} from "express";
import {
    createCourse,
    createDiscountCodes,
    createLesson,
    deleteCourse,
    deleteCourseVideo,
    deleteDiscountCode,
    deleteProductImage,
    getAllCourses,
    getAllEvents,
    getCategories,
    getClassCourses,
    getCoursesDetail,
    getDiscountCode,
    getFilteredClasses,
    getFilteredCourses,
    getFilteredEvents,
    getLessonById,
    permanentDeleteLesson,
    restoreCourse,
    searchCourses,
    uploadProductImage,
    uploadVideo
} from "../controllers/product.controller";
import isAuthenticated from "../../../../packages/middlewares/isAuthenticated";

const router: Router = express.Router();
router.get("/get-categories", getCategories);
router.post("/create-discount-code", isAuthenticated, createDiscountCodes)
router.get("/get-discount-codes", isAuthenticated, getDiscountCode)
router.delete("/delete-discount-code/:id", isAuthenticated, deleteDiscountCode)
router.post("/upload-product-image", isAuthenticated, uploadProductImage);
router.delete("/delete-product-image", isAuthenticated, deleteProductImage);
router.post("/create-product", isAuthenticated, createCourse);
router.get("/get-class-courses", isAuthenticated, getClassCourses);
router.delete("/delete-course/:courseId", isAuthenticated, deleteCourse);
router.put("/restore-course/:courseId", isAuthenticated, restoreCourse);
router.get("/get-all-courses", getAllCourses);
router.get("/get-all-events", getAllEvents);
router.get("/get-course/:id", getCoursesDetail);
router.get("/get-filtered-courses", getFilteredCourses);
router.get("/api/get-filtered-offers", getFilteredEvents);
router.get("/api/get-filtered-classes", getFilteredClasses);
router.get("/search-courses", searchCourses);
// router.get("/top-classes", topClasses);
router.post("/upload-course-video", uploadVideo);
router.delete("/delete-course-video", deleteCourseVideo);

router.post('/:courseId/lessons', createLesson);
router.get('/lessons/:lessonId', getLessonById);
router.delete('/lessons/:lessonId/permanent', permanentDeleteLesson);
export default router;