import { v4 as uuidv4 } from "uuid";
import { generateAgoraToken } from "../../utils/agoraToken";
import { ICall } from "./AgoraVideoCall.interface";
import { videoCall_model } from "./AgoraVideoCall.model";

const startCallService = async (callerId: string, receiverId: string) => {
  const channelName = `call_${callerId}_${receiverId}_${Date.now()}`;
  const callId = uuidv4();

  const token = generateAgoraToken(channelName);

  const call: ICall = await videoCall_model.create({
    callId,
    channelName,
    callerId,
    receiverId,
    status: "ringing",
  });

  return {
    callId: call.callId,
    channelName: call.channelName,
    token,
  };
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

  return {
    channelName: call.channelName,
    token,
  };
};

const endCallService = async (callId: string) => {
  const call = await videoCall_model.findOne({ callId });

  if (!call) {
    throw new Error("Call not found");
  }

  call.status = "ended";
  call.endedAt = new Date();
  await call.save();

  return true;
};

export const AgoraVideoCallService = {
  startCallService,
  acceptCallService,
  endCallService,
};
