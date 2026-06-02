import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  FaTrophy,
  FaBolt,
  FaMedal,
  FaUser,
  FaChartLine,
  FaSync,
  FaSignOutAlt,
  FaStar,
  FaFire,
  FaCrown,
  FaGamepad,
} from "react-icons/fa";
import { io } from "socket.io-client";
import api from "../lib/api";
import { useAuth } from "../context/AuthContext";

// ─── Medal colours for top-3 ────────────────────────────────────────────────
const RANK_STYLE = {
  1: {
    gradient: "from-yellow-400/20 to-yellow-600/10",
    border: "border-yellow-500/40",
    badge: "bg-yellow-500",
    text: "text-yellow-400",
    icon: <FaCrown className="text-yellow-400" />,
  },
  2: {
    gradient: "from-slate-400/20 to-slate-500/10",
    border: "border-slate-400/40",
    badge: "bg-slate-400",
    text: "text-slate-300",
    icon: <FaMedal className="text-slate-300" />,
  },
  3: {
    gradient: "from-orange-700/20 to-orange-900/10",
    border: "border-orange-700/40",
    badge: "bg-orange-700",
    text: "text-orange-400",
    icon: <FaMedal className="text-orange-400" />,
  },
};

// ─── Score submission panel ──────────────────────────────────────────────────
const ScorePanel = ({ onScoreSubmitted }) => {
  const [score, setScore] = useState("");
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState(null); // { type: 'success'|'error', msg }

  const handleSubmit = async (e) => {
    e.preventDefault();
    const num = Number(score);
    if (!Number.isFinite(num) || num <= 0) {
      setFeedback({ type: "error", msg: "Enter a positive number." });
      return;
    }
    setLoading(true);
    setFeedback(null);
    try {
      const { data } = await api.post("/leaderboard/score", { score: num });
      setFeedback({
        type: "success",
        msg: `Score submitted! Your rank: #${data.rank ?? "—"}`,
      });
      setScore("");
      onScoreSubmitted?.();
    } catch (err) {
      setFeedback({
        type: "error",
        msg: err.response?.data?.message || "Failed to submit score.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.form
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      onSubmit={handleSubmit}
      className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col gap-4"
    >
      <div className="flex items-center gap-3 mb-1">
        <FaGamepad className="text-orange-500 text-xl" />
        <h2 className="text-lg font-bold text-white">Submit Score</h2>
      </div>

      <div className="flex gap-3">
        <div className="flex-1 flex items-center gap-3 rounded-lg border border-slate-700 bg-slate-950 px-4 focus-within:border-orange-500 transition">
          <FaStar className="text-orange-500 flex-shrink-0" />
          <input
            className="w-full bg-transparent py-3 outline-none text-white placeholder:text-gray-500"
            placeholder="Enter score (e.g. 250)"
            type="number"
            min="1"
            value={score}
            onChange={(e) => setScore(e.target.value)}
            required
          />
        </div>
        <motion.button
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.97 }}
          type="submit"
          disabled={loading}
          className="px-6 py-3 bg-orange-500 rounded-lg font-semibold hover:bg-orange-600 transition text-white whitespace-nowrap"
        >
          {loading ? "Submitting…" : "Submit"}
        </motion.button>
      </div>

      <AnimatePresence mode="wait">
        {feedback && (
          <motion.p
            key={feedback.msg}
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className={`text-sm px-4 py-3 rounded-lg border ${
              feedback.type === "success"
                ? "border-green-700/50 bg-green-950/40 text-green-400"
                : "border-red-700/50 bg-red-950/40 text-red-400"
            }`}
          >
            {feedback.msg}
          </motion.p>
        )}
      </AnimatePresence>
    </motion.form>
  );
};

// ─── Single leaderboard row ──────────────────────────────────────────────────
const LeaderboardRow = ({ player, rank, isCurrentUser, isNew }) => {
  const style = RANK_STYLE[rank];
  const isTop = rank <= 3;

  return (
    <motion.div
      layout
      initial={isNew ? { opacity: 0, x: -20, scale: 0.97 } : false}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.35, type: "spring", stiffness: 200, damping: 22 }}
      className={`relative flex items-center gap-4 px-5 py-4 rounded-xl border transition-all ${
        isTop
          ? `bg-gradient-to-r ${style.gradient} ${style.border}`
          : "bg-slate-900/60 border-slate-800/70"
      } ${isCurrentUser ? "ring-1 ring-orange-500/60" : ""}`}
    >
      {/* Rank badge */}
      <div className="flex-shrink-0 w-10 text-center">
        {isTop ? (
          <div
            className={`inline-flex items-center justify-center w-9 h-9 rounded-full ${style.badge} text-slate-950 font-extrabold text-sm`}
          >
            {rank}
          </div>
        ) : (
          <span className="text-gray-500 font-bold text-sm">#{rank}</span>
        )}
      </div>

      {/* Avatar */}
      <div className="flex-shrink-0 w-9 h-9 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center">
        <FaUser className={`text-sm ${isTop ? style.text : "text-gray-400"}`} />
      </div>

      {/* Username */}
      <div className="flex-1 min-w-0">
        <p
          className={`font-semibold truncate ${isTop ? style.text : "text-gray-200"} ${
            isCurrentUser ? "text-orange-400" : ""
          }`}
        >
          {player.username}
          {isCurrentUser && (
            <span className="ml-2 text-xs font-normal text-orange-500/80">(you)</span>
          )}
        </p>
      </div>

      {/* Score */}
      <div className="flex-shrink-0 flex items-center gap-2">
        {rank === 1 && <FaFire className="text-orange-400 text-sm animate-pulse" />}
        <span
          className={`font-extrabold text-lg tabular-nums ${
            isTop ? style.text : "text-gray-300"
          } ${isCurrentUser ? "text-orange-400" : ""}`}
        >
          {player.score.toLocaleString()}
        </span>
      </div>

      {/* Top indicator strip */}
      {isTop && (
        <div
          className={`absolute left-0 top-1/2 -translate-y-1/2 w-1 h-3/4 rounded-full ${style.badge}`}
        />
      )}
    </motion.div>
  );
};

