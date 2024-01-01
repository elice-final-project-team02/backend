import { sendMail } from "../common/utils/sendMail";
import { ChatModel, IChat } from "../models/chatModel";
import { MessageModel } from "../models/messageModel";
import { UserModel } from "../models/userModel";
import { PostModel } from "../models/postModel";
import { ReservationModel } from "../models/reservationModel";
import { CareInformationModel } from "../models/careInformationModel";
import { AreaModel } from "../models/areaModel";
import NotFoundError from "../common/error/NotFoundError";

class ChatRepository {
  async applicateInfo(userId: string, postId: string): Promise<{ user: object; careTarget: string }> {
    const user = await UserModel.findOne({ _id: userId });
    if (!user) {
      throw new NotFoundError("사용자를 찾을 수 없습니다.");
    }

    const existingPost = await CareInformationModel.findOne({ postId: postId });
    if (!existingPost) {
      throw new NotFoundError("게시글을 찾을 수 없습니다.");
    }

    const area = await AreaModel.findOne({ _id: existingPost.area });

    const userResponseDto = {
      profileUrl: user.profileUrl,
      name: user.name,
      age: user.age,
      gender: user.gender,
      phoneNumber: user.phoneNumber,
      region: area.region,
      subRegion: area.subRegion,
      introduction: user.introduction,
    };

    return { user: userResponseDto, careTarget: existingPost.careTarget };
  }

  async getRooms(userId: string, page: number, limit: number) {
    const startIndex = (page - 1) * limit;

    const chats = await ChatModel.find({ $or: [{ applicant: userId }, { author: userId }] })
      .sort({ updatedAt: -1 })
      .populate({
        path: "message",
        options: { sort: { createdAt: -1 } },
      })
      .populate({
        path: "post",
        select: "postNumber title",
        populate: { path: "careInformation", select: "careTarget" },
      })
      .skip(startIndex)
      .limit(limit)
      .exec();

    if (!chats) {
      throw new NotFoundError("채팅방 리스트를 찾을 수 없습니다.");
    }

    const populatedChats = await Promise.all(
      chats.map(async (chat) => {
        const latestMessage = Array.isArray(chat.message) ? chat.message[0] : chat.message;
        const author = await UserModel.findOne({ _id: chat.author });
        const applicant = await UserModel.findOne({ _id: chat.applicant });

        return {
          ...chat.toObject(),
          message: latestMessage,
          author: { profileUrl: author.profileUrl, name: author.name },
          applicant: { profileUrl: applicant.profileUrl, name: applicant.name },
          userId,
        };
      }),
    );

    return populatedChats;
  }

  async getRoom(userId: string, chatId: string) {
    await MessageModel.updateMany({ chat: chatId, sender: { $ne: userId } }, { $set: { isRead: true } }, { new: true });

    const chat = await ChatModel.findOne({ _id: chatId })
      .populate({
        path: "message",
        options: { sort: { createdAt: 1 } },
      })
      .populate({
        path: "post",
        select: "postNumber title",
        populate: { path: "careInformation", select: "careTarget" },
      });

    if (!chat) {
      throw new NotFoundError("채팅방을 찾을 수 없습니다.");
    }

    const [author, applicant] = await Promise.all([
      UserModel.findOne({ _id: chat.author }),
      UserModel.findOne({ _id: chat.applicant }),
    ]);

    const authorArea = await AreaModel.findOne({ _id: author.area });
    const applicantArea = await AreaModel.findOne({ _id: applicant.area });

    return {
      chat: {
        ...chat.toObject(),
        author: {
          profileUrl: author.profileUrl,
          name: author.name,
          age: author.age,
          gender: author.gender,
          region: authorArea.region,
          subRegion: authorArea.subRegion,
        },
        applicant: {
          profileUrl: applicant.profileUrl,
          name: applicant.name,
          age: applicant.age,
          gender: applicant.gender,
          region: applicantArea.region,
          subRegion: applicantArea.subRegion,
        },
        userId,
      },
    };
  }

  async checkUpdateUser(userId: string): Promise<boolean> {
    let isUpdated = false;

    const chats = await ChatModel.find({ author: userId });
    for (const chat of chats) {
      const messages = await MessageModel.find({ chat: chat._id, isRead: false, sender: { $ne: userId } });

      if (messages.length > 0) {
        isUpdated = true;
        break;
      }
    }

    return isUpdated;
  }

