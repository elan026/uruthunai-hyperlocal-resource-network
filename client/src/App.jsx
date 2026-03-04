import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Landing from './pages/Landing';
import Dashboard from './pages/Dashboard';
import ResourceMap from './pages/ResourceMap';
import AdminDashboard from './pages/AdminDashboard';
import PostResource from './pages/PostResource';
import RequestResource from './pages/RequestResource';
import ResourceDetail from './pages/ResourceDetail';
import EmergencyDashboard from './pages/EmergencyDashboard';
import Volunteers from './pages/Volunteers';
import CommunityAlerts from './pages/CommunityAlerts';
import Profile from './pages/Profile';
import Layout from './components/Layout';

function ProtectedLayout({ children }) {
  const { user, emergencyMode, logout } = useAuth();
  if (!user) return <Navigate to="/" />;
  return (
    <Layout user={user} emergencyMode={emergencyMode} onLogout={logout}>
      {children}
    </Layout>
  );
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/dashboard" element={<ProtectedLayout><Dashboard /></ProtectedLayout>} />
      <Route path="/map" element={<ProtectedLayout><ResourceMap /></ProtectedLayout>} />
      <Route path="/post-resource" element={<ProtectedLayout><PostResource /></ProtectedLayout>} />
      <Route path="/request-resource" element={<ProtectedLayout><RequestResource /></ProtectedLayout>} />
      <Route path="/resource/:id" element={<ProtectedLayout><ResourceDetail /></ProtectedLayout>} />
      <Route path="/emergency" element={<ProtectedLayout><EmergencyDashboard /></ProtectedLayout>} />
      <Route path="/volunteers" element={<ProtectedLayout><Volunteers /></ProtectedLayout>} />
      <Route path="/alerts" element={<ProtectedLayout><CommunityAlerts /></ProtectedLayout>} />
      <Route path="/admin" element={<ProtectedLayout><AdminDashboard /></ProtectedLayout>} />
      <Route path="/profile" element={<ProtectedLayout><Profile /></ProtectedLayout>} />
    </Routes>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-[#F8FAFC]">
          <AppRoutes />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
