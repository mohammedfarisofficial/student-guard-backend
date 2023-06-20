import admin from "firebase-admin";
import User from "../models/User.js";

export const sendNotification = async (userId, title, body, notifyData) => {
  const Messaging = admin.messaging();
  const role = "student";
  const student = await User.findById({ _id: userId });
  const head = await User.findById({ _id: student.headId });
  console.log(student, head);

  if (!student) throw "student not found";
  if (!head) throw "head not found";

  // //store notifications into database

  // //end store

  if (head.notificationToken !== "") {
    const notification = { title, body };
    const headers = {
      "apns-push-type": "background",
      "apns-priority": "5",
    };

    const message = {
      notification,
      data: notifyData,
      token: head.notificationToken,
      apns: {
        payload: { aps: { contentAvailable: true } },
        headers: headers,
      },
    };

    const successStr = await Messaging.send(message);
    //store successStr
    return successStr;
  }
  return 
};
