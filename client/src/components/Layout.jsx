import { useState } from 'react';
import { useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import Navbar from './Navbar';
import BottomNav from './BottomNav';

export default function Layout({ children, user, emergencyMode, onLogout }) {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const isAdmin = user?.role === 'admin';
    const location = useLocation();
    const isMapPage = location.pathname === '/home' || location.pathname === '/map';

    return (
        <div className="flex h-screen overflow-hidden bg-bg-light font-sans text-slate-900">
            {sidebarOpen && (
                <div
                    className={`fixed inset-0 bg-slate-900/50 transition-opacity ${isMapPage ? 'z-[750]' : 'z-20 md:hidden'}`}
                    onClick={() => setSidebarOpen(false)}
                />
            )}
            {/* Sidebar: on map page it's an overlay (collapsed by default), on all other pages it's docked */}
            <Sidebar isAdmin={isAdmin} isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} emergencyMode={emergencyMode} overlayMode={isMapPage} />
            
            <div className={`flex-1 flex flex-col min-w-0 overflow-hidden ${isMapPage ? '' : 'md:ml-72'}`}>
                {emergencyMode && (
                    <div className="bg-red-600 text-white px-4 py-2 text-center text-sm font-bold shadow-md z-50 animate-pulse flex items-center justify-center gap-2 border-b border-red-800">
                        <span className="material-symbols-outlined text-[18px]">warning</span>
                        SYSTEM OVERRIDE: EMERGENCY MODE ACTIVE. TRAFFIC RESTRICTED.
                    </div>
                )}
                <Navbar user={user} emergencyMode={emergencyMode} onLogout={onLogout} onMenuClick={() => setSidebarOpen(true)} isMapPage={isMapPage} />
                <main className={`flex-1 ${isMapPage ? 'overflow-hidden flex flex-col' : 'overflow-y-auto'} ${!isAdmin ? 'pb-24 md:pb-0' : ''}`}>
                    {children}
                </main>
            </div>
            {!isAdmin && <BottomNav emergencyMode={emergencyMode} />}
        </div>
    );
}

