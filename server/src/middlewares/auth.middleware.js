import jwt from "jsonwebtoken";
import User from "../models/userModel.js";
import asyncHandler from "../utils/asyncHandler.js";

const protect = asyncHandler(async (req, res, next) => {
  const token = req.cookies?.token;

  if (!token) {
    return res.status(401).json({
      success: false,
      message: "Not authorised — no token",
    });
  }

  const decoded = jwt.verify(token, process.env.JWT_SECRET);

  const user = await User.findById(decoded.id).select("-password");

  if (!user) {
    return res.status(401).json({
      success: false,
      message: "Not authorised — user not found",
    });
  }

  req.user = user;
  next();
});

export default protect;
