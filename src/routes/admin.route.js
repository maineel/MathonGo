import { Router } from "express";
import {
  listController,
  userController,
  uploads,
  unsubscribeFromList,
  sendEmailsToUsers
} from "../controllers/admin.controller.js";

const adminRouter = Router();

adminRouter.route("/lists").post(listController);
adminRouter.route("/lists/users").post(uploads,userController);
adminRouter.route("/unsubscribe/:userId").get(unsubscribeFromList);
adminRouter.route("/sendEmails/:listId").post(sendEmailsToUsers);

export { adminRouter };
