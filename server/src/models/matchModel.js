import mongoose from "mongoose";

const matchSchema = new mongoose.Schema(
  {
    player: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    score: {
      type: Number,
      required: true,
    },

    gameMode: {
      type: String,
      default: "solo",
    },

    result: {
      type: String,
      enum: ["win", "lose"],
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const Match = mongoose.model(
  "Match",
  matchSchema
);

export default Match;
