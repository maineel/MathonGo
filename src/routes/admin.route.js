import { Router } from "express";
import {
  listController,
  userController,
} from "../controllers/admin.controller.js";
import multer from "multer";

const adminRouter = Router();

const upload = multer({ dest: "tmp/csv/" });

adminRouter.route("/lists").post(listController);
adminRouter.route("/lists/:listId/users").post(upload.single('file'),userController);

export { adminRouter };