import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useAuth } from '../../hooks/useAuth';
import { Link } from 'react-router-dom';

const API = 'http://localhost:5000/api/admin';

export default function AdminDashboard() {
    const { adminToken } = useAuth();
    const [stats, setStats] = useState(null);
    const [users, setUsers] = useState([]);
    const [activity, setActivity] = useState([]);
    const [health, setHealth] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activePanel, setActivePanel] = useState('overview');
    const [selectedUser, setSelectedUser] = useState(null);
    const [userDetail, setUserDetail] = useState(null);
    const [userFilter, setUserFilter] = useState('');
    const [refreshKey, setRefreshKey] = useState(0);

    const config = { headers: { Authorization: `Bearer ${adminToken}` } };

    const refresh = useCallback(() => setRefreshKey(k => k + 1), []);

    useEffect(() => {
        if (!adminToken) return;
        const load = async () => {
            setLoading(true);
            try {
                const [statsRes, usersRes, actRes, healthRes] = await Promise.all([
                    axios.get(`${API}/dashboard`, config),
                    axios.get(`${API}/users`, config),
                    axios.get(`${API}/activity`, config),
                    axios.get(`${API}/health`, config),
                ]);
                setStats(statsRes.data);
                setUsers(usersRes.data);
                setActivity(actRes.data);
                setHealth(healthRes.data);
            } catch (e) {
                console.error('Admin fetch failed', e);
            } finally {
                setLoading(false);
            }
        };
        load();
        const interval = setInterval(load, 30000); // Auto-refresh every 30s
        return () => clearInterval(interval);
    }, [adminToken, refreshKey]);

    const loadUserDetail = async (userId) => {
        try {
            const res = await axios.get(`${API}/users/${userId}`, config);
            setUserDetail(res.data);
            setSelectedUser(userId);
        } catch (e) {
            console.error('Failed to load user detail', e);
        }
    };

    const handleTrustChange = async (userId, delta) => {
        try {
            await axios.patch(`${API}/users/${userId}/trust`, { delta }, config);
            refresh();
            if (selectedUser === userId) loadUserDetail(userId);
        } catch (e) { console.error(e); }
    };

    const handleBan = async (userId) => {
        if (!window.confirm('Ban this user? They will lose all trust and access.')) return;
        try {
            await axios.post(`${API}/users/${userId}/ban`, {}, config);
            refresh();
            if (selectedUser === userId) loadUserDetail(userId);
        } catch (e) { console.error(e); }
    };

    const handleUnban = async (userId) => {
        try {
            await axios.post(`${API}/users/${userId}/unban`, {}, config);
            refresh();
            if (selectedUser === userId) loadUserDetail(userId);
        } catch (e) { console.error(e); }
    };

    const filteredUsers = users.filter(u =>
        u.role !== 'admin' && (
            u.name?.toLowerCase().includes(userFilter.toLowerCase()) ||
            u.phone_number?.includes(userFilter) ||
            u.area_code?.toLowerCase().includes(userFilter.toLowerCase())
        )
    );

    const formatTime = (ts) => {
        if (!ts) return '—';
        const d = new Date(ts);
        const now = new Date();
        const diffMs = now - d;
        const diffMin = Math.floor(diffMs / 60000);
        if (diffMin < 1) return 'Just now';
        if (diffMin < 60) return `${diffMin}m ago`;
        const diffH = Math.floor(diffMin / 60);
        if (diffH < 24) return `${diffH}h ago`;
        return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' });
    };

    const formatUptime = (seconds) => {
        const h = Math.floor(seconds / 3600);
        const m = Math.floor((seconds % 3600) / 60);
        return `${h}h ${m}m`;
    };

    if (loading && !stats) return (
        <div className="p-8 flex items-center justify-center min-h-[60vh]">
            <div className="text-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-3"></div>
                <p className="text-slate-500 text-sm font-bold">Loading system data...</p></div>
        </div>
    );

    const panels = [
        { id: 'overview', label: 'Overview', icon: 'monitoring' },
        { id: 'users', label: 'Users', icon: 'group' },
        { id: 'activity', label: 'Activity Log', icon: 'history' },
        { id: 'system', label: 'System', icon: 'dns' },
    ];

    return (
        <div className="p-6 pb-32">
            <div className="max-w-[1400px] mx-auto">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h1 className="text-2xl font-black text-slate-900 tracking-tight">System Control Center</h1>
                        <p className="text-xs text-slate-500 mt-0.5">Last refreshed: {new Date().toLocaleTimeString()}</p>
                    </div>
                    <button onClick={refresh} className="px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-600 hover:bg-slate-50 flex items-center gap-1.5 transition-colors">
                        <span className="material-symbols-outlined text-sm">refresh</span> Refresh
                    </button>
                </div>

                {/* Sub-nav */}
                <div className="flex gap-1 bg-white border border-slate-200 rounded-xl p-1 mb-6 w-fit max-w-full overflow-x-auto">
                    {panels.map(p => (
                        <button key={p.id} onClick={() => setActivePanel(p.id)}
                            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${activePanel === p.id ? 'bg-slate-900 text-white shadow-sm' : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'
                                }`}>
                            <span className="material-symbols-outlined text-sm">{p.icon}</span> {p.label}
                        </button>
                    ))}
                </div>

                {/* ═══════════ OVERVIEW ═══════════ */}
                {activePanel === 'overview' && stats && (
                    <div className="space-y-6">
                        {/* Stat Grid */}
                        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3">
                            {[
                                { label: 'Users', value: stats.users, icon: 'group', sub: `${stats.verifiedUsers} verified` },
                                { label: 'Open Requests', value: stats.requests, icon: 'assignment_late', color: 'text-amber-600', sub: `${stats.fulfilledRequests} fulfilled` },
                                { label: 'Resources', value: stats.resources, icon: 'inventory_2', color: 'text-emerald-600', sub: `${stats.claimedResources} claimed` },
                                { label: 'Pending Flags', value: stats.reports, icon: 'flag', color: stats.reports > 0 ? 'text-red-600' : 'text-slate-400', sub: 'Reports' },
                                { label: 'Pending Verify', value: stats.pendingVerifications, icon: 'how_to_reg', color: stats.pendingVerifications > 0 ? 'text-blue-600' : 'text-slate-400', sub: 'Requests' },
                            ].map((s, i) => (
                                <div key={i} className="bg-white border border-slate-200 rounded-xl p-4">
                                    <div className="flex items-center justify-between mb-2">
                                        <span className={`material-symbols-outlined text-lg ${s.color || 'text-slate-400'}`}>{s.icon}</span>
                                        <span className="text-[10px] font-bold text-slate-400 uppercase">{s.sub}</span>
                                    </div>
                                    <h3 className={`text-3xl font-black tracking-tight ${s.color || 'text-slate-900'}`}>{s.value}</h3>
                                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mt-1">{s.label}</p>
                                </div>
                            ))}
                        </div>

                        {/* Quick Links */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                            <Link to="/admin/moderation" className="bg-white border border-slate-200 rounded-xl p-4 hover:border-slate-300 transition-colors flex items-center gap-4 group">
                                <div className="h-10 w-10 rounded-lg bg-red-50 flex items-center justify-center text-red-500 shrink-0">
                                    <span className="material-symbols-outlined">gavel</span>
                                </div>
                                <div className="min-w-0">
                                    <h3 className="text-sm font-bold text-slate-900 group-hover:text-primary transition-colors">Moderation Queue</h3>
                                    <p className="text-[10px] text-slate-500 truncate">{stats.reports} pending flag{stats.reports !== 1 ? 's' : ''}</p>
                                </div>
                                <span className="material-symbols-outlined text-slate-300 ml-auto text-sm">chevron_right</span>
                            </Link>
                            <Link to="/admin/verification" className="bg-white border border-slate-200 rounded-xl p-4 hover:border-slate-300 transition-colors flex items-center gap-4 group">
                                <div className="h-10 w-10 rounded-lg bg-blue-50 flex items-center justify-center text-blue-500 shrink-0">
                                    <span className="material-symbols-outlined">verified_user</span>
                                </div>
                                <div className="min-w-0">
                                    <h3 className="text-sm font-bold text-slate-900 group-hover:text-primary transition-colors">User Verification</h3>
                                    <p className="text-[10px] text-slate-500 truncate">{stats.pendingVerifications} pending</p>
                                </div>
                                <span className="material-symbols-outlined text-slate-300 ml-auto text-sm">chevron_right</span>
                            </Link>
                            <Link to="/admin/emergency" className="bg-white border border-red-200 rounded-xl p-4 hover:border-red-300 transition-colors flex items-center gap-4 group">
                                <div className="h-10 w-10 rounded-lg bg-red-50 flex items-center justify-center text-red-500 shrink-0">
                                    <span className="material-symbols-outlined">emergency</span>
                                </div>
                                <div className="min-w-0">
                                    <h3 className="text-sm font-bold text-slate-900 group-hover:text-red-600 transition-colors">Emergency Controls</h3>
                                    <p className="text-[10px] text-slate-500 truncate">{stats.activeAlerts} active alert{stats.activeAlerts !== 1 ? 's' : ''}</p>
                                </div>
                                <span className="material-symbols-outlined text-slate-300 ml-auto text-sm">chevron_right</span>
                            </Link>
                        </div>

                        {/* Recent Activity Table */}
                        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
                            <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
                                <h3 className="text-sm font-bold text-slate-900">Recent Activity</h3>
                                <button onClick={() => setActivePanel('activity')} className="text-[10px] font-bold text-primary">View All →</button>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full text-xs">
                                    <thead>
                                        <tr className="bg-slate-50 text-left">
                                            <th className="px-4 py-2 font-bold text-slate-500 uppercase tracking-wider">Type</th>
                                            <th className="px-4 py-2 font-bold text-slate-500 uppercase tracking-wider">Detail</th>
                                            <th className="px-4 py-2 font-bold text-slate-500 uppercase tracking-wider">User</th>
                                            <th className="px-4 py-2 font-bold text-slate-500 uppercase tracking-wider">Status</th>
                                            <th className="px-4 py-2 font-bold text-slate-500 uppercase tracking-wider">Time</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {activity.slice(0, 10).map((a, i) => (
                                            <tr key={i} className="border-t border-slate-50 hover:bg-slate-50/50">
                                                <td className="px-4 py-2.5">
                                                    <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase ${a.event_type === 'resource' ? 'bg-emerald-100 text-emerald-700' :
                                                        a.event_type === 'request' ? 'bg-amber-100 text-amber-700' :
                                                            'bg-red-100 text-red-700'
                                                        }`}>{a.event_type}</span>
                                                </td>
                                                <td className="px-4 py-2.5 font-medium text-slate-800 max-w-[200px] truncate">{a.detail}</td>
                                                <td className="px-4 py-2.5 text-slate-600">{a.user_name}</td>
                                                <td className="px-4 py-2.5">
                                                    <span className={`text-[10px] font-bold ${a.status === 'Available' || a.status === 'Open' ? 'text-emerald-600' :
                                                        a.status === 'Pending' ? 'text-amber-600' : 'text-slate-400'
                                                        }`}>{a.status}</span>
                                                </td>
                                                <td className="px-4 py-2.5 text-slate-400">{formatTime(a.created_at)}</td>
                                            </tr>
                                        ))}
                                        {activity.length === 0 && (
                                            <tr><td colSpan={5} className="text-center py-8 text-slate-400">No activity recorded yet.</td></tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                )}

                {/* ═══════════ USERS ═══════════ */}
                {activePanel === 'users' && (
                    <div className="flex flex-col lg:flex-row gap-6">
                        {/* User List */}
                        <div className={`${selectedUser ? 'w-full lg:w-1/2' : 'w-full'} transition-all`}>
                            <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
                                <div className="px-4 py-3 border-b border-slate-100 flex items-center gap-3">
                                    <span className="material-symbols-outlined text-slate-400 text-lg">search</span>
                                    <input type="text" placeholder="Search by name, phone, or area..."
                                        value={userFilter} onChange={e => setUserFilter(e.target.value)}
                                        className="flex-1 text-sm bg-transparent focus:outline-none font-medium placeholder:text-slate-300" />
                                    <span className="text-[10px] font-bold text-slate-400 bg-slate-100 px-2 py-1 rounded">{filteredUsers.length} users</span>
                                </div>
                                <div className="overflow-x-auto max-h-[calc(100vh-260px)] overflow-y-auto">
                                    <table className="w-full text-xs">
                                        <thead className="sticky top-0 bg-slate-50 z-10">
                                            <tr className="text-left">
                                                <th className="px-4 py-2 font-bold text-slate-500 uppercase tracking-wider">User</th>
                                                <th className="px-4 py-2 font-bold text-slate-500 uppercase tracking-wider">Area</th>
                                                <th className="px-4 py-2 font-bold text-slate-500 uppercase tracking-wider">Type</th>
                                                <th className="px-4 py-2 font-bold text-slate-500 uppercase tracking-wider">Trust</th>
                                                <th className="px-4 py-2 font-bold text-slate-500 uppercase tracking-wider">Status</th>
                                                <th className="px-4 py-2 font-bold text-slate-500 uppercase tracking-wider">Joined</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {filteredUsers.map(u => (
                                                <tr key={u.id} onClick={() => loadUserDetail(u.id)}
                                                    className={`border-t border-slate-50 cursor-pointer transition-colors ${selectedUser === u.id ? 'bg-primary/5' : 'hover:bg-slate-50'
                                                        }`}>
                                                    <td className="px-4 py-2.5">
                                                        <div className="flex items-center gap-2">
                                                            <div className="h-7 w-7 rounded-lg bg-slate-200 text-slate-600 flex items-center justify-center font-bold text-[10px] shrink-0">
                                                                {u.name?.charAt(0) || '?'}
                                                            </div>
                                                            <div className="min-w-0">
                                                                <p className="font-bold text-slate-800 truncate">{u.name || 'Unnamed'}</p>
                                                                <p className="text-[10px] text-slate-400">{u.phone_number}</p>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-4 py-2.5 text-slate-600 truncate max-w-[100px]">{u.area_code || '—'}</td>
                                                    <td className="px-4 py-2.5"><span className="px-1.5 py-0.5 bg-slate-100 rounded text-[9px] font-bold uppercase text-slate-500">{u.user_type}</span></td>
                                                    <td className="px-4 py-2.5">
                                                        <div className="flex items-center gap-1.5">
                                                            <div className="h-1.5 w-12 bg-slate-100 rounded-full overflow-hidden">
                                                                <div className={`h-full rounded-full ${u.trust_score >= 70 ? 'bg-emerald-500' : u.trust_score >= 40 ? 'bg-amber-500' : 'bg-red-500'}`}
                                                                    style={{ width: `${u.trust_score}%` }}></div>
                                                            </div>
                                                            <span className="text-[10px] font-bold text-slate-500">{u.trust_score}</span>
                                                        </div>
                                                    </td>
                                                    <td className="px-4 py-2.5">
                                                        <span className={`text-[9px] font-bold uppercase tracking-wider ${u.verification_status === 'verified' ? 'text-emerald-600' :
                                                            u.verification_status === 'banned' ? 'text-red-600' : 'text-slate-400'
                                                            }`}>{u.verification_status}</span>
                                                    </td>
                                                    <td className="px-4 py-2.5 text-slate-400">{formatTime(u.created_at)}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>

                        {/* User Detail Panel */}
                        {selectedUser && userDetail && (
                            <div className="w-full lg:w-1/2">
                                <div className="bg-white border border-slate-200 rounded-xl overflow-hidden sticky top-4">
                                    <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between bg-slate-50">
                                        <h3 className="text-sm font-bold text-slate-900">User #{userDetail.id} — {userDetail.name}</h3>
                                        <button onClick={() => { setSelectedUser(null); setUserDetail(null); }} className="text-slate-400 hover:text-slate-600">
                                            <span className="material-symbols-outlined text-sm">close</span>
                                        </button>
                                    </div>
                                    <div className="p-4 space-y-4 max-h-[calc(100vh-300px)] overflow-y-auto">
                                        {/* Summary */}
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                                            <div className="bg-slate-50 p-3 rounded-lg"><span className="text-slate-400 block text-[10px] font-bold uppercase mb-1">Phone</span>{userDetail.phone_number}</div>
                                            <div className="bg-slate-50 p-3 rounded-lg"><span className="text-slate-400 block text-[10px] font-bold uppercase mb-1">Area</span>{userDetail.area_code || '—'}</div>
                                            <div className="bg-slate-50 p-3 rounded-lg"><span className="text-slate-400 block text-[10px] font-bold uppercase mb-1">Type</span>{userDetail.user_type}</div>
                                            <div className="bg-slate-50 p-3 rounded-lg"><span className="text-slate-400 block text-[10px] font-bold uppercase mb-1">Trust Score</span>
                                                <span className={`font-bold ${userDetail.trust_score >= 70 ? 'text-emerald-600' : userDetail.trust_score >= 40 ? 'text-amber-600' : 'text-red-600'}`}>{userDetail.trust_score}/100</span>
                                            </div>
                                        </div>

                                        {/* Actions */}
                                        <div className="flex gap-2 flex-wrap">
                                            <button onClick={() => handleTrustChange(userDetail.id, 10)} className="px-3 py-1.5 bg-emerald-50 text-emerald-700 text-[10px] font-bold rounded-lg border border-emerald-200 hover:bg-emerald-100">+10 Trust</button>
                                            <button onClick={() => handleTrustChange(userDetail.id, -10)} className="px-3 py-1.5 bg-amber-50 text-amber-700 text-[10px] font-bold rounded-lg border border-amber-200 hover:bg-amber-100">-10 Trust</button>
                                            {userDetail.verification_status === 'banned' ? (
                                                <button onClick={() => handleUnban(userDetail.id)} className="px-3 py-1.5 bg-blue-50 text-blue-700 text-[10px] font-bold rounded-lg border border-blue-200 hover:bg-blue-100">Unban</button>
                                            ) : (
                                                <button onClick={() => handleBan(userDetail.id)} className="px-3 py-1.5 bg-red-50 text-red-700 text-[10px] font-bold rounded-lg border border-red-200 hover:bg-red-100">Ban User</button>
                                            )}
                                        </div>

                                        {/* Resources */}
                                        <div>
                                            <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Resources ({userDetail.resources?.length || 0})</h4>
                                            {userDetail.resources?.length > 0 ? (
                                                <div className="space-y-1.5">
                                                    {userDetail.resources.map(r => (
                                                        <div key={r.id} className="flex items-center justify-between bg-slate-50 px-3 py-2 rounded-lg text-xs">
                                                            <span className="font-medium text-slate-700 truncate max-w-[180px]">{r.title}</span>
                                                            <span className={`text-[9px] font-bold ${r.status === 'Available' ? 'text-emerald-600' : 'text-slate-400'}`}>{r.status}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            ) : <p className="text-[10px] text-slate-400">No resources posted.</p>}
                                        </div>

                                        {/* Requests */}
                                        <div>
                                            <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Requests ({userDetail.requests?.length || 0})</h4>
                                            {userDetail.requests?.length > 0 ? (
                                                <div className="space-y-1.5">
                                                    {userDetail.requests.map(r => (
                                                        <div key={r.id} className="flex items-center justify-between bg-slate-50 px-3 py-2 rounded-lg text-xs">
                                                            <span className="font-medium text-slate-700 truncate max-w-[180px]">{r.description}</span>
                                                            <span className={`text-[9px] font-bold ${r.status === 'Open' ? 'text-amber-600' : r.status === 'Fulfilled' ? 'text-emerald-600' : 'text-slate-400'}`}>{r.status}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            ) : <p className="text-[10px] text-slate-400">No requests made.</p>}
                                        </div>

                                        {/* Reports against */}
                                        <div>
                                            <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Reports Against ({userDetail.reports?.length || 0})</h4>
                                            {userDetail.reports?.length > 0 ? (
                                                <div className="space-y-1.5">
                                                    {userDetail.reports.map(r => (
                                                        <div key={r.id} className="flex items-center justify-between bg-red-50 px-3 py-2 rounded-lg text-xs">
                                                            <span className="font-medium text-red-700 truncate max-w-[180px]">{r.reason}</span>
                                                            <span className={`text-[9px] font-bold ${r.status === 'Pending' ? 'text-red-600' : 'text-slate-400'}`}>{r.status}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            ) : <p className="text-[10px] text-slate-400">No reports against this user.</p>}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* ═══════════ ACTIVITY LOG ═══════════ */}
                {activePanel === 'activity' && (
                    <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
                        <div className="px-4 py-3 border-b border-slate-100">
                            <h3 className="text-sm font-bold text-slate-900">Full Activity Log</h3>
                            <p className="text-[10px] text-slate-500">Last 50 events across resources, requests, and reports.</p>
                        </div>
                        <div className="overflow-x-auto max-h-[calc(100vh-260px)] overflow-y-auto">
                            <table className="w-full text-xs">
                                <thead className="sticky top-0 bg-slate-50 z-10">
                                    <tr className="text-left">
                                        <th className="px-4 py-2 font-bold text-slate-500 uppercase tracking-wider w-20">Type</th>
                                        <th className="px-4 py-2 font-bold text-slate-500 uppercase tracking-wider">Detail</th>
                                        <th className="px-4 py-2 font-bold text-slate-500 uppercase tracking-wider">Category</th>
                                        <th className="px-4 py-2 font-bold text-slate-500 uppercase tracking-wider">User</th>
                                        <th className="px-4 py-2 font-bold text-slate-500 uppercase tracking-wider">Status</th>
                                        <th className="px-4 py-2 font-bold text-slate-500 uppercase tracking-wider">Time</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {activity.map((a, i) => (
                                        <tr key={i} className="border-t border-slate-50 hover:bg-slate-50/50">
                                            <td className="px-4 py-2.5">
                                                <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase ${a.event_type === 'resource' ? 'bg-emerald-100 text-emerald-700' :
                                                    a.event_type === 'request' ? 'bg-amber-100 text-amber-700' :
                                                        'bg-red-100 text-red-700'
                                                    }`}>{a.event_type}</span>
                                            </td>
                                            <td className="px-4 py-2.5 font-medium text-slate-800 max-w-[250px] truncate">{a.detail}</td>
                                            <td className="px-4 py-2.5 text-slate-500">{a.category}</td>
                                            <td className="px-4 py-2.5">
                                                <button onClick={() => { loadUserDetail(a.user_id); setActivePanel('users'); }}
                                                    className="text-primary font-bold hover:underline">{a.user_name}</button>
                                            </td>
                                            <td className="px-4 py-2.5">
                                                <span className={`text-[10px] font-bold ${['Available', 'Open'].includes(a.status) ? 'text-emerald-600' :
                                                    a.status === 'Pending' ? 'text-amber-600' :
                                                        ['Fulfilled', 'Claimed'].includes(a.status) ? 'text-blue-600' : 'text-slate-400'
                                                    }`}>{a.status}</span>
                                            </td>
                                            <td className="px-4 py-2.5 text-slate-400 whitespace-nowrap">{formatTime(a.created_at)}</td>
                                        </tr>
                                    ))}
                                    {activity.length === 0 && (
                                        <tr><td colSpan={6} className="text-center py-12 text-slate-400">No activity recorded.</td></tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* ═══════════ SYSTEM ═══════════ */}
                {activePanel === 'system' && health && (
                    <div className="space-y-6">
                        {/* Health Indicators */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                            <div className="bg-white border border-slate-200 rounded-xl p-4">
                                <div className="flex items-center gap-3 mb-3">
                                    <span className={`h-3 w-3 rounded-full ${health.database === 'healthy' ? 'bg-emerald-500' : 'bg-red-500'}`}></span>
                                    <h4 className="text-sm font-bold text-slate-900">Database</h4>
                                </div>
                                <p className="text-xs text-slate-500">{health.database === 'healthy' ? 'MySQL connection pool active' : 'Connection issues detected'}</p>
                            </div>
                            <div className="bg-white border border-slate-200 rounded-xl p-4">
                                <div className="flex items-center gap-3 mb-3">
                                    <span className="h-3 w-3 rounded-full bg-emerald-500"></span>
                                    <h4 className="text-sm font-bold text-slate-900">Server Uptime</h4>
                                </div>
                                <p className="text-xl font-black text-slate-900">{formatUptime(health.uptime)}</p>
                            </div>
                            <div className="bg-white border border-slate-200 rounded-xl p-4">
                                <div className="flex items-center gap-3 mb-3">
                                    <span className="h-3 w-3 rounded-full bg-emerald-500"></span>
                                    <h4 className="text-sm font-bold text-slate-900">Memory</h4>
                                </div>
                                <p className="text-xl font-black text-slate-900">{Math.round(health.memoryUsage?.heapUsed / 1024 / 1024)}MB</p>
                                <p className="text-[10px] text-slate-500">of {Math.round(health.memoryUsage?.heapTotal / 1024 / 1024)}MB allocated</p>
                            </div>
                        </div>

                        {/* DB Tables */}
                        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
                            <div className="px-4 py-3 border-b border-slate-100">
                                <h3 className="text-sm font-bold text-slate-900">Database Tables</h3>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full text-xs">
                                    <thead>
                                        <tr className="bg-slate-50 text-left">
                                            <th className="px-4 py-2 font-bold text-slate-500 uppercase tracking-wider">Table</th>
                                            <th className="px-4 py-2 font-bold text-slate-500 uppercase tracking-wider">Rows (approx)</th>
                                            <th className="px-4 py-2 font-bold text-slate-500 uppercase tracking-wider">Size</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {health.tables?.map((t, i) => (
                                            <tr key={i} className="border-t border-slate-50">
                                                <td className="px-4 py-2.5 font-bold text-slate-800 font-mono">{t.TABLE_NAME || t.table_name}</td>
                                                <td className="px-4 py-2.5 text-slate-600">{t.TABLE_ROWS || t.table_rows || 0}</td>
                                                <td className="px-4 py-2.5 text-slate-600">{t.data_kb || 0} KB</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
