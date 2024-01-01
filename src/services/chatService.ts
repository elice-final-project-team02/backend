import ChatRepository from "../repositories/chatRepository";
import { IChat } from "../models/chatModel";

class ChatService {
  async applicateInfo(userId: string, postId: string): Promise<{ user: object; careTarget: string }> {
    return await ChatRepository.applicateInfo(userId, postId);
  }

  async getRooms(userId: string, page: number, limit: number) {
    return await ChatRepository.getRooms(userId, page, limit);
  }

  async getRoom(userId: string, chatId: string) {
    return await ChatRepository.getRoom(userId, chatId);
  }

  async checkUpdateUser(userId: string) {
    return await ChatRepository.checkUpdateUser(userId);
  }

  async checkUpdateCareUser(userId: string) {
    return await ChatRepository.checkUpdateCareUser(userId);
  }

  async applicate(userId: string, postId: string, content: string): Promise<IChat> {
    return await ChatRepository.applicate(userId, postId, content);
  }

  async sendMessage(userId: string, chatId: string, content: string): Promise<void> {
    await ChatRepository.sendMessage(userId, chatId, content);
  }

  async confirmCaregiver(
    userId: string,
    chatId: string,
  ): Promise<{ userPhoneNumber: string; careUserPhoneNumber: string }> {
    return await ChatRepository.confirmCaregiver(userId, chatId);
  }

  async leaveRoom(userId: string, chatId: string): Promise<void> {
    await ChatRepository.leaveRoom(userId, chatId);
  }
}

export default new ChatService();
