import { v4 as uuidv4 } from "uuid";
import { generateAgoraToken } from "../../utils/agoraToken";
import { ICall } from "./AgoraVideoCall.interface";
import { videoCall_model } from "./AgoraVideoCall.model";
import { io } from "../../../socket/initSocket";

const startCallService = async (callerId: string, receiverId: string) => {
  const pairKey =
    callerId < receiverId
      ? `${callerId}_${receiverId}`
      : `${receiverId}_${callerId}`;

  const channelName = `call_${callerId}_${receiverId}_${Date.now()}`;
  const callId = uuidv4();

  const token = generateAgoraToken(channelName);

  try {
    const call = await videoCall_model.create({
      callId,
      channelName,
      callerId,
      receiverId,
      pairKey,
      status: "ringing",
    });

    io.to(receiverId).emit("incoming_call", {
      callId,
      channelName,
      callerId,
    });

    return { callId, channelName, token };
  } catch (err: any) {
    if (err.code === 11000) {
      // Duplicate key error
      throw new Error("User is already in a call");
    }
    throw err;
  }
};

const acceptCallService = async (callId: string, receiverId: string) => {
  const call = await videoCall_model.findOne({ callId, receiverId });

  if (!call) {
    throw new Error("Call not found");
  }

  call.status = "accepted";
  call.startedAt = new Date();
  await call.save();

  const token = generateAgoraToken(call.channelName);

  io.to(call.callerId).emit("call_accepted", {
    channelName: call.channelName,
    token,
  });

  return {
    channelName: call.channelName,
    token,
  };
};

const rejectCallService = async (callId: string, receiverId: string) => {
  const call = await videoCall_model.findOne({ callId, receiverId });

  if (!call) {
    throw new Error("Call not found");
  }

  if (call.status !== "ringing") {
    throw new Error("Call already handled");
  }

  call.status = "rejected";
  call.endedAt = new Date();
  await call.save();
  +(await videoCall_model.deleteOne({ callId }));

  // 🔔 Notify caller
  io.to(call.callerId).emit("call_rejected", {
    callId: call.callId,
    receiverId,
  });

  return true;
};

const endCallService = async (callId: string) => {
  const call = await videoCall_model.findOne({ callId });

  if (!call) {
    throw new Error("Call not found");
  }

  call.status = "ended";
  call.endedAt = new Date();
  await call.save();

  await videoCall_model.deleteOne({ callId });

  // Emit to both caller and receiver
  [call.callerId, call.receiverId].forEach((userId) => {
    io.to(userId).emit("call_ended", {
      channelName: call.channelName,
    });
  });

  return true;
};

export const AgoraVideoCallService = {
  startCallService,
  acceptCallService,
  rejectCallService,
  endCallService,
};
