/**
 * Request logger middleware.
 * Logs method, URL, IP, status code, and response time for every request.
 * Useful for detecting abuse patterns and debugging.
 */
export const requestLogger = (req, res, next) => {
  const start = Date.now();
  const { method, originalUrl, ip } = req;

  res.on("finish", () => {
    const duration = Date.now() - start;
    const { statusCode } = res;

    const level =
      statusCode >= 500 ? "ERROR" :
      statusCode >= 400 ? "WARN " :
      "INFO ";

    console.log(
      `[${level}] ${new Date().toISOString()} | ${method} ${originalUrl} | ${statusCode} | ${duration}ms | IP: ${ip}`
    );
  });

  next();
};

/**
 * Validates that the Content-Type header is application/json for POST/PUT/PATCH.
 * Rejects requests with malformed or missing content types.
 */
export const validateContentType = (req, res, next) => {
  const methodsRequiringJSON = ["POST", "PUT", "PATCH"];

  if (methodsRequiringJSON.includes(req.method)) {
    const contentType = req.headers["content-type"] || "";
    if (!contentType.includes("application/json")) {
      return res.status(415).json({
        success: false,
        message: "Content-Type must be application/json",
      });
    }
  }

  next();
};
