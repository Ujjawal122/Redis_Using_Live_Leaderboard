import helmet from "helmet";
import mongoSanitize from "express-mongo-sanitize";
import xssClean from "xss-clean";
import hpp from "hpp";

/**
 * Helmet — sets secure HTTP headers (XSS, clickjacking, MIME sniffing, etc.)
 * Configured to allow the frontend dev server as a trusted source.
 */
export const helmetMiddleware = helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" },
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:"],
      connectSrc: ["'self'", process.env.CLIENT_URL || "http://localhost:5173"],
    },
  },
});

/**
 * Mongo Sanitize — strips $ and . from user input to prevent NoSQL injection.
 * e.g. { "email": { "$gt": "" } } → stripped to {}
 */
export const sanitizeMongo = mongoSanitize({
  replaceWith: "_",        // Replace forbidden chars with _  instead of deleting
  onSanitize: ({ req, key }) => {
    console.warn(`[Security] Mongo injection attempt detected on key: ${key} | IP: ${req.ip}`);
  },
});

/**
 * XSS Clean — sanitizes user-supplied HTML/JS from req.body, req.params, req.query.
 * Prevents reflected/stored XSS attacks.
 */
export const sanitizeXSS = xssClean();

/**
 * HPP (HTTP Parameter Pollution) — prevents attackers from sending duplicate
 * query parameters (e.g. ?sort=score&sort=username) which can bypass validation.
 * Whitelisted params are allowed to be arrays.
 */
export const preventHPP = hpp({
  whitelist: ["sort", "fields", "page", "limit"],
});
