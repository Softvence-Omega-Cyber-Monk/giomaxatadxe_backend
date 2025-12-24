import { ChatModel } from "../app/modules/chat/chat.model";

export const chatSocketHandler = (io: any, socket: any) => {
  const user = socket.data.user;
  const userId = user.userId.toString();

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
    const { receiverId, message, chatType } = data;

    const newMsg = await ChatModel.create({
      senderId: userId,
      receiverId,
      chatType,
      message,
    });

    socket.emit("message_sent", newMsg);
    io.to(receiverId).emit("receive_message", newMsg);
  });

  // 🔵 User → Admin

  socket.on("message_to_admin", async ({ message }: { message: string }) => {
    const newMsg = await ChatModel.create({
      senderId: userId,
      receiverType: "admin",
      chatType: "user_admin",
      message,
    });

    // Notify admin
    io.to("ADMIN_ROOM").emit("receive_from_user", newMsg);

    socket.emit("message_sent", newMsg);
  });

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

      io.to(targetUserId).emit("admin_message", newMsg);
    }
  );

  // -------------------------
  // Mark message as seen
  // -------------------------
  socket.on("mark_seen", async ({ msgId }: { msgId: string }) => {
    await ChatModel.findByIdAndUpdate(msgId, { seen: true });
  });

  socket.on("disconnect", () => console.log("Disconnected:", socket.id));
};
