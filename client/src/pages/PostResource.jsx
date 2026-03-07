import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { resourceService } from '../services/api';

export default function PostResource() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        category: 'Medical Supplies',
        title: '',
        description: '',
        availability: 'Next 24 hours',
        emergencyFlag: false
    });

    const categories = ['Medical Supplies', 'Emergency Shelter', 'Food & Water', 'Clothing & Bedding', 'Rescue Tools', 'Other'];

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const dataToSubmit = {
                user_id: user?.id || 1,
                category: formData.category,
                title: formData.title,
                description: formData.description,
                availability_duration: formData.availability,
                is_emergency: formData.emergencyFlag
            };

            // Capture precise location right at the moment of posting
            if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(
                    async (position) => {
                        dataToSubmit.location_lat = position.coords.latitude;
                        dataToSubmit.location_lng = position.coords.longitude;
                        await resourceService.create(dataToSubmit);
                        navigate('/dashboard');
                    },
                    async (error) => {
                        console.error("Location error, continuing without precise location", error);
                        dataToSubmit.location_lat = 13.0827;
                        dataToSubmit.location_lng = 80.2707;
                        await resourceService.create(dataToSubmit);
                        navigate('/dashboard');
                    }
                );
            } else {
                dataToSubmit.location_lat = 13.0827;
                dataToSubmit.location_lng = 80.2707;
                await resourceService.create(dataToSubmit);
                navigate('/dashboard');
            }

        } catch (err) {
            console.error('Error posting resource', err);
        }
    };

    return (
        <div className="p-8">
            <div className="max-w-6xl mx-auto">
                <div className="mb-8">
                    <h2 className="text-3xl font-black tracking-tight text-slate-900">Post a New Resource</h2>
                    <p className="text-slate-500 mt-2">Provide accurate details to help those in need quickly.</p>
                </div>

                <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                    {/* Form Section */}
                    <form onSubmit={handleSubmit} className="xl:col-span-2 space-y-6">
                        <div className="bg-white rounded-xl p-8 shadow-sm border border-slate-200">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="col-span-1">
                                    <label className="block text-sm font-bold text-slate-700 mb-2">Resource Category</label>
                                    <select
                                        value={formData.category}
                                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                        className="w-full bg-slate-50 border-slate-200 rounded-lg p-3 text-sm focus:ring-primary focus:border-primary"
                                    >
                                        {categories.map(c => <option key={c} value={c}>{c}</option>)}
                                    </select>
                                </div>
                                <div className="col-span-1">
                                    <label className="block text-sm font-bold text-slate-700 mb-2">Resource Title</label>
                                    <input
                                        type="text"
                                        placeholder="e.g., 20 Hygiene Kits"
                                        value={formData.title}
                                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                        className="w-full bg-slate-50 border-slate-200 rounded-lg p-3 text-sm focus:ring-primary focus:border-primary"
                                        required
                                    />
                                </div>
                                <div className="col-span-2">
                                    <label className="block text-sm font-bold text-slate-700 mb-2">Description</label>
                                    <textarea
                                        rows="4"
                                        placeholder="Describe the resource, quantity, and specific instructions..."
                                        value={formData.description}
                                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                        className="w-full bg-slate-50 border-slate-200 rounded-lg p-3 text-sm focus:ring-primary focus:border-primary resize-none"
                                        required
                                    />
                                </div>
                                <div className="col-span-1">
                                    <label className="block text-sm font-bold text-slate-700 mb-2">Availability Duration</label>
                                    <select
                                        value={formData.availability}
                                        onChange={(e) => setFormData({ ...formData, availability: e.target.value })}
                                        className="w-full bg-slate-50 border-slate-200 rounded-lg p-3 text-sm focus:ring-primary focus:border-primary"
                                    >
                                        <option>Next 12 hours</option>
                                        <option>Next 24 hours</option>
                                        <option>Next 48 hours</option>
                                        <option>Until claimed</option>
                                        <option>Indefinite</option>
                                    </select>
                                </div>
                                <div className="col-span-1 flex items-end pb-3">
                                    <label className="inline-flex items-center cursor-pointer gap-3">
                                        <input
                                            type="checkbox"
                                            checked={formData.emergencyFlag}
                                            onChange={(e) => setFormData({ ...formData, emergencyFlag: e.target.checked })}
                                            className="sr-only peer"
                                        />
                                        <div className="relative w-11 h-6 bg-slate-200 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-500"></div>
                                        <span className="text-sm font-bold text-slate-700">Emergency Flag (High Priority)</span>
                                    </label>
                                </div>
                            </div>
                        </div>

                        {/* Location Section */}
                        <div className="bg-white rounded-xl p-8 shadow-sm border border-slate-200">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-lg font-bold">Auto-detected Location</h3>
                                <div className="flex items-center gap-2 text-primary">
                                    <span className="material-symbols-outlined text-sm">my_location</span>
                                    <span className="text-xs font-bold uppercase tracking-wider">GPS Active</span>
                                </div>
                            </div>
                            <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg mb-4 border border-slate-100">
                                <span className="material-symbols-outlined text-slate-400">location_on</span>
                                <p className="text-sm font-medium">{user?.area_code || 'Anna Nagar, Chennai - 600040'}</p>
                            </div>
                            <div className="h-48 rounded-lg overflow-hidden border border-slate-200 relative bg-gradient-to-br from-primary/5 to-blue-50 flex items-center justify-center">
                                <div className="text-center">
                                    <span className="material-symbols-outlined text-4xl text-slate-300">map</span>
                                    <p className="text-xs text-slate-400 mt-2">Your broadcast radius</p>
                                </div>
                                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                    <div className="size-8 bg-primary/40 rounded-full flex items-center justify-center border-2 border-primary">
                                        <div className="size-2 bg-primary rounded-full"></div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 border-t border-slate-200 pt-8 pb-4">
                            <button type="button" className="w-full sm:w-auto px-8 py-4 bg-slate-200 text-slate-700 font-bold rounded-xl hover:bg-slate-300 transition-all">
                                Save as Draft
                            </button>
                            <button type="submit" className="w-full sm:w-auto px-12 py-4 bg-primary text-white font-black rounded-xl shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-3">
                                <span className="material-symbols-outlined">send</span>
                                Publish Resource
                            </button>
                        </div>
                    </form>

                    {/* Preview Sidebar */}
                    <div className="space-y-6">
                        <h3 className="text-lg font-bold flex items-center gap-2 px-2">
                            <span className="material-symbols-outlined">visibility</span>
                            Live Preview
                        </h3>
                        <div className="sticky top-0">
                            <div className="bg-white rounded-xl overflow-hidden shadow-xl border-2 border-primary/30">
                                <div className="h-32 bg-primary/10 relative flex items-center justify-center">
                                    <div className="absolute top-4 right-4 bg-white px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest text-primary border border-primary/20">
                                        Available
                                    </div>
                                    <span className="material-symbols-outlined text-primary text-5xl opacity-40">medical_services</span>
                                </div>
                                <div className="p-6">
                                    <div className="flex items-center gap-2 mb-2">
                                        <span className="px-2 py-0.5 bg-slate-100 text-[10px] font-bold rounded text-slate-500 uppercase">{formData.category}</span>
                                        <span className="flex items-center gap-1 text-[10px] font-bold text-slate-400">
                                            <span className="material-symbols-outlined text-[12px]">schedule</span>
                                            {formData.availability}
                                        </span>
                                    </div>
                                    <h4 className="text-xl font-bold mb-2">{formData.title || 'Resource Title Preview'}</h4>
                                    <p className="text-sm text-slate-500 mb-6 line-clamp-3">
                                        {formData.description || 'Your description will appear here as you type. Provide clear details about what you\'re offering and how people can collect it.'}
                                    </p>
                                    <div className="flex items-center gap-4 py-4 border-t border-slate-100">
                                        <div className="size-8 rounded-full bg-primary/20 flex items-center justify-center text-primary text-xs font-bold">
                                            {user?.name?.charAt(0) || 'U'}
                                        </div>
                                        <div>
                                            <p className="text-xs font-bold leading-none">{user?.name || 'Your Name'}</p>
                                            <p className="text-[10px] text-slate-400 mt-1">{user?.area_code || 'Your location'}</p>
                                        </div>
                                    </div>
                                    <button className="w-full bg-slate-100 text-slate-400 font-bold py-3 rounded-lg text-sm mt-2" disabled>
                                        View Details
                                    </button>
                                </div>
                            </div>

                            <div className="mt-8 p-6 bg-primary/5 rounded-xl border border-primary/10">
                                <h5 className="text-sm font-bold text-primary mb-2 flex items-center gap-2">
                                    <span className="material-symbols-outlined text-sm">info</span>
                                    Did you know?
                                </h5>
                                <p className="text-xs text-slate-600 leading-relaxed">
                                    Emergency resources are prioritized for users in active red zones. Ensure the 'Emergency Flag' is only used for life-critical supplies.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
