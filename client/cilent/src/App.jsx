import { Route, Routes } from 'react-router-dom'
import Dashboard from './components/Dashboard.jsx'
import LandingPage from './components/LandingPage.jsx'
import Login from './components/Login.jsx'
import Signup from './components/Signup.jsx'

function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/register" element={<Signup />} />
      <Route path="/login" element={<Login />} />
      <Route path="/leaderboard" element={<Dashboard />} />
    </Routes>
  )
}

export default App
