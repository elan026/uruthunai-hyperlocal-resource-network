import { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { requestService } from '../services/api';

export default function EmergencyDashboard() {
    const { emergencyMode, setEmergencyMode } = useAuth();
    const [requests, setRequests] = useState([]);

    useEffect(() => {
        const fetchRequests = async () => {
            try {
                const res = await requestService.getAll();
                setRequests(res.data.filter(r => r.urgency_level === 'Critical' || r.urgency_level === 'Essential'));
            } catch (err) {
                console.error('Error fetching emergency requests', err);
            }
        };
        fetchRequests();
    }, []);

    return (
        <div className="p-4 md:p-8">
            {/* Emergency Banner */}
            <div className="mb-8 overflow-hidden rounded-2xl bg-red-500 text-white shadow-xl shadow-red-500/20">
                <div className="flex flex-col md:flex-row items-center gap-6 p-6 md:p-8">
                    <div className="flex-shrink-0 h-16 w-16 flex items-center justify-center bg-white/20 rounded-full">
                        <span className="material-symbols-outlined text-4xl">flood</span>
                    </div>
                    <div className="flex-1 text-center md:text-left">
                        <h2 className="text-xl sm:text-2xl md:text-3xl font-black mb-2">Flooding Alert: Move to higher ground</h2>
                        <p className="text-white/90 text-sm sm:text-lg">Emergency shelter is now available at <span className="font-bold underline">Adyar Government School</span>. High-priority evacuation for Sector 4 is in progress.</p>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-3">
                        <button className="px-6 py-3 bg-white text-red-500 font-bold rounded-xl hover:bg-slate-100 transition-colors whitespace-nowrap">View Shelters</button>
                        <button className="px-6 py-3 bg-red-600 border-2 border-white/30 text-white font-bold rounded-xl hover:bg-red-700 transition-colors whitespace-nowrap">Broadcast Info</button>
                    </div>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                {[
                    { label: 'Active Requests', value: requests.length || '128', icon: 'priority_high', iconColor: 'text-red-500', trend: '15% from last hour', trendColor: 'text-red-500' },
                    { label: 'Available Volunteers', value: '45', icon: 'person_check', iconColor: 'text-blue-500', trend: 'Sufficient coverage', trendColor: 'text-green-600', trendIcon: 'check_circle' },
                    { label: 'Shelter Capacity', value: '82%', icon: 'home_work', iconColor: 'text-orange-500', trend: 'Near full capacity', trendColor: 'text-orange-500', trendIcon: 'warning' },
                    { label: 'Power Status', value: emergencyMode ? 'OFF' : 'ON', icon: 'bolt', iconColor: 'text-yellow-500', trend: emergencyMode ? 'Grid down in 600020' : 'Grid stable', trendColor: 'text-slate-400', trendIcon: emergencyMode ? 'error' : 'check_circle' },
                ].map((stat, i) => (
                    <div key={i} className="bg-white p-5 rounded-2xl border border-slate-200">
                        <div className="flex justify-between items-start mb-2">
                            <p className="text-sm font-semibold text-slate-500">{stat.label}</p>
                            <span className={`material-symbols-outlined ${stat.iconColor}`}>{stat.icon}</span>
                        </div>
                        <h3 className={`text-3xl font-black ${stat.value === 'OFF' ? 'text-slate-400' : ''}`}>{stat.value}</h3>
                        <div className={`mt-2 flex items-center ${stat.trendColor} text-xs font-bold`}>
                            <span className="material-symbols-outlined text-sm">{stat.trendIcon || 'trending_up'}</span>
                            <span className="ml-1">{stat.trend}</span>
                        </div>
                    </div>
                ))}
            </div>

            {/* Main Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* High Priority Requests */}
                <div className="lg:col-span-2 space-y-4">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-xl font-black flex items-center gap-2">
                            <span className="material-symbols-outlined text-red-500">notification_important</span>
                            High Priority Requests
                        </h2>
                        <button className="text-sm font-bold text-red-500 hover:underline">View All</button>
                    </div>

                    {/* Request Cards */}
                    {requests.length > 0 ? requests.slice(0, 3).map((req, i) => (
                        <div key={req.id} className={`bg-white rounded-2xl p-5 shadow relative overflow-hidden ${i === 0 ? 'border-2 border-red-500 shadow-lg' : 'border-2 border-red-500/40'}`}>
                            {i === 0 && <div className="absolute top-0 right-0 bg-red-500 text-white text-[10px] font-black px-3 py-1 rounded-bl-lg tracking-widest uppercase">Critical</div>}
                            <div className="flex gap-4">
                                <div className={`flex-shrink-0 h-12 w-12 rounded-xl ${i === 0 ? 'bg-red-500/10 text-red-500' : 'bg-blue-500/10 text-blue-500'} flex items-center justify-center`}>
                                    <span className="material-symbols-outlined text-2xl font-bold">{i === 0 ? 'medical_services' : 'water_drop'}</span>
                                </div>
                                <div className="flex-1">
                                    <div className="flex justify-between items-start mb-1">
                                        <h4 className="font-bold text-base sm:text-lg">{req.description?.substring(0, 50) || 'Emergency request'}</h4>
                                        <span className="text-slate-400 text-xs font-medium">{new Date(req.created_at).toLocaleTimeString()}</span>
                                    </div>
                                    <p className="text-slate-600 text-sm mb-4">{req.description || 'Emergency assistance needed in your area.'}</p>
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <span className="bg-slate-100 text-slate-600 text-[10px] font-bold px-2 py-1 rounded">{req.category || 'Supply'}</span>
                                            <span className="bg-slate-100 text-slate-600 text-[10px] font-bold px-2 py-1 rounded">{req.urgency_level}</span>
                                        </div>
                                        <button className="px-4 py-2 bg-red-500 text-white text-xs font-bold rounded-lg hover:bg-red-600 transition-colors">
                                            {i === 0 ? 'Assign Team' : 'Dispatch'}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )) : (
                        /* Static fallback */
                        <>
                            <div className="bg-white rounded-2xl border-2 border-red-500 p-5 shadow-lg relative overflow-hidden">
                                <div className="absolute top-0 right-0 bg-red-500 text-white text-[10px] font-black px-3 py-1 rounded-bl-lg tracking-widest uppercase">Critical</div>
                                <div className="flex gap-4">
                                    <div className="flex-shrink-0 h-12 w-12 rounded-xl bg-red-500/10 flex items-center justify-center text-red-500">
                                        <span className="material-symbols-outlined text-2xl font-bold">medical_services</span>
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex justify-between items-start mb-1">
                                            <h4 className="font-bold text-lg">Elderly medical evacuation needed</h4>
                                            <span className="text-slate-400 text-xs font-medium">2 mins ago</span>
                                        </div>
                                        <p className="text-slate-600 text-sm mb-4">Besant Nagar, 4th Cross St. Water level rising. Requires oxygen cylinder support.</p>
                                        <div className="flex items-center justify-between">
                                            <div className="flex -space-x-2">
                                                <div className="h-8 w-8 rounded-full bg-blue-200 flex items-center justify-center text-blue-700 text-xs font-bold border-2 border-white">K</div>
                                                <div className="h-8 w-8 rounded-full bg-emerald-200 flex items-center justify-center text-emerald-700 text-xs font-bold border-2 border-white">A</div>
                                                <div className="h-8 w-8 rounded-full bg-slate-100 border-2 border-white flex items-center justify-center text-[10px] font-bold">+2</div>
                                            </div>
                                            <button className="px-4 py-2 bg-red-500 text-white text-xs font-bold rounded-lg hover:bg-red-600 transition-colors">Assign Team</button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="bg-white rounded-2xl border-2 border-red-500/40 p-5 shadow relative">
                                <div className="flex gap-4">
                                    <div className="flex-shrink-0 h-12 w-12 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-500">
                                        <span className="material-symbols-outlined text-2xl font-bold">water_drop</span>
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex justify-between items-start mb-1">
                                            <h4 className="font-bold text-lg">Drinking water shortage</h4>
                                            <span className="text-slate-400 text-xs font-medium">10 mins ago</span>
                                        </div>
                                        <p className="text-slate-600 text-sm mb-4">Adyar Community Hall. 50+ people without potable water. Supply requested urgently.</p>
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <span className="bg-slate-100 text-slate-600 text-[10px] font-bold px-2 py-1 rounded">Supply</span>
                                                <span className="bg-slate-100 text-slate-600 text-[10px] font-bold px-2 py-1 rounded">Urgent</span>
                                            </div>
                                            <button className="px-4 py-2 bg-slate-900 text-white text-xs font-bold rounded-lg transition-colors">Dispatch</button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </>
                    )}
                </div>

                {/* Right Sidebar */}
                <div className="space-y-8">
                    {/* Resource Categories */}
                    <div className="bg-white rounded-2xl border border-slate-200 p-5">
                        <h3 className="font-black text-sm uppercase tracking-widest text-slate-500 mb-4">Resource Categories</h3>
                        <div className="grid grid-cols-2 gap-3">
                            {[
                                { icon: 'medical_services', label: 'Medical', color: 'text-red-500', bg: 'bg-red-500/5 border-red-500/10 hover:bg-red-500/10' },
                                { icon: 'home_work', label: 'Shelter', color: 'text-orange-500', bg: 'bg-orange-500/5 border-orange-500/10 hover:bg-orange-500/10' },
                                { icon: 'water_drop', label: 'Water', color: 'text-blue-500', bg: 'bg-blue-500/5 border-blue-500/10 hover:bg-blue-500/10' },
                                { icon: 'bolt', label: 'Power', color: 'text-yellow-500', bg: 'bg-yellow-500/5 border-yellow-500/10 hover:bg-yellow-500/10' },
                            ].map((cat, i) => (
                                <button key={i} className={`flex flex-col items-center justify-center p-4 rounded-xl border transition-colors gap-2 ${cat.bg}`}>
                                    <span className={`material-symbols-outlined text-3xl ${cat.color}`}>{cat.icon}</span>
                                    <span className="text-xs font-bold">{cat.label}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Nearby Volunteers */}
                    <div className="bg-white rounded-2xl border border-slate-200 p-5">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="font-black text-sm uppercase tracking-widest text-slate-500">Nearby Volunteers</h3>
                            <span className="bg-green-100 text-green-700 text-[10px] font-bold px-2 py-0.5 rounded-full">45 Active</span>
                        </div>
                        <div className="space-y-4">
                            {[
                                { name: 'Karthik Raja', role: 'First Aid Specialist • 0.2km', active: true, initial: 'K', bg: 'bg-blue-200 text-blue-700' },
                                { name: 'Ananya S.', role: 'Heavy Vehicle Driver • 0.8km', active: true, initial: 'A', bg: 'bg-emerald-200 text-emerald-700' },
                                { name: 'Priya Mani', role: 'On Mission • 1.4km', active: false, initial: 'P', bg: 'bg-rose-200 text-rose-700' },
                            ].map((vol, i) => (
                                <div key={i} className={`flex items-center gap-3 ${!vol.active ? 'opacity-60' : ''}`}>
                                    <div className="relative">
                                        <div className={`h-10 w-10 rounded-full ${vol.bg} flex items-center justify-center text-sm font-bold`}>{vol.initial}</div>
                                        <span className={`absolute bottom-0 right-0 h-3 w-3 rounded-full ${vol.active ? 'bg-green-500' : 'bg-orange-500'} border-2 border-white`}></span>
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-sm font-bold">{vol.name}</p>
                                        <p className="text-[10px] text-slate-500">{vol.role}</p>
                                    </div>
                                    <button className="material-symbols-outlined text-slate-400 hover:text-red-500">{vol.active ? 'call' : 'chat'}</button>
                                </div>
                            ))}
                        </div>
                        <button className="w-full mt-6 py-2.5 border-2 border-slate-100 text-slate-600 text-xs font-black rounded-xl hover:bg-slate-50 transition-colors">
                            MANAGE VOLUNTEERS
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
