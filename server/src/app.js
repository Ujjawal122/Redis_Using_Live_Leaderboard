import express from "express";

import cors from "cors";

import authRoutes from "./routes/auth.routes.js";
import leaderboardRoutes from "./routes/leaderboard.routes.js";
import playerRoutes from "./routes/player.routes.js";

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api/auth", authRoutes);
app.use("/api/leaderboard", leaderboardRoutes);
app.use("/api/players", playerRoutes);

app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Leaderboard API Running",
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

  res.status(statusCode).json({
    success: false,
    message,
  });
});

export default app;
