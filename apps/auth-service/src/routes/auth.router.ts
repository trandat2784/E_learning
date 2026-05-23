import express, {Router} from 'express';
import {
  createClass,
  createStripeConnectLink,
  getProfessor,
  getUser,
  loginProfessor,
  loginUser,
  logOutUser,
  refreshToken,
  registerProfessor,
  resetUserPassword,
  userForgotPassword,
  userRegistration,
  verifyProfessor,
  verifyUser,
  verifyUserForgotPassword,
} from '../controller/auth.controller';


import {isProfessor} from "../../../../packages/middlewares/authorizeRoles";

import isAuthenticated from "../../../../packages/middlewares/isAuthenticated";
// import { verifyForgotPasswordOtp } from "../utils/auth.helper";
const router: Router = express.Router();
router.post('/user-registration', userRegistration);
router.post('/verify-user', verifyUser);
router.post('/login-user', loginUser);
router.post('/logout-user', isAuthenticated, logOutUser);
router.post('/refresh-token', refreshToken);
router.post('/forgot-password-user', userForgotPassword);
router.post('/reset-password-user', resetUserPassword);
router.post('/verify-forgot-password-user', verifyUserForgotPassword);
router.get('/logged-in-user', isAuthenticated, getUser);
router.post("/professor-registration", registerProfessor)
router.post("/verify-professor", verifyProfessor)
router.post("/create-class", createClass)
router.post("/create-stripe-link", createStripeConnectLink)
router.post("login-admin", loginAdmin)
router.post("/login-professor", loginProfessor)
router.get("/logged-in-professor", isAuthenticated, isProfessor, getProfessor)

export default router;
