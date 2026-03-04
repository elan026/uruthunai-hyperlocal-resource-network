import Sidebar from './Sidebar';
import Navbar from './Navbar';

export default function Layout({ children, user, emergencyMode, onLogout }) {
    return (
        <div className="min-h-screen bg-[#F8FAFC] flex font-sans text-gray-800">
            <Sidebar isAdmin={user?.role === 'Admin'} />
            <div className="flex-1 flex flex-col ml-64">
                <Navbar user={user} emergencyMode={emergencyMode} onLogout={onLogout} />
                <main className="flex-1 overflow-x-hidden w-full max-w-7xl mx-auto">
                    {children}
                </main>
            </div>
        </div>
    );
}
