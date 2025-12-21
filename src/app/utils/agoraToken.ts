import { RtcRole, RtcTokenBuilder } from "agora-access-token";

const APP_ID = process.env.AGORA_APP_ID as string;
const APP_CERT = process.env.AGORA_APP_CERT as string;

export const generateAgoraToken = (
  channelName: string,
  uid: number = 0
): string => {
 
  const role = RtcRole.PUBLISHER;
  const expireTime = 3600;

  const currentTime = Math.floor(Date.now() / 1000);
  const privilegeExpireTime = currentTime + expireTime;

  return RtcTokenBuilder.buildTokenWithUid(
    APP_ID,
    APP_CERT,
    channelName,
    uid,
    role,
    privilegeExpireTime
  );
};
