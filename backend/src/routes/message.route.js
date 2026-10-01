import express from "express";
import { protectRoute } from "../middleware/auth.middleware.js";
import { validateObjectId } from "../middleware/validateObjectId.middleware.js";
import {
    getUsersForSidebar,
    getMessages,
    sendMessage,
} from "../controller/message.controller.js";

const router = express.Router();

router.get("/users", protectRoute, getUsersForSidebar);
router.get("/:id", protectRoute, validateObjectId("id"), getMessages);
router.post("/send/:id", protectRoute, validateObjectId("id"), sendMessage);

export default router;
