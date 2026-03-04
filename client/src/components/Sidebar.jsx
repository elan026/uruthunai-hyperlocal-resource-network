import { Link, useLocation } from 'react-router-dom';
import { Home, Map as MapIcon, PlusCircle, HelpCircle, Users, BellRing, User, HeartHandshake, ShieldAlert } from 'lucide-react';

export default function Sidebar({ isAdmin }) {
    const location = useLocation();

    let menuItems = [
        { path: '/dashboard', label: 'Home', icon: Home },
        { path: '/map', label: 'Resource Map', icon: MapIcon },
        { path: '/post-resource', label: 'Post Resource', icon: PlusCircle },
        { path: '/request-resource', label: 'Requests', icon: HelpCircle },
        { path: '/emergency', label: 'Emergency Mode', icon: ShieldAlert },
        { path: '/volunteers', label: 'Volunteers', icon: Users },
        { path: '/alerts', label: 'Community Alerts', icon: BellRing },
    ];

    if (isAdmin) {
        menuItems.push({ path: '/admin', label: 'Admin Control', icon: ShieldAlert });
    }

    return (
        <aside className="w-64 bg-white border-r border-gray-200 flex flex-col fixed h-screen z-20 shadow-sm transition-all left-0 top-0">
            <div className="p-6 flex items-center gap-3 text-teal-600 font-bold text-xl border-b border-gray-100 h-20">
                <HeartHandshake className="h-8 w-8 text-teal-500" />
                <span className="text-navy-900 tracking-tight">Namma Thunai</span>
            </div>
            <nav className="flex-1 p-4 space-y-1.5 overflow-y-auto">
                {menuItems.map((item) => {
                    const isActive = location.pathname === item.path;
                    const Icon = item.icon;
                    return (
                        <Link
                            key={item.path}
                            to={item.path}
                            className={`flex items-center gap-3 p-3 rounded-xl font-medium transition-colors ${isActive
                                ? 'bg-teal-50 text-teal-700 font-bold'
                                : 'text-gray-600 hover:bg-gray-50 hover:text-navy-800'
                                }`}
                        >
                            <Icon className={`h-5 w-5 ${isActive ? 'text-teal-600' : 'text-gray-400'}`} /> {item.label}
                        </Link>
                    );
                })}
            </nav>
            <div className="p-4 border-t border-gray-100">
                <Link to="/profile" className={`flex items-center gap-3 p-3 rounded-xl font-medium transition-colors ${location.pathname === '/profile' ? 'bg-teal-50 text-teal-700 font-bold' : 'text-gray-600 hover:bg-gray-50'}`}>
                    <User className={`h-5 w-5 ${location.pathname === '/profile' ? 'text-teal-600' : 'text-gray-400'}`} /> Profile
                </Link>
            </div>
        </aside>
    );
}
