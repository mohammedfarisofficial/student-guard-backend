import { strictTransportSecurity } from "helmet";
import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: false,
    unique: true,
  },
  dept: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  lat: {
    type: String,
    required: true,
  },
  lng: {
    type: String,
    required: true,
  },
  status: {
    type: Boolean,
    default: false,
  },
  notificationToken: {
    type: String,
    required: false,
  },
  role: {
    type: String,
    enum: ["student", "head"],
    required: true,
  },
  headId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  
});

const User = mongoose.model("User", userSchema);
export default User;
