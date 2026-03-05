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
import ScrollProgressBar from './components/ScrollProgressBar';
import PageTransition from './components/PageTransition';
import useSmoothScroll from './hooks/useSmoothScroll';

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
      <Route path="/dashboard" element={<ProtectedLayout><PageTransition><Dashboard /></PageTransition></ProtectedLayout>} />
      <Route path="/map" element={<ProtectedLayout><PageTransition><ResourceMap /></PageTransition></ProtectedLayout>} />
      <Route path="/post-resource" element={<ProtectedLayout><PageTransition><PostResource /></PageTransition></ProtectedLayout>} />
      <Route path="/request-resource" element={<ProtectedLayout><PageTransition><RequestResource /></PageTransition></ProtectedLayout>} />
      <Route path="/resource/:id" element={<ProtectedLayout><PageTransition><ResourceDetail /></PageTransition></ProtectedLayout>} />
      <Route path="/emergency" element={<ProtectedLayout><PageTransition><EmergencyDashboard /></PageTransition></ProtectedLayout>} />
      <Route path="/volunteers" element={<ProtectedLayout><PageTransition><Volunteers /></PageTransition></ProtectedLayout>} />
      <Route path="/alerts" element={<ProtectedLayout><PageTransition><CommunityAlerts /></PageTransition></ProtectedLayout>} />
      <Route path="/admin" element={<ProtectedLayout><PageTransition><AdminDashboard /></PageTransition></ProtectedLayout>} />
      <Route path="/profile" element={<ProtectedLayout><PageTransition><Profile /></PageTransition></ProtectedLayout>} />
    </Routes>
  );
}

function AppShell() {
  // Activate Lenis smooth scroll globally
  useSmoothScroll({ duration: 1.2 });

  return (
    <>
      <ScrollProgressBar />
      <div className="min-h-screen bg-[#F8FAFC]">
        <AppRoutes />
      </div>
    </>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppShell />
      </Router>
    </AuthProvider>
  );
}

export default App;
