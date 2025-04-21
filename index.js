const express = require("express");
const admin = require("firebase-admin");
const cors = require("cors");
require("dotenv").config();

const app = express();
app.use(cors({ origin: "*" }));
app.use(express.json());

const serviceAccount = require("./serviceAccountKey.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

app.get("/", (req, res) => {
  res.send("FCM Notification Server is running");
});

app.post("/send-notification", async (req, res) => {
  const { token, title, body } = req.body;
  console.log("🚀 ~ app.post ~ req.body:", req.body);

  if (!token || !title || !body) {
    return res
      .status(400)
      .json({ error: "token, title, and body are required" });
  }

  const message = {
    notification: {
      title,
      body,
    },
    token,
  };

  try {
    const response = await admin.messaging().send(message);
    console.log("✅ Notification sent:", response);
    return res.status(200).json({ success: true, messageId: response });
  } catch (error) {
    console.error("❌ Error sending FCM:", error);
    return res.status(500).json({ success: false, error: error.message });
  }
});

app.listen(process.env.PORT, () => {
  console.log(`🚀 Server started at http://localhost:${process.env.PORT}`);
});
