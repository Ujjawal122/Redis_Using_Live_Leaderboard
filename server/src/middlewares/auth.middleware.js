import jwt from "jsonwebtoken";
import User from "../models/userModel.js";
import asyncHandler from "../utils/asyncHandler.js";

/**
 * Protect routes — verifies JWT from cookie or Authorization header.
 * Attaches the authenticated user to req.user.
 */
const protect = asyncHandler(async (req, res, next) => {
  let token;

  // 1. Try cookie first (preferred for browser clients)
  if (req.cookies?.token) {
    token = req.cookies.token;
  }
  // 2. Fall back to Authorization: Bearer <token>
  else if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer ")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      message: "Not authorized — no token provided",
    });
  }

  // Verify token
  let decoded;
  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET);
  } catch (err) {
    const message =
      err.name === "TokenExpiredError"
        ? "Session expired — please log in again"
        : "Not authorized — invalid token";
    return res.status(401).json({ success: false, message });
  }

  // Attach user (minus password) to request
  const user = await User.findById(decoded.id).select("-password");
  if (!user) {
    return res.status(401).json({
      success: false,
      message: "Not authorized — user no longer exists",
    });
  }

  req.user = user;
  next();
});

export { protect };
