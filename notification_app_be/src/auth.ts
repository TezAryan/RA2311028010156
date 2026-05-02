import axios from 'axios';
import * as dotenv from 'dotenv';
import path from 'path';

// Ensure env variables are loaded (important if executed standalone)
dotenv.config({ path: path.join(__dirname, '../.env') });

let cachedToken: string | undefined = undefined;
let tokenExpiryTime: number | undefined = undefined;

export async function getToken(): Promise<string | undefined> {
  // Add a 60 second buffer to expiry to be safe
  const now = Math.floor(Date.now() / 1000);
  if (cachedToken && tokenExpiryTime && now < tokenExpiryTime - 60) {
    return cachedToken;
  }

  try {
    const response = await axios.post('http://20.207.122.201/evaluation-service/auth', {
      email: process.env.EMAIL,
      name: process.env.NAME,
      rollNo: process.env.ROLL_NO,
      accessCode: process.env.ACCESS_CODE,
      clientID: process.env.CLIENT_ID,
      clientSecret: process.env.CLIENT_SECRET
    });

    cachedToken = response.data.access_token;
    tokenExpiryTime = response.data.expires_in;

    return cachedToken;
  } catch (error: any) {
    console.error("Failed to fetch fresh token:", error.response?.data || error.message);
    return undefined;
  }
}
