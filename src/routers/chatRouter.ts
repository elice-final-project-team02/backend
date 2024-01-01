import express from "express";
import ChatController from "../controllers/chatController";
import asyncHandler from "../common/utils/asyncHandler";
import { authenticateUser } from "../middlewares/authUserMiddlewares";

const router = express.Router();

router.get("/applicate-info/:postId", authenticateUser, asyncHandler(ChatController.applicateInfo));
router.get("/rooms", authenticateUser, asyncHandler(ChatController.getRooms));
router.get("/room/:chatId", authenticateUser, asyncHandler(ChatController.getRoom));
router.get("/check-update-user", authenticateUser, asyncHandler(ChatController.checkUpdateUser));
router.get("/check-update-careuser", authenticateUser, asyncHandler(ChatController.checkUpdateCareUser));
router.post("/applicate", authenticateUser, asyncHandler(ChatController.applicate));
router.post("/send-message/:chatId", authenticateUser, asyncHandler(ChatController.sendMessage));
router.put("/confirm/:chatId", authenticateUser, asyncHandler(ChatController.confirmCaregiver));
router.delete("/leave-room/:chatId", authenticateUser, asyncHandler(ChatController.leaveRoom));

export default router;
