import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../hooks/useAuth';

export default function AdminModeration() {
    const { adminToken } = useAuth();
    const [reports, setReports] = useState([]);

    const fetchReports = async () => {
        try {
            const res = await axios.get('http://localhost:5000/api/admin/reports', {
                headers: { Authorization: `Bearer ${adminToken}` }
            });
            setReports(res.data);
        } catch (error) {
            console.error('Failed to fetch reports', error);
        }
    };

    useEffect(() => {
        if (adminToken) fetchReports();
    }, [adminToken]);

    const handleModerate = async (reportId, action, reportedUserId) => {
        try {
            await axios.post('http://localhost:5000/api/admin/reports/moderate', {
                reportId, action, reportedUserId
            }, { headers: { Authorization: `Bearer ${adminToken}` } });

            setReports(prev => prev.filter(r => r.id !== reportId));
        } catch (error) {
            console.error('Moderation action failed', error);
        }
    };

    return (
        <div className="p-4 sm:p-8 pb-32 max-w-5xl mx-auto">
            <div className="mb-8">
                <h1 className="text-3xl font-black text-slate-900 tracking-tight">Incident & Moderation System</h1>
                <p className="text-slate-500 mt-1">Review flagged community reports and manage user suspensions.</p>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col min-h-[400px]">
                <div className="px-6 py-4 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
                    <h3 className="font-black text-slate-900 flex items-center gap-2">
                        <span className="material-symbols-outlined text-rose-500">security</span>
                        Moderation Queue
                    </h3>
                    <span className="text-xs font-bold bg-rose-100 text-rose-700 px-2 py-1 rounded-full">{reports.length} Cases</span>
                </div>
                <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
                    {reports.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center text-center py-20 border-2 border-dashed border-slate-200 rounded-2xl bg-white mt-4">
                            <div className="w-24 h-24 bg-emerald-50 rounded-full flex items-center justify-center mb-6 shadow-inner border border-emerald-100">
                                <span className="material-symbols-outlined text-[60px] text-emerald-500">playlist_add_check</span>
                            </div>
                            <h3 className="font-black text-slate-800 text-2xl mb-2">Queue Empty</h3>
                            <p className="text-slate-500 font-medium text-lg mb-8 max-w-sm">No flagged content requiring review at this time.</p>
                            <button onClick={fetchReports} className="bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-800 px-8 py-4 rounded-xl font-bold transition-colors flex items-center gap-2">
                                <span className="material-symbols-outlined text-lg">refresh</span>
                                Refresh Queue
                            </button>
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
                                    className="flex-1 py-2 rounded-lg text-xs font-bold bg-white border border-slate-300 text-slate-700 hover:bg-slate-100 transition-colors"
                                >
                                    Dismiss Report
                                </button>
                                <button
                                    onClick={() => handleModerate(report.id, 'suspend', report.reported_user_id)}
                                    className="flex-1 py-2 rounded-lg text-xs font-bold bg-rose-600 text-white hover:bg-rose-700 shadow-sm transition-colors"
                                >
                                    Suspend Component/User
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
