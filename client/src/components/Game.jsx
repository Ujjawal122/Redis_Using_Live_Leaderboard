import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  FaTrophy,
  FaRocket,
  FaSignOutAlt,
  FaChartLine,
  FaUser,
  FaPlay,
  FaStar,
  FaArrowLeft,
  FaArrowRight,
  FaCrown,
  FaFire,
  FaBolt,
  FaShieldAlt,
} from "react-icons/fa";
import { useAuth } from "../context/AuthContext";
import api from "../lib/api";

// ─── Constants ────────────────────────────────────────────────────────────────
const GAME_W = 480;
const GAME_H = 600;
const SHIP_W = 48;
const SHIP_H = 48;
const SHIP_Y = GAME_H - 80;
const SHIP_SPEED = 8;
const METEOR_BASE_W = 32;
const METEOR_BASE_H = 32;
const INITIAL_METEOR_SPEED = 3;
const SPEED_INCREMENT = 0.0008; // per frame
const SPAWN_INTERVAL_INITIAL = 1200; // ms
const SPAWN_INTERVAL_MIN = 380; // ms
const POINTS_PER_SECOND = 2;

// ─── Helpers ──────────────────────────────────────────────────────────────────
const rand = (min, max) => Math.random() * (max - min) + min;

const collides = (ship, meteor) => {
  const padding = 10; // forgiveness padding
  return (
    ship.x + padding < meteor.x + meteor.w - padding &&
    ship.x + SHIP_W - padding > meteor.x + padding &&
    ship.y + padding < meteor.y + meteor.h - padding &&
    ship.y + SHIP_H - padding > meteor.y + padding
  );
};

// ─── Particle component ───────────────────────────────────────────────────────
const Particle = ({ x, y, color }) => (
  <motion.div
    initial={{ opacity: 1, scale: 1, x: 0, y: 0 }}
    animate={{
      opacity: 0,
      scale: 0.2,
      x: rand(-60, 60),
      y: rand(-60, 60),
    }}
    transition={{ duration: 0.7, ease: "easeOut" }}
    style={{
      position: "absolute",
      left: x,
      top: y,
      width: 8,
      height: 8,
      borderRadius: "50%",
      background: color,
      pointerEvents: "none",
    }}
  />
);

