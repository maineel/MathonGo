import { List } from "../models/list.model.js";
import fs from "fs";
import { User } from "../models/user.model.js";
import multer from "multer";
import csvParser from "csv-parser";
import { format } from "fast-csv";
import path from "path";
import { fileURLToPath } from "url";
import nodemailer from "nodemailer";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const upload = multer({ dest: path.join(__dirname, "../uploads/") });
const uploads = upload.single("file");

const transporter = nodemailer.createTransport({
  host: 'smtp.ethereal.email',
  port: 587,
  auth: {
      user: 'kelly.reichert@ethereal.email',
      pass: 'sbryWbWbwwKMCaSdxg'
  }
});

// ==================================================== Controller Logic ====================================================

const listController = async (req, res) => {
  try {
    const { title, properties } = req.body;
    const newList = new List({ title, properties });
    await newList.save();
    res.status(201).json(newList);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const userController = async (req, res) => {
  const { listId } = req.body;
  const results = [];
  const errors = [];
  const successfullyAddedUsers = [];

  fs.createReadStream(req.file?.path)
    .pipe(csvParser())
    .on("data", (data) => results.push(data))
    .on("end", async () => {
      try {
        const list = await List.findById(listId);
        if (!list) {
          return res.status(404).json({ error: "List not found" });
        }

        let successCount = 0;
        let errorCount = 0;

        for (const row of results) {
          try {
            const { name, email, ...customProperties } = row;
            if (!name || !email) {
              throw new Error("Name and Email are required fields");
            }

            const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailPattern.test(email)) {
              throw new Error("Email is invalid");
            }

            const existingUser = await User.findOne({ email, list: listId });
            if (existingUser) {
              throw new Error("Duplicate email");
            }

            const userProps = {};
            list.properties.forEach((prop) => {
              userProps[prop.title] =
                customProperties[prop.title] || prop.fallbackValue;
            });

            const newUser = new User({
              name,
              email,
              list: listId,
              customProperties: userProps,
            });
            await newUser.save();
            successfullyAddedUsers.push(newUser);
            list.users.push(newUser);
            await list.save();
            successCount++;
          } catch (error) {
            errorCount++;
            errors.push({ ...row, error: error.message });
          }
        }

        const totalCount = await User.countDocuments({ list: listId });

        if (errors.length > 0) {
          const errorCsvPath = path.join(__dirname, "../uploads/errors.csv");
          const ws = fs.createWriteStream(errorCsvPath);
          const csvStream = format({ headers: true });

          csvStream.pipe(ws).on("end", () => ws.end());

          errors.forEach((errorRow) => csvStream.write(errorRow));
          csvStream.end();

          ws.on("finish", async () => {
            res.setHeader(
              "Content-disposition",
              "attachment; filename=errors.csv"
            );
            res.set("Content-Type", "text/csv");
            fs.createReadStream(errorCsvPath)
              .pipe(res)
              .on("finish", () => {
                fs.unlink(req.file.path, () => {});
                fs.unlink(errorCsvPath, () => {});
              });
          });
        } else {
          res.status(200).json({
            successCount,
            errorCount,
            totalCount,
          });

          fs.unlink(req.file.path, () => {});
        }
      } catch (error) {
        const totalCount = await User.countDocuments({ list: listId });
        res.status(500).json({
          error: error.message,
          successCount,
          errorCount,
          totalCount,
        });
      }
    });
};

const sendEmail = async (to, subject, html) => {
  try {
    const info = await transporter.sendMail({
      from: '"Neel Sheth" <neel.s2@ahduni.edu.in>',
      to: to,
      subject: subject,
      html: html,
    });
    return info.messageId;
  } catch (error) {
    console.error("Error sending email:", error);
    throw error;
  }
};

const sendEmailsToUsers = async (req, res) => {
  const listId  = req.params.listId;
  const unsubscribeBaseUrl = "http://localhost:8000/api/v1/admin/unsubscribe/";
  const subject = "Welcome to MathonGo";
  const emailTemplate =
    "Hey [name]!<br><br>Thank you for signing up with your email [email]. We have received your city as [city].<br><br> <b>Team MathonGo.</b>";

  const list = await List.findById(listId);
  if (!list) {
    return res.status(404).json({ error: "List not found" });
  }

  for (const userId of list.users) {
    const user = await User.findById(userId);
    const emailBody = emailTemplate.replace(
      /\[(.*?)\]/g,
      (match, propertyName) => {
        return (
          user[propertyName] || (user.customProperties && user.customProperties[propertyName]) || match
        );
      }
    );

    const unsubscribeLink = `${unsubscribeBaseUrl}${user._id}`;
    const emailContent = `${emailBody}<br><br>To unsubscribe, click <a href="${unsubscribeLink}">here</a>.`;

    try {
      if (!user.isSubscribed) {
        res.status(200).json({ message: "User is not subscribed for mailing functionality!" });
      };
      await sendEmail(user.email, subject, emailContent);
    } catch (error) {
      console.error(`Failed to send email to ${user.email}:`, error);
    }
  }
  return res.status(200).json({ message: "Emails sent successfully" });
};

const unsubscribeFromList = async (req, res) => {
  try {
    const userId = req.params.userId;
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    user.isSubscribed = false;
    await user.save();

    res.status(200).json({ message: "Unsubscribed successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export {
  listController,
  userController,
  uploads,
  unsubscribeFromList,
  sendEmailsToUsers,
};
