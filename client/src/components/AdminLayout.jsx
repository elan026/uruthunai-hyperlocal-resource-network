import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import AdminSidebar from './AdminSidebar';
import Reveal from './Reveal';

export default function AdminLayout({ children }) {
    const { user, adminToken } = useAuth();
    const location = useLocation();

    // Check if the user has an admin token or role
    if (!adminToken && user?.role !== 'admin') {
        return <Navigate to="/admin/login" state={{ from: location }} replace />;
    }

    return (
        <div className="flex h-screen overflow-hidden bg-slate-100 font-sans text-slate-900">
            <AdminSidebar />
            <div className="flex-1 flex flex-col ml-72 min-w-0 overflow-hidden">
                <header className="bg-white border-b border-slate-200 px-8 py-4 flex items-center justify-between sticky top-0 z-10 shadow-sm">
                    <div>
                        <h2 className="text-xl font-black tracking-tight text-slate-900">Uruthunai Governance</h2>
                        <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Platform Administration</span>
                    </div>
                    <div className="flex items-center gap-4">
                        <span className="flex items-center gap-2 text-xs font-bold bg-slate-100 px-3 py-1.5 rounded-full border border-slate-200">
                            <span className="h-2 w-2 rounded-full bg-emerald-500"></span>
                            System Online
                        </span>
                        <div className="h-10 w-10 text-white font-bold bg-slate-900 rounded-xl flex items-center justify-center shadow-lg">
                            {user?.name?.charAt(0) || 'A'}
                        </div>
                    </div>
                </header>
                <main className="flex-1 overflow-y-auto">
                    <Reveal>{children}</Reveal>
                </main>
            </div>
        </div>
    );
}