// ─── Main Leaderboard page ───────────────────────────────────────────────────
const Leaderboard = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const [leaderboard, setLeaderboard] = useState([]);
  const [myRank, setMyRank] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [lastUpdated, setLastUpdated] = useState(null);
  const [liveConnected, setLiveConnected] = useState(false);
  const [newEntries, setNewEntries] = useState(new Set());
  const [refreshing, setRefreshing] = useState(false);

  const socketRef = useRef(null);
  const prevLeaderboardRef = useRef([]);

  // ── fetch top players ──────────────────────────────────────────────────────
  const fetchLeaderboard = useCallback(async (isRefresh = false) => {
    try {
      if (isRefresh) setRefreshing(true);
      const { data } = await api.get("/leaderboard/top");
      const incoming = data.leaderboard ?? [];

      const prevUsernames = new Set(prevLeaderboardRef.current.map((p) => p.username));
      const freshSet = new Set(
        incoming.filter((p) => !prevUsernames.has(p.username)).map((p) => p.username)
      );
      if (freshSet.size > 0) {
        setNewEntries(freshSet);
        setTimeout(() => setNewEntries(new Set()), 1800);
      }

      prevLeaderboardRef.current = incoming;
      setLeaderboard(incoming);
      setLastUpdated(new Date());
      setError("");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load leaderboard.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  // ── fetch own rank ─────────────────────────────────────────────────────────
  const fetchMyRank = useCallback(async () => {
    if (!user?.username) return;
    try {
      const { data } = await api.get(`/leaderboard/rank/${user.username}`);
      setMyRank(data.rank);
    } catch {
      setMyRank(null);
    }
  }, [user?.username]);

  // ── initial load ───────────────────────────────────────────────────────────
  useEffect(() => {
    fetchLeaderboard();
    fetchMyRank();
  }, [fetchLeaderboard, fetchMyRank]);

  // ── Socket.IO live updates ─────────────────────────────────────────────────
  useEffect(() => {
    const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";
    const socket = io(BACKEND_URL, {
      withCredentials: true,
      autoConnect: false,
    });
    socketRef.current = socket;

    socket.on("connect", () => {
      setLiveConnected(true);
      socket.emit("joinLeaderboard", "global");
    });
    socket.on("connect_error", (err) => {
      console.error("Socket connection failed:", err.message);
      setLiveConnected(false);
    });
    socket.on("disconnect", (reason) => {
      console.warn("Socket disconnected:", reason);
      setLiveConnected(false);
    });
    socket.on("leaderboardRefresh", () => {
      fetchLeaderboard();
      fetchMyRank();
    });

    socket.connect();

    return () => {
      socketRef.current = null;
      socket.disconnect();
    };
  }, [fetchLeaderboard, fetchMyRank]);

  // ── logout ─────────────────────────────────────────────────────────────────
  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  // ── score submitted callback ───────────────────────────────────────────────
  const handleScoreSubmitted = () => {
    fetchLeaderboard(true);
    fetchMyRank();
    socketRef.current?.emit("scoreUpdated", {
      leaderboardId: "global",
      score: Date.now(),
    });
  };

  // ── stats ──────────────────────────────────────────────────────────────────
  const totalPlayers = leaderboard.length;
  const topScore = leaderboard[0]?.score ?? 0;

  return (
    <div className="min-h-screen bg-slate-950 text-white overflow-x-hidden">
      {/* ── Navbar ──────────────────────────────────────────────────────── */}
      <nav className="flex justify-between items-center px-6 md:px-8 py-5 border-b border-slate-800/60 sticky top-0 bg-slate-950/90 backdrop-blur-md z-50">
        <button
          className="flex items-center gap-3"
          onClick={() => navigate("/")}
          type="button"
        >
          <FaTrophy className="text-orange-500 text-3xl" />
          <h1 className="text-xl md:text-2xl font-bold">
            Redis<span className="text-orange-500">Leaderboard</span>
          </h1>
        </button>

        <div className="flex items-center gap-3">
          {/* Live indicator */}
          <div className="hidden sm:flex items-center gap-2 text-sm">
            <span
              className={`inline-block w-2 h-2 rounded-full ${
                liveConnected
                  ? "bg-green-400 animate-pulse shadow-[0_0_6px_#4ade80]"
                  : "bg-gray-500"
              }`}
            />
            <span className={liveConnected ? "text-green-400" : "text-gray-500"}>
              {liveConnected ? "Live" : "Offline"}
            </span>
          </div>

          {user && (
            <motion.button
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
              onClick={() => navigate("/profile")}
              className="hidden sm:flex items-center gap-2 text-sm text-gray-300 bg-slate-900 border border-slate-700 hover:border-orange-500 hover:text-orange-400 rounded-lg px-3 py-2 transition"
            >
              <FaUser className="text-orange-500" />
              <span>{user.username}</span>
            </motion.button>
          )}

          <motion.button
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.96 }}
            onClick={() => navigate("/game")}
            className="hidden sm:flex items-center gap-2 px-4 py-2 bg-orange-500/10 border border-orange-500/40 hover:bg-orange-500 hover:border-orange-500 rounded-lg text-orange-400 hover:text-white transition text-sm font-semibold"
          >
            <FaGamepad />
            <span>Play</span>
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.96 }}
            onClick={handleLogout}
            className="flex items-center gap-2 px-4 py-2 border border-slate-700 rounded-lg hover:border-orange-500 hover:text-orange-400 transition text-sm"
          >
            <FaSignOutAlt />
            <span className="hidden sm:inline">Logout</span>
          </motion.button>
        </div>
      </nav>

      {/* ── Hero banner ─────────────────────────────────────────────────── */}
      <motion.section
        initial={{ opacity: 0, y: -24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center py-12 px-6"
      >
        <div className="inline-flex items-center gap-3 text-orange-400 mb-4">
          <FaBolt />
          <span className="font-semibold text-sm tracking-wide uppercase">
            Real-Time Rankings
          </span>
        </div>

        <h2 className="text-4xl md:text-6xl font-extrabold leading-tight">
          Global{" "}
          <span className="text-orange-500">Leaderboard</span>
        </h2>

        <p className="mt-4 text-gray-400 text-lg max-w-2xl mx-auto">
          Powered by Redis Sorted Sets — rankings update the instant a score lands.
        </p>
      </motion.section>

      {/* ── Stats bar ───────────────────────────────────────────────────── */}
      <motion.section
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="max-w-5xl mx-auto px-6 mb-8"
      >
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            {
              icon: <FaUser className="text-orange-500" />,
              label: "Players Ranked",
              value: totalPlayers,
            },
            {
              icon: <FaStar className="text-yellow-400" />,
              label: "Top Score",
              value: topScore.toLocaleString(),
            },
            {
              icon: <FaChartLine className="text-green-400" />,
              label: "Your Rank",
              value: myRank ? `#${myRank}` : "—",
            },
            {
              icon: <FaBolt className="text-orange-400" />,
              label: "Live Status",
              value: liveConnected ? "Connected" : "Disconnected",
            },
          ].map((stat, i) => (
            <motion.div
              key={i}
              whileHover={{ y: -4 }}
              transition={{ type: "spring", stiffness: 300 }}
              className="bg-slate-900 border border-slate-800 rounded-xl p-5 text-center"
            >
              <div className="flex justify-center mb-2 text-xl">{stat.icon}</div>
              <p className="text-gray-400 text-xs uppercase tracking-wide mb-1">
                {stat.label}
              </p>
              <p className="font-extrabold text-xl text-white">{stat.value}</p>
            </motion.div>
          ))}
        </div>
      </motion.section>

      {/* ── Main content ────────────────────────────────────────────────── */}
      <main className="max-w-5xl mx-auto px-6 pb-20">
        <div className="grid lg:grid-cols-[1fr_340px] gap-8 items-start">

          {/* ── Leaderboard table ───────────────────────────────────────── */}
          <motion.section
            initial={{ opacity: 0, x: -24 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.15 }}
          >
            {/* Table header */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <FaTrophy className="text-orange-500 text-xl" />
                <h3 className="text-xl font-bold">Top Players</h3>
              </div>

              <div className="flex items-center gap-3">
                {lastUpdated && (
                  <span className="text-xs text-gray-500 hidden sm:block">
                    Updated {lastUpdated.toLocaleTimeString()}
                  </span>
                )}
                <motion.button
                  whileHover={{ rotate: 180 }}
                  transition={{ duration: 0.4 }}
                  onClick={() => fetchLeaderboard(true)}
                  disabled={refreshing}
                  className="p-2 rounded-lg border border-slate-700 hover:border-orange-500 text-gray-400 hover:text-orange-400 transition"
                  title="Refresh"
                >
                  <FaSync className={refreshing ? "animate-spin" : ""} />
                </motion.button>
              </div>
            </div>

            {/* Rows */}
            <div className="space-y-3">
              {loading ? (
                Array.from({ length: 6 }).map((_, i) => (
                  <div
                    key={i}
                    className="h-16 rounded-xl bg-slate-900/60 border border-slate-800 animate-pulse"
                  />
                ))
              ) : error ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-center py-16"
                >
                  <p className="text-red-400 mb-4">{error}</p>
                  <button
                    onClick={() => fetchLeaderboard()}
                    className="px-5 py-2 bg-orange-500 rounded-lg font-semibold hover:bg-orange-600 transition text-white"
                  >
                    Retry
                  </button>
                </motion.div>
              ) : leaderboard.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-center py-16"
                >
                  <FaTrophy className="text-5xl text-gray-700 mx-auto mb-4" />
                  <p className="text-gray-500">
                    No players yet. Be the first to submit a score!
                  </p>
                </motion.div>
              ) : (
                <AnimatePresence>
                  {leaderboard.map((player, idx) => (
                    <LeaderboardRow
                      key={player.username}
                      player={player}
                      rank={idx + 1}
                      isCurrentUser={player.username === user?.username}
                      isNew={newEntries.has(player.username)}
                    />
                  ))}
                </AnimatePresence>
              )}
            </div>
          </motion.section>

          {/* ── Right sidebar ───────────────────────────────────────────── */}
          <motion.aside
            initial={{ opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.25 }}
            className="flex flex-col gap-6 lg:sticky lg:top-24"
          >
            {/* Score submission */}
           

            {/* Your rank card */}
            {user && (
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="bg-slate-900 border border-slate-800 rounded-2xl p-6"
              >
                <div className="flex items-center gap-3 mb-4">
                  <FaChartLine className="text-orange-500 text-xl" />
                  <h3 className="font-bold text-white">Your Standing</h3>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400 text-sm">Username</p>
                    <p className="font-semibold text-white">{user.username}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-gray-400 text-sm">Current Rank</p>
                    <p className="font-extrabold text-2xl text-orange-400">
                      {myRank ? `#${myRank}` : "—"}
                    </p>
                  </div>
                </div>

                {myRank === 1 && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="mt-4 flex items-center gap-2 text-yellow-400 text-sm bg-yellow-400/10 border border-yellow-400/20 rounded-lg px-3 py-2"
                  >
                    <FaCrown />
                    <span>{"You're #1! Keep it up."}</span>
                  </motion.div>
                )}
              </motion.div>
            )}

            {/* How it works card */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="bg-slate-900 border border-slate-800 rounded-2xl p-6"
            >
              <div className="flex items-center gap-3 mb-4">
                <FaBolt className="text-orange-500 text-xl" />
                <h3 className="font-bold text-white">How It Works</h3>
              </div>
              <ul className="space-y-3 text-sm text-gray-400">
                {[
                  { icon: "1", text: "Submit your game score above." },
                  { icon: "2", text: "Redis Sorted Sets rank you instantly." },
                  { icon: "3", text: "Socket.IO pushes live updates to everyone." },
                  { icon: "4", text: "Compete globally, watch rankings shift in real-time." },
                ].map((step) => (
                  <li key={step.icon} className="flex items-start gap-3">
                    <span className="flex-shrink-0 w-5 h-5 rounded-full bg-orange-500 text-xs text-white flex items-center justify-center font-bold mt-0.5">
                      {step.icon}
                    </span>
                    <span>{step.text}</span>
                  </li>
                ))}
              </ul>
            </motion.div>
          </motion.aside>

        </div>
      </main>

      {/* ── Footer ──────────────────────────────────────────────────────── */}
      <footer className="border-t border-slate-800 py-8 text-center">
        <p className="text-gray-500 text-sm">
          Built with React, Framer Motion, Redis &amp; Socket.IO
        </p>
      </footer>
    </div>
  );
};

export default Leaderboard;
