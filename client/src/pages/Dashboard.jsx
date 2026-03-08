import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { resourceService, requestService } from '../services/api';
import { motion } from 'framer-motion';
import FadeUp from '../components/AnimatedSection';
import Reveal from '../components/Reveal';
import { StaggerContainer, StaggerItem } from '../components/StaggerContainer';

export default function Dashboard() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [resources, setResources] = useState([]);
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [resRes, reqRes] = await Promise.all([
                    resourceService.getAll(),
                    requestService.getAll()
                ]);
                setResources(resRes.data.slice(0, 4));
                setRequests(reqRes.data.slice(0, 4));
            } catch (err) {
                console.error("Error fetching dashboard data", err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const stats = [
        { label: 'Available Water', value: '1,250L', change: '+5%', positive: true, icon: 'water_drop', color: 'text-blue-500' },
        { label: 'First Aid Kits', value: '42 Units', change: '+2%', positive: true, icon: 'medical_services', color: 'text-emerald-500' },
        { label: 'Active Requests', value: requests.length || '18', change: '-10%', positive: false, icon: 'assignment_late', color: 'text-orange-500' },
        { label: 'Verified Volunteers', value: '156', change: '+12%', positive: true, icon: 'groups', color: 'text-purple-500' },
    ];

    return (
        <div className="p-4 sm:p-6 lg:p-10 grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 max-w-[1600px] mx-auto">
            {/* Left Section (Main) */}
            <div className="lg:col-span-8 space-y-8 lg:space-y-10">
                <FadeUp y={20}>
                    <div className="flex flex-col gap-1">
                        <h2 className="text-3xl font-black text-slate-900 tracking-tight">Community Dashboard</h2>
                        <p className="text-slate-500">Real-time resource and request overview for your area.</p>
                    </div>
                </FadeUp>

                {/* Resource Overview Cards */}
                <StaggerContainer staggerDelay={0.1} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {stats.map((stat, i) => (
                        <StaggerItem key={i} variant="scale">
                            <motion.div
                                whileHover={{ y: -4, boxShadow: '0 12px 24px -10px rgba(0,0,0,0.1)' }}
                                transition={{ duration: 0.3, ease: 'easeOut' }}
                                className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm h-full flex flex-col justify-between"
                            >
                                <div className="flex justify-between items-start mb-4">
                                    <div className={`p-2 rounded-xl bg-slate-50 ${stat.color}`}>
                                        <span className="material-symbols-outlined text-xl">{stat.icon}</span>
                                    </div>
                                    <span className={`text-[10px] font-bold px-2 py-1 rounded-full ${stat.positive
                                        ? 'text-emerald-600 bg-emerald-50 border border-emerald-100'
                                        : 'text-rose-600 bg-rose-50 border border-rose-100'
                                        }`}>
                                        {stat.change}
                                    </span>
                                </div>
                                <div>
                                    <h3 className="text-2xl font-black text-slate-900">{stat.value}</h3>
                                    <p className="text-xs font-semibold text-slate-500 mt-1 uppercase tracking-wider">{stat.label}</p>
                                </div>
                            </motion.div>
                        </StaggerItem>
                    ))}
                </StaggerContainer>

                {/* Urgent Emergency Alerts */}
                <FadeUp delay={0.2} y={20} className="bg-rose-50 border border-rose-100 rounded-3xl p-6 relative overflow-hidden">
                    <div className="absolute -right-10 -top-10 opacity-5">
                        <span className="material-symbols-outlined text-[150px] text-rose-500">warning</span>
                    </div>
                    <div className="relative z-10">
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center gap-3 text-rose-600">
                                <span className="material-symbols-outlined text-2xl icon-bounce">warning</span>
                                <h3 className="text-xl font-bold">Urgent Emergency Alerts</h3>
                            </div>
                            <span className="text-xs font-black tracking-widest text-rose-600 bg-rose-100 px-3 py-1.5 rounded-full animate-pulse">2 LIVE</span>
                        </div>
                        <StaggerContainer staggerDelay={0.15} className="space-y-3">
                            {requests.length > 0 ? requests.slice(0, 2).map((req, i) => (
                                <StaggerItem key={req.id || i} variant="up">
                                    <motion.div
                                        whileHover={{ x: 4 }}
                                        className="bg-white p-4 rounded-2xl flex gap-4 items-start shadow-sm border border-rose-100 relative overflow-hidden group hover-lift"
                                    >
                                        <div className={`absolute left-0 top-0 bottom-0 w-1.5 ${i === 0 ? 'bg-rose-500' : 'bg-orange-500'}`}></div>
                                        <div className={`${i === 0 ? 'bg-rose-100 text-rose-600' : 'bg-amber-100 text-amber-600'} p-2.5 rounded-xl`}>
                                            <span className="material-symbols-outlined">{i === 0 ? 'water_damage' : 'electric_bolt'}</span>
                                        </div>
                                        <div className="flex-1 pr-4">
                                            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-1 mb-1">
                                                <h4 className="font-bold text-slate-900 group-hover:text-primary transition-colors">{req.title || req.description?.substring(0, 40) || 'Emergency Alert'}</h4>
                                                <span className="text-xs font-semibold text-slate-400 whitespace-nowrap">{new Date(req.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                            </div>
                                            <p className="text-sm text-slate-600 leading-relaxed">{req.description || 'Community alert active. Please check for updates.'}</p>
                                        </div>
                                    </motion.div>
                                </StaggerItem>
                            )) : (
                                <>
                                    <StaggerItem>
                                        <div className="bg-white p-4 rounded-2xl flex gap-4 items-start shadow-sm border border-rose-100 relative overflow-hidden group hover-lift">
                                            <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-rose-500"></div>
                                            <div className="bg-rose-100 p-2.5 rounded-xl text-rose-600">
                                                <span className="material-symbols-outlined">water_damage</span>
                                            </div>
                                            <div className="flex-1 pr-4">
                                                <div className="flex justify-between items-start mb-1">
                                                    <h4 className="font-bold text-slate-900 group-hover:text-primary transition-colors">Water Logging Alert: Adyar Gate Road</h4>
                                                    <span className="text-xs font-semibold text-slate-400">2 mins ago</span>
                                                </div>
                                                <p className="text-sm text-slate-600">Water level rising above 2ft. Alternative routes advised. Volunteer rescue teams deployed.</p>
                                            </div>
                                        </div>
                                    </StaggerItem>
                                    <StaggerItem>
                                        <div className="bg-white p-4 rounded-2xl flex gap-4 items-start shadow-sm border border-orange-100 relative overflow-hidden group hover-lift">
                                            <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-orange-500"></div>
                                            <div className="bg-orange-100 p-2.5 rounded-xl text-orange-600">
                                                <span className="material-symbols-outlined">electric_bolt</span>
                                            </div>
                                            <div className="flex-1 pr-4">
                                                <div className="flex justify-between items-start mb-1">
                                                    <h4 className="font-bold text-slate-900 group-hover:text-primary transition-colors">Scheduled Power Outage: Sector 4</h4>
                                                    <span className="text-xs font-semibold text-slate-400">15 mins ago</span>
                                                </div>
                                                <p className="text-sm text-slate-600">Grid maintenance. Expected downtime: 2:00 PM - 4:00 PM. Backup generators active at community centers.</p>
                                            </div>
                                        </div>
                                    </StaggerItem>
                                </>
                            )}
                        </StaggerContainer>
                    </div>
                </FadeUp>

                {/* Nearby Resources Map Preview */}
                <Reveal delay={0.3}>
                    <section className="space-y-5">
                        <div className="flex items-center justify-between">
                            <h3 className="text-xl font-bold text-slate-900">Nearby Resources</h3>
                            <motion.button
                                whileHover={{ x: 4 }}
                                onClick={() => navigate('/map')}
                                className="text-sm font-bold text-primary flex items-center gap-1 group"
                            >
                                View Map
                                <span className="material-symbols-outlined text-sm transition-transform group-hover:translate-x-1">arrow_forward</span>
                            </motion.button>
                        </div>
                        <div className="relative h-[300px] rounded-3xl overflow-hidden bg-slate-100 border border-slate-200 shadow-inner group">
                            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-slate-200/50 flex items-center justify-center transition-transform duration-700 group-hover:scale-105">
                                <div className="text-center">
                                    <motion.span
                                        animate={{ y: [0, -8, 0] }}
                                        transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                                        className="material-symbols-outlined text-[80px] text-slate-300 drop-shadow-md"
                                    >
                                        pin_drop
                                    </motion.span>
                                    <p className="text-sm font-medium text-slate-400 mt-4">Interactive map available in detailed view</p>
                                </div>
                            </div>
                            {/* Map Overlay Tags */}
                            <StaggerContainer staggerDelay={0.2} className="absolute top-6 left-6 flex flex-col gap-3">
                                <StaggerItem variant="scale">
                                    <motion.div whileHover={{ scale: 1.05 }} className="bg-white/90 backdrop-blur-md shadow-lg rounded-2xl px-4 py-2.5 flex items-center gap-3 border border-slate-100 cursor-pointer">
                                        <div className="p-1.5 rounded-lg bg-blue-100 text-blue-600">
                                            <span className="material-symbols-outlined text-[16px]">water_drop</span>
                                        </div>
                                        <span className="text-sm font-bold text-slate-800">Water Points (12)</span>
                                    </motion.div>
                                </StaggerItem>
                                <StaggerItem variant="scale">
                                    <motion.div whileHover={{ scale: 1.05 }} className="bg-white/90 backdrop-blur-md shadow-lg rounded-2xl px-4 py-2.5 flex items-center gap-3 border border-slate-100 cursor-pointer">
                                        <div className="p-1.5 rounded-lg bg-emerald-100 text-emerald-600">
                                            <span className="material-symbols-outlined text-[16px]">medical_services</span>
                                        </div>
                                        <span className="text-sm font-bold text-slate-800">Medical Camps (4)</span>
                                    </motion.div>
                                </StaggerItem>
                            </StaggerContainer>
                        </div>
                    </section>
                </Reveal>
            </div>

            {/* Right Side Panel */}
            <aside className="lg:col-span-4 space-y-6 lg:space-y-8">
                {/* Community Announcements */}
                <FadeUp delay={0.2}>
                    <section className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-5">
                        <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
                            <div className="p-2 bg-primary/10 rounded-xl text-primary">
                                <span className="material-symbols-outlined">campaign</span>
                            </div>
                            <h3 className="text-lg font-bold">Announcements</h3>
                        </div>
                        <div className="space-y-5">
                            {[
                                { badge: 'Admin', badgeColor: 'text-primary bg-primary/10', time: '1h ago', text: 'New community fridge installed at Adyar junction.' },
                                { badge: 'Volunteer', badgeColor: 'text-blue-600 bg-blue-50', time: '3h ago', text: 'Free health checkup camp this Sunday at Community Hall.' },
                                { badge: 'General', badgeColor: 'text-slate-500 bg-slate-100', time: 'Yesterday', text: 'Cleanliness drive successful: 50kg waste collected.' },
                            ].map((ann, i) => (
                                <motion.div
                                    key={i}
                                    whileHover={{ x: 4 }}
                                    className="pb-4 border-b border-slate-50 last:border-0 last:pb-0"
                                >
                                    <div className="flex justify-between items-center mb-2">
                                        <span className={`text-[10px] font-black uppercase tracking-widest ${ann.badgeColor} px-2 py-1 rounded-md`}>{ann.badge}</span>
                                        <span className="text-[11px] font-semibold text-slate-400">{ann.time}</span>
                                    </div>
                                    <p className="text-sm font-medium text-slate-700 leading-relaxed hover:text-primary transition-colors cursor-default">{ann.text}</p>
                                </motion.div>
                            ))}
                        </div>
                        <motion.button
                            onClick={() => navigate('/alerts')}
                            whileHover={{ backgroundColor: '#f1f5f9' }}
                            whileTap={{ scale: 0.98 }}
                            className="w-full py-3 mt-2 text-sm font-bold text-slate-600 bg-slate-50 rounded-xl transition-colors"
                        >
                            View All History
                        </motion.button>
                    </section>
                </FadeUp>

                {/* Volunteer Availability Tracker */}
                <FadeUp delay={0.3}>
                    <section className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-5">
                        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                            <h3 className="text-lg font-bold">Volunteer Activity</h3>
                            <button className="text-slate-400 hover:text-primary transition-colors hover-scale">
                                <span className="material-symbols-outlined">more_horiz</span>
                            </button>
                        </div>
                        <StaggerContainer staggerDelay={0.1} className="space-y-4">
                            {[
                                { name: 'Ravi Kumar', status: 'Active Now', statusColor: 'text-emerald-500', role: 'Resource Delivery • Area A', initial: 'R', bg: 'bg-blue-100 text-blue-700', active: true },
                                { name: 'Sarah Jacob', status: 'Away (10m)', statusColor: 'text-amber-500', role: 'Medical Support • Area B', initial: 'S', bg: 'bg-rose-100 text-rose-700', active: false },
                                { name: 'Ananya D.', status: 'Active Now', statusColor: 'text-emerald-500', role: 'Tech Support • HQ', initial: 'A', bg: 'bg-emerald-100 text-emerald-700', active: true },
                            ].map((vol, i) => (
                                <StaggerItem key={i}>
                                    <div className="flex items-center gap-4 p-2 -mx-2 rounded-xl hover:bg-slate-50 transition-colors">
                                        <div className="relative">
                                            <div className={`size-11 rounded-full ${vol.bg} flex items-center justify-center text-sm font-black`}>
                                                {vol.initial}
                                            </div>
                                            {vol.active && <span className="absolute bottom-0 right-0 size-3 bg-emerald-500 border-2 border-white rounded-full"></span>}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex justify-between items-center mb-0.5">
                                                <p className="text-sm font-bold text-slate-900 truncate">{vol.name}</p>
                                                <span className={`text-[10px] font-black ${vol.statusColor} whitespace-nowrap`}>{vol.status}</span>
                                            </div>
                                            <p className="text-xs font-medium text-slate-500 truncate">{vol.role}</p>
                                        </div>
                                    </div>
                                </StaggerItem>
                            ))}
                        </StaggerContainer>
                        <motion.button
                            onClick={() => navigate('/volunteers')}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            className="w-full flex items-center justify-center gap-2 py-3.5 bg-primary text-white font-bold rounded-xl shadow-md hover:bg-primary/90 transition-colors mt-4"
                        >
                            <span className="material-symbols-outlined text-lg">handshake</span>
                            <span>Join as Volunteer</span>
                        </motion.button>
                    </section>
                </FadeUp>

                {/* Quick Support Request */}
                <FadeUp delay={0.4}>
                    <motion.div
                        whileHover={{ y: -4, boxShadow: '0 20px 40px -10px rgba(15, 23, 42, 0.2)' }}
                        className="bg-slate-900 p-8 rounded-3xl text-white relative overflow-hidden group hover-lift"
                    >
                        <div className="absolute inset-0 bg-gradient-to-br from-slate-800 to-slate-900"></div>
                        <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
                            className="absolute -right-10 -bottom-10 opacity-5 group-hover:opacity-10 transition-opacity"
                        >
                            <span className="material-symbols-outlined text-[180px]">support</span>
                        </motion.div>
                        <div className="relative z-10">
                            <div className="p-3 bg-white/10 rounded-2xl w-fit mb-5 backdrop-blur-sm">
                                <span className="material-symbols-outlined text-2xl">flash_on</span>
                            </div>
                            <h4 className="text-xl font-black mb-3 text-white">Need Immediate Help?</h4>
                            <p className="text-sm font-medium text-slate-300 mb-8 leading-relaxed">Post a request and our verified community volunteers will reach out within minutes.</p>
                            <motion.button
                                onClick={() => navigate('/request-resource')}
                                whileHover={{ scale: 1.03, backgroundColor: 'rgba(255,255,255,0.9)' }}
                                whileTap={{ scale: 0.97 }}
                                className="w-full px-5 py-3.5 bg-white text-slate-900 font-bold rounded-xl text-sm transition-colors"
                            >
                                Post Quick Request
                            </motion.button>
                        </div>
                    </motion.div>
                </FadeUp>
            </aside>
        </div>
    );
}
