import express from "express";
import isAuthenticated from "../../../../packages/middlewares/isAuthenticated";
import {
    fetchMessages,
    fetchProfessorMessages,
    getProfessorConversation,
    getUserConversation,
    newConversation
} from "../controllers/chatting.controllers";
import {isProfessor} from "../../../../packages/middlewares/authorizeRoles";


const router = express.Router()
router.post("/create-user-conversationGroup", isAuthenticated, newConversation)
router.get("/get-user-conversations", isAuthenticated, getUserConversation)
router.get("/get-professor-conversations", isAuthenticated, isProfessor, getProfessorConversation)
router.get("/get-messages/:conversationId", isAuthenticated, fetchMessages)
router.get("/get-professor-messages/:conversationId", isAuthenticated, isProfessor, fetchProfessorMessages)

export default router