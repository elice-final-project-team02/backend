import express from "express";
import PostController from "../controllers/postController";
import asyncHandler from "../common/utils/asyncHandler";
import { authenticateUser } from "../middlewares/authUserMiddlewares";

const router = express.Router();

router.post("/", authenticateUser, asyncHandler(PostController.createPost));
router.patch("/:postId", authenticateUser, asyncHandler(PostController.updatePost));
router.put("/save/:postId", authenticateUser, asyncHandler(PostController.savePost));
router.put("/cancel/:postId", authenticateUser, asyncHandler(PostController.cancelPost));
router.put("/posts/cancels", authenticateUser, asyncHandler(PostController.cancelBookmarks));
router.delete("/:postId", authenticateUser, asyncHandler(PostController.deletePost));
router.delete("/posts/delete", authenticateUser, asyncHandler(PostController.deletePosts));
router.get("/:postId", authenticateUser, asyncHandler(PostController.getPostDetail));
router.get("/", authenticateUser, asyncHandler(PostController.getPostList));
router.get("/posts/user", authenticateUser, asyncHandler(PostController.getUserPostList));
router.get("/posts/completed-user", authenticateUser, asyncHandler(PostController.getCompletedPostListUser));
router.get("/posts/completed-careuser", authenticateUser, asyncHandler(PostController.getCompletedPostListCareUser));
router.get("/posts/bookmarks", authenticateUser, asyncHandler(PostController.getSavedPostList));

export default router;
