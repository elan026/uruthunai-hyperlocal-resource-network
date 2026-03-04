import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { resourceService, requestService } from '../services/api';
import ResourceCard from '../components/ResourceCard';
import RequestCard from '../components/RequestCard';
import { ArrowRight, Activity, Bell, Package, HelpCircle } from 'lucide-react';

export default function Dashboard() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [resources, setResources] = useState([]);
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [resRes, reqRes] = await Promise.all([
                    resourceService.getAll(),
                    requestService.getAll()
                ]);
                setResources(resRes.data.slice(0, 4));
                setRequests(reqRes.data.slice(0, 4));
            } catch (err) {
                console.error("Error fetching dashboard data", err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    return (
        <div className="p-8 pt-10">
            {/* Welcome */}
            <div className="mb-10">
                <h1 className="text-3xl font-extrabold text-navy-900 tracking-tight">
                    Welcome back, <span className="text-teal-600">{user?.name || 'Neighbor'}</span>
                </h1>
                <p className="text-gray-500 font-medium mt-1 text-lg">Here's what's happening in your area right now.</p>
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">

                {/* Left/Main Column */}
                <div className="xl:col-span-2 space-y-10">

                    {/* Active Requests Summary */}
                    <section>
                        <div className="flex items-center justify-between mb-6 border-b border-gray-200 pb-4">
                            <h2 className="text-2xl font-extrabold text-navy-900 tracking-tight flex items-center gap-3">
                                <Activity className="h-6 w-6 text-orange-500" /> Active Requests
                            </h2>
                            <button onClick={() => navigate('/request-resource')} className="text-sm font-bold text-teal-600 hover:text-teal-700 flex items-center gap-1 group">
                                View all requests <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                            </button>
                        </div>

                        {loading ? (
                            <div className="grid md:grid-cols-2 gap-5">
                                {[1, 2].map(i => (
                                    <div key={i} className="h-40 bg-gray-100 animate-pulse rounded-2xl"></div>
                                ))}
                            </div>
                        ) : requests.length > 0 ? (
                            <div className="grid md:grid-cols-2 gap-5">
                                {requests.map(req => (
                                    <RequestCard key={req.id} request={{ ...req, time: new Date(req.created_at).toLocaleTimeString(), type: req.category, urgency: req.urgency_level }} isEmergency={req.urgency_level === 'Critical'} />
                                ))}
                            </div>
                        ) : (
                            <div className="bg-white p-10 rounded-2xl border border-gray-100 text-center">
                                <HelpCircle className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                                <p className="text-gray-500 font-medium">No active requests in your area.</p>
                                <button onClick={() => navigate('/request-resource')} className="mt-4 text-teal-600 font-bold hover:text-teal-700 underline">
                                    Submit a new request
                                </button>
                            </div>
                        )}
                    </section>

                    {/* Resources Overview */}
                    <section>
                        <div className="flex items-center justify-between mb-6 border-b border-gray-200 pb-4">
                            <h2 className="text-2xl font-extrabold text-navy-900 tracking-tight flex items-center gap-3">
                                <Bell className="h-6 w-6 text-teal-500" /> Nearby Resources
                            </h2>
                            <button onClick={() => navigate('/map')} className="text-sm font-bold text-teal-600 hover:text-teal-700 flex items-center gap-1 group">
                                View resource map <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                            </button>
                        </div>

                        {loading ? (
                            <div className="space-y-4">
                                {[1, 2, 3].map(i => (
                                    <div key={i} className="h-28 bg-gray-100 animate-pulse rounded-2xl"></div>
                                ))}
                            </div>
                        ) : resources.length > 0 ? (
                            <div className="space-y-4">
                                {resources.map(res => (
                                    <ResourceCard key={res.id} resource={{ ...res, time: new Date(res.created_at).toLocaleTimeString() }} />
                                ))}
                            </div>
                        ) : (
                            <div className="bg-white p-10 rounded-2xl border border-gray-100 text-center">
                                <Package className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                                <p className="text-gray-500 font-medium">No resources posted yet.</p>
                                <button onClick={() => navigate('/post-resource')} className="mt-4 text-teal-600 font-bold hover:text-teal-700 underline">
                                    Post a resource
                                </button>
                            </div>
                        )}
                    </section>
                </div>

                {/* Right Panel: Announcements & Alerts */}
                <div className="space-y-8">
                    <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
                        <h3 className="font-extrabold text-gray-900 text-lg mb-6 tracking-tight flex items-center gap-2">
                            <Bell className="w-5 h-5 text-teal-500" /> Community Announcements
                        </h3>
                        <div className="space-y-5">
                            <div className="relative pl-6 border-l-2 border-teal-200">
                                <span className="absolute -left-[5px] top-1.5 w-2 h-2 rounded-full bg-teal-500 ring-4 ring-white"></span>
                                <h4 className="font-bold text-gray-800">Water Supply Alert</h4>
                                <p className="text-sm text-gray-500 mt-1">Municipal water supply expected to resume by 6 PM today.</p>
                                <span className="text-xs font-bold text-gray-400 mt-2 block">2 hours ago</span>
                            </div>
                            <div className="relative pl-6 border-l-2 border-orange-200">
                                <span className="absolute -left-[5px] top-1.5 w-2 h-2 rounded-full bg-orange-500 ring-4 ring-white"></span>
                                <h4 className="font-bold text-gray-800">Volunteer Briefing</h4>
                                <p className="text-sm text-gray-500 mt-1">All area volunteers please gather at Community Center at 4 PM.</p>
                                <span className="text-xs font-bold text-gray-400 mt-2 block">4 hours ago</span>
                            </div>
                        </div>
                        <button onClick={() => navigate('/alerts')} className="w-full mt-6 text-sm font-bold text-teal-600 hover:text-teal-700 flex items-center justify-center gap-1 group py-2 border-t border-gray-100 pt-4">
                            View all alerts <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                        </button>
                    </div>

                    <div className="bg-gradient-to-br from-navy-800 to-navy-900 rounded-3xl p-6 shadow-lg border border-navy-700 text-white relative overflow-hidden">
                        <div className="absolute -right-10 -bottom-10 opacity-10 blur-sm pointer-events-none">
                            <div className="w-32 h-32 rounded-full border-8 border-teal-500"></div>
                            <div className="w-48 h-48 rounded-full border-8 border-teal-500 absolute -top-8 -left-8"></div>
                        </div>

                        <h3 className="font-extrabold text-white text-lg mb-4 tracking-tight z-10 relative">Volunteer Availability</h3>
                        <div className="flex items-end gap-3 mb-6 z-10 relative">
                            <span className="text-5xl font-black tracking-tighter">24</span>
                            <span className="text-teal-400 font-bold mb-1">Active Now</span>
                        </div>
                        <button onClick={() => navigate('/volunteers')} className="w-full bg-teal-500 text-white font-bold py-3 rounded-xl shadow-md hover:bg-teal-400 transition-colors z-10 relative border border-teal-400/50">
                            View Volunteer Network
                        </button>
                    </div>
                </div>

            </div>
        </div>
    );
}
