import { RtcRole, RtcTokenBuilder } from "agora-access-token";

const APP_ID = process.env.AGORA_APP_ID as string;
const APP_CERT = process.env.AGORA_APP_CERT as string;

export const generateAgoraToken = (
  channelName: string,
  uid: string // UID comes as string
): string => {
  const role = RtcRole.PUBLISHER;

  // Convert string UID to number
  const numericUid = parseInt(uid, 10);
  const finalUid = isNaN(numericUid) ? 0 : numericUid;

  // Token valid for 1 hour
  const privilegeExpireInSeconds = 3600;

  return RtcTokenBuilder.buildTokenWithUid(
    APP_ID,
    APP_CERT,
    channelName,
    finalUid,
    role,
    privilegeExpireInSeconds // <-- only 6th argument
  );
};
