import express from "express";
import bodyParser from "body-parser";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import helmet from "helmet";
import morgan from "morgan";
//firebase
import admin from "firebase-admin";
import serviceAccount from './student-tracker-715e8-firebase-adminsdk-2dxlx-57c43861db.json' assert { type: "json" };

//routes
import authRoutes from "./routes/auth.js";
import userRoutes from "./routes/user.js";
import statusRoutes from "./routes/status.js";
//model
import User from "./models/User.js";
//web sockets
import { Server } from "socket.io";
import { createServer } from "http";
import { sendNotification } from "./utils/sendNotification.js";

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});
const app = express();
const server = createServer(app);
const io = new Server(server);

dotenv.config();
app.use(express.json());
app.use(helmet());
app.use(helmet.crossOriginResourcePolicy({ policy: "cross-origin" }));
app.use(morgan("common"));
app.use(bodyParser.json({ limit: "30mb", extended: true }));
app.use(bodyParser.urlencoded({ limit: "30mb", extended: true }));
app.use(cors());

app.get("/", async (req, res) => {
  res.send("students tracker backend");
});

io.on("connection", (socket) => {
  console.log("a user connected");

  socket.on("disconnect", () => {
    console.log("user disconnected");
  });

  //updating current user location to db
  socket.on("user-location", async (data) => {
    console.log("recieved from client changing lat and lng");
    const { userId, coords, status } = data;
    // console.log(status)
    await User.findByIdAndUpdate(
      { _id: userId },
      {
        lat: coords.lat,
        lng: coords.lng,
        status,
      }
    );
  });

  //full doc change
  const userChange = User.watch({ fullDocument: "updateLookup" });
  userChange.on("change", (change) => {
    socket.emit("positionUpdate", change);
    console.log(
      change.fullDocument.name,
      "sending to client changing lat and lng"
    );
  });

  // only look for the status change
});

const statusChange = User.watch([
  { $match: { "updateDescription.updatedFields.status": { $exists: true } } },
  {
    $addFields: {
      fullDocument: "$$ROOT",
    },
  },
]);

statusChange.on("change", async (change) => {
  console.log("User status change:", change.documentKey._id);
  const student = await User.findById({_id:change.documentKey._id})
  const status = student.status
  let isInside;
  if(status===true){
    isInside="inside the college"
  }else{
    isInside="is going out"
  }

  const notifyData = {
    notificationType: "STUDENT_STATUS_UPDATE",
    desc : isInside
  };
  const title = `${student.name}`;
  const body = isInside;
  const userId = change.documentKey._id;

  sendNotification(userId, title, body, notifyData);
});

statusChange.on("error", (error) => {
  console.log("Error:", error);
});

app.use("/auth", authRoutes);
app.use("/user", userRoutes);
app.use("/status", statusRoutes);

const PORT = 6001;
mongoose.set("strictQuery", true);
mongoose
  .connect(
    process.env.MONGODB_URL || {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    }
  )
  .then(() => {
    server.listen(PORT, () => console.log(`server port ${PORT}`));
  })
  .catch((err) => console.log(`${err} did not connect`));
