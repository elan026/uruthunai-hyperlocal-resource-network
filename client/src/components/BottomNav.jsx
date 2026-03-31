import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';

const navItems = [
    { path: '/home', label: 'Home', icon: 'map' },
    { path: '/alerts', label: 'Alerts', icon: 'notifications_active' },
    { path: '/create', label: 'Create', icon: 'add_circle', isFab: true },
    { path: '/volunteers', label: 'Volunteers', icon: 'groups' },
    { path: '/profile', label: 'Profile', icon: 'person' },
];

export default function BottomNav() {
    const location = useLocation();

    return (
        <nav className="fixed bottom-0 w-full bg-white border-t border-slate-200 pb-safe pt-2 px-2 z-40 md:hidden flex justify-around items-center shadow-[0_-4px_24px_rgba(0,0,0,0.05)]">
            {navItems.map((item) => {
                const isActive = location.pathname === item.path || (item.path === '/home' && location.pathname === '/map');
                
                if (item.isFab) {
                    return (
                        <div key={item.path} className="relative -top-6">
                            <Link to="/post-resource">
                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    className="bg-primary text-white p-4 rounded-full shadow-lg shadow-primary/30 flex items-center justify-center"
                                >
                                    <span className="material-symbols-outlined filled text-3xl">add</span>
                                </motion.button>
                            </Link>
                        </div>
                    );
                }

                return (
                    <Link
                        key={item.path}
                        to={item.path}
                        className={`flex flex-col items-center justify-center w-16 h-12 rounded-xl transition-colors ${
                            isActive ? 'text-primary' : 'text-slate-500 hover:text-slate-900'
                        }`}
                    >
                        <span className={`material-symbols-outlined text-[24px] mb-1 ${isActive ? 'filled' : ''}`}>
                            {item.icon}
                        </span>
                        <span className={`text-[10px] font-medium ${isActive ? 'font-bold' : ''}`}>
                            {item.label}
                        </span>
                    </Link>
                );
            })}
        </nav>
    );
}
