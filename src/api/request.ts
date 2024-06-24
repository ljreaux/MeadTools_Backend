import express from "express";
const requestRouter = express.Router();
import { OAuth2Client } from "google-auth-library";

requestRouter.post("/", async function (req, res) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Referrer-Policy", "no-referrer-when-downgrade");
  let fullUrl = req.protocol + "://" + req.get("host") + req.originalUrl;
  console.log(fullUrl);
  const redirectUrl = "https://mead-tools-api.vercel.app/api/users/oauth";

  const oAuth2Client = new OAuth2Client(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    redirectUrl
  );

  const authorizeUrl = oAuth2Client.generateAuthUrl({
    access_type: "offline",
    scope:
      "https://www.googleapis.com/auth/userinfo.profile https://www.googleapis.com/auth/userinfo.email openid",
    prompt: "consent",
  });
  res.json({ url: authorizeUrl });
});
export default requestRouter;
