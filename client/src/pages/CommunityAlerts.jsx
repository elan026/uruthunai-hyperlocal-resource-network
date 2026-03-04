import { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { alertService } from '../services/api';
import { timeAgo } from '../utils/helpers';
import { BellRing, AlertTriangle, Info, CheckCircle, PlusCircle, Send, X } from 'lucide-react';

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
            // Fallback demo alerts
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
        if (!isActive) return { bg: 'bg-gray-50', border: 'border-gray-200', icon: CheckCircle, iconColor: 'text-gray-400', textColor: 'text-gray-500', tagBg: 'bg-gray-100 text-gray-500' };
        switch (type) {
            case 'Warning': return { bg: 'bg-orange-50', border: 'border-orange-200', icon: AlertTriangle, iconColor: 'text-orange-500', textColor: 'text-orange-900', tagBg: 'bg-orange-100 text-orange-700' };
            case 'Critical': return { bg: 'bg-red-50', border: 'border-red-200', icon: AlertTriangle, iconColor: 'text-red-500', textColor: 'text-red-900', tagBg: 'bg-red-100 text-red-700' };
            case 'Resolved': return { bg: 'bg-green-50', border: 'border-green-200', icon: CheckCircle, iconColor: 'text-green-500', textColor: 'text-green-900', tagBg: 'bg-green-100 text-green-700' };
            default: return { bg: 'bg-blue-50', border: 'border-blue-200', icon: Info, iconColor: 'text-blue-500', textColor: 'text-blue-900', tagBg: 'bg-blue-100 text-blue-700' };
        }
    };



    return (
        <div className="p-8 max-w-5xl mx-auto pb-32">
            <div className="flex justify-between items-end mb-10 border-b border-gray-200 pb-6">
                <div>
                    <h1 className="text-4xl font-extrabold text-navy-900 tracking-tight flex items-center gap-3">
                        <BellRing className="w-9 h-9 text-orange-500" /> Community Alerts
                    </h1>
                    <p className="text-gray-500 font-medium text-lg mt-2">Official updates from area admins and local authorities.</p>
                </div>
                {user?.role === 'Admin' && (
                    <button
                        onClick={() => setShowForm(!showForm)}
                        className="flex items-center gap-2 bg-navy-800 text-white font-bold px-6 py-3 rounded-full shadow-lg hover:bg-navy-900 transition-all"
                    >
                        {showForm ? <X className="w-5 h-5" /> : <PlusCircle className="w-5 h-5" />}
                        {showForm ? 'Cancel' : 'Post Alert'}
                    </button>
                )}
            </div>

            {/* Admin Alert Form */}
            {showForm && (
                <form onSubmit={handleSubmit} className="bg-white p-8 rounded-[32px] border border-gray-100 shadow-sm mb-10 space-y-6">
                    <h3 className="font-extrabold text-navy-900 text-2xl tracking-tight">New Community Alert</h3>
                    <div className="space-y-2">
                        <label className="text-sm font-bold text-navy-800 uppercase tracking-wide">Alert Type</label>
                        <select
                            value={formData.alert_type}
                            onChange={(e) => setFormData({ ...formData, alert_type: e.target.value })}
                            className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-5 py-4 focus:outline-none focus:ring-2 focus:ring-teal-500 font-medium text-gray-800 appearance-none"
                        >
                            <option value="Info">Information</option>
                            <option value="Warning">Warning</option>
                            <option value="Critical">Critical</option>
                            <option value="Resolved">Resolved</option>
                        </select>
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-bold text-navy-800 uppercase tracking-wide">Message <span className="text-red-500">*</span></label>
                        <textarea
                            rows="3"
                            placeholder="Write a clear, actionable message for the community..."
                            value={formData.message}
                            onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                            className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-5 py-4 focus:outline-none focus:ring-2 focus:ring-teal-500 font-medium text-gray-800 resize-none"
                            required
                        />
                    </div>
                    <button type="submit" className="flex items-center gap-2 bg-teal-600 text-white font-extrabold px-8 py-4 rounded-full shadow-lg hover:bg-teal-700 transition-all">
                        <Send className="w-5 h-5" /> Publish Alert
                    </button>
                </form>
            )}

            {/* Alerts Timeline */}
            <div className="space-y-5">
                {alerts.length > 0 ? alerts.map(alert => {
                    const style = getAlertStyle(alert.alert_type, alert.is_active);
                    const Icon = style.icon;
                    return (
                        <div key={alert.id} className={`p-6 rounded-[28px] border ${style.bg} ${style.border} flex items-start gap-5 transition-all hover:shadow-md ${!alert.is_active ? 'opacity-60' : ''}`}>
                            <div className={`p-3 rounded-full bg-white shadow-sm border border-gray-100 flex-shrink-0`}>
                                <Icon className={`w-7 h-7 ${style.iconColor}`} />
                            </div>
                            <div className="flex-1">
                                <div className="flex items-center gap-3 mb-2">
                                    <span className={`text-xs font-bold px-3 py-1 rounded-full ${style.tagBg} uppercase tracking-wider`}>
                                        {alert.alert_type}
                                    </span>
                                    <span className="text-xs text-gray-400 font-medium">{timeAgo(alert.created_at)}</span>
                                    {!alert.is_active && <span className="text-xs font-bold text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">Resolved</span>}
                                </div>
                                <p className={`text-lg font-medium leading-relaxed ${style.textColor}`}>{alert.message}</p>
                                <span className="text-xs text-gray-400 mt-3 block font-medium">Posted by {alert.admin_name || 'Area Admin'}</span>
                            </div>
                            {alert.is_active && user?.role === 'Admin' && (
                                <button
                                    onClick={() => handleDeactivate(alert.id)}
                                    className="text-xs font-bold text-gray-400 hover:text-red-500 transition-colors bg-white px-3 py-2 rounded-full border border-gray-200 flex-shrink-0"
                                >
                                    Resolve
                                </button>
                            )}
                        </div>
                    );
                }) : (
                    <div className="bg-white rounded-[32px] p-16 text-center border border-gray-100">
                        <BellRing className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                        <h3 className="font-bold text-gray-800 text-xl">No alerts yet</h3>
                        <p className="text-gray-500 mt-2">Area admins will post community updates here.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
