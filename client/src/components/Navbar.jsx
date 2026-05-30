import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useState } from 'react';
import { getLocationsDropdownOptions } from '../data/erodeLocations';
import { useAuth } from '../context/AuthContext';

export default function Navbar({ user, emergencyMode, onLogout, onMenuClick, isMapPage = false }) {
    const navigate = useNavigate();
    const { updateProfile, hillStationDangerMode } = useAuth();
    const [isUpdatingArea, setIsUpdatingArea] = useState(false);
    const [showProfileMenu, setShowProfileMenu] = useState(false);

    const handleLogout = () => {
        if (onLogout) onLogout();
        navigate('/');
    };

    const handleAreaChange = async (e) => {
        if (!user) return;
        setIsUpdatingArea(true);
        try {
            const areaCode = e.target.value;
            const selectedOpt = getLocationsDropdownOptions().find(o => o.value === areaCode) || getLocationsDropdownOptions()[0];
            await updateProfile(user.id, {
                area_code: areaCode,
                pincode: selectedOpt.pincode,
                area_name: selectedOpt.areaName
            });
            window.location.reload(); // Reload to reflect changes across app
        } catch (err) {
            console.error('Failed to change area', err);
        } finally {
            setIsUpdatingArea(false);
        }
    };

    return (
        <header className="h-20 bg-white/80 backdrop-blur-md border-b border-slate-200 flex items-center justify-between px-4 md:px-8 sticky top-0 z-[500]">
            {/* Left: Menu + Location + Emergency Toggle */}
            <div className="flex items-center gap-2 md:gap-6 lg:gap-8">
                <button
                    onClick={onMenuClick}
                    className={`${isMapPage ? '' : 'md:hidden'} p-2 -ml-2 text-slate-500 hover:bg-slate-100 rounded-lg transition-colors flex items-center justify-center cursor-pointer`}
                >
                    <span className="material-symbols-outlined">menu</span>
                </button>
                <div className="hidden md:flex items-center gap-2.5 px-3 py-1.5 rounded-lg transition-colors bg-slate-50 border border-slate-200">
                    <span className="material-symbols-outlined text-primary">location_on</span>
                    {isUpdatingArea ? (
                        <span className="text-sm font-bold text-slate-500">Updating...</span>
                    ) : (
                        <select 
                            value={user?.area_code || '638001 - Erode City'}
                            onChange={handleAreaChange}
                            className="bg-transparent border-none outline-none font-bold text-slate-900 text-sm cursor-pointer"
                        >
                            {getLocationsDropdownOptions().map((opt, i) => (
                                <option key={i} value={opt.value}>
                                    {opt.type === 'HILL' ? '⛰️ ' : ''}{opt.areaName}
                                </option>
                            ))}
                        </select>
                    )}
                </div>
                <div className="hidden md:block h-6 w-px bg-slate-200"></div>
                <div className="flex items-center gap-2 md:gap-3">
                    {hillStationDangerMode && (
                        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-600 text-white animate-pulse shadow-rose-500/30 shadow-lg" title="Hill Station Danger Mode Active">
                            <span className="text-sm">⛰️</span>
                            <span className="text-[10px] font-black uppercase tracking-widest hidden md:inline">Hill Alert</span>
                        </div>
                    )}
                    <span className="text-sm font-bold text-slate-500 hidden lg:block">System Status</span>
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
            <div className="flex items-center gap-2 md:gap-4 lg:gap-5">
                {/* Dual Search */}
                <div className="flex items-center gap-2 hidden lg:flex">
                    <div className="relative group">
                        <input
                            className="bg-orange-50 border border-orange-100 rounded-xl py-2 pl-9 pr-3 text-xs w-40 focus:bg-white focus:border-orange-300 focus:ring-2 focus:ring-orange-100 transition-all font-medium text-slate-700 placeholder:text-orange-900/40"
                            placeholder="Search Needs..."
                            type="text"
                        />
                        <span className="material-symbols-outlined absolute left-2.5 top-1/2 -translate-y-1/2 text-orange-400 text-[18px]">search_hands_free</span>
                    </div>
                    <div className="relative group">
                        <input
                            className="bg-blue-50 border border-blue-100 rounded-xl py-2 pl-9 pr-3 text-xs w-40 focus:bg-white focus:border-blue-300 focus:ring-2 focus:ring-blue-100 transition-all font-medium text-slate-700 placeholder:text-blue-900/40"
                            placeholder="Search Resources..."
                            type="text"
                        />
                        <span className="material-symbols-outlined absolute left-2.5 top-1/2 -translate-y-1/2 text-blue-400 text-[18px]">inventory_2</span>
                    </div>
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
                    className="hidden md:block p-2.5 text-slate-400 rounded-xl transition-colors"
                    title="Logout"
                >
                    <span className="material-symbols-outlined">logout</span>
                </motion.button>

                <div className="h-6 w-px bg-slate-200 hidden md:block"></div>

                {/* Profile */}
                <div className="relative">
                    <motion.button
                        onClick={() => setShowProfileMenu(!showProfileMenu)}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="flex items-center gap-3 p-1.5 pr-4 rounded-full border border-slate-200 transition-colors cursor-pointer bg-white shadow-sm outline-none text-left"
                    >
                        <div className="size-9 rounded-full bg-gradient-to-tr from-primary to-blue-400 flex items-center justify-center text-white text-sm font-black shadow-inner">
                            {user?.name?.charAt(0) || 'U'}
                        </div>
                        <div className="text-left hidden md:block">
                            <p className="text-sm font-bold text-slate-900 leading-tight">{user?.name || 'User'}</p>
                            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{user?.user_type ? user.user_type.replace('_', ' ') : 'Resident'}</p>
                        </div>
                        <span className="material-symbols-outlined text-slate-400 text-sm hidden md:inline">keyboard_arrow_down</span>
                    </motion.button>

                    {showProfileMenu && (
                        <>
                            {/* Backdrop overlay to close */}
                            <div 
                                className="fixed inset-0 z-20 cursor-default" 
                                onClick={() => setShowProfileMenu(false)}
                            />
                            <div className="absolute right-0 mt-2 w-56 bg-white border border-slate-200 rounded-2xl shadow-xl py-2 z-30 animate-in fade-in slide-in-from-top-2 duration-150">
                                <div className="px-4 py-2 border-b border-slate-100 md:hidden">
                                    <p className="text-sm font-bold text-slate-900 leading-tight truncate">{user?.name || 'User'}</p>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest truncate">{user?.user_type ? user.user_type.replace('_', ' ') : 'Resident'}</p>
                                </div>
                                <Link 
                                    to="/profile" 
                                    onClick={() => setShowProfileMenu(false)}
                                    className="flex items-center gap-2.5 px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
                                >
                                    <span className="material-symbols-outlined text-slate-400 text-[20px]">person</span>
                                    View Profile
                                </Link>
                                <button
                                    onClick={() => {
                                        setShowProfileMenu(false);
                                        handleLogout();
                                    }}
                                    className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm font-bold text-rose-600 hover:bg-rose-50/50 transition-colors text-left cursor-pointer border-t border-slate-100"
                                >
                                    <span className="material-symbols-outlined text-rose-500 text-[20px]">logout</span>
                                    Logout
                                </button>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </header>
    );
}
