import express from "express";
import axios from "axios";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.get("/", (req, res) => {
  res.send("Roblox OAuth Server Running");
});

app.get("/callback", async (req, res) => {
  const code = req.query.code;

  if (!code) {
    return res.send("No code provided");
  }

  try {
    const tokenResponse = await axios.post(
      "https://apis.roblox.com/oauth/v1/token",
      new URLSearchParams({
        grant_type: "authorization_code",
        code: code,
        client_id: process.env.CLIENT_ID,
        client_secret: process.env.CLIENT_SECRET,
        redirect_uri: process.env.REDIRECT_URI
      }),
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded"
        }
      }
    );

    const accessToken = tokenResponse.data.access_token;

    const userInfo = await axios.get(
      "https://apis.roblox.com/oauth/v1/userinfo",
      {
        headers: {
          Authorization: `Bearer ${accessToken}`
        }
      }
    );

    res.json(userInfo.data);

  } catch (error) {
    console.error(error.response?.data || error.message);
    res.send("OAuth failed");
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
