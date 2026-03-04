import { useParams, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { resourceService, requestService } from '../services/api';
import { ArrowLeft, MessageCircle, MapPin, Clock, Zap, CheckCircle } from 'lucide-react';
import VolunteerBadge from '../components/VolunteerBadge';

export default function ResourceDetail() {
    const { user } = useAuth();

    const { id } = useParams();
    const navigate = useNavigate();
    const [resource, setResource] = useState(null);
    const [loading, setLoading] = useState(true);
    const [requested, setRequested] = useState(false);

    useEffect(() => {
        const fetchResource = async () => {
            try {
                const res = await resourceService.getById(id);
                setResource(res.data);
            } catch (err) {
                console.error("Failed to fetch resource", err);
            } finally {
                setLoading(false);
            }
        };
        fetchResource();
    }, [id]);

    const handleRequest = async () => {
        try {
            await requestService.create({
                user_id: user?.id || 1,
                category: resource.category,
                description: `Requesting: ${resource.title}`,
                urgency_level: resource.is_emergency ? 'Critical' : 'Essential'
            });
            setRequested(true);
        } catch (err) {
            console.error("Failed to send request", err);
        }
    };

    if (loading) {
        return (
            <div className="p-8 flex items-center justify-center min-h-[60vh]">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-teal-200 border-t-teal-600 rounded-full animate-spin mx-auto mb-6"></div>
                    <p className="text-gray-500 font-medium text-lg">Loading resource details...</p>
                </div>
            </div>
        );
    }

    if (!resource) {
        return (
            <div className="p-8 flex items-center justify-center min-h-[60vh]">
                <div className="text-center bg-white p-12 rounded-[40px] border border-gray-100 shadow-sm">
                    <h2 className="text-2xl font-extrabold text-navy-900 mb-3">Resource Not Found</h2>
                    <p className="text-gray-500 font-medium mb-6">This resource may have been removed or claimed.</p>
                    <button onClick={() => navigate('/map')} className="bg-teal-600 text-white font-bold px-6 py-3 rounded-full shadow-lg hover:bg-teal-700 transition-all">
                        Browse Resource Map
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="p-8 max-w-4xl mx-auto pb-32">
            <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-navy-800 font-bold hover:text-teal-600 transition-colors mb-8 bg-white px-5 py-2.5 rounded-full shadow-sm border border-gray-100 hover:shadow-md w-fit">
                <ArrowLeft className="w-5 h-5" /> Back
            </button>

            <div className="bg-white rounded-[40px] p-10 md:p-14 border border-gray-100 shadow-[0_10px_40px_-10px_rgba(0,0,0,0.05)] relative overflow-hidden">

                <Zap className="absolute -right-20 -top-20 w-96 h-96 text-gray-50 opacity-50 -rotate-12 pointer-events-none" />

                <div className="relative z-10 flex flex-col md:flex-row justify-between items-start gap-8 mb-10">
                    <div className="space-y-4 max-w-2xl">
                        <div className="flex items-center gap-3 flex-wrap">
                            <span className="inline-block text-sm font-extrabold text-teal-700 bg-teal-50 px-4 py-1.5 rounded-full border border-teal-100 uppercase tracking-widest">{resource.category}</span>
                            <span className={`text-sm font-bold px-3 py-1 rounded-full ${resource.status === 'Available' ? 'bg-green-100 text-green-700 border border-green-200' : resource.status === 'Claimed' ? 'bg-yellow-100 text-yellow-700 border border-yellow-200' : 'bg-gray-100 text-gray-500 border border-gray-200'}`}>
                                {resource.status}
                            </span>
                        </div>
                        <h1 className="text-4xl md:text-5xl font-extrabold text-navy-900 leading-tight tracking-tight">{resource.title}</h1>
                        {resource.is_emergency ? (
                            <span className="inline-flex items-center gap-2 bg-red-50 text-red-700 px-4 py-1.5 rounded-full font-bold text-sm border border-red-200">
                                🚨 Emergency Resource
                            </span>
                        ) : null}
                    </div>
                </div>

                <div className="relative z-10 grid md:grid-cols-2 gap-8 mb-12 border-y border-gray-100 py-10">
                    <div className="space-y-6">
                        <div className="flex items-center gap-4 text-gray-700 font-medium">
                            <div className="bg-gray-50 p-3 rounded-full border border-gray-100"><MapPin className="w-6 h-6 text-teal-500" /></div>
                            <div>
                                <span className="block text-sm text-gray-400 font-bold">Location</span>
                                <span className="text-lg">Approximate (hidden until accepted)</span>
                            </div>
                        </div>
                        <div className="flex items-center gap-4 text-gray-700 font-medium">
                            <div className="bg-gray-50 p-3 rounded-full border border-gray-100"><Clock className="w-6 h-6 text-teal-500" /></div>
                            <div>
                                <span className="block text-sm text-gray-400 font-bold">Availability</span>
                                <span className="text-lg">{resource.availability_duration || 'Not specified'}</span>
                            </div>
                        </div>
                        <div className="flex items-center gap-4 text-gray-700 font-medium">
                            <div className="bg-gray-50 p-3 rounded-full border border-gray-100"><Clock className="w-6 h-6 text-gray-400" /></div>
                            <div>
                                <span className="block text-sm text-gray-400 font-bold">Posted</span>
                                <span className="text-lg">{new Date(resource.created_at).toLocaleString()}</span>
                            </div>
                        </div>
                    </div>

                    <div className="bg-gradient-to-br from-gray-50 to-white rounded-3xl p-6 border border-gray-100 shadow-sm flex flex-col justify-center">
                        <span className="block text-sm text-gray-400 font-bold mb-3 uppercase tracking-wider">Provider Information</span>
                        <div className="flex items-center gap-4 mb-4">
                            <div className="w-14 h-14 bg-teal-600 rounded-full flex items-center justify-center text-white font-bold text-xl shadow-inner">
                                {(resource.provider_name || 'A').charAt(0)}
                            </div>
                            <div>
                                <h3 className="font-bold text-navy-800 text-xl">{resource.provider_name || 'Anonymous'}</h3>
                                <span className="text-sm text-gray-500 font-medium">{resource.provider_role || 'Resident'}</span>
                            </div>
                        </div>
                        <VolunteerBadge score={resource.provider_trust_score || 50} />
                    </div>
                </div>

                <div className="relative z-10 mb-12">
                    <h3 className="font-extrabold text-navy-800 text-2xl mb-4 tracking-tight">Details</h3>
                    <p className="text-lg text-gray-600 leading-relaxed max-w-3xl">{resource.description || 'No additional details provided.'}</p>
                </div>

                <div className="relative z-10 flex flex-col sm:flex-row gap-5">
                    {requested ? (
                        <div className="flex-1 bg-green-50 text-green-700 font-extrabold py-5 px-8 rounded-full border border-green-200 text-xl flex items-center justify-center gap-3">
                            <CheckCircle className="w-7 h-7" /> Request Sent Successfully
                        </div>
                    ) : (
                        <button
                            onClick={handleRequest}
                            disabled={resource.status !== 'Available'}
                            className={`flex-1 font-extrabold py-5 px-8 rounded-full text-xl flex items-center justify-center gap-3 transition-all ${resource.status === 'Available'
                                ? 'bg-teal-600 text-white shadow-[0_8px_30px_rgb(13,148,136,0.3)] hover:bg-teal-700 hover:shadow-[0_12px_40px_rgb(13,148,136,0.4)] hover:-translate-y-1'
                                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                                }`}
                        >
                            Request Help
                        </button>
                    )}

                    <button disabled className="group relative flex-1 bg-gray-100 text-gray-400 font-extrabold py-5 px-8 rounded-full border border-gray-200 cursor-not-allowed flex items-center justify-center gap-3 text-xl transition-all">
                        <MessageCircle className="w-6 h-6" /> Chat

                        <div className="absolute -top-12 opacity-0 group-hover:opacity-100 transition-opacity bg-navy-900 text-white text-xs font-bold py-2 px-4 rounded-xl shadow-lg whitespace-nowrap pointer-events-none">
                            Available after request is accepted
                        </div>
                    </button>
                </div>
            </div>
        </div>
    );
}
