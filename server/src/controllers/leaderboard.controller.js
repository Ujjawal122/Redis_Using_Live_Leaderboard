import redis from "../config/redis.js";

import User from "../models/userModel.js";

import {
  updateScoreService,
  getTopPlayerService,
  getPlayerRankService,
} from "../services/leaderboard.service.js";
import asyncHandler from "../utils/asyncHandler.js";

export const updateScore = asyncHandler(async (req, res) => {
  // Username is taken from the verified JWT — client cannot forge it
  const normalizedUsername = req.user.username;
  const { score } = req.body;
  const numericScore = Number(score);

  if (!Number.isFinite(numericScore)) {
    return res.status(400).json({
      success: false,
      message: "A numeric score is required",
    });
  }

  const player = await User.findOneAndUpdate(
    { username: normalizedUsername },
    {
      $inc: {
        totalScore: numericScore,
        gamesPlayed: 1,
      },
    },
    { new: true }
  );

  if (!player) {
    return res.status(404).json({
      success: false,
      message: "Player is not found",
    });
  }

  await updateScoreService(normalizedUsername, numericScore);
  await redis.incr("total_games");

  const rank = await getPlayerRankService(normalizedUsername);

  res.status(200).json({
    success: true,
    message: "Score updated",
    rank: rank === null ? null : rank + 1,
  });
});


export const getTopPlayers = asyncHandler(async (req, res) => {
  const leaderboard = await getTopPlayerService();

  const formattedPlayers = [];

  for (let i = 0; i < leaderboard.length; i += 2) {
    formattedPlayers.push({
      username: leaderboard[i],
      score: Number(leaderboard[i + 1]),
    });
  }

  res.status(200).json({
    success: true,
    leaderboard: formattedPlayers,
  });
});

export const getPlayerRank = asyncHandler(async (req, res) => {
  const username = req.params.username?.trim();

  if (!username) {
    return res.status(400).json({
      success: false,
      message: "Username is required",
    });
  }

  const rank = await getPlayerRankService(username);

  if (rank === null) {
    return res.status(404).json({
      success: false,
      message: "Player is not ranked",
    });
  }

  res.status(200).json({
    success: true,
    username,
    rank: rank + 1,
  });
});
