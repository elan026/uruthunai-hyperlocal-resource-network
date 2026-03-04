import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { resourceService, requestService } from '../services/api';
import MetricCard from '../components/MetricCard';
import { ShieldAlert, ArrowRight, Users, Package, HelpCircle, BellRing } from 'lucide-react';

export default function AdminDashboard() {
    const { user, emergencyMode, setEmergencyMode } = useAuth();
    const navigate = useNavigate();
    const [disasterType, setDisasterType] = useState('Flood');
    const [metrics, setMetrics] = useState({ requests: 0, resources: 0, critical: 0 });
    const disasterOptions = ['Flood', 'Cyclone', 'Heatwave', 'Medical Emergency', 'Industrial Accident'];

    useEffect(() => {
        const fetchMetrics = async () => {
            try {
                const [reqRes, resRes] = await Promise.all([
                    requestService.getAll(),
                    resourceService.getAll()
                ]);
                setMetrics({
                    requests: reqRes.data.length,
                    resources: resRes.data.length,
                    critical: reqRes.data.filter(r => r.urgency_level === 'Critical').length
                });
            } catch (err) {
                console.error("Failed to load metrics", err);
            }
        };
        fetchMetrics();
    }, []);

    return (
        <div className="p-8 max-w-7xl mx-auto h-[calc(100vh-80px)] overflow-y-auto pb-32">
            <div className="flex justify-between items-end border-b border-gray-200 pb-6 mb-10">
                <div>
                    <h1 className="text-4xl font-extrabold text-navy-900 tracking-tight leading-tight">Admin Control Panel</h1>
                    <p className="text-lg text-gray-500 font-medium mt-1">Area: {user?.area_code || 'CHN-ADY-01'} | Role: {user?.role || 'Admin'}</p>
                </div>
            </div>

            <div className="grid lg:grid-cols-3 gap-8">

                {/* Main Control Area */}
                <div className="lg:col-span-2 space-y-8">

                    <div className={`p-10 rounded-[40px] border shadow-lg transition-colors relative overflow-hidden ${emergencyMode ? 'bg-gradient-to-br from-red-600 to-red-800 border-red-600' : 'bg-white border-gray-200'}`}>
                        {emergencyMode && <div className="absolute inset-0 bg-red-500 mix-blend-overlay animate-pulse opacity-20"></div>}

                        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-8">
                            <div className="space-y-4 max-w-sm">
                                <h2 className={`text-3xl font-extrabold tracking-tight ${emergencyMode ? 'text-white' : 'text-navy-900'}`}>
                                    Operations State
                                </h2>
                                <p className={`font-medium leading-relaxed ${emergencyMode ? 'text-red-100' : 'text-gray-500'}`}>
                                    Activating emergency mode pushes local alerts and prioritizes rescue requests.
                                </p>
                            </div>

                            <button
                                onClick={() => setEmergencyMode(!emergencyMode)}
                                className={`h-24 px-12 rounded-[2rem] font-black text-2xl uppercase tracking-widest shadow-xl transition-all hover:scale-[1.02] flex items-center justify-center gap-4 border-4 ${emergencyMode
                                    ? 'bg-navy-900 text-red-500 border-navy-800 hover:bg-black'
                                    : 'bg-red-600 text-white border-red-500 hover:bg-red-700 shadow-red-500/30'
                                    }`}
                            >
                                <ShieldAlert className={`w-8 h-8 ${emergencyMode ? 'text-red-500' : 'text-white'}`} />
                                {emergencyMode ? 'DEACTIVATE' : 'ACTIVATE'}
                            </button>
                        </div>
                    </div>

                    <div className="bg-white p-10 rounded-[40px] border border-gray-200 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-8">
                        <div>
                            <h3 className="font-extrabold text-navy-900 text-2xl tracking-tight mb-2">Disaster Context</h3>
                            <p className="text-gray-500 font-medium">Select type to configure UI templates and alert parameters.</p>
                        </div>
                        <select
                            value={disasterType}
                            onChange={(e) => setDisasterType(e.target.value)}
                            className="bg-gray-50 border border-gray-200 rounded-2xl px-6 py-4 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:bg-white transition-colors font-bold text-lg text-gray-800 w-full sm:w-64 appearance-none shadow-inner"
                        >
                            {disasterOptions.map(o => <option key={o} value={o}>{o}</option>)}
                        </select>
                    </div>

                    {/* Quick Actions */}
                    <div className="grid sm:grid-cols-3 gap-4">
                        <button onClick={() => navigate('/alerts')} className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-all text-left group">
                            <BellRing className="w-8 h-8 text-orange-500 mb-3 group-hover:scale-110 transition-transform" />
                            <h4 className="font-bold text-navy-900">Post Alert</h4>
                            <p className="text-sm text-gray-500 mt-1">Send community-wide notification</p>
                        </button>
                        <button onClick={() => navigate('/volunteers')} className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-all text-left group">
                            <Users className="w-8 h-8 text-teal-500 mb-3 group-hover:scale-110 transition-transform" />
                            <h4 className="font-bold text-navy-900">Manage Volunteers</h4>
                            <p className="text-sm text-gray-500 mt-1">View and coordinate responders</p>
                        </button>
                        <button onClick={() => navigate('/emergency')} className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-all text-left group">
                            <ShieldAlert className="w-8 h-8 text-red-500 mb-3 group-hover:scale-110 transition-transform" />
                            <h4 className="font-bold text-navy-900">Emergency Queue</h4>
                            <p className="text-sm text-gray-500 mt-1">View critical request pipeline</p>
                        </button>
                    </div>

                </div>

                {/* Metrics Sidebar */}
                <div className="space-y-6">
                    <h3 className="font-extrabold text-navy-900 text-2xl tracking-tight mb-4 border-b border-gray-100 pb-2">Real-time Metrics</h3>

                    <MetricCard title="Active Requests" value={metrics.requests} trend={12} subtitle="Total from database" colorClass="text-orange-600" />
                    <MetricCard title="Critical Requests" value={metrics.critical} trend={-5} subtitle="Urgency: Critical" colorClass="text-red-600" />
                    <MetricCard title="Total Resources" value={metrics.resources} trend={22} subtitle="Posted by community" colorClass="text-teal-600" />

                    <button onClick={() => navigate('/map')} className="w-full bg-navy-800 text-white font-bold py-5 rounded-3xl mt-4 shadow-lg hover:bg-navy-900 transition-colors flex items-center justify-center gap-2">
                        View Resource Map <ArrowRight className="w-5 h-5" />
                    </button>
                </div>

            </div>
        </div>
    );
}
