import { Request, Response } from "express";
import ChatService from "../services/chatService";
import { AuthRequest } from "../middlewares/authUserMiddlewares";
import { PageQueryParamDTO, LimitQueryParamDTO } from "../dtos/queryParamsDtos";
import { ApiResponse } from "../common/ApiResponse";

class ChatController {
  async applicateInfo(req: AuthRequest, res: Response) {
    const userId = req.user._id;
    const postId = req.params.postId;
    const { user, careTarget } = await ChatService.applicateInfo(userId, postId);
    return ApiResponse.success(res, "신청할 유저의 프로필이 조회되었습니다.", { user, careTarget });
  }

  async getRooms(req: AuthRequest, res: Response) {
    const userId = req.user._id;
    const { page } = new PageQueryParamDTO(req.query.page as string);
    const { limit } = new LimitQueryParamDTO(req.query.limit as string) || { limit: 10 };
    const waitForChange = async () => {
      const chats = await ChatService.getRooms(userId, page, limit);
      if (chats.length > 0) {
        return ApiResponse.success(res, "채팅방 리스트 조회가 완료되었습니다.", { chats });
      }
      setTimeout(waitForChange, 5000);
    };
    waitForChange();
  }

  async getRoom(req: AuthRequest, res: Response) {
    const userId = req.user._id;
    const chatId = req.params.chatId;
    const waitForChange = async () => {
      const chat = await ChatService.getRoom(userId, chatId);
      if (chat) {
        return ApiResponse.success(res, "채팅방 조회가 완료되었습니다.", { chat });
      }
      setTimeout(waitForChange, 5000);
    };
    waitForChange();
  }

  async checkUpdateUser(req: AuthRequest, res: Response) {
    const userId = req.user._id;
    const isUpdated = await ChatService.checkUpdateUser(userId);
    return ApiResponse.success(res, "메시지 업데이트 조회가 완료되었습니다.", { isUpdated });
  }

  async checkUpdateCareUser(req: AuthRequest, res: Response) {
    const userId = req.user._id;
    const isUpdated = await ChatService.checkUpdateCareUser(userId);
    return ApiResponse.success(res, "메시지 업데이트 조회가 완료되었습니다.", { isUpdated });
  }

  async applicate(req: AuthRequest, res: Response) {
    const userId = req.user._id;
    const { postId, content } = req.body;
    const chat = await ChatService.applicate(userId, postId, content);
    return ApiResponse.success(res, "신청이 완료되었습니다.", { chat });
  }

  async sendMessage(req: AuthRequest, res: Response) {
    const userId = req.user._id;
    const chatId = req.params.chatId;
    const { content } = req.body;
    await ChatService.sendMessage(userId, chatId, content);
    return ApiResponse.success(res, "메시지가 전송되었습니다.");
  }

  async confirmCaregiver(req: AuthRequest, res: Response) {
    const userId = req.user._id;
    const chatId = req.params.chatId;
    const { userPhoneNumber, careUserPhoneNumber } = await ChatService.confirmCaregiver(userId, chatId);
    return ApiResponse.success(res, "돌봄유저가 매칭되었습니다.", { userPhoneNumber, careUserPhoneNumber });
  }

  async leaveRoom(req: AuthRequest, res: Response) {
    const userId = req.user._id;
    const chatId = req.params.chatId;
    await ChatService.leaveRoom(userId, chatId);
    return ApiResponse.success(res, "채팅방 나가기가 완료되었습니다.");
  }
}

export default new ChatController();
