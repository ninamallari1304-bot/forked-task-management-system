import express from "express";
import {
  getProjects,
  createProject,
  updateProject,
  deleteProject,
} from "../controllers/projectController.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

router.use(protect); // everything below requires login

router.route("/").get(getProjects).post(createProject);
router.route("/:id").put(updateProject).delete(deleteProject);

export default router;