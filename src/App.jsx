import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Deposit from './pages/Deposit';
import ProtectedRoute from './components/ProtectedRoute';
import Navbar from './components/Navbar';
import './App.css';

function App() {

  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route
          path="/deposit"
          element={
            <ProtectedRoute>
              <Deposit />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/betting"
          element={
            <ProtectedRoute>
              <BettingPage />
            </ProtectedRoute>
          }
        />
        <Route path="/" element={<Navigate to="/login" replace />} />
      </Routes>
    </Router>
  );
}

// Dashboard Component (placeholder for authenticated users)
function Dashboard() {
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/login';
  };

  return (
    <div style={{ background: '#000', minHeight: '100vh', color: '#fff' }}>
      <Navbar />
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '40px 20px', textAlign: 'center' }}>
        <h1>Welcome, {user.name}!</h1>
        <p>Email: {user.email}</p>
        <button
          onClick={handleLogout}
          style={{
            padding: '10px 20px',
            background: '#A020F0',
            color: '#fff',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer',
            marginTop: '20px',
          }}
        >
          Logout
        </button>
      </div>
    </div>
  );
}

// Betting Page (placeholder)
function BettingPage() {
  return (
    <div style={{ background: '#000', minHeight: '100vh', color: '#fff' }}>
      <Navbar />
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '40px 20px', textAlign: 'center' }}>
        <h1>Betting Coming Soon!</h1>
        <p>Check back later for exciting betting opportunities.</p>
      </div>
    </div>
  );
}

export default App;
