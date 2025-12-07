import { ChatModel } from "./chat.model";

export const chatService = {
  getConversation: async (userA: string, userB: string) => {
    return ChatModel.find({
      $or: [
        { senderId: userA, receiverId: userB },
        { senderId: userB, receiverId: userA },
      ],
    }).sort({ createdAt: 1 });
  },

  getAdminConversation: async (userId: string, adminIds: string[]) => {
    return ChatModel.find({
      $or: [
        { senderId: userId, receiverType: "admin" },
        { senderId: { $in: adminIds }, receiverId: userId },
      ],
    }).sort({ createdAt: 1 });
  },
};
