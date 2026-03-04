import { Search, Bell, User, LogOut } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

export default function Navbar({ user, emergencyMode, onLogout }) {
    const navigate = useNavigate();

    const handleLogout = () => {
        if (onLogout) onLogout();
        navigate('/');
    };

    return (
        <header className="bg-white border-b border-gray-200 p-4 px-8 flex justify-between items-center sticky top-0 z-10 w-full h-20 shadow-[0_4px_20px_-10px_rgba(0,0,0,0.05)]">
            <div className="relative w-96">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input type="text" placeholder="Search resources or needs..." className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:bg-white transition-all" />
            </div>

            <div className="flex items-center gap-5">
                <div className="flex items-center gap-2 bg-gray-50 px-4 py-2 rounded-full text-sm font-semibold text-gray-600 border border-gray-200">
                    Area: <span className="text-gray-800 tracking-wide">{user?.area_code || 'CHN-ADY-01'}</span>
                </div>

                <div className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold border transition-all ${emergencyMode ? 'bg-red-50 text-red-700 border-red-200 shadow-[0_0_15px_rgba(239,68,68,0.2)]' : 'bg-green-50 text-green-700 border-green-200'}`}>
                    <span className="relative flex h-3 w-3">
                        {emergencyMode && <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>}
                        <span className={`relative inline-flex rounded-full h-3 w-3 ${emergencyMode ? 'bg-red-500' : 'bg-green-500'}`}></span>
                    </span>
                    {emergencyMode ? 'EMERGENCY MODE ACTIVE' : 'Normal Operations'}
                </div>

                <button className="relative text-gray-400 hover:text-navy-800 transition-colors p-2 rounded-full hover:bg-gray-50">
                    <Bell className="h-6 w-6" />
                    <span className="absolute top-2 right-2 h-2.5 w-2.5 rounded-full bg-red-500 border-2 border-white"></span>
                </button>

                <Link to="/profile" className="flex items-center gap-2">
                    <div className="h-10 w-10 bg-gradient-to-tr from-teal-400 to-teal-500 rounded-full flex justify-center items-center text-white shadow-md hover:shadow-lg transition-all border border-teal-600">
                        <span className="font-bold text-sm">{user?.name?.charAt(0) || 'U'}</span>
                    </div>
                    <span className="text-sm font-bold text-navy-800 hidden lg:block">{user?.name || 'User'}</span>
                </Link>

                <button
                    onClick={handleLogout}
                    className="flex items-center gap-2 text-gray-400 hover:text-red-600 transition-colors p-2 rounded-full hover:bg-red-50"
                    title="Logout"
                >
                    <LogOut className="h-5 w-5" />
                </button>
            </div>
        </header>
    );
}
