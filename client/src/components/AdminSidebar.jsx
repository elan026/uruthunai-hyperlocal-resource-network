import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../hooks/useAuth';

export default function AdminSidebar() {
    const location = useLocation();
    const navigate = useNavigate();
    const { logout } = useAuth(); // Assuming we use same auth context or custom admin one

    const menuItems = [
        { path: '/admin/dashboard', label: 'Control Center', icon: 'dashboard' },
        { path: '/admin/moderation', label: 'Moderation Queue', icon: 'gavel' },
        { path: '/admin/verification', label: 'User Verification', icon: 'verified_user' },
        { path: '/admin/emergency', label: 'Emergency Controls', icon: 'mode_heat' },
    ];

    const handleLogout = () => {
        logout();
        navigate('/admin/login');
    };

    return (
        <aside className="w-72 bg-slate-900 border-r border-slate-800 flex flex-col fixed h-screen z-20 shadow-2xl text-slate-300">
            {/* Brand */}
            <div className="p-6 flex items-center gap-3 border-b border-slate-800/50">
                <motion.div
                    whileHover={{ rotate: [0, -5, 5, 0], scale: 1.05 }}
                    transition={{ duration: 0.4 }}
                    className="size-10 rounded-xl bg-white flex items-center justify-center text-slate-900 shadow-lg shadow-white/10"
                >
                    <span className="material-symbols-outlined material-symbols-outlined-filled text-2xl">security</span>
                </motion.div>
                <div>
                    <h1 className="text-lg font-black tracking-tight leading-none text-white">Administration</h1>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mt-1">Command Module</p>
                </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
                {menuItems.map((item) => {
                    const isActive = location.pathname.startsWith(item.path);
                    return (
                        <Link
                            key={item.path}
                            to={item.path}
                            className={`flex items-center gap-3 px-4 py-3.5 rounded-xl font-bold transition-all group relative overflow-hidden ${isActive
                                ? 'text-white'
                                : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                                }`}
                        >
                            {isActive && (
                                <motion.div
                                    layoutId="admin-active-bg"
                                    className="absolute inset-0 bg-slate-800 border-l-4 border-white"
                                    initial={false}
                                    transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                                />
                            )}
                            <span className={`material-symbols-outlined relative z-10 transition-transform duration-300 group-hover:scale-110 ${isActive ? 'material-symbols-outlined-filled text-white' : ''}`}>
                                {item.icon}
                            </span>
                            <span className="text-sm relative z-10">{item.label}</span>
                        </Link>
                    );
                })}
            </nav>

            <div className="p-4 border-t border-slate-800">
                <button
                    onClick={handleLogout}
                    className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-bold text-slate-400 hover:text-white hover:bg-rose-500 transition-colors group"
                >
                    <span className="material-symbols-outlined text-lg group-hover:text-white">logout</span>
                    Session Terminate
                </button>
            </div>
        </aside>
    );
}
