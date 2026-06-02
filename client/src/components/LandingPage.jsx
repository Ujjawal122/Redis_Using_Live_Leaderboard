import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  FaTrophy,
  FaBolt,
  FaUsers,
  FaChartLine,
  FaUser,
  FaSignOutAlt,
  FaGamepad,
} from "react-icons/fa";
import { useAuth } from "../context/AuthContext";

const LandingPage = () => {
  const navigate = useNavigate();
  const { user, loading, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
    // stay on landing page — navbar will update automatically
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white overflow-hidden">
      {/* ── Navbar ──────────────────────────────────────────────────────── */}
      <nav className="flex justify-between items-center px-8 py-6">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <FaTrophy className="text-orange-500 text-3xl" />
          <h1 className="text-2xl font-bold">
            Redis<span className="text-orange-500">Leaderboard</span>
          </h1>
        </div>

        {/* Right side — conditional on auth state */}
        <div className="flex items-center gap-3">
          {/* Show skeleton pill while the /auth/me check is in flight */}
          {loading ? (
            <div className="h-9 w-32 rounded-lg bg-slate-800 animate-pulse" />
          ) : user ? (
            /* ── Logged-in state ── */
            <>
              {/* Username chip → links to profile */}
              <motion.button
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.96 }}
                onClick={() => navigate("/profile")}
                className="hidden sm:flex items-center gap-2 text-sm text-gray-300 bg-slate-900 border border-slate-700 hover:border-orange-500 hover:text-orange-400 rounded-lg px-3 py-2 transition"
              >
                <FaUser className="text-orange-500" />
                <span>{user.username}</span>
              </motion.button>

              {/* Play Game shortcut */}
              <motion.button
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.96 }}
                onClick={() => navigate("/game")}
                className="hidden sm:flex items-center gap-2 px-4 py-2 bg-orange-500/10 border border-orange-500/40 hover:bg-orange-500 hover:border-orange-500 rounded-lg text-orange-400 hover:text-white transition text-sm font-semibold"
              >
                <FaGamepad />
                <span>Play Game</span>
              </motion.button>

              {/* Leaderboard shortcut */}
              <motion.button
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.96 }}
                onClick={() => navigate("/leaderboard")}
                className="hidden sm:flex items-center gap-2 px-4 py-2 border border-slate-700 rounded-lg hover:border-orange-500 hover:text-orange-400 transition text-sm"
              >
                <FaChartLine />
                <span>Leaderboard</span>
              </motion.button>

              {/* Logout */}
              <motion.button
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.96 }}
                onClick={handleLogout}
                className="flex items-center gap-2 px-4 py-2 bg-orange-500 hover:bg-orange-600 rounded-lg font-semibold transition text-sm text-white"
              >
                <FaSignOutAlt />
                <span>Logout</span>
              </motion.button>
            </>
          ) : (
            /* ── Logged-out state ── */
            <>
              <motion.button
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.96 }}
                className="px-5 py-2 border border-orange-500 rounded-lg hover:bg-orange-500 transition text-sm font-semibold"
                onClick={() => navigate("/register")}
              >
                Register
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.96 }}
                className="px-5 py-2 bg-orange-500 rounded-lg hover:bg-orange-600 transition text-sm font-semibold"
                onClick={() => navigate("/login")}
              >
                Login
              </motion.button>
            </>
          )}
        </div>
      </nav>

      {/* ── Hero Section ─────────────────────────────────────────────────── */}
      <section className="flex flex-col items-center justify-center text-center px-6 mt-20">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.6 }}
        >
          <FaTrophy className="text-7xl text-orange-500 mb-6 mx-auto" />
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: -60 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-5xl md:text-7xl font-extrabold leading-tight"
        >
          Real-Time Leaderboards
          <span className="block text-orange-500">Powered by Redis</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="mt-6 text-gray-400 text-lg md:text-xl max-w-3xl"
        >
          Track scores instantly, compete globally, and watch rankings update
          in real-time with blazing-fast Redis performance.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="mt-10"
        >
          <p className="italic text-orange-400 text-xl md:text-2xl">
            "Every second counts. Every score matters. Every rank updates instantly."
          </p>
        </motion.div>

        {/* Hero CTA — adapts to auth state */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="flex flex-wrap justify-center gap-5 mt-10"
        >
          {!loading && user ? (
            /* Logged-in: jump straight to leaderboard or profile */
            <>
              <motion.button
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.97 }}
                className="flex items-center gap-2 px-8 py-4 bg-orange-500 rounded-xl font-bold hover:bg-orange-600 transition shadow-lg shadow-orange-500/30"
                onClick={() => navigate("/game")}
              >
                <FaGamepad />
                Play Meteor Dodge
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.97 }}
                className="px-8 py-4 border border-orange-500 rounded-xl font-semibold hover:bg-orange-500 transition"
                onClick={() => navigate("/leaderboard")}
              >
                View Leaderboard
              </motion.button>
            </>
          ) : (
            /* Logged-out: register / view leaderboard */
            <>
              <motion.button
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.97 }}
                className="px-8 py-4 bg-orange-500 rounded-xl font-semibold hover:bg-orange-600 transition"
                onClick={() => navigate("/register")}
              >
                Get Started
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.97 }}
                className="px-8 py-4 border border-orange-500 rounded-xl font-semibold hover:bg-orange-500 transition"
                onClick={() => navigate("/leaderboard")}
              >
                View Leaderboard
              </motion.button>
            </>
          )}
        </motion.div>
      </section>

      {/* ── Feature cards ─────────────────────────────────────────────────── */}
      <section className="mt-28 px-8">
        <div className="grid md:grid-cols-4 gap-6 max-w-7xl mx-auto">
          {[
            {
              icon: <FaBolt />,
              title: "Lightning Fast",
              desc: "Redis updates rankings in milliseconds.",
            },
            {
              icon: <FaTrophy />,
              title: "Live Rankings",
              desc: "Watch positions change instantly.",
            },
            {
              icon: <FaUsers />,
              title: "Global Players",
              desc: "Compete with users worldwide.",
            },
            {
              icon: <FaChartLine />,
              title: "Real-Time Analytics",
              desc: "Monitor performance and trends.",
            },
          ].map((item, index) => (
            <motion.div
              key={index}
              whileHover={{ y: -10 }}
              className="bg-slate-900 border border-slate-800 rounded-2xl p-8 text-center"
            >
              <div className="text-4xl text-orange-500 flex justify-center mb-4">
                {item.icon}
              </div>
              <h3 className="text-xl font-bold mb-2">{item.title}</h3>
              <p className="text-gray-400">{item.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── Footer ───────────────────────────────────────────────────────── */}
      <footer className="mt-24 py-8 text-center border-t border-slate-800">
        <p className="text-gray-500">
          Built with React, Framer Motion, Redis &amp; Socket.IO
        </p>
      </footer>
    </div>
  );
};

export default LandingPage;
