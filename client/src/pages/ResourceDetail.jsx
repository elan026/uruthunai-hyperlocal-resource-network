import { useParams, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { resourceService, requestService } from '../services/api';
import { motion } from 'framer-motion';
import FadeUp from '../components/AnimatedSection';
import Reveal from '../components/Reveal';
import { StaggerContainer, StaggerItem } from '../components/StaggerContainer';

export default function ResourceDetail() {
    const { user } = useAuth();
    const { id } = useParams();
    const navigate = useNavigate();
    const [resource, setResource] = useState(null);
    const [loading, setLoading] = useState(true);
    const [requested, setRequested] = useState(false);

    useEffect(() => {
        const fetchResource = async () => {
            if (!id || id === 'undefined') {
                setLoading(false);
                return;
            }
            try {
                const res = await resourceService.getById(id);
                setResource(res.data);
            } catch (err) {
                console.error("Failed to fetch resource", err);
            } finally {
                setLoading(false);
            }
        };
        fetchResource();
    }, [id]);

    const handleRequest = async () => {
        try {
            await requestService.create({
                user_id: user?.id || 1,
                category: resource.category,
                description: `Requesting: ${resource.title}`,
                urgency_level: resource.is_emergency ? 'Critical' : 'Essential'
            });
            setRequested(true);
        } catch (err) {
            console.error("Failed to send request", err);
        }
    };

    if (loading) {
        return (
            <div className="p-8 flex items-center justify-center min-h-[60vh]">
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-center"
                >
                    <div className="w-16 h-16 border-4 border-primary/20 border-t-primary rounded-full animate-spin mx-auto mb-6"></div>
                    <p className="text-slate-500 font-bold text-lg tracking-wide">Loading resource details...</p>
                </motion.div>
            </div>
        );
    }

    if (!resource) {
        return (
            <div className="p-8 flex items-center justify-center min-h-[60vh]">
                <FadeUp y={20} className="max-w-md w-full">
                    <div className="text-center bg-white p-12 rounded-3xl border border-slate-200 shadow-lg shadow-slate-200/50 relative overflow-hidden">
                        <div className="absolute top-0 left-0 right-0 h-1.5 bg-rose-500"></div>
                        <span className="material-symbols-outlined text-[80px] text-slate-200 mb-6 block">search_off</span>
                        <h2 className="text-2xl font-black text-slate-900 mb-3 tracking-tight">Resource Not Found</h2>
                        <p className="text-slate-500 font-medium mb-8 leading-relaxed">This resource may have been removed or claimed by another community member.</p>
                        <motion.button
                            onClick={() => navigate('/map')}
                            whileHover={{ scale: 1.04, boxShadow: '0 12px 24px -10px rgba(48, 140, 232, 0.4)' }}
                            whileTap={{ scale: 0.97 }}
                            className="w-full bg-primary text-white font-bold px-6 py-4 rounded-xl transition-all flex items-center justify-center gap-2"
                        >
                            <span className="material-symbols-outlined">map</span>
                            Browse Resource Map
                        </motion.button>
                    </div>
                </FadeUp>
            </div>
        );
    }

    const categoryIcons = {
        'Medical Help': 'medical_services',
        'Shelter': 'home_work',
        'Water & Food': 'water_drop',
        'Electricity / Generator': 'electric_bolt',
        'Transport': 'local_shipping',
        'Volunteers': 'groups',
    };

    const iconName = categoryIcons[resource.category] || 'electric_bolt';

    return (
        <div className="p-6 lg:p-10 max-w-6xl mx-auto">
            {/* Breadcrumb */}
            <FadeUp delay={0.1}>
                <nav className="flex items-center gap-3 text-sm font-semibold text-slate-500 mb-8 bg-white/50 backdrop-blur w-fit px-4 py-2 rounded-full border border-slate-200">
                    <button onClick={() => navigate('/dashboard')} className="hover:text-primary transition-colors hover:scale-105 active:scale-95">Home</button>
                    <span className="material-symbols-outlined text-sm text-slate-300">chevron_right</span>
                    <button onClick={() => navigate('/map')} className="hover:text-primary transition-colors hover:scale-105 active:scale-95">Resources</button>
                    <span className="material-symbols-outlined text-sm text-slate-300">chevron_right</span>
                    <span className="text-slate-900 font-bold truncate max-w-[200px]">{resource.title}</span>
                </nav>
            </FadeUp>

            {/* Main Detail Card */}
            <FadeUp delay={0.2} y={30}>
                <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-200 overflow-hidden relative">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -mx-20 -my-20"></div>

                    <div className="p-8 lg:p-10 flex flex-col lg:flex-row gap-10 relative z-10">
                        {/* Image / Icon Area */}
                        <div className="w-full lg:w-1/3">
                            <motion.div
                                whileHover={{ scale: 1.02 }}
                                transition={{ duration: 0.4 }}
                                className="aspect-square rounded-2xl bg-gradient-to-br from-slate-50 to-slate-100/50 border border-slate-100 flex items-center justify-center relative overflow-hidden group shadow-inner"
                            >
                                <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent"></div>
                                <motion.span
                                    animate={{ y: [0, -6, 0] }}
                                    transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                                    className="material-symbols-outlined text-[100px] text-primary/40 group-hover:scale-110 transition-transform duration-500 drop-shadow-md"
                                >
                                    {iconName}
                                </motion.span>
                                <div className="absolute bottom-4 left-4 right-4 bg-white/90 backdrop-blur-md p-3.5 rounded-xl flex items-center justify-between border border-white/50 shadow-sm">
                                    <span className="text-xs font-black uppercase tracking-widest text-slate-600">{resource.category}</span>
                                    <div className="flex items-center gap-1.5 text-emerald-600 bg-emerald-50 px-2 py-1 rounded-md">
                                        <span className="material-symbols-outlined text-[16px] filled">verified</span>
                                        <span className="text-[10px] font-black tracking-widest uppercase">VERIFIED</span>
                                    </div>
                                </div>
                            </motion.div>
                        </div>

                        {/* Details */}
                        <div className="flex-1 flex flex-col pt-2">
                            <div className="flex justify-between items-start mb-4">
                                <h1 className="text-3xl lg:text-5xl font-black text-slate-900 tracking-tight leading-[1.1]">{resource.title}</h1>
                                <motion.button
                                    whileHover={{ scale: 1.1, backgroundColor: '#f1f5f9' }}
                                    whileTap={{ scale: 0.9 }}
                                    className="p-3 text-slate-400 hover:text-primary rounded-xl transition-colors bg-white border border-slate-100 shadow-sm"
                                >
                                    <span className="material-symbols-outlined">share</span>
                                </motion.button>
                            </div>

                            <div className="flex flex-wrap gap-4 items-center mb-8 border-b border-slate-100 pb-8">
                                <div className="flex items-center gap-2 text-slate-600 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100 font-semibold">
                                    <span className="material-symbols-outlined text-lg text-primary">location_on</span>
                                    <span className="text-sm">Thindal, Erode • Nearby</span>
                                </div>
                                <div className="flex items-center gap-2 text-slate-600 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100 font-semibold">
                                    <span className="material-symbols-outlined text-lg text-slate-400">schedule</span>
                                    <span className="text-sm">Listed {new Date(resource.created_at).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}</span>
                                </div>
                            </div>

                            {/* Info Cards */}
                            <StaggerContainer staggerDelay={0.15} className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
                                <StaggerItem variant="scale">
                                    <div className="p-5 rounded-2xl border border-primary/20 bg-primary/5 flex items-center gap-4 hover:bg-primary/10 transition-colors">
                                        <div className="w-14 h-14 rounded-xl bg-white shadow-sm flex items-center justify-center text-primary">
                                            <span className="material-symbols-outlined text-3xl font-bold filled">verified_user</span>
                                        </div>
                                        <div>
                                            <p className="text-[11px] font-black text-primary/70 uppercase tracking-widest mb-1">Trust Score</p>
                                            <p className="text-2xl font-black text-slate-900 leading-none">{resource.provider_trust_score || 98}<span className="text-sm font-bold text-slate-500 ml-1">%</span></p>
                                        </div>
                                    </div>
                                </StaggerItem>
                                <StaggerItem variant="scale">
                                    <div className="p-5 rounded-2xl border border-amber-200 bg-amber-50 flex items-center gap-4 hover:bg-amber-100/50 transition-colors">
                                        <div className="w-14 h-14 rounded-xl bg-white shadow-sm flex items-center justify-center text-amber-500 border border-amber-100">
                                            <span className="material-symbols-outlined text-3xl filled">event_available</span>
                                        </div>
                                        <div>
                                            <p className="text-[11px] font-black text-amber-700/70 uppercase tracking-widest mb-1">Availability</p>
                                            <p className="text-lg font-bold text-amber-900 leading-tight">{resource.availability_duration || 'Until claimed'}</p>
                                        </div>
                                    </div>
                                </StaggerItem>
                            </StaggerContainer>

                            {/* Description */}
                            <Reveal delay={0.4}>
                                <div className="space-y-4 mb-10">
                                    <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
                                        <span className="material-symbols-outlined text-primary">description</span>
                                        Resource Description
                                    </h3>
                                    <p className="text-slate-600 text-lg leading-relaxed font-medium bg-slate-50 p-6 rounded-2xl border border-slate-100">
                                        {resource.description || 'No additional description provided for this resource.'}
                                    </p>
                                </div>
                            </Reveal>

                            {/* Action Buttons */}
                            <Reveal delay={0.5} y={20}>
                                <div className="flex flex-col sm:flex-row gap-4 mt-auto">
                                    {requested ? (
                                        <motion.div
                                            initial={{ scale: 0.95, opacity: 0 }}
                                            animate={{ scale: 1, opacity: 1 }}
                                            className="flex-1 bg-emerald-50 text-emerald-700 font-bold py-4 px-6 rounded-2xl border border-emerald-200 flex items-center justify-center gap-2 shadow-sm"
                                        >
                                            <span className="material-symbols-outlined text-2xl filled">check_circle</span>
                                            Request Sent Successfully
                                        </motion.div>
                                    ) : (
                                        <motion.button
                                            onClick={handleRequest}
                                            disabled={resource.status !== 'Available'}
                                            whileHover={{ scale: resource.status === 'Available' ? 1.03 : 1, boxShadow: resource.status === 'Available' ? '0 12px 30px rgba(48,140,232,0.3)' : 'none' }}
                                            whileTap={{ scale: resource.status === 'Available' ? 0.97 : 1 }}
                                            className={`flex-1 text-lg font-black py-4 px-8 rounded-2xl transition-all flex items-center justify-center gap-3 ${resource.status === 'Available'
                                                ? 'bg-primary text-white shadow-lg'
                                                : 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200'
                                                }`}
                                        >
                                            <span className="material-symbols-outlined text-2xl">{resource.status === 'Available' ? 'handshake' : 'block'}</span>
                                            {resource.status === 'Available' ? 'Request Immediate Help' : 'Resource Unavailable'}
                                        </motion.button>
                                    )}
                                    <div className="relative group flex-1">
                                        <motion.button
                                            whileHover={{ backgroundColor: '#f8fafc', borderColor: '#cbd5e1' }}
                                            className="w-full h-full bg-white text-slate-500 font-bold py-4 px-6 rounded-2xl cursor-not-allowed flex items-center justify-center gap-3 border-2 border-slate-200 transition-colors"
                                        >
                                            <span className="material-symbols-outlined text-xl">chat_bubble</span>
                                            Start Chat
                                        </motion.button>
                                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 w-max opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-20 y-2">
                                            <div className="bg-slate-900 text-white text-xs font-medium py-2.5 px-4 rounded-xl shadow-xl border border-slate-700">
                                                Available after request is accepted
                                                <div className="absolute top-full left-1/2 -translate-x-1/2 border-[6px] border-transparent border-t-slate-900"></div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </Reveal>
                        </div>
                    </div>

                    {/* Location Map Section */}
                    <div className="border-t border-slate-200 p-8 lg:p-10 bg-slate-50 relative overflow-hidden">
                        <div className="absolute top-0 bottom-0 left-0 w-1.5 bg-gradient-to-b from-primary to-blue-400"></div>
                        <h3 className="text-xl font-black text-slate-900 mb-6 flex items-center gap-2">
                            <span className="material-symbols-outlined text-primary">pin_drop</span>
                            Collection Point
                        </h3>
                        <div className="rounded-3xl overflow-hidden h-64 relative border border-slate-200 bg-slate-200 flex items-center justify-center shadow-inner group">
                            <div className="absolute inset-0 bg-gradient-to-br from-slate-100 to-slate-200 opacity-60 transition-opacity duration-700 group-hover:opacity-100"></div>
                            <div className="text-center relative z-10">
                                <span className="material-symbols-outlined text-5xl text-slate-400 mb-3 drop-shadow-sm">map</span>
                                <p className="text-sm font-semibold text-slate-500 bg-white/80 backdrop-blur-sm px-4 py-2 rounded-full border border-slate-200/50">Interactive map showing Thindal, Erode</p>
                            </div>
                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                                <div className="w-8 h-8 bg-primary/40 rounded-full animate-ping absolute -inset-1"></div>
                                <div className="w-6 h-6 bg-primary rounded-full relative border-2 border-white shadow-xl flex items-center justify-center">
                                    <span className="material-symbols-outlined text-white text-[12px] filled">{iconName}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </FadeUp>

            {/* Nearby Resources */}
            <FadeUp delay={0.4} className="mt-16 mb-20">
                <div className="flex items-center justify-between mb-8">
                    <h3 className="text-2xl font-black text-slate-900 tracking-tight">Other Resources Nearby</h3>
                    <motion.button
                        onClick={() => navigate('/map')}
                        whileHover={{ x: 4 }}
                        className="text-primary font-bold text-sm bg-primary/10 px-4 py-2 rounded-lg flex items-center gap-1 transition-colors hover:bg-primary/15"
                    >
                        View all <span className="material-symbols-outlined text-sm">arrow_forward</span>
                    </motion.button>
                </div>
                <StaggerContainer staggerDelay={0.15} className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {[
                        { icon: 'water_drop', title: 'Clean Drinking Water', distance: '500m away', bg: 'bg-blue-50 text-blue-500', color: 'text-blue-600' },
                        { icon: 'medical_services', title: 'First Aid Station', distance: '1.2km away', bg: 'bg-emerald-50 text-emerald-500', color: 'text-emerald-600' },
                        { icon: 'wifi', title: 'Satellite Internet Hub', distance: '800m away', bg: 'bg-purple-50 text-purple-500', color: 'text-purple-600' },
                    ].map((item, i) => (
                        <StaggerItem key={i}>
                            <motion.div
                                onClick={() => navigate('/map')}
                                whileHover={{ y: -6, boxShadow: '0 20px 40px -10px rgba(0,0,0,0.08)' }}
                                transition={{ duration: 0.3, ease: 'easeOut' }}
                                className="bg-white p-5 rounded-2xl border border-slate-200 cursor-pointer group flex flex-col h-full"
                            >
                                <div className={`w-full aspect-[16/10] rounded-xl ${item.bg} mb-5 flex items-center justify-center overflow-hidden transition-colors group-hover:bg-slate-50`}>
                                    <span className={`material-symbols-outlined text-5xl opacity-40 group-hover:scale-110 transition-transform duration-500 ${item.color} group-hover:opacity-100`}>{item.icon}</span>
                                </div>
                                <h4 className="text-lg font-black text-slate-900 mb-2 truncate group-hover:text-primary transition-colors">{item.title}</h4>
                                <div className="flex items-center gap-1.5 text-xs font-bold text-slate-500 mb-6 bg-slate-50 w-fit px-2 py-1 rounded border border-slate-100">
                                    <span className="material-symbols-outlined text-[14px]">location_on</span>
                                    {item.distance}
                                </div>
                                <div className="mt-auto w-full py-2.5 bg-slate-50 border border-slate-100 rounded-xl text-sm font-bold text-center text-slate-600 group-hover:bg-primary group-hover:text-white group-hover:border-primary transition-all">
                                    View Details
                                </div>
                            </motion.div>
                        </StaggerItem>
                    ))}
                </StaggerContainer>
            </FadeUp>
        </div>
    );
}
