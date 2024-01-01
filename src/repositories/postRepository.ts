import { AreaModel } from "./../models/areaModel";
import { UserModel } from "../models/userModel";
import { PostModel, IPost } from "../models/postModel";
import { CreatePostDTO } from "../dtos/postDto";
import { ReservationModel } from "../models/reservationModel";
import { CareInformationModel } from "../models/careInformationModel";
import NotFoundError from "../common/error/NotFoundError";
import BadRequestError from "../common/error/BadRequestError";

class PostRepository {
  async createPost(userId: string, CreatePostDTO: CreatePostDTO): Promise<IPost> {
    const latestPost = await PostModel.findOne().sort({ postNumber: -1 });
    const nextPostNumber = latestPost && latestPost.postNumber ? latestPost.postNumber + 1 : 1;

    const areaDTO = {
      region: CreatePostDTO.region,
      subRegion: CreatePostDTO.subRegion,
    };

    const [area, post] = await Promise.all([
      AreaModel.create(areaDTO),
      PostModel.create({
        postNumber: nextPostNumber,
        author: userId,
        ...CreatePostDTO,
        reservation: null,
        careInformation: null,
      }),
    ]);

    const reservationDTO = {
      postId: post._id,
      isLongTerm: CreatePostDTO.isLongTerm,
      longTerm: CreatePostDTO.isLongTerm ? CreatePostDTO.longTerm : null,
      shortTerm: CreatePostDTO.isLongTerm ? null : CreatePostDTO.shortTerm,
      hourlyRate: CreatePostDTO.hourlyRate,
      negotiableRate: CreatePostDTO.negotiableRate,
      status: "모집중",
    };

    const careInformationDTO = {
      postId: post._id,
      area: area._id,
      careTarget: CreatePostDTO.careTarget,
      targetFeatures: CreatePostDTO.targetFeatures,
      cautionNotes: CreatePostDTO.cautionNotes,
      preferredmateAge: CreatePostDTO.preferredmateAge,
      preferredmateGender: CreatePostDTO.preferredmateGender,
      care_user: null,
    };

    const [reservation, careInformation] = await Promise.all([
      ReservationModel.create(reservationDTO),
      CareInformationModel.create(careInformationDTO),
    ]);

    await PostModel.findByIdAndUpdate(post._id, {
      reservation: reservation._id,
      careInformation: careInformation._id,
    });

    return await PostModel.findById(post._id)
      .populate({
        path: "reservation",
        model: "Reservation",
      })
      .populate({
        path: "careInformation",
        model: "CareInformation",
        populate: {
          path: "area",
          model: "Area",
        },
      })
      .exec();
  }

  async updatePost(userId: string, postId: string, postDTO: CreatePostDTO): Promise<IPost> {
    const existingPost = await PostModel.findById(postId);

    if (!existingPost) {
      throw new NotFoundError("게시글을 찾을 수 없습니다.");
    }

    if (existingPost.author !== userId.toString()) {
      throw new BadRequestError("작성자만 수정할 수 있습니다.");
    }

    const careInnformation = await CareInformationModel.findOne({ postId: postId });

    await PostModel.findOneAndUpdate(
      { _id: postId },
      {
        title: postDTO.title,
        content: postDTO.content,
      },
    );

    await ReservationModel.findOneAndUpdate(
      { postId: postId },
      {
        isLongTerm: postDTO.isLongTerm,
        longTerm: postDTO.isLongTerm ? postDTO.longTerm : null,
        shortTerm: postDTO.isLongTerm ? null : postDTO.shortTerm,
        hourlyRate: postDTO.hourlyRate,
        negotiableRate: postDTO.negotiableRate,
      },
    );

    const area = await AreaModel.findOneAndUpdate(
      { _id: careInnformation.area },
      { region: postDTO.region, subRegion: postDTO.subRegion },
    );

    await CareInformationModel.findOneAndUpdate(
      { postId: postId },
      {
        careTarget: postDTO.careTarget,
        targetFeatures: postDTO.targetFeatures,
        cautionNotes: postDTO.cautionNotes,
        preferredmateAge: postDTO.preferredmateAge,
        preferredmateGender: postDTO.preferredmateGender,
        area: area._id,
      },
    );

    return await PostModel.findById(postId)
      .populate({
        path: "reservation",
        model: "Reservation",
      })
      .populate({
        path: "careInformation",
        model: "CareInformation",
        populate: {
          path: "area",
          model: "Area",
        },
      })
      .exec();
  }

