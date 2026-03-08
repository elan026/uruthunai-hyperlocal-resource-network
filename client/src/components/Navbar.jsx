import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

export default function Navbar({ user, emergencyMode, onLogout }) {
    const navigate = useNavigate();

    const handleLogout = () => {
        if (onLogout) onLogout();
        navigate('/');
    };

    return (
        <header className="h-20 bg-white/80 backdrop-blur-md border-b border-slate-200 flex items-center justify-between px-8 sticky top-0 z-10">
            {/* Left: Location + Emergency Toggle */}
            <div className="flex items-center gap-6">
                <motion.div
                    whileHover={{ scale: 1.02, backgroundColor: '#f1f5f9' }}
                    className="flex items-center gap-2.5 px-3 py-1.5 rounded-lg cursor-pointer transition-colors"
                >
                    <span className="material-symbols-outlined text-primary">location_on</span>
                    <span className="font-bold text-slate-900">{user?.area_code || '638001 - Erode City'}</span>
                </motion.div>
                <div className="h-6 w-px bg-slate-200"></div>
                <div className="flex items-center gap-3">
                    <span className="text-sm font-bold text-slate-500">System Status</span>
                    <motion.div
                        whileHover={{ scale: 1.05 }}
                        className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-black tracking-widest uppercase shadow-sm ${emergencyMode
                            ? 'bg-rose-500 text-white emergency-pulse shadow-rose-500/20'
                            : 'bg-emerald-50 text-emerald-600 border border-emerald-100'
                            }`}
                    >
                        {emergencyMode ? (
                            <>
                                <span className="material-symbols-outlined text-[16px]">emergency</span>
                                Emergency Active
                            </>
                        ) : (
                            <>
                                <span className="material-symbols-outlined text-[16px]">check_circle</span>
                                Normal
                            </>
                        )}
                    </motion.div>
                </div>
            </div>

            {/* Right: Search + Notifications + Profile */}
            <div className="flex items-center gap-5">
                {/* Search */}
                <div className="relative group">
                    <input
                        className="bg-slate-100 border border-transparent rounded-xl py-2.5 pl-11 pr-4 text-sm w-64 focus:bg-white focus:border-slate-300 focus:ring-4 focus:ring-primary/10 transition-all font-medium"
                        placeholder="Search resources, users..."
                        type="text"
                    />
                    <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-sm group-focus-within:text-primary transition-colors">search</span>
                </div>

                {/* Notifications */}
                <motion.button
                    whileHover={{ scale: 1.05, backgroundColor: '#f1f5f9' }}
                    whileTap={{ scale: 0.95 }}
                    className="p-2.5 text-slate-500 rounded-xl relative transition-colors"
                >
                    <span className="material-symbols-outlined">notifications</span>
                    <span className="absolute top-2.5 right-2.5 size-2 bg-rose-500 rounded-full border-2 border-white"></span>
                </motion.button>

                {/* Logout */}
                <motion.button
                    onClick={handleLogout}
                    whileHover={{ scale: 1.05, backgroundColor: '#fff1f2', color: '#e11d48' }}
                    whileTap={{ scale: 0.95 }}
                    className="p-2.5 text-slate-400 rounded-xl transition-colors"
                    title="Logout"
                >
                    <span className="material-symbols-outlined">logout</span>
                </motion.button>

                <div className="h-6 w-px bg-slate-200"></div>

                {/* Profile */}
                <Link to="/profile">
                    <motion.div
                        whileHover={{ scale: 1.02, backgroundColor: '#f8fafc' }}
                        className="flex items-center gap-3 p-1.5 pr-4 rounded-full border border-slate-200 transition-colors cursor-pointer bg-white shadow-sm"
                    >
                        <div className="size-9 rounded-full bg-gradient-to-tr from-primary to-blue-400 flex items-center justify-center text-white text-sm font-black shadow-inner">
                            {user?.name?.charAt(0) || 'U'}
                        </div>
                        <div className="text-left hidden sm:block">
                            <p className="text-sm font-bold text-slate-900 leading-tight">{user?.name || 'User'}</p>
                            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{user?.user_type ? user.user_type.replace('_', ' ') : 'Resident'}</p>
                        </div>
                    </motion.div>
                </Link>
            </div>
        </header>
    );
}
