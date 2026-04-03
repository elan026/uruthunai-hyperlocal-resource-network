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
import AuthPage from './pages/AuthPage'; // Added import
import Layout from './components/Layout';
import ScrollProgressBar from './components/ScrollProgressBar';
import PageTransition from './components/PageTransition';

// Admin Components
import AdminLogin from './pages/admin/AdminLogin';
import AdminLayout from './components/AdminLayout';
import AdminDashboardNew from './pages/admin/AdminDashboard'; // new separate dashboard
import AdminModeration from './pages/admin/AdminModeration';
import AdminVerification from './pages/admin/AdminVerification';
import AdminEmergency from './pages/admin/AdminEmergency';

function EmergencyGuard({ children, fallback = "/emergency" }) {
  const { emergencyMode, user } = useAuth();
  if (emergencyMode && user?.role !== 'admin') {
    return <Navigate to={fallback} replace />;
  }
  return children;
}
function ProtectedLayout({ children }) {
  const { user, emergencyMode, logout } = useAuth();
  if (!user) return <Navigate to="/login" />; // Redirect to login page instead of "/"
  return (
    <Layout user={user} emergencyMode={emergencyMode} onLogout={logout}>
      {children}
    </Layout>
  );
}

function AdminRoute({ children }) {
  const { user } = useAuth();
  if (user?.role !== 'admin') return <Navigate to="/home" />;
  return children;
}


function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<AuthPage />} />
      <Route path="/home" element={<ProtectedLayout><PageTransition><ResourceMap /></PageTransition></ProtectedLayout>} />
      <Route path="/dashboard" element={<ProtectedLayout><PageTransition><EmergencyGuard><Dashboard /></EmergencyGuard></PageTransition></ProtectedLayout>} />
      <Route path="/map" element={<Navigate to="/home" />} />
      <Route path="/post-resource" element={<ProtectedLayout><PageTransition><PostResource /></PageTransition></ProtectedLayout>} />
      <Route path="/request-resource" element={<ProtectedLayout><PageTransition><RequestResource /></PageTransition></ProtectedLayout>} />
      <Route path="/resource/:id" element={<ProtectedLayout><PageTransition><ResourceDetail /></PageTransition></ProtectedLayout>} />
      <Route path="/emergency" element={<ProtectedLayout><PageTransition><EmergencyDashboard /></PageTransition></ProtectedLayout>} />
      <Route path="/volunteers" element={<ProtectedLayout><PageTransition><EmergencyGuard><Volunteers /></EmergencyGuard></PageTransition></ProtectedLayout>} />
      <Route path="/alerts" element={<ProtectedLayout><PageTransition><CommunityAlerts /></PageTransition></ProtectedLayout>} />
      <Route path="/profile" element={<ProtectedLayout><PageTransition><Profile /></PageTransition></ProtectedLayout>} />

      {/* Admin Routes Isolated */}
      <Route path="/admin/login" element={<AdminLogin />} />
      <Route path="/admin/*" element={
        <AdminLayout>
          <PageTransition>
            <Routes>
              <Route path="dashboard" element={<AdminDashboardNew />} />
              <Route path="moderation" element={<AdminModeration />} />
              <Route path="verification" element={<AdminVerification />} />
              <Route path="emergency" element={<AdminEmergency />} />
              <Route path="*" element={<Navigate to="/admin/dashboard" replace />} />
            </Routes>
          </PageTransition>
        </AdminLayout>
      } />
    </Routes>
  );
}

function AppShell() {
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
