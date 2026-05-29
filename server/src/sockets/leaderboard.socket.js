// leaderboardSocket.js
const leaderboardSocket = (io) => {
  io.on("connection", (socket) => {
    console.log("User Connected:", socket.id);

    socket.on("joinLeaderboard", (leaderboardId) => {
      if (!leaderboardId) {
        socket.emit("error", "Leaderboard ID is required");
        return;
      }
      socket.join(`leaderboard_${leaderboardId}`);
      console.log(`User ${socket.id} joined leaderboard: ${leaderboardId}`);
    });

    socket.on("scoreUpdated", (data) => {
      if (!data?.leaderboardId || data.score === undefined || data.score === null) {
        socket.emit("error", "Invalid score data");
        return;
      }
      io.to(`leaderboard_${data.leaderboardId}`).emit("leaderboardRefresh", data);
    });

    socket.on("disconnect", () => {
      console.log("User Disconnected:", socket.id);
    });
  });
};

export default leaderboardSocket;
