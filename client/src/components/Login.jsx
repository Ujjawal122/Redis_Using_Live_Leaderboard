import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { FaBolt, FaEnvelope, FaLock, FaTrophy } from "react-icons/fa";
import { useState } from "react";
import { useAuth } from "../context/AuthContext";

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [formData, setFormData] = useState({
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
      await login({
        email: formData.email.trim(),
        password: formData.password,
      });

      navigate("/leaderboard");
    } catch (error) {
      const message =
        error.response?.data?.message ||
        error.message ||
        "Login failed. Check that your backend server is running.";

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
          className="px-5 py-2 border border-orange-500 rounded-lg hover:bg-orange-500 transition"
          onClick={() => navigate("/register")}
          type="button"
        >
          Register
        </button>
      </nav>

      <main className="grid lg:grid-cols-[1fr_440px] gap-10 items-center max-w-6xl mx-auto px-6 py-12 md:py-20">
        <motion.section
          initial={{ opacity: 0, x: -40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.7 }}
          className="text-center lg:text-left"
        >
          <div className="inline-flex items-center gap-3 text-orange-400 mb-6">
            <FaBolt />
            <span className="font-semibold">Live ranking access</span>
          </div>

          <h2 className="text-4xl md:text-6xl font-extrabold leading-tight">
            Welcome back to the
            <span className="block text-orange-500">real-time arena.</span>
          </h2>

          <p className="mt-6 text-gray-400 text-lg max-w-2xl mx-auto lg:mx-0">
            Sign in to track scores, monitor rank changes, and stay synced with
            the latest leaderboard movement.
          </p>
        </motion.section>

        <motion.section
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.15 }}
          className="bg-slate-900 border border-slate-800 rounded-2xl p-6 md:p-8"
        >
          <div className="mb-8">
            <h3 className="text-3xl font-bold">Login</h3>
            <p className="text-gray-400 mt-2">
              Continue competing where every second counts.
            </p>
          </div>

          <form className="space-y-5" onSubmit={handleSubmit}>
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
                  placeholder="Enter your password"
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                />
              </div>
            </label>

            <div className="flex items-center justify-between gap-4 text-sm">
              <label className="flex items-center gap-2 text-gray-400">
                <input className="accent-orange-500" type="checkbox" />
                Remember me
              </label>
              <button className="text-orange-400 hover:text-orange-300" type="button">
                Forgot password?
              </button>
            </div>

            <button
              className="w-full px-6 py-3 bg-orange-500 rounded-lg font-semibold hover:bg-orange-600 transition"
              type="submit"
              disabled={loading}
            >
              {loading ? "Logging in..." : "Login"}
            </button>
          </form>

          {status && (
            <p className="mt-4 rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-gray-300">
              {status}
            </p>
          )}

          <p className="text-center text-gray-400 mt-6">
            New player?{" "}
            <button
              className="text-orange-400 font-semibold hover:text-orange-300"
              onClick={() => navigate("/register")}
              type="button"
            >
              Create account
            </button>
          </p>
        </motion.section>
      </main>
    </div>
  );
};

export default Login;
