import rateLimit from "express-rate-limit";

/**
 * General API rate limiter — 100 requests per 15 minutes per IP.
 * Applied globally to all /api/* routes.
 */
export const globalRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  standardHeaders: true,  // Return rate-limit info in RateLimit-* headers
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many requests from this IP, please try again after 15 minutes",
  },
  skipSuccessfulRequests: false,
});

/**
 * Strict rate limiter for auth endpoints — 10 attempts per 15 minutes per IP.
 * Prevents brute-force attacks on login/register.
 */
export const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many auth attempts from this IP, please try again after 15 minutes",
  },
  skipSuccessfulRequests: true, // Only count failed attempts
});

/**
 * Score-update rate limiter — 30 score updates per minute per IP.
 * Prevents score spamming on leaderboard endpoints.
 */
export const scoreRateLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many score updates, please slow down",
  },
});
