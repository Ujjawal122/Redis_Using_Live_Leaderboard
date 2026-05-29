import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { io } from "socket.io-client";
import {
  FaBolt,
  FaChartLine,
  FaCrown,
  FaGamepad,
  FaGlobeAsia,
  FaMedal,
  FaPen,
  FaSearch,
  FaShieldAlt,
  FaSignInAlt,
  FaTrophy,
  FaUserPlus,
} from "react-icons/fa";
import "./index.css";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:3000/api";
const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || "http://localhost:3000";
const LEADERBOARD_ID = "global";

const fadeUp = {
  hidden: { opacity: 0, y: 18 },
  visible: { opacity: 1, y: 0 },
};

async function apiRequest(path, options = {}) {
  const response = await fetch(`${API_BASE}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
    ...options,
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok || data.success === false) {
    throw new Error(data.message || "Request failed");
  }

  return data;
}

function StatCard({ icon, label, value }) {
  return (
    <motion.div
      variants={fadeUp}
      whileHover={{ y: -4 }}
      className="rounded-lg border border-white/10 bg-white/[0.07] p-4 shadow-xl shadow-black/10"
    >
      <div className="flex items-center justify-between gap-3">
        <span className="grid h-10 w-10 place-items-center rounded-lg bg-cyan-400/15 text-cyan-200">
          {icon}
        </span>
        <strong className="text-2xl text-white">{value}</strong>
      </div>
      <p className="mt-3 text-sm text-slate-300">{label}</p>
    </motion.div>
  );
}

function AuthPanel({ onAuth }) {
  const [mode, setMode] = useState("login");
  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
  });
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);

  const isSignup = mode === "signup";

  const submitAuth = async (event) => {
    event.preventDefault();
    setLoading(true);
    setStatus("");

    try {
      const payload = isSignup
        ? form
        : { email: form.email, password: form.password };
      const data = await apiRequest(`/auth/${isSignup ? "register" : "login"}`, {
        method: "POST",
        body: JSON.stringify(payload),
      });

      localStorage.setItem("leaderboardUser", JSON.stringify(data.user));
      localStorage.setItem("leaderboardToken", data.token);
      onAuth(data.user, data.token);
      setStatus("Signed in successfully");
    } catch (error) {
      setStatus(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.section
      initial="hidden"
      animate="visible"
      variants={fadeUp}
      className="rounded-lg border border-white/10 bg-slate-950/70 p-5 shadow-2xl shadow-black/25 backdrop-blur"
    >
      <div className="mb-5 flex items-center justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-cyan-200">Player access</p>
          <h2 className="text-2xl font-bold text-white">
            {isSignup ? "Create your player" : "Login to compete"}
          </h2>
        </div>
        <span className="grid h-11 w-11 place-items-center rounded-lg bg-emerald-400/15 text-emerald-200">
          {isSignup ? <FaUserPlus /> : <FaSignInAlt />}
        </span>
      </div>

      <div className="mb-5 grid grid-cols-2 rounded-lg bg-white/5 p-1">
        {["login", "signup"].map((item) => (
          <button
            key={item}
            type="button"
            onClick={() => setMode(item)}
            className={`rounded-md px-3 py-2 text-sm font-semibold transition ${
              mode === item
                ? "bg-white text-slate-950"
                : "text-slate-300 hover:text-white"
            }`}
          >
            {item === "login" ? "Login" : "Signup"}
          </button>
        ))}
      </div>

      <form onSubmit={submitAuth} className="space-y-4">
        <AnimatePresence initial={false}>
          {isSignup && (
            <motion.label
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="block overflow-hidden"
            >
              <span className="mb-2 block text-sm text-slate-300">Username</span>
              <input
                value={form.username}
                onChange={(event) =>
                  setForm({ ...form, username: event.target.value })
                }
                minLength={3}
                required={isSignup}
                className="field"
                placeholder="player_one"
              />
            </motion.label>
          )}
        </AnimatePresence>

        <label className="block">
          <span className="mb-2 block text-sm text-slate-300">Email</span>
          <input
            type="email"
            value={form.email}
            onChange={(event) => setForm({ ...form, email: event.target.value })}
            required
            className="field"
            placeholder="player@example.com"
          />
        </label>

        <label className="block">
          <span className="mb-2 block text-sm text-slate-300">Password</span>
          <input
            type="password"
            value={form.password}
            onChange={(event) =>
              setForm({ ...form, password: event.target.value })
            }
            minLength={6}
            required
            className="field"
            placeholder="Minimum 6 characters"
          />
        </label>

        <button disabled={loading} className="primary-button w-full">
          {loading ? "Working..." : isSignup ? "Create Account" : "Login"}
        </button>
      </form>

      {status && (
        <p className="mt-4 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-slate-200">
          {status}
        </p>
      )}
    </motion.section>
  );
}

function Leaderboard({ players, loading }) {
  return (
    <motion.section
      initial="hidden"
      animate="visible"
      variants={fadeUp}
      className="rounded-lg border border-white/10 bg-white/[0.06] p-5 shadow-2xl shadow-black/20"
    >
      <div className="mb-5 flex items-center justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-cyan-200">Live top 10</p>
          <h2 className="text-2xl font-bold text-white">Leaderboard</h2>
        </div>
        <span className="grid h-11 w-11 place-items-center rounded-lg bg-amber-300/15 text-amber-200">
          <FaTrophy />
        </span>
      </div>

      <div className="space-y-3">
        {loading && <p className="text-slate-300">Loading leaderboard...</p>}
        {!loading && players.length === 0 && (
          <p className="text-slate-300">No ranked players yet.</p>
        )}

        {players.map((player, index) => (
          <motion.div
            key={player.username}
            layout
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            className="grid grid-cols-[44px_1fr_auto] items-center gap-3 rounded-lg border border-white/10 bg-slate-950/45 p-3"
          >
            <span
              className={`grid h-10 w-10 place-items-center rounded-lg font-bold ${
                index === 0
                  ? "bg-amber-300 text-slate-950"
                  : index === 1
                    ? "bg-slate-200 text-slate-950"
                    : index === 2
                      ? "bg-orange-300 text-slate-950"
                      : "bg-white/10 text-slate-200"
              }`}
            >
              {index + 1}
            </span>
            <div className="min-w-0">
              <p className="truncate font-semibold text-white">
                {player.username}
              </p>
              <p className="text-xs text-slate-400">Rank #{index + 1}</p>
            </div>
            <strong className="rounded-md bg-cyan-400/15 px-3 py-2 text-cyan-100">
              {player.score}
            </strong>
          </motion.div>
        ))}
      </div>
    </motion.section>
  );
}

function PlayerTools({ user, onUserUpdate, refreshLeaderboard, socket }) {
  const [score, setScore] = useState("");
  const [rankName, setRankName] = useState("");
  const [rankResult, setRankResult] = useState(null);
  const [profile, setProfile] = useState({
    username: user?.username || "",
    email: user?.email || "",
    country: user?.country || "India",
    avatar: user?.avatar || "",
  });
  const [message, setMessage] = useState("");

  const updateScore = async (event) => {
    event.preventDefault();
    setMessage("");

    try {
      const data = await apiRequest("/leaderboard/score", {
        method: "POST",
        body: JSON.stringify({
          username: user.username,
          score: Number(score),
        }),
      });
      setScore("");
      setMessage(`Score updated. Current rank: ${data.rank ?? "unranked"}`);
      socket?.emit("scoreUpdated", {
        leaderboardId: LEADERBOARD_ID,
        username: user.username,
        score,
      });
      refreshLeaderboard();
    } catch (error) {
      setMessage(error.message);
    }
  };

  const findRank = async (event) => {
    event.preventDefault();
    setMessage("");

    try {
      const data = await apiRequest(
        `/leaderboard/rank/${encodeURIComponent(rankName)}`
      );
      setRankResult(data);
    } catch (error) {
      setRankResult(null);
      setMessage(error.message);
    }
  };

  const updateProfile = async (event) => {
    event.preventDefault();
    setMessage("");

    try {
      const data = await apiRequest(`/players/${user._id}`, {
        method: "PUT",
        body: JSON.stringify(profile),
      });
      localStorage.setItem("leaderboardUser", JSON.stringify(data.player));
      onUserUpdate(data.player);
      setMessage("Profile updated");
    } catch (error) {
      setMessage(error.message);
    }
  };

  if (!user) {
    return null;
  }

  return (
    <motion.section
      initial="hidden"
      animate="visible"
      variants={fadeUp}
      className="grid gap-4"
    >
      <div className="rounded-lg border border-white/10 bg-white/[0.06] p-5">
        <div className="mb-4 flex items-center gap-3">
          <span className="grid h-10 w-10 place-items-center rounded-lg bg-violet-400/15 text-violet-200">
            <FaBolt />
          </span>
          <div>
            <h2 className="text-xl font-bold text-white">Submit Score</h2>
            <p className="text-sm text-slate-300">{user.username}</p>
          </div>
        </div>
        <form onSubmit={updateScore} className="flex gap-3">
          <input
            type="number"
            value={score}
            onChange={(event) => setScore(event.target.value)}
            required
            className="field"
            placeholder="Score"
          />
          <button className="icon-button" aria-label="Submit score">
            <FaGamepad />
          </button>
        </form>
      </div>

      <div className="rounded-lg border border-white/10 bg-white/[0.06] p-5">
        <div className="mb-4 flex items-center gap-3">
          <span className="grid h-10 w-10 place-items-center rounded-lg bg-cyan-400/15 text-cyan-200">
            <FaSearch />
          </span>
          <h2 className="text-xl font-bold text-white">Find Rank</h2>
        </div>
        <form onSubmit={findRank} className="flex gap-3">
          <input
            value={rankName}
            onChange={(event) => setRankName(event.target.value)}
            required
            className="field"
            placeholder="Username"
          />
          <button className="icon-button" aria-label="Find rank">
            <FaSearch />
          </button>
        </form>
        {rankResult && (
          <p className="mt-3 rounded-lg bg-emerald-400/15 px-3 py-2 text-sm text-emerald-100">
            {rankResult.username} is ranked #{rankResult.rank}
          </p>
        )}
      </div>

      <div className="rounded-lg border border-white/10 bg-white/[0.06] p-5">
        <div className="mb-4 flex items-center gap-3">
          <span className="grid h-10 w-10 place-items-center rounded-lg bg-amber-300/15 text-amber-200">
            <FaPen />
          </span>
          <h2 className="text-xl font-bold text-white">Player Profile</h2>
        </div>
        <form onSubmit={updateProfile} className="grid gap-3">
          <input
            value={profile.username}
            onChange={(event) =>
              setProfile({ ...profile, username: event.target.value })
            }
            minLength={3}
            className="field"
            placeholder="Username"
          />
          <input
            type="email"
            value={profile.email}
            onChange={(event) =>
              setProfile({ ...profile, email: event.target.value })
            }
            className="field"
            placeholder="Email"
          />
          <input
            value={profile.country}
            onChange={(event) =>
              setProfile({ ...profile, country: event.target.value })
            }
            className="field"
            placeholder="Country"
          />
          <input
            value={profile.avatar}
            onChange={(event) =>
              setProfile({ ...profile, avatar: event.target.value })
            }
            className="field"
            placeholder="Avatar URL"
          />
          <button className="primary-button">Save Profile</button>
        </form>
      </div>

      {message && (
        <p className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-slate-200">
          {message}
        </p>
      )}
    </motion.section>
  );
}

function App() {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem("leaderboardUser");
    return saved ? JSON.parse(saved) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem("leaderboardToken"));
  const [players, setPlayers] = useState([]);
  const [loadingLeaderboard, setLoadingLeaderboard] = useState(true);

  const socket = useMemo(() => {
    const connection = io(SOCKET_URL, {
      autoConnect: true,
      transports: ["websocket", "polling"],
    });
    connection.emit("joinLeaderboard", LEADERBOARD_ID);
    return connection;
  }, []);

  const refreshLeaderboard = async () => {
    setLoadingLeaderboard(true);
    try {
      const data = await apiRequest("/leaderboard/top");
      setPlayers(data.leaderboard || []);
    } finally {
      setLoadingLeaderboard(false);
    }
  };

  useEffect(() => {
    queueMicrotask(refreshLeaderboard);
  }, []);

  useEffect(() => {
    socket.on("leaderboardRefresh", refreshLeaderboard);
    return () => {
      socket.off("leaderboardRefresh", refreshLeaderboard);
      socket.disconnect();
    };
  }, [socket]);

  const logout = () => {
    localStorage.removeItem("leaderboardUser");
    localStorage.removeItem("leaderboardToken");
    setUser(null);
    setToken(null);
  };

  const totalScore = players.reduce((sum, player) => sum + player.score, 0);

  return (
    <main className="min-h-screen bg-[#071013] text-slate-100">
      <div className="mx-auto flex min-h-screen w-full max-w-7xl flex-col px-4 py-6 sm:px-6 lg:px-8">
        <motion.header
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 flex flex-col gap-4 border-b border-white/10 pb-5 md:flex-row md:items-center md:justify-between"
        >
          <div className="flex items-center gap-3">
            <span className="grid h-12 w-12 place-items-center rounded-lg bg-cyan-400 text-slate-950 shadow-lg shadow-cyan-400/20">
              <FaCrown />
            </span>
            <div>
              <h1 className="text-3xl font-black tracking-normal text-white">
                LiveBoard
              </h1>
              <p className="text-sm text-slate-300">
                Real-time player ranking and score tracking
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="rounded-lg border border-emerald-300/25 bg-emerald-300/10 px-3 py-2 text-sm text-emerald-100">
              Socket live
            </span>
            {user && (
              <button onClick={logout} className="secondary-button">
                Logout
              </button>
            )}
          </div>
        </motion.header>

        <motion.div
          initial="hidden"
          animate="visible"
          transition={{ staggerChildren: 0.08 }}
          className="mb-6 grid gap-4 sm:grid-cols-3"
        >
          <StatCard icon={<FaMedal />} label="Ranked players" value={players.length} />
          <StatCard icon={<FaChartLine />} label="Total score" value={totalScore} />
          <StatCard
            icon={<FaGlobeAsia />}
            label="Signed in"
            value={user ? user.country || "India" : "Guest"}
          />
        </motion.div>

        <div className="grid flex-1 gap-6 lg:grid-cols-[minmax(0,1fr)_390px]">
          <Leaderboard players={players} loading={loadingLeaderboard} />

          <aside className="grid content-start gap-5">
            {user && token ? (
              <>
                <motion.div
                  initial="hidden"
                  animate="visible"
                  variants={fadeUp}
                  className="rounded-lg border border-white/10 bg-slate-950/70 p-5"
                >
                  <div className="flex items-center gap-4">
                    <div className="grid h-14 w-14 place-items-center overflow-hidden rounded-lg bg-white/10">
                      {user.avatar ? (
                        <img
                          src={user.avatar}
                          alt={user.username}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <FaShieldAlt className="text-cyan-200" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-lg font-bold text-white">
                        {user.username}
                      </p>
                      <p className="truncate text-sm text-slate-300">
                        {user.email}
                      </p>
                    </div>
                  </div>
                </motion.div>
                <PlayerTools
                  key={user._id || user.email}
                  user={user}
                  socket={socket}
                  onUserUpdate={setUser}
                  refreshLeaderboard={refreshLeaderboard}
                />
              </>
            ) : (
              <AuthPanel
                onAuth={(nextUser, nextToken) => {
                  setUser(nextUser);
                  setToken(nextToken);
                }}
              />
            )}
          </aside>
        </div>
      </div>
    </main>
  );
}

export default App;

