import express from 'express'
import { getStudent, getStudents } from '../controllers/user.js';

const router = express.Router()

router.get("/students",getStudents)
router.get("/student/:studentId",getStudent)

export default router;