// ─── Main Game Component ──────────────────────────────────────────────────────
const Game = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  // game states: 'idle' | 'playing' | 'over' | 'submitting' | 'submitted'
  const [gameState, setGameState] = useState("idle");
  const [score, setScore] = useState(0);
  const [bestScore, setBestScore] = useState(
    () => Number(localStorage.getItem("meteor_best") || 0)
  );
  const [rank, setRank] = useState(null);
  const [submitError, setSubmitError] = useState("");
  const [particles, setParticles] = useState([]);

  // canvas / game loop refs
  const canvasRef = useRef(null);
  const gameRef = useRef({
    running: false,
    shipX: GAME_W / 2 - SHIP_W / 2,
    meteors: [],
    score: 0,
    frame: 0,
    meteorSpeed: INITIAL_METEOR_SPEED,
    spawnInterval: SPAWN_INTERVAL_INITIAL,
    lastSpawnTime: 0,
    lastSecondTime: 0,
    keys: {},
    animId: null,
    touchStartX: null,
  });

  // ── submit score to backend ──────────────────────────────────────────────
  const submitScore = useCallback(async (finalScore) => {
    if (!finalScore || finalScore <= 0) return;
    setGameState("submitting");
    setSubmitError("");
    try {
      const { data } = await api.post("/leaderboard/score", { score: finalScore });
      setRank(data.rank ?? null);
      setGameState("submitted");
    } catch (err) {
      setSubmitError(err.response?.data?.message || "Failed to submit score.");
      setGameState("over");
    }
  }, []);

  // ── spawn a meteor ───────────────────────────────────────────────────────
  const spawnMeteor = useCallback(() => {
    const size = rand(24, 52);
    gameRef.current.meteors.push({
      id: Date.now() + Math.random(),
      x: rand(0, GAME_W - size),
      y: -size,
      w: size,
      h: size,
      speed: gameRef.current.meteorSpeed * rand(0.7, 1.4),
      rotation: rand(0, 360),
      rotSpeed: rand(-3, 3),
      color: Math.random() > 0.7 ? "#f97316" : Math.random() > 0.5 ? "#94a3b8" : "#6b7280",
    });
  }, []);

  // ── draw frame ───────────────────────────────────────────────────────────
  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const g = gameRef.current;

    // Background
    ctx.clearRect(0, 0, GAME_W, GAME_H);

    // Star field (static, index-based)
    ctx.fillStyle = "rgba(255,255,255,0.55)";
    for (let i = 0; i < 60; i++) {
      const sx = ((i * 137.5 + g.frame * 0.3) % GAME_W);
      const sy = ((i * 97.3 + g.frame * (0.5 + (i % 5) * 0.2)) % GAME_H);
      const size = i % 3 === 0 ? 1.5 : 1;
      ctx.beginPath();
      ctx.arc(sx, sy, size, 0, Math.PI * 2);
      ctx.fill();
    }

    // Meteors
    g.meteors.forEach((m) => {
      ctx.save();
      ctx.translate(m.x + m.w / 2, m.y + m.h / 2);
      ctx.rotate((m.rotation * Math.PI) / 180);

      // Glow
      const glow = ctx.createRadialGradient(0, 0, 2, 0, 0, m.w / 2);
      glow.addColorStop(0, m.color);
      glow.addColorStop(1, "transparent");
      ctx.fillStyle = glow;
      ctx.beginPath();
      ctx.arc(0, 0, m.w / 2, 0, Math.PI * 2);
      ctx.fill();

      // Core
      ctx.fillStyle = m.color;
      ctx.beginPath();
      ctx.arc(0, 0, m.w / 2 - 4, 0, Math.PI * 2);
      ctx.fill();

      // Crater details
      ctx.fillStyle = "rgba(0,0,0,0.25)";
      ctx.beginPath();
      ctx.arc(-m.w / 6, -m.h / 6, m.w / 8, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();
    });

    // Ship
    const sx = g.shipX;
    const sy = SHIP_Y;
    ctx.save();

    // Thruster flame
    const flameH = 16 + Math.sin(g.frame * 0.3) * 6;
    const flame = ctx.createLinearGradient(sx + SHIP_W / 2, sy + SHIP_H, sx + SHIP_W / 2, sy + SHIP_H + flameH);
    flame.addColorStop(0, "#f97316");
    flame.addColorStop(1, "transparent");
    ctx.fillStyle = flame;
    ctx.beginPath();
    ctx.ellipse(sx + SHIP_W / 2, sy + SHIP_H, 10, flameH, 0, 0, Math.PI * 2);
    ctx.fill();

    // Ship body glow
    ctx.shadowBlur = 18;
    ctx.shadowColor = "#f97316";

    // Ship body
    ctx.fillStyle = "#1e293b";
    ctx.beginPath();
    ctx.moveTo(sx + SHIP_W / 2, sy);
    ctx.lineTo(sx + SHIP_W, sy + SHIP_H);
    ctx.lineTo(sx + SHIP_W / 2 + 10, sy + SHIP_H - 10);
    ctx.lineTo(sx + SHIP_W / 2, sy + SHIP_H - 4);
    ctx.lineTo(sx + SHIP_W / 2 - 10, sy + SHIP_H - 10);
    ctx.lineTo(sx, sy + SHIP_H);
    ctx.closePath();
    ctx.fill();

    // Cockpit
    ctx.fillStyle = "#38bdf8";
    ctx.shadowColor = "#38bdf8";
    ctx.shadowBlur = 12;
    ctx.beginPath();
    ctx.ellipse(sx + SHIP_W / 2, sy + SHIP_H / 2 - 4, 8, 12, 0, 0, Math.PI * 2);
    ctx.fill();

    // Wings accent
    ctx.shadowBlur = 0;
    ctx.fillStyle = "#f97316";
    ctx.beginPath();
    ctx.moveTo(sx + 2, sy + SHIP_H - 6);
    ctx.lineTo(sx + SHIP_W / 2 - 8, sy + SHIP_H - 12);
    ctx.lineTo(sx + SHIP_W / 2 - 8, sy + SHIP_H - 4);
    ctx.closePath();
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo(sx + SHIP_W - 2, sy + SHIP_H - 6);
    ctx.lineTo(sx + SHIP_W / 2 + 8, sy + SHIP_H - 12);
    ctx.lineTo(sx + SHIP_W / 2 + 8, sy + SHIP_H - 4);
    ctx.closePath();
    ctx.fill();

    ctx.restore();

    // Score overlay on canvas
    ctx.fillStyle = "rgba(255,255,255,0.85)";
    ctx.font = "bold 20px Inter, system-ui, sans-serif";
    ctx.fillText(`⭐ ${g.score}`, 14, 34);

    // Speed indicator
    const speedPct = Math.min((g.meteorSpeed - INITIAL_METEOR_SPEED) / 6, 1);
    ctx.fillStyle = "rgba(249,115,22,0.15)";
    ctx.fillRect(GAME_W - 80, 14, 66, 12);
    ctx.fillStyle = `rgba(249,115,22,${0.5 + speedPct * 0.5})`;
    ctx.fillRect(GAME_W - 80, 14, 66 * speedPct, 12);
    ctx.fillStyle = "rgba(255,255,255,0.5)";
    ctx.font = "10px Inter, system-ui";
    ctx.fillText("SPEED", GAME_W - 78, 23);
  }, []);

  // ── game loop ────────────────────────────────────────────────────────────
  const gameLoop = useCallback(
    (timestamp) => {
      const g = gameRef.current;
      if (!g.running) return;

      g.frame++;
      g.meteorSpeed += SPEED_INCREMENT;
      g.spawnInterval = Math.max(
        SPAWN_INTERVAL_MIN,
        SPAWN_INTERVAL_INITIAL - g.frame * 0.4
      );

      // Move ship
      if (g.keys["ArrowLeft"] || g.keys["a"] || g.keys["A"]) {
        g.shipX = Math.max(0, g.shipX - SHIP_SPEED);
      }
      if (g.keys["ArrowRight"] || g.keys["d"] || g.keys["D"]) {
        g.shipX = Math.min(GAME_W - SHIP_W, g.shipX + SHIP_SPEED);
      }

      // Spawn meteors
      if (timestamp - g.lastSpawnTime > g.spawnInterval) {
        spawnMeteor();
        g.lastSpawnTime = timestamp;
      }

      // Move meteors
      g.meteors = g.meteors
        .map((m) => ({
          ...m,
          y: m.y + m.speed,
          rotation: m.rotation + m.rotSpeed,
        }))
        .filter((m) => m.y < GAME_H + 60);

      // Score: +POINTS_PER_SECOND every second survived
      if (timestamp - g.lastSecondTime >= 1000) {
        g.score += POINTS_PER_SECOND;
        setScore(g.score);
        g.lastSecondTime = timestamp;
      }

      // Collision detection
      const ship = { x: g.shipX, y: SHIP_Y };
      const hit = g.meteors.find((m) => collides(ship, m));
      if (hit) {
        g.running = false;
        const finalScore = g.score;

        // Spawn particles at collision point
        const pts = Array.from({ length: 12 }, (_, i) => ({
          id: i,
          x: g.shipX + SHIP_W / 2,
          y: SHIP_Y + SHIP_H / 2,
          color: i % 2 === 0 ? "#f97316" : "#fbbf24",
        }));
        setParticles(pts);
        setTimeout(() => setParticles([]), 800);

        // Update best
        if (finalScore > bestScore) {
          setBestScore(finalScore);
          localStorage.setItem("meteor_best", finalScore);
        }
        setScore(finalScore);
        submitScore(finalScore);
        return;
      }

      draw();
      g.animId = requestAnimationFrame(gameLoop);
    },
    [draw, spawnMeteor, submitScore, bestScore]
  );

  // ── start game ────────────────────────────────────────────────────────────
  const startGame = useCallback(() => {
    const g = gameRef.current;
    g.running = true;
    g.shipX = GAME_W / 2 - SHIP_W / 2;
    g.meteors = [];
    g.score = 0;
    g.frame = 0;
    g.meteorSpeed = INITIAL_METEOR_SPEED;
    g.spawnInterval = SPAWN_INTERVAL_INITIAL;
    g.lastSpawnTime = 0;
    g.lastSecondTime = 0;
    setScore(0);
    setRank(null);
    setSubmitError("");
    setGameState("playing");
    if (g.animId) cancelAnimationFrame(g.animId);
    g.animId = requestAnimationFrame(gameLoop);
  }, [gameLoop]);

  // ── keyboard controls ─────────────────────────────────────────────────────
  useEffect(() => {
    const down = (e) => {
      gameRef.current.keys[e.key] = true;
    };
    const up = (e) => {
      gameRef.current.keys[e.key] = false;
    };
    window.addEventListener("keydown", down);
    window.addEventListener("keyup", up);
    return () => {
      window.removeEventListener("keydown", down);
      window.removeEventListener("keyup", up);
    };
  }, []);

  // ── touch / mouse controls ────────────────────────────────────────────────
  const handleCanvasMove = useCallback((clientX) => {
    const canvas = canvasRef.current;
    if (!canvas || !gameRef.current.running) return;
    const rect = canvas.getBoundingClientRect();
    const scaleX = GAME_W / rect.width;
    const relX = (clientX - rect.left) * scaleX;
    gameRef.current.shipX = Math.max(
      0,
      Math.min(GAME_W - SHIP_W, relX - SHIP_W / 2)
    );
  }, []);

  const handleMouseMove = useCallback(
    (e) => handleCanvasMove(e.clientX),
    [handleCanvasMove]
  );

  const handleTouchMove = useCallback(
    (e) => {
      e.preventDefault();
      handleCanvasMove(e.touches[0].clientX);
    },
    [handleCanvasMove]
  );

  // ── initial draw (idle screen) ────────────────────────────────────────────
  useEffect(() => {
    if (gameState === "idle") {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext("2d");
      ctx.clearRect(0, 0, GAME_W, GAME_H);
      // draw static star field
      ctx.fillStyle = "rgba(255,255,255,0.4)";
      for (let i = 0; i < 60; i++) {
        const sx = (i * 137.5) % GAME_W;
        const sy = (i * 97.3) % GAME_H;
        ctx.beginPath();
        ctx.arc(sx, sy, i % 3 === 0 ? 1.5 : 1, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  }, [gameState]);

  // ── cleanup on unmount ────────────────────────────────────────────────────
  useEffect(() => {
    return () => {
      gameRef.current.running = false;
      if (gameRef.current.animId) cancelAnimationFrame(gameRef.current.animId);
    };
  }, []);

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-slate-950 text-white overflow-x-hidden">
      {/* ── Navbar ──────────────────────────────────────────────────────── */}
      <nav className="flex justify-between items-center px-6 md:px-8 py-5 border-b border-slate-800/60 sticky top-0 bg-slate-950/90 backdrop-blur-md z-40">
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
          <motion.button
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.96 }}
            onClick={() => navigate("/leaderboard")}
            className="hidden sm:flex items-center gap-2 px-4 py-2 border border-slate-700 rounded-lg hover:border-orange-500 hover:text-orange-400 transition text-sm"
          >
            <FaChartLine />
            <span>Leaderboard</span>
          </motion.button>

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
            onClick={handleLogout}
            className="flex items-center gap-2 px-4 py-2 border border-slate-700 rounded-lg hover:border-red-500 hover:text-red-400 transition text-sm"
          >
            <FaSignOutAlt />
            <span className="hidden sm:inline">Logout</span>
          </motion.button>
        </div>
      </nav>

      {/* ── Page hero ───────────────────────────────────────────────────── */}
      <motion.section
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center py-8 px-6"
      >
        <div className="inline-flex items-center gap-2 text-orange-400 mb-3">
          <FaRocket />
          <span className="font-semibold text-sm tracking-wide uppercase">
            Meteor Dodge
          </span>
        </div>
        <h2 className="text-3xl md:text-5xl font-extrabold leading-tight">
          Dodge & <span className="text-orange-500">Survive</span>
        </h2>
        <p className="mt-3 text-gray-400 max-w-lg mx-auto">
          Steer your ship, avoid incoming meteors, and earn a score that's
          instantly uploaded to the global leaderboard.
        </p>
      </motion.section>

      {/* ── Main layout ─────────────────────────────────────────────────── */}
      <main className="max-w-5xl mx-auto px-4 pb-24 flex flex-col lg:flex-row gap-8 items-start justify-center">
        {/* ── Game canvas area ──────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="flex-shrink-0 relative"
        >
          {/* Canvas wrapper */}
          <div
            className="relative rounded-2xl overflow-hidden border border-slate-700 shadow-2xl shadow-orange-500/10"
            style={{ width: "min(480px, 92vw)", aspectRatio: "480/600" }}
          >
            <canvas
              ref={canvasRef}
              width={GAME_W}
              height={GAME_H}
              onMouseMove={handleMouseMove}
              onTouchMove={handleTouchMove}
              className="w-full h-full block"
              style={{
                background:
                  "radial-gradient(ellipse at 50% 0%, #0f172a 0%, #020617 100%)",
                cursor: gameState === "playing" ? "none" : "default",
              }}
            />

            {/* Particle layer */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
              <AnimatePresence>
                {particles.map((p) => (
                  <Particle key={p.id} x={p.x} y={p.y} color={p.color} />
                ))}
              </AnimatePresence>
            </div>

            {/* ── Idle overlay ── */}
            <AnimatePresence>
              {gameState === "idle" && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 flex flex-col items-center justify-center gap-6 bg-slate-950/80 backdrop-blur-sm"
                >
                  <motion.div
                    animate={{ y: [0, -8, 0] }}
                    transition={{ repeat: Infinity, duration: 2 }}
                  >
                    <FaRocket className="text-6xl text-orange-500" />
                  </motion.div>
                  <div className="text-center px-6">
                    <h3 className="text-2xl font-extrabold text-white mb-2">
                      Meteor Dodge
                    </h3>
                    <p className="text-gray-400 text-sm">
                      Move mouse / touch to steer · Keyboard ← →
                    </p>
                  </div>
                  {bestScore > 0 && (
                    <div className="flex items-center gap-2 text-yellow-400 text-sm bg-yellow-400/10 border border-yellow-400/20 rounded-lg px-4 py-2">
                      <FaCrown />
                      <span>Personal best: {bestScore} pts</span>
                    </div>
                  )}
                  <motion.button
                    whileHover={{ scale: 1.06 }}
                    whileTap={{ scale: 0.96 }}
                    onClick={startGame}
                    className="flex items-center gap-3 px-8 py-4 bg-orange-500 hover:bg-orange-600 rounded-xl font-bold text-white text-lg shadow-lg shadow-orange-500/30 transition"
                  >
                    <FaPlay />
                    Play Now
                  </motion.button>
                </motion.div>
              )}
            </AnimatePresence>

            {/* ── Game-over / submitting / submitted overlay ── */}
            <AnimatePresence>
              {(gameState === "over" ||
                gameState === "submitting" ||
                gameState === "submitted") && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ type: "spring", stiffness: 220, damping: 22 }}
                  className="absolute inset-0 flex flex-col items-center justify-center gap-5 bg-slate-950/85 backdrop-blur-sm px-8"
                >
                  {/* Explosion icon */}
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: [0, 1.3, 1] }}
                    transition={{ duration: 0.5 }}
                    className="text-5xl"
                  >
                    💥
                  </motion.div>

                  <div className="text-center">
                    <h3 className="text-2xl font-extrabold text-white mb-1">
                      {gameState === "submitted" ? "Score Saved!" : "Game Over"}
                    </h3>
                    <p className="text-gray-400 text-sm">
                      {gameState === "submitting"
                        ? "Uploading your score…"
                        : gameState === "submitted"
                        ? "Your score is on the leaderboard!"
                        : "You hit a meteor!"}
                    </p>
                  </div>

                  {/* Score display */}
                  <div className="bg-slate-900 border border-slate-700 rounded-2xl px-8 py-5 text-center w-full">
                    <p className="text-gray-400 text-xs uppercase tracking-wide mb-1">
                      Your Score
                    </p>
                    <p className="text-5xl font-extrabold text-orange-400">
                      {score}
                    </p>
                    {score >= bestScore && score > 0 && (
                      <motion.p
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-yellow-400 text-xs mt-2 flex items-center justify-center gap-1"
                      >
                        <FaCrown /> New personal best!
                      </motion.p>
                    )}
                  </div>

                  {/* Rank pill */}
                  {gameState === "submitted" && rank && (
                    <motion.div
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex items-center gap-2 bg-orange-500/10 border border-orange-500/30 rounded-lg px-4 py-2 text-orange-400 text-sm"
                    >
                      <FaChartLine />
                      <span>
                        Global rank:{" "}
                        <strong className="text-orange-300">#{rank}</strong>
                      </span>
                    </motion.div>
                  )}

                  {/* Submitting spinner */}
                  {gameState === "submitting" && (
                    <div className="flex items-center gap-2 text-gray-400 text-sm">
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ repeat: Infinity, duration: 0.8, ease: "linear" }}
                        className="w-4 h-4 border-2 border-orange-500 border-t-transparent rounded-full"
                      />
                      Saving to leaderboard…
                    </div>
                  )}

                  {/* Error */}
                  {submitError && (
                    <p className="text-red-400 text-xs bg-red-950/40 border border-red-700/30 rounded-lg px-3 py-2 w-full text-center">
                      {submitError}
                    </p>
                  )}

                  {/* Action buttons */}
                  {gameState !== "submitting" && (
                    <div className="flex gap-3 w-full">
                      <motion.button
                        whileHover={{ scale: 1.04 }}
                        whileTap={{ scale: 0.96 }}
                        onClick={startGame}
                        className="flex-1 flex items-center justify-center gap-2 py-3 bg-orange-500 hover:bg-orange-600 rounded-xl font-bold text-white transition"
                      >
                        <FaPlay />
                        Play Again
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.04 }}
                        whileTap={{ scale: 0.96 }}
                        onClick={() => navigate("/leaderboard")}
                        className="flex-1 flex items-center justify-center gap-2 py-3 border border-slate-700 hover:border-orange-500 rounded-xl font-semibold text-gray-300 hover:text-orange-400 transition text-sm"
                      >
                        <FaChartLine />
                        Leaderboard
                      </motion.button>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>

            {/* ── Live score HUD (playing) ── */}
            {gameState === "playing" && (
              <div className="absolute top-2 left-1/2 -translate-x-1/2 flex items-center gap-3 pointer-events-none">
                <div className="flex items-center gap-1.5 bg-slate-950/70 border border-slate-700/60 rounded-full px-4 py-1.5 text-sm">
                  <FaFire className="text-orange-400" />
                  <span className="font-bold text-white tabular-nums">
                    {score}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Mobile controls hint */}
          {gameState === "playing" && (
            <p className="mt-3 text-center text-gray-600 text-xs">
              Move mouse / drag finger to steer · Keyboard ← →
            </p>
          )}
        </motion.div>

        {/* ── Right sidebar ─────────────────────────────────────────────── */}
        <motion.aside
          initial={{ opacity: 0, x: 24 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="flex flex-col gap-5 lg:sticky lg:top-24 w-full lg:w-72"
        >
          {/* Player card */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
            <div className="flex items-center gap-3 mb-4">
              <FaUser className="text-orange-500" />
              <h3 className="font-bold text-white">Playing as</h3>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-500 to-orange-700 flex items-center justify-center font-extrabold text-white text-sm">
                {user?.username?.slice(0, 2).toUpperCase()}
              </div>
              <div>
                <p className="font-semibold text-white">{user?.username}</p>
                <p className="text-xs text-gray-500">Scores update live</p>
              </div>
            </div>
          </div>

          {/* Personal best */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
            <div className="flex items-center gap-3 mb-3">
              <FaCrown className="text-yellow-400" />
              <h3 className="font-bold text-white">Personal Best</h3>
            </div>
            <p className="text-4xl font-extrabold text-yellow-400 tabular-nums">
              {bestScore}
            </p>
            <p className="text-gray-500 text-xs mt-1">pts this session</p>
          </div>

          {/* How to play */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
            <div className="flex items-center gap-3 mb-4">
              <FaBolt className="text-orange-500" />
              <h3 className="font-bold text-white">How to Play</h3>
            </div>
            <ul className="space-y-3 text-sm text-gray-400">
              {[
                { icon: <FaArrowLeft />, text: "← → keys or move mouse to steer" },
                { icon: <FaRocket />, text: "Survive longer = more points" },
                { icon: <FaStar />, text: `+${POINTS_PER_SECOND} pts per second survived` },
                { icon: <FaShieldAlt />, text: "Meteors speed up over time!" },
                { icon: <FaChartLine />, text: "Score auto-submits on game over" },
              ].map((step, i) => (
                <li key={i} className="flex items-start gap-3">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-orange-500/20 text-orange-400 text-xs flex items-center justify-center mt-0.5">
                    {step.icon}
                  </span>
                  <span>{step.text}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Quick links */}
          <div className="flex flex-col gap-2">
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => navigate("/leaderboard")}
              className="flex items-center justify-center gap-2 py-3 bg-slate-900 border border-slate-800 hover:border-orange-500/50 rounded-xl text-gray-300 hover:text-orange-400 transition text-sm font-semibold"
            >
              <FaChartLine />
              View Global Leaderboard
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => navigate("/profile")}
              className="flex items-center justify-center gap-2 py-3 bg-slate-900 border border-slate-800 hover:border-orange-500/50 rounded-xl text-gray-300 hover:text-orange-400 transition text-sm font-semibold"
            >
              <FaUser />
              My Profile & Stats
            </motion.button>
          </div>
        </motion.aside>
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

export default Game;
