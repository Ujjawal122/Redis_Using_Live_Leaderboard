import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  FaTrophy,
  FaUser,
  FaEnvelope,
  FaLock,
  FaGlobeAsia,
  FaSignOutAlt,
  FaEdit,
  FaCheck,
  FaTimes,
  FaGamepad,
  FaStar,
  FaChartLine,
  FaCrown,
  FaCamera,
  FaShieldAlt,
  FaTrashAlt,
} from "react-icons/fa";
import api from "../lib/api";
import { useAuth } from "../context/AuthContext";

// ─── Avatar initials circle ───────────────────────────────────────────────────
const AvatarCircle = ({ username, avatar, size = "lg" }) => {
  const initials = username
    ? username.slice(0, 2).toUpperCase()
    : "??";
  const sizeClass = size === "lg" ? "w-24 h-24 text-3xl" : "w-10 h-10 text-sm";

  return (
    <div
      className={`relative flex-shrink-0 ${sizeClass} rounded-full bg-gradient-to-br from-orange-500 to-orange-700 flex items-center justify-center font-extrabold text-white shadow-lg shadow-orange-500/30 ring-4 ring-orange-500/20`}
    >
      {avatar ? (
        <img
          src={avatar}
          alt={username}
          className="w-full h-full object-cover rounded-full"
          onError={(e) => {
            e.currentTarget.style.display = "none";
          }}
        />
      ) : (
        <span>{initials}</span>
      )}
    </div>
  );
};

// ─── Stat card ────────────────────────────────────────────────────────────────
const StatCard = ({ icon, label, value, accent = "orange" }) => {
  const accentMap = {
    orange: "text-orange-500",
    yellow: "text-yellow-400",
    green: "text-green-400",
    blue: "text-blue-400",
  };
  return (
    <motion.div
      whileHover={{ y: -4 }}
      transition={{ type: "spring", stiffness: 300 }}
      className="bg-slate-900 border border-slate-800 rounded-xl p-5 text-center"
    >
      <div className={`flex justify-center mb-2 text-xl ${accentMap[accent]}`}>
        {icon}
      </div>
      <p className="text-gray-400 text-xs uppercase tracking-wide mb-1">{label}</p>
      <p className="font-extrabold text-xl text-white">{value ?? "—"}</p>
    </motion.div>
  );
};

// ─── Editable field row ───────────────────────────────────────────────────────
const EditField = ({ icon, label, name, value, onChange, type = "text", placeholder, disabled }) => (
  <div className="flex flex-col gap-1.5">
    <label className="text-xs text-gray-400 uppercase tracking-wide flex items-center gap-2">
      <span className="text-orange-500">{icon}</span>
      {label}
    </label>
    <input
      name={name}
      type={type}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      disabled={disabled}
      className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-2.5 text-white placeholder-gray-600 outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition disabled:opacity-50 disabled:cursor-not-allowed"
    />
  </div>
);

