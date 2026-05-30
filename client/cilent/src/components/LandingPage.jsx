"use client";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

import {
  FaTrophy,
  FaBolt,
  FaUsers,
  FaChartLine,
} from "react-icons/fa";






const LandingPage = () => {
  const navigate = useNavigate();

 
  
    



  return (
    <div className="min-h-screen bg-slate-950 text-white overflow-hidden">
      {/* Navbar */}
      <nav className="flex justify-between items-center px-8 py-6">
        <div className="flex items-center gap-3">
          <FaTrophy className="text-orange-500 text-3xl" />
          <h1 className="text-2xl font-bold">
            Redis<span className="text-orange-500">Leaderboard</span>
          </h1>
        </div>

        <div className="flex gap-4">
          <button
            className="px-5 py-2 border border-orange-500 rounded-lg hover:bg-orange-500 transition"
            onClick={() => navigate("/register")}
          >
            Register
          </button>

          <button
            className="px-5 py-2 bg-orange-500 rounded-lg hover:bg-orange-600 transition"
            onClick={() => navigate("/login")}
          >
            Login
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="flex flex-col items-center justify-center text-center px-6 mt-20">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.6 }}
        >
          <FaTrophy className="text-7xl text-orange-500 mb-6" />
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: -60 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-5xl md:text-7xl font-extrabold leading-tight" 
        >
          Real-Time Leaderboards
          <span className="block text-orange-500">
            Powered by Redis
          </span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="mt-6 text-gray-400 text-lg md:text-xl max-w-3xl"
        >
          Track scores instantly, compete globally, and watch rankings
          update in real-time with blazing-fast Redis performance.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="mt-10"
        >
          <p className="italic text-orange-400 text-xl md:text-2xl">
            "Every second counts. Every score matters.
            Every rank updates instantly."
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="flex flex-wrap justify-center gap-5 mt-10"
        >
          <button
            className="px-8 py-4 bg-orange-500 rounded-xl font-semibold hover:bg-orange-600 transition"
            onClick={() => navigate("/register")}
          >
            Get Started
          </button>

          <button
            className="px-8 py-4 border border-orange-500 rounded-xl font-semibold hover:bg-orange-500 transition"
            onClick={() => navigate("/leaderboard")}
          >
            View Leaderboard
          </button>
        </motion.div>
      </section>

      {/* Stats Section */}
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

              <h3 className="text-xl font-bold mb-2">
                {item.title}
              </h3>

              <p className="text-gray-400">
                {item.desc}
              </p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-24 py-8 text-center border-t border-slate-800">
        <p className="text-gray-500">
          Built with React, Framer Motion, Redis & Socket.IO
        </p>
      </footer>
    </div>
  );
};

export default LandingPage;

