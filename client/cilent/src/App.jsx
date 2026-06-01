import { Route, Routes } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext.jsx'
import Leaderboard from './components/Leaderboard.jsx'
import LandingPage from './components/LandingPage.jsx'
import Login from './components/Login.jsx'
import ProtectedRoute from './components/ProtectedRoute.jsx'
import Signup from './components/Signup.jsx'

function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/register" element={<Signup />} />
        <Route path="/login" element={<Login />} />
        <Route
          path="/leaderboard"
          element={
            <ProtectedRoute>
              <Leaderboard />
            </ProtectedRoute>
          }
        />
      </Routes>
    </AuthProvider>
  )
}

export default App
