import Sidebar from './Sidebar';
import Navbar from './Navbar';

export default function Layout({ children, user, emergencyMode, onLogout }) {
    return (
        <div className="flex h-screen overflow-hidden bg-bg-light font-sans text-slate-900">
            <Sidebar isAdmin={user?.role === 'Admin'} />
            <div className="flex-1 flex flex-col ml-72 min-w-0 overflow-hidden">
                <Navbar user={user} emergencyMode={emergencyMode} onLogout={onLogout} />
                <main className="flex-1 overflow-y-auto">
                    {children}
                </main>
            </div>
        </div>
    );
}
