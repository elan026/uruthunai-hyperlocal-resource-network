import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { requestService } from '../services/api';
import MapPanel from '../components/MapPanel';
import { Send, MapPin, AlertCircle } from 'lucide-react';

export default function RequestResource() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        type: 'Medical Help',
        description: '',
        urgency: 'Support'
    });

    const resourceTypes = ['Medical Help', 'Shelter', 'Water & Food', 'Electricity / Generator', 'Rescue / Evacuation'];
    const urgencies = [
        { level: 'Critical', color: 'bg-red-500 hover:bg-red-600', text: 'text-white' },
        { level: 'Essential', color: 'bg-orange-500 hover:bg-orange-600', text: 'text-white' },
        { level: 'Support', color: 'bg-blue-500 hover:bg-blue-600', text: 'text-white' },
    ];

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await requestService.create({
                user_id: user?.id || 1,
                category: formData.type,
                description: formData.description,
                urgency_level: formData.urgency
            });
            navigate('/dashboard');
        } catch (err) {
            console.error('Error sending request', err);
        }
    };

    return (
        <div className="p-8 max-w-7xl mx-auto h-[calc(100vh-80px)] overflow-y-auto flex flex-col gap-8 pb-32">
            <h1 className="text-3xl font-extrabold text-navy-900 tracking-tight mb-2">Request Help</h1>
            <p className="text-gray-500 font-medium text-lg leading-relaxed max-w-2xl mb-4">Let your neighbors know what you need. Provide clear details to help responders assist you accurately and quickly.</p>

            <div className="grid lg:grid-cols-2 gap-12">

                {/* Form Area */}
                <form onSubmit={handleSubmit} className="space-y-6 bg-white p-10 rounded-[40px] shadow-sm border border-gray-100 flex flex-col">
                    <div className="space-y-2">
                        <label className="text-sm font-bold text-navy-800 tracking-wide uppercase">Resource Type Needed</label>
                        <select
                            value={formData.type}
                            onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                            className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-5 py-4 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:bg-white transition-colors font-medium text-gray-800 appearance-none"
                        >
                            {resourceTypes.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-bold text-navy-800 tracking-wide uppercase">Situation Description <span className="text-red-500">*</span></label>
                        <textarea
                            rows="5"
                            placeholder="Describe exactly what you need and your current condition. E.g., 'Trapped on first floor, need rescue boat, 2 adults 1 child.'"
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-5 py-4 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:bg-white transition-colors font-medium text-gray-800 resize-none"
                            required
                        />
                    </div>

                    <div className="space-y-4">
                        <label className="text-sm font-bold text-navy-800 tracking-wide uppercase">Urgency Level <span className="text-red-500">*</span></label>
                        <div className="grid grid-cols-3 gap-4">
                            {urgencies.map(u => (
                                <button
                                    key={u.level}
                                    type="button"
                                    onClick={() => setFormData({ ...formData, urgency: u.level })}
                                    className={`py-4 rounded-2xl font-bold transition-all border-2 ${formData.urgency === u.level
                                        ? `${u.color} ${u.text} border-transparent shadow-[0_8px_20px_rgba(0,0,0,0.15)] -translate-y-1`
                                        : 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100'
                                        }`}
                                >
                                    {u.level}
                                </button>
                            ))}
                        </div>
                        <p className="text-sm font-medium text-gray-500 pt-2 border-t border-gray-100 mt-4 italic">
                            * Critical requests trigger SMS alerts to Top Responders in your sector.
                        </p>
                    </div>


                    <div className="pt-6 border-t border-gray-100 mt-auto flex justify-between items-center -mx-10 -mb-10 px-10 py-8 bg-gray-50 rounded-b-[40px]">
                        <button type="submit" className={`flex items-center gap-2 text-white font-extrabold px-10 py-5 rounded-full shadow-lg transition-all w-full justify-center text-lg ${formData.urgency === 'Critical' ? 'bg-red-600 hover:bg-red-700 shadow-red-500/30' : 'bg-teal-600 hover:bg-teal-700 shadow-teal-500/30'} hover:scale-105`}>
                            <Send className="w-6 h-6" /> Send Request Now
                        </button>
                    </div>
                </form>

                {/* Map Preview Area */}
                <div className="space-y-6 flex flex-col pt-8 lg:pt-0">
                    <div className="bg-navy-900 text-white p-8 rounded-[40px] shadow-xl flex items-start flex-col gap-4 relative overflow-hidden h-[500px]">
                        <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] mix-blend-overlay"></div>

                        <div className="flex items-center gap-3 relative z-10 w-full mb-2">
                            <MapPin className="w-8 h-8 text-teal-400 flex-shrink-0" />
                            <div>
                                <h3 className="font-bold text-xl tracking-tight">Verify Your Location</h3>
                                <p className="text-gray-300 text-sm font-medium">This connects you with the nearest willing volunteers.</p>
                            </div>
                        </div>

                        <div className="flex-1 w-full bg-white/5 rounded-3xl overflow-hidden border border-white/10 relative z-10 p-1 backdrop-blur-sm">
                            <MapPanel locationDesc="Pinpoint accuracy enabled for responders." />
                        </div>
                    </div>

                </div>

            </div>
        </div>
    );
}