  async savePost(userId: string, postId: string): Promise<void> {
    const user = await UserModel.findOne({ _id: userId });
    const existingPost = await PostModel.findById(postId);

    if (!existingPost) {
      throw new NotFoundError("게시글을 찾을 수 없습니다.");
    }

    if (user.bookmarks.includes(postId)) {
      throw new BadRequestError("이미 찜한 게시글입니다.");
    }

    user.bookmarks.push(postId);

    await UserModel.findByIdAndUpdate(userId, { bookmarks: user.bookmarks });
  }

  async cancelPost(userId: string, postId: string): Promise<void> {
    const user = await UserModel.findOne({ _id: userId });

    const existingPost = await PostModel.findById(postId);

    if (!existingPost) {
      throw new NotFoundError("게시글을 찾을 수 없습니다.");
    }

    if (!user.bookmarks.includes(postId)) {
      throw new BadRequestError("해당 게시글이 없습니다.");
    }

    user.bookmarks = user.bookmarks.filter((bookmark) => !postId.includes(bookmark));

    await UserModel.findByIdAndUpdate(userId, { bookmarks: user.bookmarks });
  }

  async cancelBookmarks(userId: string, postIds: string[]): Promise<void> {
    const user = await UserModel.findOne({ _id: userId });

    user.bookmarks = user.bookmarks.filter((bookmark) => !postIds.includes(bookmark));

    await user.save();
  }

  async deletePost(userId: string, postId: string): Promise<void> {
    const existingPost = await PostModel.findById(postId);

    if (!existingPost) {
      throw new NotFoundError("게시글을 찾을 수 없습니다.");
    }

    if (existingPost.author !== userId.toString()) {
      throw new BadRequestError("작성자만 삭제할 수 있습니다.");
    }

    const careInformation = await CareInformationModel.findOne({ postId: postId });

    await Promise.all([
      ReservationModel.findOneAndDelete({ postId: postId }),
      AreaModel.findOneAndDelete({ _id: careInformation.area }),
      CareInformationModel.findOneAndDelete({ postId: postId }),
      PostModel.findByIdAndDelete(postId),
    ]);
  }

  async deletePosts(postIds: string[]): Promise<void> {
    await PostModel.deleteMany({ _id: { $in: postIds } });
  }

  async getPostDetail(postId: string): Promise<{ post: IPost; authorProfile: object }> {
    const existingPost = await PostModel.findById(postId);

    if (!existingPost) {
      throw new NotFoundError("게시글을 찾을 수 없습니다.");
    }

    const authorProfile = await UserModel.findById(existingPost.author);

    const authorProfileResponseDto = {
      name: authorProfile.name,
      profileUrl: authorProfile.profileUrl,
    };

    const post = await PostModel.findById(postId)
      .populate({
        path: "reservation",
        model: "Reservation",
      })
      .populate({
        path: "careInformation",
        model: "CareInformation",
        populate: {
          path: "area",
          model: "Area",
        },
      })
      .exec();

    return { post: post, authorProfile: authorProfileResponseDto };
  }

  async getPostList(
    userId: string,
    // page: number,
    // limit: number,
    careTarget: string,
    isLongTerm: string,
  ) {
    const user = UserModel.findOne({ _id: userId });

    const sortedPosts = await PostModel.aggregate([
      {
        $lookup: {
          from: "reservations",
          localField: "reservation",
          foreignField: "_id",
          as: "reservation",
        },
      },
      {
        $unwind: "$reservation",
      },
      ...(isLongTerm
        ? [
            {
              $match: {
                "reservation.isLongTerm": isLongTerm === "true",
                "reservation.status": "모집중",
              },
            },
          ]
        : []),
      {
        $lookup: {
          from: "careinformations",
          localField: "careInformation",
          foreignField: "_id",
          as: "careInformation",
        },
      },
      {
        $unwind: "$careInformation",
      },
      ...(careTarget
        ? [
            {
              $match: {
                "careInformation.careTarget": careTarget,
              },
            },
          ]
        : []),
      {
        $lookup: {
          from: "areas",
          localField: "careInformation.area",
          foreignField: "_id",
          as: "careInformation.area",
        },
      },
      {
        $unwind: "$careInformation.area",
      },
      {
        $sort: { createdAt: -1 },
      },
    ]);

    // const startIndex = (page - 1) * limit;
    // const endIndex = page * limit;
    // const posts = sortedPosts.slice(startIndex, endIndex);

    const userBookmarkPostIds = (await user)?.bookmarks.map((bookmark) => bookmark.toString()) || [];

    const postsWithBookmarks = sortedPosts.map((post) => ({
      ...post,
      isBookmarked: userBookmarkPostIds.includes(post._id.toString()),
    }));

    return { posts: postsWithBookmarks, totalCount: sortedPosts.length };
  }

