import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../hooks/useAuth';

export default function AdminVerification() {
    const { adminToken } = useAuth();
    const [verifications, setVerifications] = useState([]);

    useEffect(() => {
        const fetchVerifications = async () => {
            try {
                const res = await axios.get('http://localhost:5000/api/admin/verifications', {
                    headers: { Authorization: `Bearer ${adminToken}` }
                });
                setVerifications(res.data);
            } catch (error) {
                console.error('Failed to fetch verification data', error);
            }
        };

        if (adminToken) fetchVerifications();
    }, [adminToken]);

    const handleVerification = async (reqId, userId, newType, status) => {
        try {
            await axios.post('http://localhost:5000/api/admin/verifications/process', {
                reqId, userId, newType, status
            }, { headers: { Authorization: `Bearer ${adminToken}` } });

            setVerifications(prev => prev.filter(v => v.id !== reqId));
        } catch (error) {
            console.error('Verification update failed', error);
        }
    };

    return (
        <div className="p-4 sm:p-8 pb-32 max-w-5xl mx-auto">
            <div className="mb-8">
                <h1 className="text-3xl font-black text-slate-900 tracking-tight">Identity & Role Verification</h1>
                <p className="text-slate-500 mt-1">Review user roles, volunteers, and organizational requests to maintain system trust.</p>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col min-h-[400px]">
                <div className="px-6 py-4 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
                    <h3 className="font-black text-slate-900 flex items-center gap-2">
                        <span className="material-symbols-outlined text-primary">verified_user</span>
                        Verification Requests Queue
                    </h3>
                    <span className="text-xs font-bold bg-primary/10 text-primary px-2 py-1 rounded-full">{verifications.length} Pending</span>
                </div>
                <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
                    {verifications.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center text-slate-400 py-12">
                            <span className="material-symbols-outlined text-4xl mb-2">verified</span>
                            <p className="font-bold">All users verified!</p>
                        </div>
                    ) : verifications.map(req => (
                        <div key={req.id} className="border border-slate-200 rounded-xl p-4 sm:p-5 bg-white shadow-sm flex flex-col sm:flex-row justify-between items-center gap-6">
                            <div className="flex-1">
                                <div className="flex items-center gap-3 mb-1">
                                    <h4 className="font-black text-base text-slate-900">{req.user_name}</h4>
                                    <span className="text-xs font-bold bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">Score: {req.trust_score}%</span>
                                </div>
                                <p className="text-sm text-slate-500 mb-2">Requests an upgrade to their community operational role.</p>
                                <span className="text-xs font-bold bg-emerald-100 border border-emerald-200 text-emerald-700 px-3 py-1 rounded-full inline-block">
                                    Requested Role: {req.requested_role}
                                </span>
                            </div>
                            <div className="flex flex-col gap-2 w-full sm:w-48 shrink-0">
                                <button
                                    onClick={() => handleVerification(req.id, req.user_id, req.requested_role, 'Approved')}
                                    className="w-full px-4 py-2 rounded-lg text-sm font-bold bg-slate-900 text-white hover:bg-slate-800 transition-colors"
                                >
                                    Verify & Approve
                                </button>
                                <button
                                    onClick={() => handleVerification(req.id, req.user_id, null, 'Rejected')}
                                    className="w-full px-4 py-2 rounded-lg text-sm font-bold bg-white border border-slate-200 text-rose-600 hover:bg-slate-50 transition-colors"
                                >
                                    Reject Application
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
