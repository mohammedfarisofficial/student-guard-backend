import User from "../models/User.js";
import mongoose from "mongoose";
const ObjectId = mongoose.Types.ObjectId;


export const getStudents = async (req, res) => {
  try {
    const students = await User.find({ role: "student" });
    return res.status(200).json(students);
  } catch (err) {
    return res.status(500).json({
      error: err.message,
    });
  }
};

export const getStudent = async (req, res) => {
  try {
    const { studentId } = req.params;
    if (!ObjectId.isValid(studentId)) {
      return res.status(400).json({ msg: "Invalid student ID" });
    }
  
    const student = await User.findById(studentId);
  
    if (!student) {
      return res.status(404).json({ msg: "Student not found" });
    }
  
    return res.status(200).json(student);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
  
};
