import { useState } from 'react';
import Sidebar from './Sidebar';
import Navbar from './Navbar';
import BottomNav from './BottomNav';

export default function Layout({ children, user, emergencyMode, onLogout }) {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const isAdmin = user?.role === 'admin';

    return (
        <div className="flex h-screen overflow-hidden bg-bg-light font-sans text-slate-900">
            {sidebarOpen && (
                <div
                    className="fixed inset-0 bg-slate-900/50 z-20 md:hidden transition-opacity"
                    onClick={() => setSidebarOpen(false)}
                />
            )}
            {/* Sidebar acts as navigation for admins all the time, for standard users on desktop */}
            <Sidebar isAdmin={isAdmin} isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
            
            <div className={`flex-1 flex flex-col min-w-0 overflow-hidden ${!isAdmin ? 'md:ml-72' : 'md:ml-72'}`}>
                <Navbar user={user} emergencyMode={emergencyMode} onLogout={onLogout} onMenuClick={() => setSidebarOpen(true)} />
                <main className={`flex-1 overflow-y-auto ${!isAdmin ? 'pb-24 md:pb-0' : ''}`}>
                    {children}
                </main>
            </div>
            {!isAdmin && <BottomNav />}
        </div>
    );
}

