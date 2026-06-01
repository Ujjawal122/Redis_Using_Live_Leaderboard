import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

import authRoutes from "./routes/auth.routes.js";
import leaderboardRoutes from "./routes/leaderboard.routes.js";
import playerRoutes from "./routes/player.routes.js";

const app = express();

app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    credentials: true,
  })
);
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api/auth", authRoutes);
app.use("/api/leaderboard", leaderboardRoutes);
app.use("/api/players", playerRoutes);

app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Leaderboard API Running",
    environment: process.env.NODE_ENV,
  });
});

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
  });
});

app.use((err, req, res, next) => {
  let statusCode = err.statusCode || 500;
  let message = err.message || "Server error";

  if (err.name === "CastError") {
    statusCode = 400;
    message = "Invalid resource id";
  }

  if (err.name === "ValidationError") {
    statusCode = 400;
    message = Object.values(err.errors)
      .map((error) => error.message)
      .join(", ");
  }

  if (err.code === 11000) {
    statusCode = 409;
    const fields = Object.keys(err.keyPattern || err.keyValue || {}).join(", ");
    message = fields ? `${fields} already exists` : "Duplicate value already exists";
  }

  if (process.env.NODE_ENV === "development") {
    console.error("[Error]", err);
  }

  res.status(statusCode).json({
    success: false,
    message,
  });
});

export default app;
