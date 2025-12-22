import { RtcRole, RtcTokenBuilder } from "agora-access-token";

const APP_ID = process.env.AGORA_APP_ID as string;
const APP_CERT = process.env.AGORA_APP_CERT as string;

export const generateAgoraToken = (
  channelName: string,
  userAccount: string
): string => {
  const role = RtcRole.PUBLISHER;
  const expireTime = 24 * 60 * 60;

  const currentTime = Math.floor(Date.now() / 1000);
  const privilegeExpireTime = currentTime + expireTime;

  return RtcTokenBuilder.buildTokenWithAccount(
    APP_ID,
    APP_CERT,
    channelName,
    userAccount,
    role,
    privilegeExpireTime
  );
};