// ─── Toast notification ───────────────────────────────────────────────────────
const Toast = ({ toast }) => (
  <AnimatePresence>
    {toast && (
      <motion.div
        key={toast.id}
        initial={{ opacity: 0, y: 40, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 20, scale: 0.95 }}
        className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-5 py-4 rounded-xl border shadow-2xl text-sm font-medium ${
          toast.type === "success"
            ? "bg-green-950/90 border-green-700/50 text-green-300"
            : "bg-red-950/90 border-red-700/50 text-red-300"
        }`}
      >
        {toast.type === "success" ? <FaCheck /> : <FaTimes />}
        {toast.msg}
      </motion.div>
    )}
  </AnimatePresence>
);

// ─── Delete confirmation modal ────────────────────────────────────────────────
const DeleteModal = ({ onConfirm, onCancel, loading }) => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm px-4"
  >
    <motion.div
      initial={{ scale: 0.9, y: 20 }}
      animate={{ scale: 1, y: 0 }}
      exit={{ scale: 0.9, y: 20 }}
      className="bg-slate-900 border border-red-700/40 rounded-2xl p-8 max-w-sm w-full shadow-2xl"
    >
      <div className="flex flex-col items-center text-center gap-4">
        <div className="w-14 h-14 rounded-full bg-red-500/10 border border-red-500/30 flex items-center justify-center">
          <FaTrashAlt className="text-red-400 text-2xl" />
        </div>
        <div>
          <h3 className="text-xl font-bold text-white mb-2">Delete Account</h3>
          <p className="text-gray-400 text-sm">
            This action is <span className="text-red-400 font-semibold">permanent</span> and cannot
            be undone. All your scores and rankings will be lost.
          </p>
        </div>
        <div className="flex gap-3 w-full mt-2">
          <button
            onClick={onCancel}
            className="flex-1 px-4 py-2.5 border border-slate-700 rounded-lg text-gray-300 hover:border-slate-500 transition text-sm font-semibold"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className="flex-1 px-4 py-2.5 bg-red-600 hover:bg-red-700 rounded-lg text-white transition text-sm font-semibold disabled:opacity-60"
          >
            {loading ? "Deleting…" : "Yes, Delete"}
          </button>
        </div>
      </div>
    </motion.div>
  </motion.div>
);

// ─── Main Profile Page ────────────────────────────────────────────────────────
const Profile = () => {
  const navigate = useNavigate();
  const { user: authUser, logout } = useAuth();

  const [profile, setProfile] = useState(null);
  const [rank, setRank] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [toast, setToast] = useState(null);
  const toastTimer = useRef(null);

  const [form, setForm] = useState({
    username: "",
    email: "",
    country: "",
    avatar: "",
    password: "",
    confirmPassword: "",
  });
  const [formErrors, setFormErrors] = useState({});

  // ── show toast helper ────────────────────────────────────────────────────
  const showToast = (msg, type = "success") => {
    const id = Date.now();
    setToast({ msg, type, id });
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), 3500);
  };

  // ── fetch profile ────────────────────────────────────────────────────────
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        const { data } = await api.get("/players/me");
        const p = data.player;
        setProfile(p);
        setForm({
          username: p.username || "",
          email: p.email || "",
          country: p.country || "",
          avatar: p.avatar || "",
          password: "",
          confirmPassword: "",
        });
      } catch (err) {
        showToast(err.response?.data?.message || "Failed to load profile.", "error");
      } finally {
        setLoading(false);
      }
    };

    // fetch rank
    const fetchRank = async () => {
      if (!authUser?.username) return;
      try {
        const { data } = await api.get(`/leaderboard/rank/${authUser.username}`);
        setRank(data.rank);
      } catch {
        setRank(null);
      }
    };

    fetchProfile();
    fetchRank();
  }, [authUser?.username]);

  // ── form change ──────────────────────────────────────────────────────────
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (formErrors[name]) {
      setFormErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  // ── validate ─────────────────────────────────────────────────────────────
  const validate = () => {
    const errors = {};
    if (!form.username.trim() || form.username.trim().length < 3) {
      errors.username = "Username must be at least 3 characters.";
    }
    if (!form.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      errors.email = "Please enter a valid email.";
    }
    if (form.password && form.password.length < 6) {
      errors.password = "Password must be at least 6 characters.";
    }
    if (form.password && form.password !== form.confirmPassword) {
      errors.confirmPassword = "Passwords do not match.";
    }
    return errors;
  };

  // ── save profile ─────────────────────────────────────────────────────────
  const handleSave = async () => {
    const errors = validate();
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    setSaving(true);
    try {
      const payload = {
        username: form.username.trim(),
        email: form.email.trim(),
        country: form.country.trim(),
        avatar: form.avatar.trim(),
      };
      if (form.password) payload.password = form.password;

      const { data } = await api.put("/players/me", payload);
      setProfile(data.player);
      setForm((prev) => ({ ...prev, password: "", confirmPassword: "" }));
      setEditing(false);
      showToast("Profile updated successfully!");
    } catch (err) {
      showToast(err.response?.data?.message || "Failed to update profile.", "error");
    } finally {
      setSaving(false);
    }
  };

  // ── cancel edit ──────────────────────────────────────────────────────────
  const handleCancel = () => {
    setForm({
      username: profile.username || "",
      email: profile.email || "",
      country: profile.country || "",
      avatar: profile.avatar || "",
      password: "",
      confirmPassword: "",
    });
    setFormErrors({});
    setEditing(false);
  };

  // ── delete account ────────────────────────────────────────────────────────
  const handleDelete = async () => {
    setDeleting(true);
    try {
      await api.delete("/players/me");
      await logout();
      navigate("/");
    } catch (err) {
      showToast(err.response?.data?.message || "Failed to delete account.", "error");
      setDeleting(false);
      setShowDeleteModal(false);
    }
  };

  // ── logout ────────────────────────────────────────────────────────────────
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

      {/* ── Hero banner ─────────────────────────────────────────────────── */}
      <motion.section
        initial={{ opacity: 0, y: -24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center py-10 px-6"
      >
        <div className="inline-flex items-center gap-3 text-orange-400 mb-3">
          <FaUser />
          <span className="font-semibold text-sm tracking-wide uppercase">Player Profile</span>
        </div>
        <h2 className="text-4xl md:text-5xl font-extrabold leading-tight">
          Your <span className="text-orange-500">Dashboard</span>
        </h2>
        <p className="mt-3 text-gray-400 text-lg max-w-xl mx-auto">
          Manage your account, track your stats, and update your information.
        </p>
      </motion.section>

      {/* ── Main content ─────────────────────────────────────────────────── */}
      <main className="max-w-5xl mx-auto px-6 pb-24">
        {loading ? (
          // Skeleton
          <div className="grid lg:grid-cols-[300px_1fr] gap-8 items-start">
            <div className="space-y-4">
              <div className="h-64 rounded-2xl bg-slate-900 border border-slate-800 animate-pulse" />
              <div className="h-40 rounded-2xl bg-slate-900 border border-slate-800 animate-pulse" />
            </div>
            <div className="h-96 rounded-2xl bg-slate-900 border border-slate-800 animate-pulse" />
          </div>
        ) : profile ? (
          <div className="grid lg:grid-cols-[300px_1fr] gap-8 items-start">
            {/* ── Left: Avatar + Stats ───────────────────────────────────── */}
            <motion.div
              initial={{ opacity: 0, x: -24 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.55 }}
              className="flex flex-col gap-6"
            >
              {/* Profile card */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col items-center text-center gap-4">
                {/* Avatar */}
                <div className="relative">
                  <AvatarCircle username={profile.username} avatar={profile.avatar} size="lg" />
                  {rank === 1 && (
                    <motion.span
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute -top-2 -right-2 w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center shadow-lg"
                    >
                      <FaCrown className="text-slate-900 text-sm" />
                    </motion.span>
                  )}
                </div>

                <div>
                  <h3 className="text-xl font-bold text-white">{profile.username}</h3>
                  <p className="text-gray-400 text-sm mt-0.5">{profile.email}</p>
                  {profile.country && (
                    <span className="inline-flex items-center gap-1.5 mt-2 text-xs text-gray-500 bg-slate-800 px-3 py-1 rounded-full">
                      <FaGlobeAsia className="text-orange-500" />
                      {profile.country}
                    </span>
                  )}
                </div>

                {/* Current rank highlight */}
                {rank && (
                  <div className="w-full bg-orange-500/10 border border-orange-500/20 rounded-xl px-4 py-3 flex items-center justify-between">
                    <span className="text-sm text-gray-300">Global Rank</span>
                    <span className="text-2xl font-extrabold text-orange-400">#{rank}</span>
                  </div>
                )}

                {/* Edit button */}
                {!editing && (
                  <motion.button
                    whileHover={{ scale: 1.04 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => setEditing(true)}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-orange-500 hover:bg-orange-600 rounded-lg font-semibold text-white transition text-sm"
                  >
                    <FaEdit />
                    Edit Profile
                  </motion.button>
                )}
              </div>

              {/* Stats grid */}
              <div className="grid grid-cols-2 gap-3">
                <StatCard
                  icon={<FaStar />}
                  label="Total Score"
                  value={(profile.totalScore ?? 0).toLocaleString()}
                  accent="yellow"
                />
                <StatCard
                  icon={<FaGamepad />}
                  label="Games Played"
                  value={profile.gamesPlayed ?? 0}
                  accent="green"
                />
                <StatCard
                  icon={<FaChartLine />}
                  label="Rank"
                  value={rank ? `#${rank}` : "—"}
                  accent="orange"
                />
                <StatCard
                  icon={<FaCrown />}
                  label="Status"
                  value={rank === 1 ? "👑 #1" : rank ? "Active" : "Unranked"}
                  accent="blue"
                />
              </div>

              {/* Danger zone */}
              <div className="bg-slate-900 border border-red-900/40 rounded-2xl p-5">
                <div className="flex items-center gap-2 mb-3">
                  <FaShieldAlt className="text-red-400" />
                  <h4 className="font-bold text-sm text-red-400 uppercase tracking-wide">
                    Danger Zone
                  </h4>
                </div>
                <p className="text-gray-500 text-xs mb-4 leading-relaxed">
                  Permanently delete your account and all associated data. This cannot be undone.
                </p>
                <button
                  onClick={() => setShowDeleteModal(true)}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2.5 border border-red-700/50 hover:border-red-500 hover:bg-red-500/10 rounded-lg text-red-400 transition text-sm font-semibold"
                >
                  <FaTrashAlt />
                  Delete Account
                </button>
              </div>
            </motion.div>

            {/* ── Right: Edit form / Info display ───────────────────────── */}
            <motion.div
              initial={{ opacity: 0, x: 24 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.55, delay: 0.1 }}
            >
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 md:p-8">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <FaUser className="text-orange-500 text-xl" />
                    <h3 className="text-xl font-bold text-white">
                      {editing ? "Edit Profile" : "Profile Information"}
                    </h3>
                  </div>
                  {editing && (
                    <div className="flex items-center gap-2">
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.96 }}
                        onClick={handleCancel}
                        disabled={saving}
                        className="flex items-center gap-2 px-4 py-2 border border-slate-700 hover:border-slate-500 rounded-lg text-gray-300 transition text-sm"
                      >
                        <FaTimes />
                        Cancel
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.96 }}
                        onClick={handleSave}
                        disabled={saving}
                        className="flex items-center gap-2 px-4 py-2 bg-orange-500 hover:bg-orange-600 rounded-lg text-white font-semibold transition text-sm disabled:opacity-60"
                      >
                        <FaCheck />
                        {saving ? "Saving…" : "Save Changes"}
                      </motion.button>
                    </div>
                  )}
                </div>

                {editing ? (
                  // ── Edit mode ─────────────────────────────────────────
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                    className="space-y-5"
                  >
                    <div className="grid sm:grid-cols-2 gap-5">
                      <div>
                        <EditField
                          icon={<FaUser />}
                          label="Username"
                          name="username"
                          value={form.username}
                          onChange={handleChange}
                          placeholder="e.g. shadow_king"
                        />
                        {formErrors.username && (
                          <p className="text-red-400 text-xs mt-1">{formErrors.username}</p>
                        )}
                      </div>
                      <div>
                        <EditField
                          icon={<FaEnvelope />}
                          label="Email"
                          name="email"
                          type="email"
                          value={form.email}
                          onChange={handleChange}
                          placeholder="you@example.com"
                        />
                        {formErrors.email && (
                          <p className="text-red-400 text-xs mt-1">{formErrors.email}</p>
                        )}
                      </div>
                    </div>

                    <EditField
                      icon={<FaGlobeAsia />}
                      label="Country"
                      name="country"
                      value={form.country}
                      onChange={handleChange}
                      placeholder="e.g. India"
                    />

                    <EditField
                      icon={<FaCamera />}
                      label="Avatar URL"
                      name="avatar"
                      value={form.avatar}
                      onChange={handleChange}
                      placeholder="https://example.com/avatar.png"
                    />

                    {/* Preview avatar URL if filled */}
                    {form.avatar && (
                      <div className="flex items-center gap-3 p-3 bg-slate-800/50 rounded-xl border border-slate-700">
                        <img
                          src={form.avatar}
                          alt="Avatar preview"
                          className="w-10 h-10 rounded-full object-cover border border-slate-600"
                          onError={(e) => {
                            e.currentTarget.src = "";
                            e.currentTarget.style.display = "none";
                          }}
                        />
                        <p className="text-gray-400 text-xs">Avatar preview</p>
                      </div>
                    )}

                    {/* Divider */}
                    <div className="relative py-2">
                      <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-slate-800" />
                      </div>
                      <div className="relative flex justify-center">
                        <span className="bg-slate-900 px-3 text-xs text-gray-500 flex items-center gap-2">
                          <FaLock className="text-orange-500" /> Change Password (optional)
                        </span>
                      </div>
                    </div>

                    <div className="grid sm:grid-cols-2 gap-5">
                      <div>
                        <EditField
                          icon={<FaLock />}
                          label="New Password"
                          name="password"
                          type="password"
                          value={form.password}
                          onChange={handleChange}
                          placeholder="Leave blank to keep current"
                        />
                        {formErrors.password && (
                          <p className="text-red-400 text-xs mt-1">{formErrors.password}</p>
                        )}
                      </div>
                      <div>
                        <EditField
                          icon={<FaLock />}
                          label="Confirm New Password"
                          name="confirmPassword"
                          type="password"
                          value={form.confirmPassword}
                          onChange={handleChange}
                          placeholder="Repeat new password"
                        />
                        {formErrors.confirmPassword && (
                          <p className="text-red-400 text-xs mt-1">{formErrors.confirmPassword}</p>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ) : (
                  // ── View mode ─────────────────────────────────────────
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                    className="space-y-5"
                  >
                    {[
                      {
                        icon: <FaUser className="text-orange-500" />,
                        label: "Username",
                        value: profile.username,
                      },
                      {
                        icon: <FaEnvelope className="text-orange-500" />,
                        label: "Email",
                        value: profile.email,
                      },
                      {
                        icon: <FaGlobeAsia className="text-orange-500" />,
                        label: "Country",
                        value: profile.country || "Not set",
                      },
                    ].map((row) => (
                      <div key={row.label} className="flex items-center gap-4 py-3 border-b border-slate-800 last:border-0">
                        <span className="w-8 flex justify-center">{row.icon}</span>
                        <div className="flex-1">
                          <p className="text-xs text-gray-500 uppercase tracking-wide">{row.label}</p>
                          <p className="text-white font-semibold mt-0.5">{row.value}</p>
                        </div>
                      </div>
                    ))}

                    {/* Password placeholder */}
                    <div className="flex items-center gap-4 py-3 border-b border-slate-800 last:border-0">
                      <span className="w-8 flex justify-center">
                        <FaLock className="text-orange-500" />
                      </span>
                      <div className="flex-1">
                        <p className="text-xs text-gray-500 uppercase tracking-wide">Password</p>
                        <p className="text-gray-600 font-semibold mt-0.5">••••••••</p>
                      </div>
                    </div>

                    {/* Member since */}
                    {profile.createdAt && (
                      <div className="flex items-center gap-4 py-3">
                        <span className="w-8 flex justify-center">
                          <FaStar className="text-yellow-400" />
                        </span>
                        <div className="flex-1">
                          <p className="text-xs text-gray-500 uppercase tracking-wide">Member Since</p>
                          <p className="text-white font-semibold mt-0.5">
                            {new Date(profile.createdAt).toLocaleDateString("en-IN", {
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                            })}
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Quick action */}
                    <div className="mt-4 pt-4 border-t border-slate-800">
                      <motion.button
                        whileHover={{ scale: 1.03 }}
                        whileTap={{ scale: 0.97 }}
                        onClick={() => setEditing(true)}
                        className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-slate-800 hover:bg-slate-700 border border-slate-700 hover:border-orange-500/50 rounded-xl text-gray-300 hover:text-orange-400 transition text-sm font-semibold"
                      >
                        <FaEdit />
                        Edit Profile Information
                      </motion.button>
                    </div>
                  </motion.div>
                )}
              </div>

              {/* Account activity info */}
              {!editing && (
                <motion.div
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.35 }}
                  className="mt-6 bg-slate-900 border border-slate-800 rounded-2xl p-6"
                >
                  <div className="flex items-center gap-3 mb-4">
                    <FaChartLine className="text-orange-500 text-lg" />
                    <h4 className="font-bold text-white">Activity Summary</h4>
                  </div>

                  <div className="grid sm:grid-cols-3 gap-4">
                    {[
                      {
                        label: "Best Score",
                        value: (profile.totalScore ?? 0).toLocaleString(),
                        sub: "All time",
                        color: "text-yellow-400",
                      },
                      {
                        label: "Games",
                        value: profile.gamesPlayed ?? 0,
                        sub: "Played",
                        color: "text-green-400",
                      },
                      {
                        label: "Avg Score",
                        value:
                          profile.gamesPlayed > 0
                            ? Math.round(profile.totalScore / profile.gamesPlayed).toLocaleString()
                            : "—",
                        sub: "Per game",
                        color: "text-orange-400",
                      },
                    ].map((item) => (
                      <div
                        key={item.label}
                        className="bg-slate-800/60 border border-slate-700/60 rounded-xl p-4 text-center"
                      >
                        <p className={`text-2xl font-extrabold ${item.color}`}>{item.value}</p>
                        <p className="text-white text-sm font-semibold mt-0.5">{item.label}</p>
                        <p className="text-gray-500 text-xs">{item.sub}</p>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </motion.div>
          </div>
        ) : (
          // Error / not found state
          <div className="text-center py-24">
            <FaUser className="text-5xl text-gray-700 mx-auto mb-4" />
            <p className="text-gray-400 text-lg">Could not load profile.</p>
            <button
              onClick={() => window.location.reload()}
              className="mt-4 px-5 py-2 bg-orange-500 hover:bg-orange-600 rounded-lg font-semibold text-white transition"
            >
              Retry
            </button>
          </div>
        )}
      </main>

      {/* ── Footer ──────────────────────────────────────────────────────── */}
      <footer className="border-t border-slate-800 py-8 text-center">
        <p className="text-gray-500 text-sm">
          Built with React, Framer Motion, Redis &amp; Socket.IO
        </p>
      </footer>

      {/* ── Delete modal ─────────────────────────────────────────────────── */}
      <AnimatePresence>
        {showDeleteModal && (
          <DeleteModal
            onConfirm={handleDelete}
            onCancel={() => setShowDeleteModal(false)}
            loading={deleting}
          />
        )}
      </AnimatePresence>

      {/* ── Toast ────────────────────────────────────────────────────────── */}
      <Toast toast={toast} />
    </div>
  );
};

export default Profile;
