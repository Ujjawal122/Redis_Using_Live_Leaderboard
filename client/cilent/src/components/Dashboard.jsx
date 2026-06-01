import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Dashboard = () => {
  const navigate = useNavigate();
  const { logout, user } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/login");
    } catch (err) {
      console.error("Logout error:", err);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">Leaderboard</h1>
          {user?.username && (
            <p className="text-slate-400 mt-1">Signed in as {user.username}</p>
          )}
        </div>
        <button
          onClick={handleLogout}
          className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg transition-colors font-semibold"
        >
          Logout
        </button>
      </div>
    </div>
  );
};

export default Dashboard;
