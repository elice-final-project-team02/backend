import { Request, Response } from "express";
import PostService from "../services/postService";
import { AuthRequest } from "../middlewares/authUserMiddlewares";
import { CreatePostDTO } from "../dtos/postDto";
import { PageQueryParamDTO, LimitQueryParamDTO } from "../dtos/queryParamsDtos";
import { ApiResponse } from "../common/ApiResponse";

class PostController {
  async createPost(req: AuthRequest, res: Response) {
    const userId = req.user._id;
    const CreatePostDTO: CreatePostDTO = req.body;
    const post = await PostService.createPost(userId, CreatePostDTO);
    return ApiResponse.created(res, "게시글 작성이 완료되었습니다.", post);
  }

  async updatePost(req: AuthRequest, res: Response) {
    const userId = req.user._id;
    const postId = req.params.postId;
    const post = await PostService.updatePost(userId, postId, req.body);
    return ApiResponse.success(res, "게시글 수정이 완료되었습니다.", post);
  }

  async savePost(req: AuthRequest, res: Response) {
    const postId = req.params.postId;
    const userId = req.user._id;
    await PostService.savePost(userId, postId);
    return ApiResponse.success(res, "게시글 찜이 완료되었습니다.");
  }

  async cancelPost(req: AuthRequest, res: Response) {
    const postId = req.params.postId;
    const userId = req.user._id;
    await PostService.cancelPost(userId, postId);
    return ApiResponse.success(res, "게시글 찜이 취소되었습니다.");
  }

  async cancelBookmarks(req: AuthRequest, res: Response) {
    const userId = req.user._id;
    const { postIds } = req.body;
    await PostService.cancelBookmarks(userId, postIds);
    return ApiResponse.success(res, "찜한 게시글이 삭제되었습니다.");
  }

  async deletePost(req: AuthRequest, res: Response) {
    const userId = req.user._id;
    const postId = req.params.postId;
    await PostService.deletePost(userId, postId);
    return ApiResponse.success(res, "게시글이 삭제되었습니다.");
  }

  async deletePosts(req: AuthRequest, res: Response) {
    const { postIds } = req.body;
    await PostService.deletePosts(postIds);
    return ApiResponse.success(res, "유저 게시글이 삭제되었습니다.");
  }

  async getPostDetail(req: Request, res: Response) {
    const postId = req.params.postId;
    const { post, authorProfile } = await PostService.getPostDetail(postId);
    return ApiResponse.success(res, "게시글이 조회되었습니다.", { post, authorProfile });
  }

  async getPostList(req: AuthRequest, res: Response) {
    const userId = req.user._id;
    // const { page } = new PageQueryParamDTO(req.query.page as string);
    // const { limit } = new LimitQueryParamDTO(req.query.limit as string) || { limit: 6 };
    const careTarget = req.query.careTarget as string;
    const isLongTerm = req.query.isLongTerm as string;
    const { posts, totalCount } = await PostService.getPostList(userId, careTarget, isLongTerm);
    return ApiResponse.success(res, "전체 게시글 목록이 조회되었습니다.", { posts, totalCount });
  }

  async getUserPostList(req: AuthRequest, res: Response) {
    const userId = req.user._id;
    const { page } = new PageQueryParamDTO(req.query.page as string);
    const { posts, totalCount } = await PostService.getUserPostList(userId, page);
    return ApiResponse.success(res, "사용자의 게시글 목록이 조회되었습니다.", { posts, totalCount });
  }

  async getCompletedPostListUser(req: AuthRequest, res: Response) {
    const userId = req.user._id;
    const { page } = new PageQueryParamDTO(req.query.page as string);
    const { posts, totalCount } = await PostService.getCompletedPostListUser(userId, page);
    return ApiResponse.success(res, "매칭 완료된 게시글 목록이 조회되었습니다.", { posts, totalCount });
  }

  async getCompletedPostListCareUser(req: AuthRequest, res: Response) {
    const userId = req.user._id;
    const { page } = new PageQueryParamDTO(req.query.page as string);
    const { posts, totalCount } = await PostService.getCompletedPostListCareUser(userId, page);
    return ApiResponse.success(res, "매칭 완료된 게시글 목록이 조회되었습니다.", { posts, totalCount });
  }

  async getSavedPostList(req: AuthRequest, res: Response) {
    const userId = req.user._id;
    const { page } = new PageQueryParamDTO(req.query.page as string);
    const { posts, totalCount } = await PostService.getSavedPostList(userId, page);
    return ApiResponse.success(res, "찜한 게시글 목록이 조회되었습니다.", { posts, totalCount });
  }
}

export default new PostController();