  async checkUpdateCareUser(userId: string): Promise<boolean> {
    let isUpdated = false;

    const message = await MessageModel.findOne({ isRead: false, receiver: userId });

    if (message) {
      isUpdated = true;
    }

    return isUpdated;
  }

  async applicate(userId: string, postId: string, content: string): Promise<IChat> {
    const post = await PostModel.findOne({ _id: postId });
    if (!post) {
      throw new NotFoundError("게시글을 찾을 수 없습니다.");
    }

    post.applicantsCount += 1;
    await post.save();

    const chat = await ChatModel.create({
      message: [null],
      applicant: userId,
      author: post.author,
      post: postId,
      status: "매칭전",
      leaveRoom: [],
    });

    const messageDTO = {
      chat: chat._id,
      sender: userId,
      receiver: post.author,
      content: content,
      isRead: false,
    };

    const message = await MessageModel.create(messageDTO);

    chat.message.push(message._id);

    await chat.save();

    return chat.populate("message");
  }

  async sendMessage(userId: string, chatId: string, content: string): Promise<void> {
    const chat = await ChatModel.findOne({ _id: chatId });
    if (!chat) {
      throw new NotFoundError("채팅방을 찾을 수 없습니다.");
    }

    const receiverId = userId === chat.applicant ? chat.author : chat.applicant;

    const message = await MessageModel.create({
      chat: chat._id,
      sender: userId,
      receiver: receiverId,
      content: content,
      isRead: false,
    });

    chat.message.push(message._id);

    await chat.save();
  }

  async confirmCaregiver(
    userId: string,
    chatId: string,
  ): Promise<{ userPhoneNumber: string; careUserPhoneNumber: string }> {
    const chat = await ChatModel.findOneAndUpdate({ _id: chatId }, { status: "매칭완료" }, { new: true });
    await ReservationModel.findOneAndUpdate({ postId: chat.post }, { status: "완료" });

    const user = await UserModel.findOne({ _id: userId });
    const careUser = await UserModel.findOne({ _id: chat.applicant });

    await CareInformationModel.findOneAndUpdate(
      { postId: chat.post },
      { $set: { careUser: [careUser._id, careUser.name] } },
    );

    const emailSubject = "[쓰담쓰담] 돌봄 매칭이 완료되었습니다.";
    const userEmailBody = `
  안녕하세요, ${user.name}님!

  쓰담쓰담을 이용해 주셔서 감사합니다. 돌봄 매칭이 성공적으로 완료되었습니다.

  - 돌봄 매칭 정보 -
  돌봄 매칭 대상: ${careUser.name}님
  돌봄 매칭 대상 전화번호: ${careUser.phoneNumber}

  쓰담쓰담을 이용해 주셔서 진심으로 감사드립니다. 더 나은 서비스로 보답하겠습니다.

  감사합니다,
  쓰담쓰담 팀
`;
    const careUserEmailBody = `
  안녕하세요, ${careUser.name}님!

  쓰담쓰담을 이용해 주셔서 감사합니다. 돌봄 매칭이 성공적으로 완료되었습니다.

  - 돌봄 매칭 정보 -
  돌봄 매칭 대상: ${user.name}님
  돌봄 매칭 대상 전화번호: ${user.phoneNumber}

  쓰담쓰담을 이용해 주셔서 진심으로 감사드립니다. 더 나은 서비스로 보답하겠습니다.

  감사합니다,
  쓰담쓰담 팀
`;

    await sendMail(user.email, emailSubject, userEmailBody);
    await sendMail(careUser.email, emailSubject, careUserEmailBody);

    return { userPhoneNumber: user.phoneNumber, careUserPhoneNumber: careUser.phoneNumber };
  }

  async leaveRoom(userId: string, chatId: string): Promise<void> {
    const chat = await ChatModel.findOne({ _id: chatId });
    if (!chat) {
      throw new NotFoundError("채팅방을 찾을 수 없습니다.");
    }
    chat.leaveRoom.push(userId);
    await chat.save();
  }
}

export default new ChatRepository();
