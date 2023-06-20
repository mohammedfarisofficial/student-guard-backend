import express from "express";
import User from "../models/User.js";

const router = express.Router();

router.post("/notification", async (req, res) => {
  const { userId, headId } = req.body;
  const student = await User.findOne({ _id: userId, role: "student" });

  if (student) {
    console.log(student.name);
  }
  res.send("working");
});

export default router;
