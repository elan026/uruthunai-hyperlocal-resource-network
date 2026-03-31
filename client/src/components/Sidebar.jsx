import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';

const menuItems = [
    { path: '/home', label: 'Home Map', icon: 'map' },
    { path: '/dashboard', label: 'Feed', icon: 'list_alt' },
    { path: '/post-resource', label: 'Post Resource', icon: 'add_box' },
    { path: '/request-resource', label: 'Requests', icon: 'volunteer_activism' },
    { path: '/emergency', label: 'Emergency Mode', icon: 'emergency' },
    { path: '/volunteers', label: 'Volunteers', icon: 'groups' },
    { path: '/alerts', label: 'Community Alerts', icon: 'notifications_active' },
];

const adminItem = { path: '/admin', label: 'Admin Control', icon: 'shield_with_heart' };

export default function Sidebar({ isAdmin, isOpen, onClose }) {
    const location = useLocation();
    const items = isAdmin ? [...menuItems, adminItem] : menuItems;

    return (
        <aside className={`w-72 bg-white border-r border-slate-200 flex flex-col fixed h-screen z-30 shadow-[4px_0_24px_rgba(0,0,0,0.02)] transition-transform duration-300 md:translate-x-0 ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
            <div className="p-6 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <motion.div
                        whileHover={{ rotate: [0, -5, 5, 0], scale: 1.05 }}
                        transition={{ duration: 0.4 }}
                        className="size-10 rounded-xl bg-primary flex items-center justify-center text-white shadow-md shadow-primary/20"
                    >
                        <span className="material-symbols-outlined">diversity_3</span>
                    </motion.div>
                    <div>
                        <h1 className="text-lg font-black tracking-tight leading-none text-slate-900">Uruthunai</h1>
                        <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400 mt-1">Community Support</p>
                    </div>
                </div>
                <button
                    onClick={onClose}
                    className="md:hidden text-slate-500 hover:text-slate-900 p-2"
                >
                    <span className="material-symbols-outlined">close</span>
                </button>
            </div>

            {/* Navigation */}
            <nav className="flex-1 px-4 py-2 space-y-1 overflow-y-auto">
                {items.map((item) => {
                    const isActive = location.pathname === item.path;
                    return (
                        <Link
                            key={item.path}
                            to={item.path}
                            onClick={onClose}
                            className={`flex items-center gap-3 px-4 py-3 rounded-xl font-semibold transition-all group relative overflow-hidden ${isActive
                                ? 'text-primary'
                                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                                }`}
                        >
                            {isActive && (
                                <motion.div
                                    layoutId="active-nav-bg"
                                    className="absolute inset-0 bg-primary/10 border-l-4 border-primary"
                                    initial={false}
                                    transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                                />
                            )}
                            <span className={`material-symbols-outlined relative z-10 transition-transform duration-300 group-hover:scale-110 ${isActive ? 'filled' : ''}`}>
                                {item.icon}
                            </span>
                            <span className="text-sm relative z-10">{item.label}</span>
                        </Link>
                    );
                })}
            </nav>

            {/* Profile Link */}
            <div className="p-4 border-t border-slate-100">
                <Link
                    to="/profile"
                    onClick={onClose}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl font-semibold transition-all group relative overflow-hidden ${location.pathname === '/profile'
                        ? 'text-primary'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                        }`}
                >
                    {location.pathname === '/profile' && (
                        <motion.div
                            layoutId="active-nav-bg"
                            className="absolute inset-0 bg-primary/10 border-l-4 border-primary"
                            initial={false}
                            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                        />
                    )}
                    <span className={`material-symbols-outlined relative z-10 transition-transform duration-300 group-hover:scale-110 ${location.pathname === '/profile' ? 'filled' : ''}`}>
                        settings
                    </span>
                    <span className="text-sm relative z-10">Settings</span>
                </Link>
            </div>
        </aside>
    );
}
