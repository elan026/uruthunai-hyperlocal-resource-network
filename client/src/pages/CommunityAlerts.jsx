import { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { alertService } from '../services/api';
import { timeAgo } from '../utils/helpers';
import { motion, AnimatePresence } from 'framer-motion';
import FadeUp from '../components/AnimatedSection';
import { StaggerContainer, StaggerItem } from '../components/StaggerContainer';
import Reveal from '../components/Reveal';

export default function CommunityAlerts() {
    const { user } = useAuth();
    const [alerts, setAlerts] = useState([]);
    const [showForm, setShowForm] = useState(false);
    const [formData, setFormData] = useState({ alert_type: 'Info', message: '' });

    const fetchAlerts = async () => {
        try {
            const res = await alertService.getAll();
            setAlerts(res.data);
        } catch (err) {
            console.error("Failed to fetch alerts", err);
            // Fallback mock data
            setAlerts([
                { id: 1, alert_type: 'Warning', message: 'Flooding expected in low-lying areas of Adyar. Move valuables to higher ground.', is_active: true, admin_name: 'Admin', created_at: new Date(Date.now() - 3600000).toISOString() },
                { id: 2, alert_type: 'Info', message: 'Municipal water tankers dispatched to T. Nagar. Expected arrival: 4 PM.', is_active: true, admin_name: 'Admin', created_at: new Date(Date.now() - 7200000).toISOString() },
                { id: 3, alert_type: 'Resolved', message: 'Power restored in Mylapore sector. All residents can return to normal operations.', is_active: false, admin_name: 'Admin', created_at: new Date(Date.now() - 18000000).toISOString() },
            ]);
        }
    };

    useEffect(() => {
        fetchAlerts();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await alertService.create({
                admin_id: user?.id || 1,
                alert_type: formData.alert_type,
                message: formData.message
            });
            setFormData({ alert_type: 'Info', message: '' });
            setShowForm(false);
            fetchAlerts();
        } catch (err) {
            console.error("Failed to post alert", err);
        }
    };

    const handleDeactivate = async (id) => {
        try {
            await alertService.deactivate(id);
            fetchAlerts();
        } catch (err) {
            console.error("Failed to deactivate alert", err);
        }
    };

    const getAlertStyle = (type, isActive) => {
        if (!isActive) return { bg: 'bg-slate-50 border-slate-200', icon: 'check_circle', iconColor: 'text-slate-400', textColor: 'text-slate-500', tagBg: 'bg-slate-200 text-slate-600', ring: '' };
        switch (type) {
            case 'Warning': return { bg: 'bg-orange-50 border-orange-200', icon: 'warning', iconColor: 'text-orange-500', textColor: 'text-orange-900', tagBg: 'bg-orange-200 text-orange-800', ring: 'ring-1 ring-orange-500/20' };
            case 'Critical': return { bg: 'bg-rose-50 border-rose-200', icon: 'emergency', iconColor: 'text-rose-500', textColor: 'text-rose-900', tagBg: 'bg-rose-200 text-rose-800', ring: 'ring-1 ring-rose-500/30' };
            case 'Resolved': return { bg: 'bg-emerald-50 border-emerald-200', icon: 'check_circle', iconColor: 'text-emerald-500', textColor: 'text-emerald-900', tagBg: 'bg-emerald-200 text-emerald-800', ring: '' };
            default: return { bg: 'bg-blue-50 border-blue-200', icon: 'info', iconColor: 'text-blue-500', textColor: 'text-blue-900', tagBg: 'bg-blue-200 text-blue-800', ring: '' };
        }
    };

    return (
        <div className="p-6 lg:p-10 max-w-5xl mx-auto">
            {/* Header */}
            <FadeUp>
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8 pb-6 border-b border-slate-200">
                    <div>
                        <h2 className="text-3xl lg:text-4xl font-black tracking-tight text-slate-900 flex items-center gap-3">
                            <span className="material-symbols-outlined text-primary text-[40px] drop-shadow-sm">notifications_active</span>
                            Community Alerts
                        </h2>
                        <p className="text-slate-500 mt-2 text-lg font-medium">Official updates from area admins and local authorities.</p>
                    </div>
                    {user?.role === 'admin' && (
                        <motion.button
                            onClick={() => setShowForm(!showForm)}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className={`flex items-center gap-2 font-bold px-6 py-3.5 rounded-2xl shadow-sm transition-colors ${showForm
                                ? 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                : 'bg-primary text-white shadow-primary/20 hover:bg-primary/90'
                                }`}
                        >
                            <span className="material-symbols-outlined text-lg">{showForm ? 'close' : 'add_alert'}</span>
                            {showForm ? 'Cancel' : 'Post New Alert'}
                        </motion.button>
                    )}
                </div>
            </FadeUp>

            {/* Admin Alert Form */}
            <AnimatePresence>
                {showForm && (
                    <motion.form
                        initial={{ opacity: 0, height: 0, overflow: 'hidden' }}
                        animate={{ opacity: 1, height: 'auto', overflow: 'visible' }}
                        exit={{ opacity: 0, height: 0, overflow: 'hidden' }}
                        transition={{ duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
                        onSubmit={handleSubmit}
                        className="bg-white p-8 lg:p-10 rounded-3xl border border-slate-200 shadow-xl shadow-slate-200/50 mb-10 space-y-6 relative"
                    >
                        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl -mx-10 -my-10"></div>
                        <h3 className="font-black text-2xl text-slate-900 tracking-tight">New Community Alert</h3>
                        <div className="space-y-3 relative z-10">
                            <label className="text-sm font-black uppercase tracking-widest text-slate-600">Alert Type</label>
                            <div className="relative group">
                                <select
                                    value={formData.alert_type}
                                    onChange={(e) => setFormData({ ...formData, alert_type: e.target.value })}
                                    className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-5 py-4 text-base font-semibold focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all appearance-none cursor-pointer"
                                >
                                    <option value="Info" className="font-semibold">Info - General Information</option>
                                    <option value="Warning" className="font-semibold">Warning - Potential Hazard</option>
                                    <option value="Critical" className="font-semibold text-rose-600">Critical - Immediate Danger</option>
                                    <option value="Resolved" className="font-semibold text-emerald-600">Resolved - All Clear</option>
                                </select>
                                <span className="material-symbols-outlined absolute right-5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none group-focus-within:text-primary transition-colors">expand_more</span>
                            </div>
                        </div>
                        <div className="space-y-3 relative z-10">
                            <label className="text-sm font-black uppercase tracking-widest text-slate-600 flex items-center justify-between">
                                Message Body
                                <span className="text-rose-500 font-bold">*</span>
                            </label>
                            <textarea
                                rows="4"
                                placeholder="Write a clear, actionable message for the community. Include specific details like locations and timeframes."
                                value={formData.message}
                                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                                className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-5 py-4 text-base font-medium focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all resize-none shadow-inner"
                                required
                            />
                        </div>
                        <div className="pt-2 relative z-10">
                            <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                type="submit"
                                className="flex items-center justify-center gap-2 w-full sm:w-auto bg-primary text-white font-bold px-10 py-4 rounded-2xl shadow-lg shadow-primary/20 hover:bg-primary/90 transition-colors"
                            >
                                <span className="material-symbols-outlined text-lg">campaign</span>
                                Publish Global Alert
                            </motion.button>
                        </div>
                    </motion.form>
                )}
            </AnimatePresence>

            {/* Alerts Timeline */}
            <Reveal delay={0.2} direction="up">
                <div className="space-y-6">
                    {alerts.length > 0 ? (
                        <StaggerContainer staggerDelay={0.15}>
                            {alerts.map(alert => {
                                const style = getAlertStyle(alert.alert_type, alert.is_active);
                                return (
                                    <StaggerItem key={alert.id} variant="scale">
                                        <motion.div
                                            whileHover={{ y: -4, boxShadow: '0 20px 40px -10px rgba(0,0,0,0.05)' }}
                                            className={`p-6 lg:p-8 rounded-3xl border-2 ${style.bg} ${style.border} ${style.ring} flex flex-col sm:flex-row items-start gap-6 transition-all ${!alert.is_active ? 'opacity-70 saturate-[0.8]' : ''}`}
                                        >
                                            <div className="flex-shrink-0 bg-white p-3.5 rounded-2xl shadow-sm border border-slate-100 flex items-center justify-center relative">
                                                {alert.alert_type === 'Critical' && alert.is_active && (
                                                    <span className="absolute inset-0 rounded-2xl blur-md bg-rose-500/30 animate-pulse"></span>
                                                )}
                                                <span className={`material-symbols-outlined text-3xl relative z-10 ${style.iconColor}`}>{style.icon}</span>
                                            </div>
                                            <div className="flex-1 w-full relative">
                                                <div className="flex flex-wrap items-center gap-3 mb-3">
                                                    <span className={`text-[11px] font-black px-3 py-1.5 rounded-lg ${style.tagBg} uppercase tracking-widest leading-none`}>
                                                        {alert.alert_type}
                                                    </span>
                                                    <span className="text-sm text-slate-500 font-semibold">{timeAgo(alert.created_at)}</span>
                                                    {!alert.is_active && <span className="text-[11px] font-black uppercase tracking-widest text-slate-500 bg-slate-200 px-3 py-1.5 rounded-lg leading-none border border-slate-300">Resolved</span>}
                                                </div>
                                                <p className={`text-xl lg:text-2xl font-semibold leading-relaxed tracking-tight ${style.textColor}`}>{alert.message}</p>
                                                <div className="mt-5 flex items-center gap-2">
                                                    <div className="w-6 h-6 rounded-full bg-slate-200 flex items-center justify-center border border-slate-300">
                                                        <span className="material-symbols-outlined text-[12px] text-slate-500">shield_person</span>
                                                    </div>
                                                    <span className="text-sm text-slate-500 font-semibold">Posted by <span className="text-slate-700">{alert.admin_name || 'Area Admin'}</span></span>
                                                </div>
                                            </div>
                                            {alert.is_active && user?.role === 'Admin' && (
                                                <motion.button
                                                    whileHover={{ scale: 1.05 }}
                                                    whileTap={{ scale: 0.95 }}
                                                    onClick={() => handleDeactivate(alert.id)}
                                                    className="w-full sm:w-auto text-sm font-bold text-slate-500 hover:text-emerald-700 transition-colors bg-white px-5 py-3 rounded-2xl border-2 border-slate-200 hover:border-emerald-200 hover:bg-emerald-50 flex-shrink-0 flex items-center justify-center gap-2 shadow-sm"
                                                >
                                                    <span className="material-symbols-outlined text-lg">check_circle</span>
                                                    Mark Resolved
                                                </motion.button>
                                            )}
                                        </motion.div>
                                    </StaggerItem>
                                );
                            })}
                        </StaggerContainer>
                    ) : (
                        <div className="bg-white rounded-3xl p-16 text-center border-2 border-dashed border-slate-200">
                            <div className="w-24 h-24 mx-auto mb-6 bg-slate-50 rounded-full flex items-center justify-center">
                                <span className="material-symbols-outlined text-[60px] text-slate-300">notifications_off</span>
                            </div>
                            <h3 className="font-black text-slate-800 text-2xl mb-2">No Active Alerts</h3>
                            <p className="text-slate-500 font-medium text-lg">Your neighborhood is currently clear. Area admins will post important updates here when necessary.</p>
                        </div>
                    )}
                </div>
            </Reveal>
        </div>
    );
}
