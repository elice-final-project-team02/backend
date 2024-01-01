import express from "express";
import UserController from "../controllers/userController";
import asyncHandler from "../common/utils/asyncHandler";
import { authenticateUser } from "../middlewares/authUserMiddlewares";
import { upload } from "../middlewares/s3Middleware";

const router = express.Router();

router.post("/register", asyncHandler(UserController.createUser));
router.post("/register/send-mail", asyncHandler(UserController.sendVerificationCode));
router.post("/register/verify-email-code", asyncHandler(UserController.verifyEmail));
router.post("/login", asyncHandler(UserController.login));
router.post("/logout", asyncHandler(UserController.logout));
router.get("/userinfo", authenticateUser, asyncHandler(UserController.userInfo));
router.get("/", authenticateUser, asyncHandler(UserController.getUser));
router.put("/", authenticateUser, upload.single("profileUrl"), asyncHandler(UserController.updateUser));
router.delete("/", authenticateUser, asyncHandler(UserController.deleteUser));

export default router;
