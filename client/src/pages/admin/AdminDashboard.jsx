import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../hooks/useAuth';

export default function AdminDashboard() {
    const { adminToken } = useAuth();
    const [stats, setStats] = useState({ users: 0, requests: 0, resources: 0, reports: 0 });
    const [reports, setReports] = useState([]);
    const [verifications, setVerifications] = useState([]);
    const [emergencyMode, setEmergencyMode] = useState(false);

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                const config = {
                    headers: { Authorization: `Bearer ${adminToken}` }
                };
                const [statRes, reportRes, verifyRes, emerRes] = await Promise.all([
                    axios.get('http://localhost:5000/api/admin/dashboard', config),
                    axios.get('http://localhost:5000/api/admin/reports', config),
                    axios.get('http://localhost:5000/api/admin/verifications', config),
                    axios.get('http://localhost:5000/api/admin/emergency', config)
                ]);

                setStats(statRes.data);
                setReports(reportRes.data);
                setVerifications(verifyRes.data);
                setEmergencyMode(emerRes.data.isEmergency);
            } catch (error) {
                console.error('Failed to fetch admin data', error);
            }
        };

        if (adminToken) {
            fetchDashboardData();
        }
    }, [adminToken]);

    const handleVerification = async (reqId, userId, newType, status) => {
        try {
            await axios.post('http://localhost:5000/api/admin/verifications/process', {
                reqId, userId, newType, status
            }, { headers: { Authorization: `Bearer ${adminToken}` } });

            // update UI locally
            setVerifications(prev => prev.filter(v => v.id !== reqId));
        } catch (error) {
            console.error('Verification update failed');
        }
    };

    const handleModerate = async (reportId, action, reportedUserId) => {
        try {
            await axios.post('http://localhost:5000/api/admin/reports/moderate', {
                reportId, action, reportedUserId
            }, { headers: { Authorization: `Bearer ${adminToken}` } });

            // update UI locally
            setReports(prev => prev.filter(r => r.id !== reportId));
            setStats(prev => ({ ...prev, reports: prev.reports - 1 }));
        } catch (error) {
            console.error('Moderation action failed');
        }
    };

    const toggleEmergency = async () => {
        try {
            const newState = !emergencyMode;
            await axios.post('http://localhost:5000/api/admin/emergency', {
                active: newState
            }, { headers: { Authorization: `Bearer ${adminToken}` } });
            setEmergencyMode(newState);
        } catch (error) {
            console.error('Failed to toggle emergency mode');
        }
    };

    return (
        <div className="p-8 space-y-8 pb-32">
            {/* Top Stat Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-white rounded-2xl p-6 border-l-4 border-primary shadow-sm flex items-center gap-4">
                    <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                        <span className="material-symbols-outlined">group</span>
                    </div>
                    <div>
                        <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Users</p>
                        <h3 className="text-2xl font-black text-slate-900">{stats.users}</h3>
                    </div>
                </div>
                <div className="bg-white rounded-2xl p-6 border-l-4 border-amber-500 shadow-sm flex items-center gap-4">
                    <div className="h-12 w-12 rounded-full bg-amber-100 flex items-center justify-center text-amber-600">
                        <span className="material-symbols-outlined">assignment_late</span>
                    </div>
                    <div>
                        <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Open Requests</p>
                        <h3 className="text-2xl font-black text-slate-900">{stats.requests}</h3>
                    </div>
                </div>
                <div className="bg-white rounded-2xl p-6 border-l-4 border-emerald-500 shadow-sm flex items-center gap-4">
                    <div className="h-12 w-12 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600">
                        <span className="material-symbols-outlined">local_hospital</span>
                    </div>
                    <div>
                        <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Resources Avail</p>
                        <h3 className="text-2xl font-black text-slate-900">{stats.resources}</h3>
                    </div>
                </div>
                <div className="bg-white rounded-2xl p-6 border-l-4 border-rose-500 shadow-sm flex items-center gap-4 relative overflow-hidden">
                    <div className="h-12 w-12 rounded-full bg-rose-100 flex items-center justify-center text-rose-600">
                        <span className="material-symbols-outlined">gavel</span>
                    </div>
                    <div>
                        <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Pending Reports</p>
                        <h3 className="text-2xl font-black text-rose-600">{stats.reports}</h3>
                    </div>
                </div>
            </div>

            {/* Emergency Mode Toggle */}
            <div className={`rounded-2xl p-6 border-2 transition-colors flex items-center justify-between shadow-md ${emergencyMode ? 'bg-red-50 border-red-500' : 'bg-white border-slate-200'}`}>
                <div className="flex items-center gap-4">
                    <span className={`material-symbols-outlined text-4xl ${emergencyMode ? 'text-red-500 animate-pulse' : 'text-slate-400'}`}>warning</span>
                    <div>
                        <h3 className="text-lg font-black text-slate-900">System Emergency Mode</h3>
                        <p className="text-sm text-slate-500">Activates critical disaster response mode platform-wide.</p>
                    </div>
                </div>
                <button
                    onClick={toggleEmergency}
                    className={`px-6 py-3 rounded-xl font-bold text-white transition-all ${emergencyMode ? 'bg-slate-900 hover:bg-slate-800' : 'bg-red-600 hover:bg-red-700 shadow-lg shadow-red-500/30'}`}
                >
                    {emergencyMode ? 'DEACTIVATE EMERGENCY' : 'ACTIVATE EMERGENCY'}
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Moderation Queue */}
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col h-[500px]">
                    <div className="px-6 py-4 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
                        <h3 className="font-black text-slate-900 flex items-center gap-2">
                            <span className="material-symbols-outlined text-rose-500">security</span>
                            Moderation Queue
                        </h3>
                        <span className="text-xs font-bold bg-rose-100 text-rose-700 px-2 py-1 rounded-full">{reports.length} Cases</span>
                    </div>
                    <div className="flex-1 overflow-y-auto p-6 space-y-4">
                        {reports.length === 0 ? (
                            <div className="h-full flex flex-col items-center justify-center text-slate-400">
                                <span className="material-symbols-outlined text-4xl mb-2">done_all</span>
                                <p className="font-bold">No pending reports!</p>
                            </div>
                        ) : reports.map(report => (
                            <div key={report.id} className="border border-slate-200 rounded-xl p-4 bg-slate-50">
                                <div className="flex justify-between items-start mb-2">
                                    <h4 className="font-bold text-sm text-slate-900">Target: {report.reported_user_name || 'Listing'}</h4>
                                    <span className="text-xs text-rose-500 font-bold bg-rose-100 px-2 py-0.5 rounded">Flagged</span>
                                </div>
                                <p className="text-xs text-slate-600 mb-4 bg-white p-3 rounded-lg border border-slate-200">
                                    <span className="font-bold">Reason:</span> {report.reason}
                                </p>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => handleModerate(report.id, 'dismiss', report.reported_user_id)}
                                        className="flex-1 py-1.5 rounded-lg text-xs font-bold bg-white border border-slate-300 text-slate-700 hover:bg-slate-100"
                                    >
                                        Dismiss
                                    </button>
                                    <button
                                        onClick={() => handleModerate(report.id, 'suspend', report.reported_user_id)}
                                        className="flex-1 py-1.5 rounded-lg text-xs font-bold bg-rose-600 text-white hover:bg-rose-700 shadow-sm"
                                    >
                                        Suspend User
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Verification Requests */}
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col h-[500px]">
                    <div className="px-6 py-4 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
                        <h3 className="font-black text-slate-900 flex items-center gap-2">
                            <span className="material-symbols-outlined text-primary">verified_user</span>
                            Role Verifications
                        </h3>
                        <span className="text-xs font-bold bg-primary/10 text-primary px-2 py-1 rounded-full">{verifications.length} Pending</span>
                    </div>
                    <div className="flex-1 overflow-y-auto p-6 space-y-4">
                        {verifications.length === 0 ? (
                            <div className="h-full flex flex-col items-center justify-center text-slate-400">
                                <span className="material-symbols-outlined text-4xl mb-2">verified</span>
                                <p className="font-bold">All users verified!</p>
                            </div>
                        ) : verifications.map(req => (
                            <div key={req.id} className="border border-slate-200 rounded-xl p-4 bg-white shadow-sm flex flex-col sm:flex-row justify-between items-center gap-4">
                                <div>
                                    <h4 className="font-bold text-sm text-slate-900">{req.user_name}</h4>
                                    <p className="text-xs text-slate-500 mb-1">Score: {req.trust_score}</p>
                                    <span className="text-xs font-bold bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded">
                                        Req: {req.requested_role}
                                    </span>
                                </div>
                                <div className="flex flex-col gap-2 w-full sm:w-auto">
                                    <button
                                        onClick={() => handleVerification(req.id, req.user_id, req.requested_role, 'Approved')}
                                        className="w-full sm:w-auto px-4 py-1.5 rounded-lg text-xs font-bold bg-slate-900 text-white hover:bg-slate-800"
                                    >
                                        Verify & Approve
                                    </button>
                                    <button
                                        onClick={() => handleVerification(req.id, req.user_id, null, 'Rejected')}
                                        className="w-full sm:w-auto px-4 py-1.5 rounded-lg text-xs font-bold bg-white border border-slate-200 text-rose-600 hover:bg-slate-50"
                                    >
                                        Reject
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
