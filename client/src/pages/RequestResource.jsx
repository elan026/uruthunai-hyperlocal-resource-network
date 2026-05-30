import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Circle } from 'react-leaflet';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { requestService } from '../services/api';
import { motion, AnimatePresence } from 'framer-motion';

export default function RequestResource() {
    const { user } = useAuth();
    const navigate = useNavigate();
    
    const [formData, setFormData] = useState({
        type: '',
        description: '',
        urgency: 'Essential',
        emergency_type: 'GENERAL',
        location_type: 'CITY',
        quantity_needed: 1,
        is_shelter_needed: false,
        is_path_reachable: true
    });
    
    const [location, setLocation] = useState(null);
    const [isLocating, setIsLocating] = useState(true);
    
    // AI NLP Parsing States
    const [nlpText, setNlpText] = useState('');
    const [aiLoading, setAiLoading] = useState(false);
    const [aiSuccess, setAiSuccess] = useState(false);
    const [aiError, setAiError] = useState('');

    useEffect(() => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (pos) => {
                    setLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
                    setIsLocating(false);
                },
                (err) => {
                    // Fallback to Erode Default
                    setLocation({ lat: 11.3410, lng: 77.7172 });
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

    const handleParseNLP = async () => {
        if (!nlpText.trim()) {
            setAiError('Please enter some text description first.');
            return;
        }
        
        setAiLoading(true);
        setAiError('');
        setAiSuccess(false);
        
        try {
            const res = await requestService.parseNlp(nlpText);
            if (res.data.success && res.data.data) {
                const parsed = res.data.data;
                setFormData({
                    type: parsed.category || '',
                    urgency: parsed.urgency_level || 'Essential',
                    description: parsed.clean_description || nlpText,
                    emergency_type: parsed.emergency_type || 'GENERAL',
                    location_type: parsed.location_type || 'CITY',
                    quantity_needed: parsed.quantity_needed || 1,
                    is_shelter_needed: parsed.is_shelter_needed || false,
                    is_path_reachable: parsed.is_path_reachable !== undefined ? parsed.is_path_reachable : true
                });
                setAiSuccess(true);
                setTimeout(() => setAiSuccess(false), 4000);
            } else {
                setAiError('Failed to analyze the request. Please fill the form manually.');
            }
        } catch (err) {
            console.error('NLP parsing failed:', err);
            setAiError(err.response?.data?.error || 'AI parsing service unavailable. Try filling the form manually.');
        } finally {
            setAiLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const dataToSubmit = {
                user_id: user?.id || 1,
                category: formData.type || 'Medical / First Aid',
                description: formData.description,
                urgency_level: formData.urgency,
                location_lat: location?.lat || 11.3410,
                location_lng: location?.lng || 77.7172,
                emergency_type: formData.emergency_type,
                location_type: formData.location_type,
                quantity_needed: formData.quantity_needed,
                is_shelter_needed: formData.is_shelter_needed,
                is_path_reachable: formData.is_path_reachable
            };

            await requestService.create(dataToSubmit);
            navigate('/home');

        } catch (err) {
            console.error('Submission failed:', err);
        }
    };

    return (
        <div className="p-4 md:p-6 lg:p-10 max-w-7xl mx-auto w-full grid grid-cols-1 xl:grid-cols-3 gap-6 lg:gap-8 font-sans">
            {/* Left Side: Form */}
            <div className="xl:col-span-2 space-y-8">
                <div>
                    <h1 className="text-3xl font-black tracking-tight text-slate-900">Request Assistance</h1>
                    <p className="text-slate-500 mt-2">Fill in the details to broadcast an emergency resource request to your nearby community members.</p>
                </div>

                {/* AI Assistant Container */}
                <div className="bg-gradient-to-r from-blue-50/70 to-indigo-50/70 backdrop-blur-md rounded-2xl p-6 border border-blue-100 shadow-[0_4px_20px_rgba(99,102,241,0.05)] relative overflow-hidden">
                    <div className="absolute right-0 top-0 w-24 h-24 bg-primary/5 rounded-full blur-2xl pointer-events-none"></div>
                    <div className="flex items-center gap-2 mb-3">
                        <span className="material-symbols-outlined text-primary font-bold animate-pulse">temp_preferences_custom</span>
                        <h2 className="text-base font-black text-slate-800">Express AI Auto-Fill</h2>
                        <span className="text-[9px] font-black tracking-wider bg-primary/10 text-primary px-2 py-0.5 rounded-full uppercase">Tamil & English</span>
                    </div>
                    <p className="text-xs text-slate-500 mb-4 leading-relaxed">
                        Describe your emergency simply (e.g. <i>"Valparai landslide blocked our path, need drinking water for 3 people"</i>) and let the AI fill the form fields for you.
                    </p>
                    
                    <div className="space-y-4">
                        <textarea
                            value={nlpText}
                            onChange={(e) => setNlpText(e.target.value)}
                            placeholder="Describe your situation here..."
                            rows="2"
                            className="w-full p-4 text-sm bg-white/80 border border-slate-200 focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none rounded-xl transition-all resize-none shadow-sm text-slate-800"
                        />
                        
                        <div className="flex flex-wrap items-center justify-between gap-3">
                            <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={handleParseNLP}
                                disabled={aiLoading || !nlpText.trim()}
                                type="button"
                                className="px-5 py-3 bg-primary hover:bg-primary/95 text-white font-bold text-xs rounded-xl flex items-center gap-2 shadow-md shadow-primary/15 disabled:opacity-50 transition-all cursor-pointer"
                            >
                                {aiLoading ? (
                                    <>
                                        <div className="h-4.5 w-4.5 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                                        Analyzing Emergency...
                                    </>
                                ) : (
                                    <>
                                        <span className="material-symbols-outlined text-[16px]">psychology</span>
                                        Parse Emergency Details
                                    </>
                                )}
                            </motion.button>
                            
                            <AnimatePresence>
                                {aiSuccess && (
                                    <motion.span 
                                        initial={{ opacity: 0, x: -10 }} 
                                        animate={{ opacity: 1, x: 0 }} 
                                        exit={{ opacity: 0 }}
                                        className="text-xs font-bold text-emerald-600 flex items-center gap-1.5"
                                    >
                                        <span className="material-symbols-outlined text-[18px]">verified</span>
                                        Form filled successfully!
                                    </motion.span>
                                )}
                                {aiError && (
                                    <motion.span 
                                        initial={{ opacity: 0, x: -10 }} 
                                        animate={{ opacity: 1, x: 0 }} 
                                        exit={{ opacity: 0 }}
                                        className="text-xs font-bold text-red-500 flex items-center gap-1.5"
                                    >
                                        <span className="material-symbols-outlined text-[18px]">error</span>
                                        {aiError}
                                    </motion.span>
                                )}
                            </AnimatePresence>
                        </div>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6 bg-white p-5 md:p-8 rounded-xl shadow-sm border border-slate-200">
                    {/* Urgency Level */}
                    <div className="space-y-4">
                        <label className="text-sm font-semibold uppercase tracking-wider text-slate-500">Urgency Level</label>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                                required
                            >
                                <option disabled value="">Select Resource Type</option>
                                {resourceTypes.map(r => <option key={r.value} value={r.label}>{r.label}</option>)}
                            </select>
                            <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500">expand_more</span>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Emergency Type */}
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-slate-700">Emergency Type</label>
                            <div className="relative">
                                <select
                                    value={formData.emergency_type}
                                    onChange={(e) => setFormData({ ...formData, emergency_type: e.target.value })}
                                    className="w-full h-14 pl-4 pr-10 py-3 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary appearance-none text-slate-900"
                                >
                                    <option value="GENERAL">General Emergency</option>
                                    <option value="FLOOD">Flood</option>
                                    <option value="EARTHQUAKE">Earthquake</option>
                                    <option value="FIRE">Fire</option>
                                </select>
                                <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500">expand_more</span>
                            </div>
                        </div>

                        {/* Location Type */}
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-slate-700">Location Terrain</label>
                            <div className="relative">
                                <select
                                    value={formData.location_type}
                                    onChange={(e) => setFormData({ ...formData, location_type: e.target.value })}
                                    className="w-full h-14 pl-4 pr-10 py-3 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary appearance-none text-slate-900"
                                >
                                    <option value="CITY">City / Urban</option>
                                    <option value="RURAL">Rural / Village</option>
                                    <option value="HILL">Hill Station / Mountain</option>
                                </select>
                                <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500">expand_more</span>
                            </div>
                        </div>
                    </div>

                    {/* Conditional Fields */}
                    {formData.location_type === 'HILL' && (
                        <label className="p-4 bg-orange-50 border border-orange-100 rounded-lg flex items-center justify-between cursor-pointer select-none">
                            <div>
                                <h4 className="font-bold text-slate-800 text-sm">Is the path reachable?</h4>
                                <p className="text-xs text-slate-500">Are roads clear for vehicles to reach you?</p>
                            </div>
                            <div className="relative flex items-center">
                                <input type="checkbox" className="sr-only peer" checked={formData.is_path_reachable} onChange={(e) => setFormData({ ...formData, is_path_reachable: e.target.checked })} />
                                <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                            </div>
                        </label>
                    )}

                    {formData.emergency_type === 'FLOOD' && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-blue-50 border border-blue-100 rounded-lg">
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-slate-700">Quantity Needed (People)</label>
                                <input 
                                    type="number" 
                                    min="1" 
                                    value={formData.quantity_needed}
                                    onChange={(e) => setFormData({ ...formData, quantity_needed: parseInt(e.target.value) || 1 })}
                                    className="w-full p-3 bg-white border border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-400"
                                />
                            </div>
                            <label className="flex flex-col justify-center gap-1 cursor-pointer select-none">
                                <h4 className="font-bold text-slate-800 text-sm">Need Immediate Shelter?</h4>
                                <div className="flex items-center mt-1">
                                    <input type="checkbox" className="sr-only peer" checked={formData.is_shelter_needed} onChange={(e) => setFormData({ ...formData, is_shelter_needed: e.target.checked })} />
                                    <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-500"></div>
                                    <span className="ml-3 text-sm font-medium text-slate-700">{formData.is_shelter_needed ? 'Yes' : 'No'}</span>
                                </div>
                            </label>
                        </div>
                    )}

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
