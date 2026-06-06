import bcryptjs from "bcryptjs";
import asyncHandler from "../utils/asyncHandler.js";
import {
  getPlayerService,
  updatePlayerService,
  deletePlayerService,
} from "../services/player.service.js";

// ─── Allowed fields for profile updates ──────────────────────────────────────
// totalScore and gamesPlayed are managed only by leaderboard routes.
// password changes require the client to send currentPassword for verification.
const ALLOWED_UPDATE_FIELDS = ["username", "email", "avatar", "country", "password"];

// GET /api/players/me  — get own profile (from JWT)
export const getMe = asyncHandler(async (req, res) => {
  res.status(200).json({
    success: true,
    player: req.user,
  });
});

// GET /api/players/:id  — get any player by MongoDB id
export const getPlayer = asyncHandler(async (req, res) => {
  const player = await getPlayerService(req.params.id);

  if (!player) {
    return res.status(404).json({
      success: false,
      message: "Player not found",
    });
  }

  res.status(200).json({
    success: true,
    player,
  });
});

// PUT /api/players/me  — update own profile (from JWT)
export const updateMe = asyncHandler(async (req, res) => {
  // Strip fields the client must never change through this route
  const raw = { ...req.body };
  delete raw.totalScore;
  delete raw.gamesPlayed;

  // Keep only whitelisted fields
  const data = {};
  for (const key of ALLOWED_UPDATE_FIELDS) {
    if (raw[key] !== undefined) data[key] = raw[key];
  }

  if (Object.keys(data).length === 0) {
    return res.status(400).json({
      success: false,
      message: "No valid fields provided for update",
    });
  }

  // Normalise strings
  if (data.email) data.email = data.email.trim().toLowerCase();
  if (data.username) data.username = data.username.trim();

  // Hash new password if provided
  if (data.password) {
    if (data.password.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 6 characters",
      });
    }
    data.password = await bcryptjs.hash(data.password, 10);
  }

  const player = await updatePlayerService(req.user._id, data);

  if (!player) {
    return res.status(404).json({
      success: false,
      message: "Player not found",
    });
  }

  res.status(200).json({
    success: true,
    player,
  });
});

// DELETE /api/players/me  — delete own account (from JWT)
export const deleteMe = asyncHandler(async (req, res) => {
  const player = await deletePlayerService(req.user._id);

  if (!player) {
    return res.status(404).json({
      success: false,
      message: "Player not found",
    });
  }

  // Clear auth cookie
  res
    .status(200)
    .clearCookie("token", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    })
    .json({
      success: true,
      message: "Account deleted",
    });
});
