import { useState, useEffect } from 'react';
import { requestService } from '../services/api';
import { ShieldAlert, Zap } from 'lucide-react';
import RequestCard from '../components/RequestCard';
import EmergencyBanner from '../components/EmergencyBanner';

export default function EmergencyDashboard() {
    const [requests, setRequests] = useState([]);

    useEffect(() => {
        const fetchRequests = async () => {
            try {
                const res = await requestService.getAll();
                // Filter only Critical requests for emergency view
                setRequests(res.data.filter(r => r.urgency_level === 'Critical'));
            } catch (err) {
                console.error("Failed to fetch emergency requests", err);
            }
        };
        fetchRequests();
    }, []);

    return (
        <div className="p-8 bg-red-50/20 min-h-full">
            <EmergencyBanner message="WIDESPREAD FLOODING ALERT: Move to higher ground immediately. Top responders activated. Stay indoors if not in active flood zones." />

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 mt-10">
                {/* Left: High Priority Queue */}
                <div className="xl:col-span-2 space-y-10">
                    <section>
                        <div className="flex items-center justify-between mb-6 pb-4 border-b border-red-200">
                            <h2 className="text-3xl font-extrabold text-red-900 tracking-tight flex items-center gap-3">
                                <ShieldAlert className="h-8 w-8 text-red-600" /> High Priority Queue
                            </h2>
                            <span className="bg-red-600 text-white font-bold px-4 py-1.5 rounded-full text-sm shadow-md animate-pulse">{requests.length} Critical</span>
                        </div>
                        <div className="space-y-4">
                            {requests.length > 0 ? requests.map(req => (
                                <RequestCard key={req.id} request={{ ...req, time: new Date(req.created_at).toLocaleTimeString(), type: req.category, urgency: req.urgency_level }} isEmergency={true} />
                            )) : (
                                <div className="bg-white rounded-3xl p-10 text-center border border-red-100">
                                    <p className="text-gray-500 font-medium text-lg">No critical requests at this time.</p>
                                </div>
                            )}
                        </div>
                    </section>
                </div>

                {/* Right: Volunteer Availability & Urgent Categories */}
                <div className="space-y-8">
                    <div className="bg-gradient-to-br from-red-600 to-red-800 rounded-[32px] p-8 shadow-xl border border-red-500 text-white relative overflow-hidden">
                        <div className="absolute -right-8 -top-8 opacity-20"><Zap className="w-48 h-48" /></div>

                        <h3 className="font-extrabold text-white text-xl mb-4 tracking-tight z-10 relative leading-tight">Emergency Responder Availability</h3>

                        <div className="flex items-baseline gap-2 mb-8 z-10 relative">
                            <span className="text-7xl font-black tracking-tighter text-white drop-shadow-md">11</span>
                            <span className="text-red-200 font-bold text-lg">on standby</span>
                        </div>

                        <div className="space-y-3 z-10 relative">
                            <button className="w-full bg-white text-red-800 font-extrabold py-4 rounded-xl shadow-[0_4px_20px_rgb(0,0,0,0.2)] hover:bg-gray-50 transition-all hover:scale-105">
                                Ping All Responders
                            </button>
                            <p className="text-xs text-red-200 font-medium text-center">Notifies top tier volunteers via SMS bypass.</p>
                        </div>
                    </div>

                    <div className="bg-white rounded-[32px] p-8 shadow-sm border border-red-100">
                        <h3 className="font-extrabold text-navy-900 text-xl mb-6 tracking-tight">Critical Needs Deficit</h3>
                        <div className="space-y-5">
                            <div className="flex justify-between items-center bg-red-50 p-4 rounded-2xl border border-red-100">
                                <div className="font-bold text-red-900">Medical Kits</div>
                                <div className="text-xl font-black text-red-600">-12</div>
                            </div>
                            <div className="flex justify-between items-center bg-red-50 p-4 rounded-2xl border border-red-100">
                                <div className="font-bold text-red-900">Evac Boats</div>
                                <div className="text-xl font-black text-red-600">-3</div>
                            </div>
                            <div className="flex justify-between items-center bg-orange-50 p-4 rounded-2xl border border-orange-100">
                                <div className="font-bold text-orange-900">Drinking Water</div>
                                <div className="text-xl font-black text-orange-600">-45L</div>
                            </div>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}
