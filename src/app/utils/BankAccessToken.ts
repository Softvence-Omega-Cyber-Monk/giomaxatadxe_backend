import axios from "axios";

const CLIENT_ID = process.env.BOG_CLIENT_ID;
const CLIENT_SECRET = process.env.BOG_CLIENT_SECRET;

// 1. Function to get OAuth 2.0 access token
export async function getAccessToken() {
  const response = await axios.post(
    "https://oauth2.bog.ge/auth/realms/bog/protocol/openid-connect/token",
    {
      grant_type: "client_credentials",
      client_id: CLIENT_ID,
      client_secret: CLIENT_SECRET,
    },
    {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
    }
  );

  console.log("token response ", response.data.access_token);
  return response.data.access_token;
}
