import { ChatModel } from "../app/modules/chat/chat.model";
import { User_Model } from "../app/modules/user/user.schema";
import { sendNotification } from "../app/utils/notificationHelper";

const onlineUsers = new Map<string, string>();

// 🔹 Helper function
const isUserOnline = (userId: string): boolean => {
  return onlineUsers.has(userId);
};

export const chatSocketHandler = (io: any, socket: any) => {
  // 🔹 Track online users globally (userId -> socketId)

  const user = socket.data.user;
  const userId = user.userId.toString();

  onlineUsers.set(userId, socket.id);

  console.log("login user ", userId);

  // Join personal room
  socket.join(userId);

  // Admin joins special room
  if (user.role === "admin") {
    socket.join("ADMIN_ROOM");
    console.log("Admin joined room");
  }

  // 🔵 Send normal message (user ↔ user)

  socket.on("send_message", async (data: any) => {
    const { receiverId, message, chatType, document, customOffer } = data;

    if (!message && !document && !customOffer) {
      return console.log("Message, document, or custom offer is required");
    }

    const payload: any = {
      senderId: userId,
      receiverId,
      chatType,
    };

    // ✅ conditionally add fields
    if (message) payload.message = message;
    if (document) payload.document = document;
    if (customOffer) payload.customOffer = customOffer;

    const newMsg = await ChatModel.create(payload);

    socket.emit("message_sent", newMsg);
    io.to(receiverId).emit("receive_message", newMsg);

    if (!isUserOnline(receiverId)) {
      await sendNotification(
        receiverId,
        "New message",
        message || "📎 Attachment received"
      );
    }
  });

  socket.on("listen_custom_offer_status", async (data: any) => {
    const { customOfferId, isAccept } = data;
    await ChatModel.findOneAndUpdate(
      { _id: customOfferId },
      { $set: { "customOffer.isAccept": isAccept } }
    );
  });

  // 🔵 User → Admin

  socket.on(
    "send_message_to_admin",
    async ({ message }: { message: string }) => {
      const newMsg = await ChatModel.create({
        senderId: userId,

        receiverType: "admin",
        chatType: "user_admin",
        message,
      });

      // Notify admin
      io.to("ADMIN_ROOM").emit("receive_from_user", newMsg);

      socket.emit("message_sent", newMsg);
    }
  );

  // -------------------------
  // 🔵 Admin → User
  // -------------------------

  socket.on(
    "admin_reply",
    async ({
      userId: targetUserId,
      message,
    }: {
      userId: string;
      message: string;
    }) => {
      const newMsg = await ChatModel.create({
        senderId: userId,
        receiverId: targetUserId,
        chatType: "user_admin",
        message,
      });

      io.to(targetUserId).emit("receive_message_from_admin", newMsg);

      // 🔔 Notify user if offline
      if (!isUserOnline(targetUserId)) {
        await sendNotification(targetUserId, "Admin replied", message);
      }
    }
  );

  // -------------------------
  // Mark message as seen
  // -------------------------
  socket.on("mark_seen", async ({ msgId }: { msgId: string }) => {
    await ChatModel.findByIdAndUpdate(msgId, { seen: true });
  });

  socket.on("disconnect", () => {
    onlineUsers.delete(userId);
    console.log("Disconnected:", socket.id);
  });
};
