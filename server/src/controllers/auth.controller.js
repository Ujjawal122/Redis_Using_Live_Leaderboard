import User from "../models/userModel.js";
import bcryptjs from "bcryptjs";
import generateToken from "../utils/generateToken.js";
import asyncHandler from "../utils/asyncHandler.js";

const sanitizeUser = (user) => {
  const userObject = user.toObject();
  delete userObject.password;
  return userObject;
};

// Cookie options reused across login/register/logout
const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax", // "strict" blocks cookies on cross-origin dev (5173 → 3000)
  maxAge: 4 * 24 * 60 * 60 * 1000, // 4 days in ms
};

export const registerUser = asyncHandler(async (req, res) => {
  const { username, email, password } = req.body;

  if (!username || !email || !password) {
    return res.status(400).json({
      success: false,
      message: "Username, email and password are required",
    });
  }

  const normalizedEmail = email.trim().toLowerCase();
  const normalizedUsername = username.trim();

  const existUser = await User.findOne({
    $or: [{ email: normalizedEmail }, { username: normalizedUsername }],
  });

  if (existUser) {
    return res.status(409).json({
      success: false,
      message: "User already exists",
    });
  }

  const hashedPassword = await bcryptjs.hash(password, 10);
  const user = await User.create({
    username: normalizedUsername,
    email: normalizedEmail,
    password: hashedPassword,
  });

  const token = generateToken(user._id);

  // ✅ Token lives ONLY in the HttpOnly cookie — never returned in the body
  res
    .status(201)
    .cookie("token", token, cookieOptions)
    .json({
      success: true,
      user: sanitizeUser(user),
    });
});

export const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({
      success: false,
      message: "Email and password are required",
    });
  }

  const user = await User.findOne({ email: email.trim().toLowerCase() });

  if (!user) {
    return res.status(401).json({
      success: false,
      message: "Invalid credentials",
    });
  }

  const isMatch = await bcryptjs.compare(password, user.password);

  if (!isMatch) {
    return res.status(401).json({
      success: false,
      message: "Invalid credentials",
    });
  }

  const token = generateToken(user._id);

  // ✅ Token lives ONLY in the HttpOnly cookie — never returned in the body
  res
    .status(200)
    .cookie("token", token, cookieOptions)
    .json({
      success: true,
      user: sanitizeUser(user),
    });
});

export const logoutUser = asyncHandler(async (req, res) => {
  res
    .status(200)
    .clearCookie("token", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
    })
    .json({
      success: true,
      message: "Logged out successfully",
    });
});


export const getMe = asyncHandler(async (req, res) => {
  
  res.status(200).json({
    success: true,
    user: req.user,
  });
});



