import Redis from "ioredis";
import dotenv from "dotenv";

dotenv.config()


const redis = new Redis({
  host:process.env.REDIS_HOST,
  port:process.env.REDIS_PORT,
  username:process.env.REDIS_USERNAME,
  password:process.env.REDIS_PASSWORD,                  
  maxRetriesPerRequest: 3,
  retryStrategy(times) {
    if (times > 3) {
      console.error("Redis: max retries reached, giving up.");
      return null;
    }
    return Math.min(times * 500, 2000);

    
  },
});



redis.on("error", (err) => {
  console.error("Redis error:", err.message);
});




export default redis;