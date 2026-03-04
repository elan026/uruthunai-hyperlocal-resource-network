import { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { authService } from '../services/api';
import { Heart, Package, MapPin, Edit3 } from 'lucide-react';
import VolunteerBadge from '../components/VolunteerBadge';

export default function Profile() {
    const { user } = useAuth();
    const [profile, setProfile] = useState(null);

    useEffect(() => {
        const fetchProfile = async () => {
            if (!user?.id) return;
            try {
                const res = await authService.getProfile(user.id);
                setProfile(res.data);
            } catch (err) {
                console.error("Failed to fetch profile", err);
                // Fallback to user prop
                setProfile(user);
            }
        };
        fetchProfile();
    }, [user]);

    const p = profile || user || { name: 'Anitha M.', area_code: 'CHN-ADY-01', trust_score: 50 };

    return (
        <div className="p-8 max-w-5xl mx-auto pb-32">

            {/* Header / Top Card */}
            <div className="bg-white rounded-[40px] p-10 mt-12 border border-gray-100 shadow-[0_10px_40px_-10px_rgba(0,0,0,0.05)] relative z-10 flex flex-col md:flex-row items-center gap-10">
                <div className="relative">
                    <div className="w-40 h-40 bg-gradient-to-tr from-teal-400 to-blue-500 rounded-full flex items-center justify-center text-white text-6xl font-black shadow-xl ring-8 ring-white -mt-24">
                        {p.name ? p.name.charAt(0) : 'U'}
                    </div>
                    <button className="absolute bottom-0 right-0 bg-navy-900 p-3 rounded-full text-white shadow-lg border-2 border-white hover:bg-black transition-colors">
                        <Edit3 className="w-5 h-5" />
                    </button>
                </div>

                <div className="flex-1 text-center md:text-left">
                    <h1 className="text-4xl font-extrabold text-navy-900 tracking-tight leading-none mb-3">{p.name}</h1>
                    <div className="flex flex-col md:flex-row items-center gap-4">
                        <div className="flex items-center gap-2 text-gray-500 font-bold bg-gray-50 px-4 py-2 rounded-full border border-gray-200">
                            <MapPin className="w-4 h-4 text-teal-600" /> {p.area_code}
                        </div>
                        <VolunteerBadge score={p.trust_score || 50} />
                    </div>
                    <div className="mt-4 flex gap-6 text-center md:text-left">
                        <div>
                            <span className="text-3xl font-black text-navy-900">{p.resources_posted || 0}</span>
                            <span className="block text-sm text-gray-500 font-bold">Resources Posted</span>
                        </div>
                        <div>
                            <span className="text-3xl font-black text-navy-900">{p.requests_fulfilled || 0}</span>
                            <span className="block text-sm text-gray-500 font-bold">Requests Fulfilled</span>
                        </div>
                    </div>
                </div>

            </div>

            {/* Split Content */}
            <div className="grid md:grid-cols-2 gap-8 mt-10">
                {/* Left: Resources Shared */}
                <div className="bg-white p-8 rounded-[40px] border border-gray-100 shadow-sm">
                    <h3 className="text-2xl font-extrabold text-navy-900 tracking-tight mb-8 flex items-center gap-3">
                        <Package className="w-7 h-7 text-teal-500" /> Resources Shared
                    </h3>

                    <div className="space-y-4">
                        <div className="p-5 border border-gray-100 rounded-2xl bg-gray-50 hover:bg-white hover:shadow-md transition-all flex items-center justify-between">
                            <div>
                                <h4 className="font-bold text-gray-900 text-lg leading-tight">Extra Water Bottles</h4>
                                <p className="text-sm text-gray-500 mt-1 font-medium">Shared with 2 neighbors</p>
                            </div>
                            <span className="text-sm font-bold bg-green-100 text-green-700 px-3 py-1 rounded-full">Completed</span>
                        </div>
                        <div className="p-5 border border-gray-100 rounded-2xl bg-gray-50 hover:bg-white hover:shadow-md transition-all flex items-center justify-between">
                            <div>
                                <h4 className="font-bold text-gray-900 text-lg leading-tight">Power Bank</h4>
                                <p className="text-sm text-gray-500 mt-1 font-medium">Currently active</p>
                            </div>
                            <span className="text-sm font-bold bg-blue-100 text-blue-700 px-3 py-1 rounded-full">Active</span>
                        </div>
                    </div>
                </div>

                {/* Right: Requests Fulfilled */}
                <div className="bg-white p-8 rounded-[40px] border border-gray-100 shadow-sm">
                    <h3 className="text-2xl font-extrabold text-navy-900 tracking-tight mb-8 flex items-center gap-3">
                        <Heart className="w-7 h-7 text-orange-500" /> Requests Fulfilled
                    </h3>

                    <div className="space-y-4">
                        <div className="p-5 border border-gray-100 rounded-2xl bg-orange-50/30 border-orange-100 hover:shadow-md transition-all flex items-center justify-between">
                            <div>
                                <h4 className="font-bold text-gray-900 text-lg leading-tight">Transport for Senior Citizen</h4>
                                <p className="text-sm text-gray-500 mt-1 font-medium">Dec 12, Cyclone Michaung</p>
                            </div>
                            <span className="text-2xl">🏆</span>
                        </div>
                        <div className="p-5 border border-gray-100 rounded-2xl bg-gray-50 hover:bg-white hover:shadow-md transition-all flex items-center justify-between">
                            <div>
                                <h4 className="font-bold text-gray-900 text-lg leading-tight">Delivered Paracetamol</h4>
                                <p className="text-sm text-gray-500 mt-1 font-medium">Aug 05, Medical Emergency</p>
                            </div>
                            <span className="text-2xl">⭐️</span>
                        </div>
                    </div>
                </div>
            </div>

        </div>
    );
}