  async getUserPostList(userId: string, page: number): Promise<{ posts: IPost[]; totalCount: number }> {
    const [posts, totalCount] = await Promise.all([
      PostModel.find({ author: userId })
        .skip((page - 1) * 7)
        .limit(7)
        .sort({ createdAt: -1 })
        .populate({
          path: "reservation",
          model: "Reservation",
        })
        .populate({
          path: "careInformation",
          model: "CareInformation",
          populate: {
            path: "area",
            model: "Area",
          },
        })
        .exec(),
      PostModel.countDocuments({ author: userId }),
    ]);

    return { posts, totalCount };
  }

  async getCompletedPostListUser(userId: string, page: number): Promise<{ posts: IPost[]; totalCount: number }> {
    const [result] = await PostModel.aggregate([
      {
        $lookup: {
          from: "reservations",
          localField: "reservation",
          foreignField: "_id",
          as: "reservation",
        },
      },
      {
        $unwind: "$reservation",
      },
      {
        $match: {
          "reservation.status": "완료",
          author: userId.toString(),
        },
      },
      {
        $lookup: {
          from: "careinformations",
          localField: "careInformation",
          foreignField: "_id",
          as: "careInformation",
        },
      },
      {
        $unwind: "$careInformation",
      },
      {
        $lookup: {
          from: "areas",
          localField: "careInformation.area",
          foreignField: "_id",
          as: "careInformation.area",
        },
      },
      {
        $unwind: "$careInformation.area",
      },
      {
        $facet: {
          posts: [
            {
              $sort: { createdAt: -1 },
            },
            {
              $skip: (page - 1) * 7,
            },
            {
              $limit: 7,
            },
          ],
          totalCount: [
            {
              $count: "total",
            },
          ],
        },
      },
      {
        $unwind: "$totalCount",
      },
    ]);

    return { posts: result?.posts || [], totalCount: result?.totalCount?.total || 0 };
  }

  async getCompletedPostListCareUser(userId: string, page: number): Promise<{ posts: IPost[]; totalCount: number }> {
    const [result] = await PostModel.aggregate([
      {
        $lookup: {
          from: "reservations",
          localField: "reservation",
          foreignField: "_id",
          as: "reservation",
        },
      },
      {
        $unwind: "$reservation",
      },
      {
        $lookup: {
          from: "careinformations",
          localField: "careInformation",
          foreignField: "_id",
          as: "careInformation",
        },
      },
      {
        $unwind: "$careInformation",
      },
      {
        $match: {
          "reservation.status": "완료",
          "careInformation.careUser": userId.toString(),
        },
      },
      {
        $lookup: {
          from: "areas",
          localField: "careInformation.area",
          foreignField: "_id",
          as: "careInformation.area",
        },
      },
      {
        $unwind: "$careInformation.area",
      },
      {
        $facet: {
          posts: [
            {
              $sort: { createdAt: -1 },
            },
            {
              $skip: (page - 1) * 7,
            },
            {
              $limit: 7,
            },
          ],
          totalCount: [
            {
              $count: "total",
            },
          ],
        },
      },
      {
        $unwind: "$totalCount",
      },
    ]);

    const postsWithUser = await Promise.all(
      (result?.posts || []).map(async (post: IPost) => {
        const user = await UserModel.findOne({ _id: post.author });
        return { ...post, author: [user._id, user.name] };
      }),
    );

    return { posts: postsWithUser, totalCount: result?.totalCount?.total || 0 };
  }

  async getSavedPostList(userId: string, page: number): Promise<{ posts: IPost[]; totalCount: number }> {
    const user = await UserModel.findOne({ _id: userId });

    const [posts, totalCount] = await Promise.all([
      PostModel.find({ _id: { $in: user.bookmarks } })
        .skip((page - 1) * 7)
        .limit(7)
        .sort({ createdAt: -1 })
        .populate({
          path: "reservation",
          model: "Reservation",
        })
        .populate({
          path: "careInformation",
          model: "CareInformation",
          populate: {
            path: "area",
            model: "Area",
          },
        })
        .exec(),
      PostModel.countDocuments({ _id: { $in: user.bookmarks } }),
    ]);

    return { posts, totalCount };
  }
}

export default new PostRepository();
