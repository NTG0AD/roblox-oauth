const express = require("express");
const fetch = require("node-fetch"); // npm install node-fetch@2
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 3000;

// Homepage — reviewer-friendly
app.get("/", (req, res) => {
  res.send(`
    <h1>IMEF Account Verification</h1>
    <p>Click below to link your Roblox account for IMEF verification.</p>
    <a href="https://apis.roblox.com/oauth/v1/authorize?client_id=${process.env.CLIENT_ID}&redirect_uri=${process.env.REDIRECT_URI}&response_type=code&scope=openid%20profile&state=test123">
      <button style="padding:10px 20px;font-size:18px;">Login with Roblox</button>
    </a>
    <p>All data is used only for verification. No spam.</p>
  `);
});

// OAuth callback
app.get("/callback", async (req, res) => {
  const code = req.query.code;
  if (!code) return res.send("No code provided");

  try {
    // Exchange code for access token
    const tokenResponse = await fetch("https://apis.roblox.com/oauth/v1/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        grant_type: "authorization_code",
        code: code,
        redirect_uri: process.env.REDIRECT_URI,
        client_id: process.env.CLIENT_ID,
        client_secret: process.env.CLIENT_SECRET
      })
    });

    const tokenData = await tokenResponse.json();

    // Fetch profile
    const profileResponse = await fetch("https://apis.roblox.com/oauth/v1/userinfo", {
      headers: { Authorization: `Bearer ${tokenData.access_token}` }
    });
    const profileData = await profileResponse.json();

    res.send(`<pre>${JSON.stringify(profileData, null, 2)}</pre>`);
  } catch (err) {
    console.error(err);
    res.send("Error fetching Roblox profile");
  }
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
