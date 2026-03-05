import React from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import DashboardPage from './pages/DashboardPage';
import AdminDashboardPage from './pages/AdminDashboardPage';
import './index.css';

function LandingWrapper() {
  const navigate = useNavigate();

  return (
    <LandingPage
      onLogin={() => navigate('/login')}
      onSignup={() => navigate('/signup')}
    />
  );
}

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingWrapper />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/admin-dashboard" element={<AdminDashboardPage />} />
      </Routes>
    </Router>
  );
}

export default App;

