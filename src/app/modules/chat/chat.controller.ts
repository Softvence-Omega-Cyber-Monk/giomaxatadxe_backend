import { Request, Response } from "express";
import { chatService } from "./chat.service";
import { User_Model } from "../user/user.schema";

export const chatController = {
  // user ↔ user
  getConversation: async (req: Request, res: Response) => {
    if (!req.user || !req.user.userId) {
      return res
        .status(401)
        .json({ error: "Unauthorized: user not found in request" });
    }
    const userId = req.user.userId as string;
    const otherUserId = req.params.id;

    const messages = await chatService.getConversation(userId, otherUserId);
    res.json(messages);
  },

  // user ↔ admin
  getAdminConversation: async (req: Request, res: Response) => {
    if (!req.user || !req.user.userId) {
      return res
        .status(401)
        .json({ error: "Unauthorized: user not found in request" });
    }
    const userId = req?.user.userId as string;

    const admins = await User_Model.find({ role: "admin" }).select("_id");
    const adminIds = admins.map((a) => a._id.toString());

    const messages = await chatService.getAdminConversation(userId, adminIds);
    res.json(messages);
  },
};
