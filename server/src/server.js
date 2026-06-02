import http from "http";
import { Server } from "socket.io";
import dotenv from "dotenv";

import app from "./app.js";
import connectDB from "./config/db.js";
import redis from "./config/redis.js";
import leaderboardSocket from "./sockets/leaderboard.socket.js";

dotenv.config();

const PORT = process.env.PORT || 5000;

connectDB();

redis.on("connect", () => {
    console.log("Redis Connected");
});

const server = http.createServer(app);

const io = new Server(server, {
    cors: {
        origin: process.env.CLIENT_URL || "http://localhost:5173",
        credentials: true,
    }
});

leaderboardSocket(io);

server.listen(PORT, () => {
    console.log(`Server Running On Port ${PORT}`);
});
