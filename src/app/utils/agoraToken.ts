import { RtcRole, RtcTokenBuilder } from "agora-access-token";

const APP_ID = process.env.AGORA_APP_ID as string;
const APP_CERT = process.env.AGORA_APP_CERT as string;

export const generateAgoraToken = (
  channelName: string,
  uid: number = 0
): string => {
  const role = RtcRole.PUBLISHER;

  // Token valid for 24 hours
  const expireTimeInSeconds = 24 * 60 * 60;

  return RtcTokenBuilder.buildTokenWithUid(
    APP_ID,
    APP_CERT,
    channelName,
    uid,
    role,
    expireTimeInSeconds // <-- pass duration in seconds, not absolute timestamp
  );
};
