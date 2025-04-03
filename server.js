require("dotenv").config();
const express = require("express");
const admin = require("firebase-admin");

// Initialize Firebase Admin SDK
const serviceAccount = require("./serviceAccountKey.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const app = express();
app.use(express.json());

// Send Notification API
app.post("/send-notification", async (req, res) => {
  console.log("req " + req.body);

  try {
    // const { to, title, body, android_channel_id, sound = "default" } = req.body;
    const { to, notification } = req.body;
    const { title, body, android_channel_id, sound } = notification;

    if (!to || !title || !body || !android_channel_id) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // FCM message payload
    // const message = {
    //   token: to, // FCM Token
    //   notification: {
    //     title,
    //     body,
    //     android_channel_id,
    //     sound: sound,
    //   },
    //   priority: "high",
    // };

    const message = {
      token: to, // FCM Token
      notification: {
        title,
        body,
      },
      android: {
        notification: {
          channel_id: android_channel_id, // Must match the created channel in your app
          sound, // Custom sound file (must be in res/raw folder)
        },
        priority: "high", // Moved priority inside android
      },
      apns: {
        payload: {
          aps: {
            sound, // Custom sound for iOS
            alert: {
              title,
              body,
            },
          },
        },
      },
    };

    //   android: {
    //     notification: {
    //       channelId:android_channel_id, // Must match the created channel in your app
    //       sound, // Custom sound file (must be in res/raw folder)
    //       priority: "high",
    //     },
    //   },
    //   apns: {
    //     payload: {
    //       aps: {
    //         sound, // Custom sound for iOS
    //         alert: {
    //           title,
    //           body,
    //         },
    //       },
    //     },
    //   },
    // };

    // Send the notification
    const response = await admin.messaging().send(message);
    return res.json({ success: true, messageId: response });
  } catch (error) {
    console.error("FCM Error:", error);
    return res.status(500).json({ error: "Failed to send notification" });
  }
});

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(3000, () => {
  console.log(`FCM Server running on port ${PORT}`);
});
