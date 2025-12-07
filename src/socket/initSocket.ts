import { Server } from "socket.io";
import { jwtHelpers } from "../app/utils/JWT";
import { configs } from "../app/configs";
import { chatSocketHandler } from "./chatSocketHandler";

export const initSocket = (server: any) => {
  const io = new Server(server, {
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
    chatSocketHandler(io, socket);
  });

  return io;
};
