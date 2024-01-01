import PostRepository from "../repositories/postRepository";
import { CreatePostDTO } from "../dtos/postDto";
import { IPost } from "../models/postModel";

class PostService {
  async createPost(userId: string, postDTO: CreatePostDTO): Promise<IPost> {
    return await PostRepository.createPost(userId, postDTO);
  }

  async updatePost(userId: string, postId: string, postDTO: CreatePostDTO): Promise<IPost | null> {
    return await PostRepository.updatePost(userId, postId, postDTO);
  }

  async savePost(userId: string, postId: string): Promise<void> {
    return await PostRepository.savePost(userId, postId);
  }

  async cancelPost(userId: string, postId: string): Promise<void> {
    return await PostRepository.cancelPost(userId, postId);
  }

  async cancelBookmarks(userId: string, postIds: string[]): Promise<void> {
    await PostRepository.cancelBookmarks(userId, postIds);
  }

  async deletePost(userId: string, postId: string): Promise<void> {
    await PostRepository.deletePost(userId, postId);
  }

  async deletePosts(postIds: string[]): Promise<void> {
    await PostRepository.deletePosts(postIds);
  }

  async getPostDetail(postId: string): Promise<{ post: IPost; authorProfile: object }> {
    return await PostRepository.getPostDetail(postId);
  }

  async getPostList(
    userId: string,
    // page: number,
    // limit: number,
    careTarget: string,
    isLongTerm: string,
  ) {
    return await PostRepository.getPostList(userId, careTarget, isLongTerm);
  }

  async getUserPostList(userId: string, page: number): Promise<{ posts: IPost[]; totalCount: number }> {
    return await PostRepository.getUserPostList(userId, page);
  }

  async getCompletedPostListUser(userId: string, page: number): Promise<{ posts: IPost[]; totalCount: number }> {
    return await PostRepository.getCompletedPostListUser(userId, page);
  }

  async getCompletedPostListCareUser(userId: string, page: number): Promise<{ posts: IPost[]; totalCount: number }> {
    return await PostRepository.getCompletedPostListCareUser(userId, page);
  }

  async getSavedPostList(userId: string, page: number): Promise<{ posts: IPost[]; totalCount: number }> {
    return await PostRepository.getSavedPostList(userId, page);
  }
}

export default new PostService();
