import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../hooks/useAuth';
import { Link } from 'react-router-dom';

export default function AdminDashboard() {
    const { adminToken } = useAuth();
    const [stats, setStats] = useState({ users: 0, requests: 0, resources: 0, reports: 0 });

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                const config = {
                    headers: { Authorization: `Bearer ${adminToken}` }
                };
                const statRes = await axios.get('http://localhost:5000/api/admin/dashboard', config);
                setStats(statRes.data);
            } catch (error) {
                console.error('Failed to fetch admin stats', error);
            }
        };

        if (adminToken) {
            fetchDashboardData();
        }
    }, [adminToken]);

    return (
        <div className="p-8 space-y-8 pb-32 max-w-7xl mx-auto">
            <div className="mb-2">
                <h1 className="text-3xl font-black text-slate-900 tracking-tight">System Control Center</h1>
                <p className="text-slate-500 mt-1">High-level overview of network health and active operations.</p>
            </div>

            {/* Top Stat Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200 relative overflow-hidden group">
                    <div className="flex justify-between items-start mb-4">
                        <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                            <span className="material-symbols-outlined material-symbols-outlined-filled text-2xl">group</span>
                        </div>
                    </div>
                    <div>
                        <h3 className="text-4xl font-black text-slate-900 tracking-tight">{stats.users}</h3>
                        <p className="text-sm font-bold text-slate-500 mt-1">Total Active Nodes</p>
                    </div>
                    <div className="absolute right-0 bottom-0 opacity-[0.03] scale-[4] translate-x-1/4 translate-y-1/4 pointer-events-none text-primary">
                        <span className="material-symbols-outlined material-symbols-outlined-filled">group</span>
                    </div>
                </div>

                <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200 relative overflow-hidden group">
                    <div className="flex justify-between items-start mb-4">
                        <div className="h-12 w-12 rounded-2xl bg-amber-100 flex items-center justify-center text-amber-600 group-hover:scale-110 transition-transform">
                            <span className="material-symbols-outlined material-symbols-outlined-filled text-2xl">assignment_late</span>
                        </div>
                    </div>
                    <div>
                        <h3 className="text-4xl font-black text-slate-900 tracking-tight">{stats.requests}</h3>
                        <p className="text-sm font-bold text-slate-500 mt-1">Open Help Requests</p>
                    </div>
                    <div className="absolute right-0 bottom-0 opacity-[0.03] scale-[4] translate-x-1/4 translate-y-1/4 pointer-events-none text-amber-600">
                        <span className="material-symbols-outlined material-symbols-outlined-filled">assignment_late</span>
                    </div>
                </div>

                <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200 relative overflow-hidden group">
                    <div className="flex justify-between items-start mb-4">
                        <div className="h-12 w-12 rounded-2xl bg-emerald-100 flex items-center justify-center text-emerald-600 group-hover:scale-110 transition-transform">
                            <span className="material-symbols-outlined material-symbols-outlined-filled text-2xl">local_hospital</span>
                        </div>
                    </div>
                    <div>
                        <h3 className="text-4xl font-black text-slate-900 tracking-tight">{stats.resources}</h3>
                        <p className="text-sm font-bold text-slate-500 mt-1">Resources Deployed</p>
                    </div>
                    <div className="absolute right-0 bottom-0 opacity-[0.03] scale-[4] translate-x-1/4 translate-y-1/4 pointer-events-none text-emerald-600">
                        <span className="material-symbols-outlined material-symbols-outlined-filled">local_hospital</span>
                    </div>
                </div>

                <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200 relative overflow-hidden group">
                    <div className="flex justify-between items-start mb-4">
                        <div className="h-12 w-12 rounded-2xl bg-rose-100 flex items-center justify-center text-rose-600 group-hover:scale-110 transition-transform">
                            <span className="material-symbols-outlined material-symbols-outlined-filled text-2xl">gavel</span>
                        </div>
                    </div>
                    <div>
                        <h3 className="text-4xl font-black text-rose-600 tracking-tight">{stats.reports}</h3>
                        <p className="text-sm font-bold text-slate-500 mt-1">Pending Flags</p>
                    </div>
                    <div className="absolute right-0 bottom-0 opacity-[0.03] scale-[4] translate-x-1/4 translate-y-1/4 pointer-events-none text-rose-600">
                        <span className="material-symbols-outlined material-symbols-outlined-filled">gavel</span>
                    </div>
                </div>
            </div>

            {/* Quick Access Grid */}
            <div className="mt-12">
                <h2 className="text-xl font-black text-slate-900 mb-6">Quick Actions</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <Link to="/admin/moderation" className="bg-slate-900 text-white rounded-3xl p-8 hover:-translate-y-1 hover:shadow-xl hover:shadow-slate-900/20 transition-all group overflow-hidden relative">
                        <span className="material-symbols-outlined material-symbols-outlined-filled text-4xl mb-4 group-hover:scale-110 transition-transform text-rose-400">security</span>
                        <h3 className="text-xl font-black mb-2 relative z-10">Moderation Queue</h3>
                        <p className="text-sm text-slate-400 font-medium relative z-10">Review flagged users and ensure community safety.</p>
                        <span className="material-symbols-outlined absolute right-6 bottom-6 opacity-0 group-hover:opacity-100 group-hover:translate-x-2 transition-all">arrow_forward</span>
                    </Link>

                    <Link to="/admin/verification" className="bg-slate-900 text-white rounded-3xl p-8 hover:-translate-y-1 hover:shadow-xl hover:shadow-slate-900/20 transition-all group overflow-hidden relative">
                        <span className="material-symbols-outlined material-symbols-outlined-filled text-4xl mb-4 group-hover:scale-110 transition-transform text-blue-400">verified_user</span>
                        <h3 className="text-xl font-black mb-2 relative z-10">Identity Verification</h3>
                        <p className="text-sm text-slate-400 font-medium relative z-10">Approve or reject role upgrade requests for trusted members.</p>
                        <span className="material-symbols-outlined absolute right-6 bottom-6 opacity-0 group-hover:opacity-100 group-hover:translate-x-2 transition-all">arrow_forward</span>
                    </Link>

                    <Link to="/admin/emergency" className="bg-red-600 text-white rounded-3xl p-8 hover:-translate-y-1 hover:shadow-xl hover:shadow-red-600/30 transition-all group overflow-hidden relative">
                        <span className="material-symbols-outlined material-symbols-outlined-filled text-4xl mb-4 group-hover:scale-110 transition-transform opacity-90">mode_heat</span>
                        <h3 className="text-xl font-black mb-2 relative z-10">Emergency Override</h3>
                        <p className="text-sm text-red-200 font-medium relative z-10">Access platform-wide crisis management and alert systems.</p>
                        <span className="material-symbols-outlined absolute right-6 bottom-6 opacity-0 group-hover:opacity-100 group-hover:translate-x-2 transition-all">arrow_forward</span>
                    </Link>
                </div>
            </div>
        </div>
    );
}
