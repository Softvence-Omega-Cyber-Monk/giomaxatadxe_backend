import { Server } from "socket.io";
import { jwtHelpers } from "../app/utils/JWT";
import { configs } from "../app/configs";
import { chatSocketHandler } from "./chatSocketHandler";

let io: Server;

export const initSocket = (server: any) => {
  io = new Server(server, {
    cors: {
      origin: [
        "http://localhost:3000",
        "http://localhost:5173",
        "http://localhost:5174",
      ],
      credentials: true,
    },
  });

  io.use((socket, next) => {
    const token =
      socket.handshake.auth?.token || socket.handshake.headers?.authorization;
    if (!token) {
      return next(new Error("Unauthorized"));
    }
    try {
      const user = jwtHelpers.verifyToken(
        token,
        configs.jwt.accessToken_secret as string
      );
      socket.data.user = user;
      next();
    } catch (err) {
      next(new Error("Unauthorized"));
    }
  });

  io.on("connection", (socket) => {
    console.log("✅ User connected:", socket.id);

    const user = socket.data.user;
    const userId = user.userId.toString();

    socket.join(userId);

    chatSocketHandler(io, socket ,user , userId );
  });

  return io;
};

// ✅ Export io separately
export { io };
export default initSocket;
