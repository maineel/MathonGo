import express from "express";
import cors from "cors";

const app = express();

app.use(cors({ origin: process.env.CORS_ORIGIN || "*" }));
app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));

app.get("/", (req, res) => {
  res.json({ message: "Welcome to the application." });
});

import { adminRouter } from "./routes/admin.route.js";
app.use("/api/v1/admin", adminRouter);


export { app };
