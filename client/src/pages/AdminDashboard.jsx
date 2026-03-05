import { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { resourceService, requestService, alertService } from '../services/api';

export default function AdminDashboard() {
    const { user, emergencyMode, setEmergencyMode } = useAuth();
    const [metrics, setMetrics] = useState({
        totalResources: 0,
        totalRequests: 0,
        totalAlerts: 0,
    });
    const [recentRequests, setRecentRequests] = useState([]);

    useEffect(() => {
        const fetchMetrics = async () => {
            try {
                const [resRes, reqRes, alertRes] = await Promise.all([
                    resourceService.getAll(),
                    requestService.getAll(),
                    alertService.getAll().catch(() => ({ data: [] }))
                ]);
                setMetrics({
                    totalResources: resRes.data.length,
                    totalRequests: reqRes.data.length,
                    totalAlerts: alertRes.data?.length || 0
                });
                setRecentRequests(reqRes.data.slice(0, 5));
            } catch (err) {
                console.error('Error fetching admin metrics', err);
            }
        };
        fetchMetrics();
    }, []);

    return (
        <div className="p-6 md:p-8">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
                    <div>
                        <h2 className="text-3xl font-black tracking-tight">Admin Control Panel</h2>
                        <p className="text-slate-500 mt-1">Disaster Management Overview — Area: {user?.area_code || 'CHN-ADY-01'}</p>
                    </div>
                    <div className="flex gap-3 mt-4 md:mt-0">
                        <button
                            onClick={() => setEmergencyMode(!emergencyMode)}
                            className={`px-6 py-3 rounded-xl font-bold text-sm flex items-center gap-3 transition-all ${emergencyMode
                                    ? 'bg-red-500 text-white shadow-xl shadow-red-500/20'
                                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                                }`}
                        >
                            <span className="material-symbols-outlined text-lg">{emergencyMode ? 'emergency' : 'toggle_off'}</span>
                            {emergencyMode ? 'Emergency Mode Active' : 'Emergency Mode Off'}
                        </button>
                        <button className="px-6 py-3 rounded-xl font-bold text-sm bg-primary text-white shadow-lg shadow-primary/20 flex items-center gap-2">
                            <span className="material-symbols-outlined text-lg">add_alert</span>
                            Create Alert
                        </button>
                    </div>
                </div>

                {/* Metrics Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                    {[
                        { label: 'Total Active Resources', value: metrics.totalResources, icon: 'inventory_2', color: 'text-blue-500', bg: 'bg-blue-50 border-blue-100' },
                        { label: 'Open Requests', value: metrics.totalRequests, icon: 'assignment_late', color: 'text-red-500', bg: 'bg-red-50 border-red-100' },
                        { label: 'Verified Volunteers', value: '156', icon: 'person_check', color: 'text-emerald-500', bg: 'bg-emerald-50 border-emerald-100' },
                        { label: 'Community Alerts', value: metrics.totalAlerts, icon: 'campaign', color: 'text-amber-500', bg: 'bg-amber-50 border-amber-100' },
                    ].map((stat, i) => (
                        <div key={i} className={`flex items-center gap-5 p-5 rounded-2xl border ${stat.bg}`}>
                            <div className={`flex-shrink-0 h-14 w-14 rounded-xl flex items-center justify-center ${stat.color}`} style={{ backgroundColor: 'white' }}>
                                <span className="material-symbols-outlined text-3xl">{stat.icon}</span>
                            </div>
                            <div>
                                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{stat.label}</p>
                                <h3 className="text-3xl font-black text-slate-900 mt-1">{stat.value}</h3>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left: Main Content */}
                    <div className="lg:col-span-2 space-y-8">
                        {/* Recent Requests Table */}
                        <div className="bg-white rounded-2xl shadow-sm border border-slate-200">
                            <div className="p-6 border-b border-slate-200 flex items-center justify-between">
                                <h3 className="font-bold text-lg flex items-center gap-2">
                                    <span className="material-symbols-outlined text-red-500">assignment_late</span>
                                    Recent Activity
                                </h3>
                                <button className="text-sm font-bold text-primary hover:underline">View All</button>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="bg-slate-50 text-slate-500 text-xs font-bold uppercase tracking-widest">
                                            <th className="py-3 px-6 text-left">User / Request</th>
                                            <th className="py-3 px-6 text-left">Category</th>
                                            <th className="py-3 px-6 text-left">Urgency</th>
                                            <th className="py-3 px-6 text-left">Status</th>
                                            <th className="py-3 px-6 text-left">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {recentRequests.length > 0 ? recentRequests.map((req, i) => (
                                            <tr key={req.id || i} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                                                <td className="py-4 px-6">
                                                    <div className="flex items-center gap-3">
                                                        <div className="h-8 w-8 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold">#{req.id || i + 1}</div>
                                                        <div>
                                                            <p className="font-bold text-slate-900">{req.description?.substring(0, 30) || 'Request'}</p>
                                                            <p className="text-[10px] text-slate-500">{new Date(req.created_at).toLocaleString()}</p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="py-4 px-6">
                                                    <span className="bg-slate-100 text-slate-600 text-[10px] font-bold px-2 py-1 rounded uppercase">{req.category}</span>
                                                </td>
                                                <td className="py-4 px-6">
                                                    <span className={`text-[10px] font-black px-3 py-1 rounded-full ${req.urgency_level === 'Critical' ? 'bg-red-500 text-white' :
                                                            req.urgency_level === 'Essential' ? 'bg-orange-500 text-white' :
                                                                'bg-blue-100 text-blue-700'
                                                        }`}>{req.urgency_level}</span>
                                                </td>
                                                <td className="py-4 px-6">
                                                    <span className={`text-[10px] font-bold px-2 py-1 rounded ${req.status === 'Active' || !req.status ? 'bg-green-100 text-green-600' : 'bg-slate-100 text-slate-500'
                                                        }`}>{req.status || 'Active'}</span>
                                                </td>
                                                <td className="py-4 px-6">
                                                    <button className="text-primary hover:underline text-xs font-bold">View</button>
                                                </td>
                                            </tr>
                                        )) : (
                                            [
                                                { desc: 'Emergency med evac request', cat: 'Medical', urg: 'Critical', status: 'Active' },
                                                { desc: 'Shelter for stranded family(5)', cat: 'Shelter', urg: 'Essential', status: 'Active' },
                                                { desc: 'Power backup need', cat: 'Electricity', urg: 'Support', status: 'Pending' },
                                            ].map((row, i) => (
                                                <tr key={i} className="border-b border-slate-100">
                                                    <td className="py-4 px-6">
                                                        <div className="flex items-center gap-3">
                                                            <div className="h-8 w-8 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold">#{i + 1}</div>
                                                            <div>
                                                                <p className="font-bold text-slate-900">{row.desc}</p>
                                                                <p className="text-[10px] text-slate-500">Today</p>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="py-4 px-6"><span className="bg-slate-100 text-slate-600 text-[10px] font-bold px-2 py-1 rounded uppercase">{row.cat}</span></td>
                                                    <td className="py-4 px-6">
                                                        <span className={`text-[10px] font-black px-3 py-1 rounded-full ${row.urg === 'Critical' ? 'bg-red-500 text-white' :
                                                                row.urg === 'Essential' ? 'bg-orange-500 text-white' :
                                                                    'bg-blue-100 text-blue-700'
                                                            }`}>{row.urg}</span>
                                                    </td>
                                                    <td className="py-4 px-6"><span className="bg-green-100 text-green-600 text-[10px] font-bold px-2 py-1 rounded">{row.status}</span></td>
                                                    <td className="py-4 px-6"><button className="text-primary hover:underline text-xs font-bold">View</button></td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* Area Map */}
                        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
                            <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                                <span className="material-symbols-outlined text-primary">map</span>
                                Region Overview Map
                            </h3>
                            <div className="h-56 rounded-xl bg-slate-200 relative flex items-center justify-center overflow-hidden">
                                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent"></div>
                                <div className="text-center z-10">
                                    <span className="material-symbols-outlined text-5xl text-slate-300">public</span>
                                    <p className="text-sm text-slate-400 mt-2">Admin region overview</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Panel */}
                    <div className="space-y-8">
                        {/* Volunteer Management */}
                        <div className="bg-white rounded-2xl border border-slate-200 p-6">
                            <h3 className="font-bold text-sm uppercase tracking-widest text-slate-500 mb-4 flex items-center justify-between">
                                Volunteer Pool
                                <span className="text-primary text-xs cursor-pointer hover:underline">Manage</span>
                            </h3>
                            <div className="space-y-4">
                                {[
                                    { name: 'Field Medics', count: 12, icon: 'medical_services', color: 'text-red-500' },
                                    { name: 'Transport Drivers', count: 8, icon: 'local_shipping', color: 'text-blue-500' },
                                    { name: 'Logistics & Supply', count: 15, icon: 'inventory_2', color: 'text-emerald-500' },
                                    { name: 'Communication Team', count: 6, icon: 'cell_tower', color: 'text-purple-500' },
                                ].map((role, i) => (
                                    <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-slate-50 border border-slate-100">
                                        <div className="flex items-center gap-3">
                                            <span className={`material-symbols-outlined ${role.color}`}>{role.icon}</span>
                                            <span className="text-sm font-bold">{role.name}</span>
                                        </div>
                                        <span className="text-sm font-black text-slate-900">{role.count}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* System Status */}
                        <div className="bg-slate-900 text-white rounded-2xl p-6">
                            <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-4">System Status</h3>
                            <div className="space-y-4">
                                {[
                                    { label: 'SMS Gateway', status: 'Operational', ok: true },
                                    { label: 'Database Sync', status: 'Synced (5s ago)', ok: true },
                                    { label: 'Alert Broadcast', status: emergencyMode ? 'Armed' : 'Standby', ok: emergencyMode },
                                ].map((item, i) => (
                                    <div key={i} className="flex items-center justify-between bg-white/10 p-3 rounded-lg">
                                        <span className="text-sm font-medium">{item.label}</span>
                                        <div className="flex items-center gap-2">
                                            <span className={`h-2 w-2 rounded-full ${item.ok ? 'bg-green-500' : 'bg-yellow-500'}`}></span>
                                            <span className="text-xs font-bold">{item.status}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
