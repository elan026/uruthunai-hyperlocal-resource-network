import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Circle } from 'react-leaflet';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { requestService } from '../services/api';

export default function RequestResource() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        type: '',
        description: '',
        urgency: 'Essential'
    });
    const [location, setLocation] = useState(null);
    const [isLocating, setIsLocating] = useState(true);

    useEffect(() => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (pos) => {
                    setLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
                    setIsLocating(false);
                },
                (err) => {
                    console.error("Location access denied or failed", err);
                    setLocation({ lat: 11.3410, lng: 77.7172 }); // Erode Default
                    setIsLocating(false);
                }
            );
        } else {
            setLocation({ lat: 11.3410, lng: 77.7172 });
            setIsLocating(false);
        }
    }, []);

    const resourceTypes = [
        { value: 'food', label: 'Food & Rations' },
        { value: 'water', label: 'Drinking Water' },
        { value: 'medical', label: 'Medical / First Aid' },
        { value: 'rescue', label: 'Rescue / Transport' },
        { value: 'power', label: 'Power / Charging' },
        { value: 'shelter', label: 'Temporary Shelter' },
    ];

    const urgencies = [
        { level: 'Critical', icon: 'emergency', color: 'red', desc: 'Life-threatening or immediate risk' },
        { level: 'Essential', icon: 'warning', color: 'orange', desc: 'Required soon for survival' },
        { level: 'Support', icon: 'info', color: 'blue', desc: 'Non-emergency basic assistance' },
    ];

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const dataToSubmit = {
                user_id: user?.id || 1,
                category: formData.type || 'Medical / First Aid',
                description: formData.description,
                urgency_level: formData.urgency,
                location_lat: location?.lat || 11.3410,
                location_lng: location?.lng || 77.7172
            };

            await requestService.create(dataToSubmit);
            navigate('/dashboard');

        } catch (err) {
            console.error('Error sending request', err);
        }
    };

    return (
        <div className="p-6 lg:p-10 max-w-7xl mx-auto w-full grid grid-cols-1 xl:grid-cols-3 gap-8">
            {/* Left Side: Form */}
            <div className="xl:col-span-2 space-y-8">
                <div>
                    <h1 className="text-3xl font-black tracking-tight text-slate-900">Request Assistance</h1>
                    <p className="text-slate-500 mt-2">Fill in the details to broadcast an emergency resource request to your nearby community members.</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6 bg-white p-8 rounded-xl shadow-sm border border-slate-200">
                    {/* Urgency Level */}
                    <div className="space-y-4">
                        <label className="text-sm font-semibold uppercase tracking-wider text-slate-500">Urgency Level</label>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            {urgencies.map(u => (
                                <label key={u.level} className="cursor-pointer">
                                    <input
                                        className="peer hidden"
                                        name="urgency"
                                        type="radio"
                                        value={u.level}
                                        checked={formData.urgency === u.level}
                                        onChange={() => setFormData({ ...formData, urgency: u.level })}
                                    />
                                    <div className={`flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all hover:bg-slate-50
                                        ${formData.urgency === u.level
                                            ? `border-${u.color}-500 bg-${u.color}-50`
                                            : 'border-slate-100'
                                        }`}
                                        style={formData.urgency === u.level ? {
                                            borderColor: u.color === 'red' ? '#ef4444' : u.color === 'orange' ? '#f97316' : '#3b82f6',
                                            backgroundColor: u.color === 'red' ? '#fef2f2' : u.color === 'orange' ? '#fff7ed' : '#eff6ff'
                                        } : {}}
                                    >
                                        <span className={`material-symbols-outlined text-3xl mb-2`} style={{ color: u.color === 'red' ? '#ef4444' : u.color === 'orange' ? '#f97316' : '#3b82f6' }}>{u.icon}</span>
                                        <span className="text-sm font-bold" style={{ color: u.color === 'red' ? '#dc2626' : u.color === 'orange' ? '#ea580c' : '#2563eb' }}>{u.level}</span>
                                        <span className="text-[10px] text-center text-slate-500 mt-1">{u.desc}</span>
                                    </div>
                                </label>
                            ))}
                        </div>
                    </div>

                    {/* Resource Type */}
                    <div className="space-y-2">
                        <label className="text-sm font-semibold text-slate-700">What do you need?</label>
                        <div className="relative">
                            <select
                                value={formData.type}
                                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                                className="w-full h-14 pl-4 pr-10 py-3 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary appearance-none text-slate-900"
                            >
                                <option disabled value="">Select Resource Type</option>
                                {resourceTypes.map(r => <option key={r.value} value={r.label}>{r.label}</option>)}
                            </select>
                            <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500">expand_more</span>
                        </div>
                    </div>

                    {/* Situation Description */}
                    <div className="space-y-2">
                        <label className="text-sm font-semibold text-slate-700">Describe the Situation</label>
                        <textarea
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            className="w-full p-4 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary text-slate-900 resize-none"
                            placeholder="Describe your current situation, how many people are affected, and any specific landmarks nearby..."
                            rows="4"
                            required
                        />
                    </div>

                    {/* Submit */}
                    <div className="pt-4">
                        <button
                            type="submit"
                            className="w-full h-16 bg-primary hover:bg-primary/90 text-white font-black text-lg rounded-xl flex items-center justify-center gap-3 shadow-lg shadow-primary/20 transition-all active:scale-[0.98]"
                        >
                            <span className="material-symbols-outlined">send</span>
                            Send Request to Neighborhood
                        </button>
                        <p className="text-center text-xs text-slate-400 mt-4">By sending, your request will be visible to vetted volunteers in your 5km radius.</p>
                    </div>
                </form>
            </div>

            {/* Right Side: Map and Info */}
            <div className="space-y-6">
                {/* Map Panel */}
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                    <div className="p-4 border-b border-slate-100 flex items-center justify-between">
                        <h3 className="text-sm font-bold flex items-center gap-2">
                            <span className="material-symbols-outlined text-primary text-lg">location_on</span>
                            Neighborhood Preview
                        </h3>
                        <span className="text-[10px] bg-slate-100 px-2 py-1 rounded text-slate-500">Erode, TN</span>
                    </div>
                    <div className="aspect-square bg-slate-100 relative overflow-hidden z-0">
                        {location && !isLocating ? (
                            <MapContainer center={[location.lat, location.lng]} zoom={15} style={{ height: '100%', width: '100%' }} zoomControl={false} dragging={false}>
                                <TileLayer url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png" />
                                <Circle center={[location.lat, location.lng]} radius={800} pathOptions={{ color: '#ef4444', fillColor: '#ef4444', fillOpacity: 0.2 }} />
                            </MapContainer>
                        ) : (
                            <div className="absolute inset-0 flex flex-col items-center justify-center">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mb-2"></div>
                                <span className="text-xs text-slate-500 font-bold">Acquiring GPS Signal...</span>
                            </div>
                        )}
                        {/* Privacy Overlay */}
                        <div className="absolute inset-0 bg-slate-900/40 flex items-center justify-center p-6 text-center pointer-events-none">
                            <div className="bg-white/90 p-4 rounded-lg backdrop-blur shadow-xl">
                                <span className="material-symbols-outlined text-primary mb-2">lock</span>
                                <p className="text-xs font-medium">Privacy Guaranteed</p>
                                <p className="text-[10px] text-slate-500 mt-1 leading-relaxed">Your exact home number is never shown publicly. Only approximate neighborhood zone is shared with respondents.</p>
                            </div>
                        </div>
                    </div>
                    <div className="p-4 bg-primary/5">
                        <p className="text-xs text-slate-600 leading-relaxed">
                            <strong>Note:</strong> We automatically detect your current location. If you are requesting for someone else, please clarify in the description.
                        </p>
                    </div>
                </div>

                {/* Quick Tips */}
                <div className="bg-primary/10 p-6 rounded-xl border border-primary/20">
                    <h3 className="text-sm font-bold mb-3 flex items-center gap-2">
                        <span className="material-symbols-outlined text-primary">tips_and_updates</span>
                        Quick Tips
                    </h3>
                    <ul className="space-y-3">
                        <li className="flex gap-2 text-xs text-slate-600">
                            <span className="text-primary">•</span>
                            Be specific about quantities (e.g., "Food for 4 people for 2 days")
                        </li>
                        <li className="flex gap-2 text-xs text-slate-600">
                            <span className="text-primary">•</span>
                            Mention if there are children or elderly involved.
                        </li>
                        <li className="flex gap-2 text-xs text-slate-600">
                            <span className="text-primary">•</span>
                            Keep your phone line free after sending the request.
                        </li>
                    </ul>
                </div>
            </div>
        </div>
    );
}
