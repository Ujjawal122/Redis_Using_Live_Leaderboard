import {
  createPlayerService,
  getPlayerService,
  updatePlayerService,
  deletePlayerService,
} from "../services/player.service.js";
import asyncHandler from "../utils/asyncHandler.js";
import bcryptjs from "bcryptjs";

const sanitizePlayer = (player) => {
  const playerObject = player.toObject();
  delete playerObject.password;
  return playerObject;
};

export const createPlayer = asyncHandler(async (req, res) => {
  const { username, email, password } = req.body;

  if (!username || !email || !password) {
    return res.status(400).json({
      success: false,
      message: "Username, email and password are required",
    });
  }

  const player = await createPlayerService({
    ...req.body,
    username: username.trim(),
    email: email.trim().toLowerCase(),
    password: await bcryptjs.hash(password, 10),
  });

  return res.status(201).json({
    success: true,
    player: sanitizePlayer(player),
  });
});

export const getPlayer = asyncHandler(async (req, res) => {
  const player = await getPlayerService(req.params.id);

  if (!player) {
    return res.status(404).json({
      success: false,
      message: "Player is not found",
    });
  }

  res.status(200).json({
    success: true,
    player,
  });
});

export const updatePlayer = asyncHandler(async (req, res) => {
  const data = { ...req.body };

  delete data.totalScore;
  delete data.gamesPlayed;

  if (data.email) {
    data.email = data.email.trim().toLowerCase();
  }

  if (data.username) {
    data.username = data.username.trim();
  }

  if (data.password) {
    data.password = await bcryptjs.hash(data.password, 10);
  }

  const player = await updatePlayerService(req.params.id, data);

  if (!player) {
    return res.status(404).json({
      success: false,
      message: "Player is not found",
    });
  }

  res.status(200).json({
    success: true,
    player,
  });
});

export const deletePlayer = asyncHandler(
  async (req, res) => {
    const player = await deletePlayerService(req.params.id);

    if (!player) {
      return res.status(404).json({
        success: false,
        message: "Player is not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Player deleted",
    });
  }
);
