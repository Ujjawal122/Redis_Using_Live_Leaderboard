import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  FaChartLine,
  FaEnvelope,
  FaLock,
  FaTrophy,
  FaUser,
  FaUsers,
} from "react-icons/fa";
import { useState } from "react";
import { useAuth } from "../context/AuthContext";

const Signup = () => {
  const navigate = useNavigate();
  const { register } = useAuth();

  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
  });
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setStatus("");

    try {
      await register({
        username: formData.username.trim(),
        email: formData.email.trim(),
        password: formData.password,
      });

      navigate("/leaderboard");
    } catch (error) {
      const message =
        error.response?.data?.message ||
        error.message ||
        "Registration failed. Check that your backend server is running.";

      console.error(error);
      setStatus(message);
    } finally {
      setLoading(false);
    }
  };







  return (
    <div className="min-h-screen bg-slate-950 text-white overflow-hidden">
      <nav className="flex justify-between items-center px-6 md:px-8 py-6">
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

        <button
          className="px-5 py-2 bg-orange-500 rounded-lg hover:bg-orange-600 transition"
          onClick={() => navigate("/login")}
          type="button"
        >
          Login
        </button>
      </nav>

      <main className="grid lg:grid-cols-[440px_1fr] gap-10 items-center max-w-6xl mx-auto px-6 py-12 md:py-20">
        <motion.section
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="bg-slate-900 border border-slate-800 rounded-2xl p-6 md:p-8 order-2 lg:order-1"
        >
          <div className="mb-8">
            <h2 className="text-3xl font-bold">Create account</h2>
            <p className="text-gray-400 mt-2">
              Join the board and start tracking your rank.
            </p>
          </div>

          <form className="space-y-5" onSubmit={handleSubmit}>
            <label className="block">
              <span className="text-sm font-semibold text-white">
                Player name
              </span>
              <div className="mt-2 flex items-center gap-3 rounded-lg border border-slate-700 bg-slate-950 px-4 focus-within:border-orange-500 transition">
                <FaUser className="text-orange-500" />
                <input
                  className="w-full bg-transparent py-3 outline-none text-white placeholder:text-gray-500"
                  placeholder="Your display name"
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  minLength={3}
                  required
                />
              </div>
            </label>

            <label className="block">
              <span className="text-sm font-semibold text-gray-300">Email</span>
              <div className="mt-2 flex items-center gap-3 rounded-lg border border-slate-700 bg-slate-950 px-4 focus-within:border-orange-500 transition">
                <FaEnvelope className="text-orange-500" />
                <input
                  className="w-full bg-transparent py-3 outline-none text-white placeholder:text-gray-500"
                  placeholder="you@example.com"
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>
            </label>

            <label className="block">
              <span className="text-sm font-semibold text-gray-300">
                Password
              </span>
              <div className="mt-2 flex items-center gap-3 rounded-lg border border-slate-700 bg-slate-950 px-4 focus-within:border-orange-500 transition">
                <FaLock className="text-orange-500" />
                <input
                  className="w-full bg-transparent py-3 outline-none text-white placeholder:text-gray-500"
                  placeholder="Create a password"
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  minLength={6}
                  required
                />
              </div>
            </label>

            <label className="flex items-start gap-3 text-sm text-gray-400">
              <input className="mt-1 accent-orange-500" type="checkbox" />
              <span>
                I agree to fair play rules and real-time leaderboard updates.
              </span>
            </label>

            <button
              className="w-full px-6 py-3 bg-orange-500 rounded-lg font-semibold hover:bg-orange-600 transition"
              disabled={loading}
              type="submit"
            >
              {loading ? "Registering..." : "Register"}
            </button>
          </form>

          {status && (
            <p className="mt-4 rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-gray-300">
              {status}
            </p>
          )}

          <p className="text-center text-gray-400 mt-6">
            Already ranked?{" "}
            <button
              className="text-orange-400 font-semibold hover:text-orange-300"
              onClick={() => navigate("/login")}
              type="button"
            >
              Login
            </button>
          </p>
        </motion.section>

        <motion.section
          initial={{ opacity: 0, x: 40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.7, delay: 0.15 }}
          className="text-center lg:text-left order-1 lg:order-2"
        >
          <div className="inline-flex items-center gap-3 text-orange-400 mb-6">
            <FaUsers />
            <span className="font-semibold">Global competition</span>
          </div>

          <h1 className="text-4xl md:text-6xl font-extrabold leading-tight">
            Claim your spot on the
            <span className="block text-orange-500">live leaderboard.</span>
          </h1>

          <p className="mt-6 text-gray-400 text-lg max-w-2xl mx-auto lg:mx-0">
            Create your profile, submit scores, and watch your ranking update
            instantly with Redis-powered performance.
          </p>

          <div className="grid sm:grid-cols-2 gap-4 mt-10">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
              <FaTrophy className="text-3xl text-orange-500 mb-3" />
              <h3 className="font-bold text-lg">Live Rankings</h3>
              <p className="text-gray-400 mt-1">
                See position changes as soon as scores land.
              </p>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
              <FaChartLine className="text-3xl text-orange-500 mb-3" />
              <h3 className="font-bold text-lg">Fast Analytics</h3>
              <p className="text-gray-400 mt-1">
                Track momentum and performance trends over time.
              </p>
            </div>
          </div>
        </motion.section>
      </main>
    </div>
  );
};

export default Signup;
