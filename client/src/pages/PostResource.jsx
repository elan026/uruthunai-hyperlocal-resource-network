import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { resourceService } from '../services/api';
import ResourceCard from '../components/ResourceCard';
import { Send, MapPin, AlertCircle } from 'lucide-react';

export default function PostResource() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        category: 'Shelter',
        title: '',
        description: '',
        availability: 'Next 24 hours',
        emergencyFlag: false
    });

    const categories = ['Medical Help', 'Shelter', 'Water & Food', 'Electricity / Generator', 'Transport', 'Volunteers'];

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await resourceService.create({
                user_id: user?.id || 1,
                category: formData.category,
                title: formData.title,
                description: formData.description,
                availability_duration: formData.availability,
                is_emergency: formData.emergencyFlag
            });
            navigate('/dashboard');
        } catch (err) {
            console.error('Error posting resource', err);
        }
    };

    return (
        <div className="p-8 max-w-6xl mx-auto h-[calc(100vh-80px)] overflow-y-auto flex flex-col gap-8 pb-32">
            <h1 className="text-3xl font-extrabold text-navy-900 tracking-tight mb-2">Post a Resource</h1>
            <p className="text-gray-500 font-medium text-lg leading-relaxed max-w-2xl mb-4">Offer your help to the community. Fill in the details below so neighbors in need can find and request your resources.</p>

            <div className="grid lg:grid-cols-5 gap-12">

                {/* Form Area */}
                <form onSubmit={handleSubmit} className="lg:col-span-3 space-y-6 bg-white p-8 rounded-[40px] shadow-sm border border-gray-100">
                    <div className="space-y-2">
                        <label className="text-sm font-bold text-navy-800 tracking-wide uppercase">Resource Category</label>
                        <select
                            value={formData.category}
                            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                            className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-5 py-4 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:bg-white transition-colors font-medium text-gray-800 appearance-none"
                        >
                            {categories.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-bold text-navy-800 tracking-wide uppercase">Title <span className="text-red-500">*</span></label>
                        <input
                            type="text"
                            placeholder="e.g. 20L Drinking Water Cans"
                            value={formData.title}
                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                            className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-5 py-4 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:bg-white transition-colors font-medium text-gray-800"
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-bold text-navy-800 tracking-wide uppercase">Description <span className="text-red-500">*</span></label>
                        <textarea
                            rows="4"
                            placeholder="Provide details like quantity, restrictions, or specific directions..."
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-5 py-4 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:bg-white transition-colors font-medium text-gray-800 resize-none"
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-bold text-navy-800 tracking-wide uppercase">Availability Duration</label>
                        <select
                            value={formData.availability}
                            onChange={(e) => setFormData({ ...formData, availability: e.target.value })}
                            className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-5 py-4 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:bg-white transition-colors font-medium text-gray-800 appearance-none"
                        >
                            <option>Next 12 hours</option>
                            <option>Next 24 hours</option>
                            <option>Next 48 hours</option>
                            <option>Indefinite / As needed</option>
                        </select>
                    </div>

                    <div className="flex items-center gap-4 bg-red-50 p-5 rounded-2xl border border-red-100">
                        <div className="flex-shrink-0 bg-white p-2 rounded-full border border-red-200 shadow-sm">
                            <input
                                type="checkbox"
                                id="emergency"
                                checked={formData.emergencyFlag}
                                onChange={(e) => setFormData({ ...formData, emergencyFlag: e.target.checked })}
                                className="w-5 h-5 accent-red-600 rounded bg-gray-100 border-gray-300 focus:ring-red-500 cursor-pointer"
                            />
                        </div>
                        <div>
                            <label htmlFor="emergency" className="font-bold text-red-900 cursor-pointer block">Flag as Emergency Resource</label>
                            <span className="text-sm text-red-700/80 font-medium">Check this if the item is critical and limited in supply (e.g. Oxygen cylinder, life raft).</span>
                        </div>
                    </div>

                    <div className="pt-4 border-t border-gray-100 flex justify-between items-center bg-gray-50 -mx-8 -mb-8 px-8 py-6 rounded-b-[40px] mt-8">
                        <div className="flex items-center gap-2 text-sm text-gray-500 font-medium">
                            <MapPin className="w-4 h-4" /> Location auto-detected: <span className="font-bold text-gray-700">Adyar, CHN</span>
                        </div>
                        <button type="submit" className="flex items-center gap-2 bg-teal-600 text-white font-extrabold px-8 py-4 rounded-full shadow-lg hover:bg-teal-700 hover:shadow-xl hover:-translate-y-1 transition-all">
                            <Send className="w-5 h-5" /> Publish Resource
                        </button>
                    </div>
                </form>

                {/* Preview Area */}
                <div className="lg:col-span-2 space-y-6 sticky top-8 h-fit">
                    <div className="bg-navy-900 text-white p-6 rounded-3xl shadow-xl flex items-start gap-4 mb-4 relative overflow-hidden">
                        <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] mix-blend-overlay"></div>
                        <AlertCircle className="w-8 h-8 text-teal-400 flex-shrink-0 relative z-10 mt-1" />
                        <div className="relative z-10">
                            <h3 className="font-bold text-lg mb-1 tracking-tight">Live Preview</h3>
                            <p className="text-gray-300 text-sm font-medium leading-relaxed">This is exactly how your resource will appear to neighbors in need on the live map and dashboard.</p>
                        </div>
                    </div>

                    <div className="pointer-events-none transform origin-top hover:scale-[1.02] transition-transform">
                        <ResourceCard
                            resource={{
                                category: formData.category,
                                title: formData.title || 'Your Title Here',
                                description: formData.description || 'Detailed description will appear here. Be as specific as possible.',
                                time: 'Just now',
                                distance: 'Your location'
                            }}
                        />
                    </div>

                    <div className="bg-blue-50/50 border border-blue-100 p-6 rounded-3xl mt-6">
                        <h4 className="font-bold text-navy-800 mb-2">Privacy & Request Flow</h4>
                        <ol className="list-decimal pl-5 space-y-2 text-sm text-gray-600 font-medium leading-relaxed">
                            <li>Your exact location is hidden unti you approve a request.</li>
                            <li>When a neighbor requests help, you get notified immediately.</li>
                            <li>After accepting, you can chat with them securely to coordinate pickup/delivery.</li>
                        </ol>
                    </div>
                </div>

            </div>
        </div>
    );
}
