import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { resourceService } from '../services/api';

const categoryConfig = [
    { key: 'Medical Help', label: 'Medical Help', color: 'bg-red-500', icon: 'medical_services', textColor: 'text-red-500' },
    { key: 'Shelter', label: 'Shelter', color: 'bg-blue-500', icon: 'home_work', textColor: 'text-blue-500' },
    { key: 'Water & Food', label: 'Water & Food', color: 'bg-green-500', icon: 'water_drop', textColor: 'text-green-500' },
    { key: 'Electricity / Generator', label: 'Electricity/Gen', color: 'bg-yellow-500', icon: 'electric_bolt', textColor: 'text-yellow-500' },
    { key: 'Transport', label: 'Transport', color: 'bg-purple-500', icon: 'local_shipping', textColor: 'text-purple-500' },
    { key: 'Volunteers', label: 'Volunteers', color: 'bg-orange-500', icon: 'group', textColor: 'text-orange-500' },
];

export default function ResourceMap() {
    const navigate = useNavigate();
    const [resources, setResources] = useState([]);
    const [filters, setFilters] = useState(categoryConfig.map(c => c.key));

    useEffect(() => {
        const fetchResources = async () => {
            try {
                const res = await resourceService.getAll();
                setResources(res.data);
            } catch (err) {
                console.error('Error fetching resources', err);
            }
        };
        fetchResources();
    }, []);

    const toggleFilter = (key) => {
        setFilters(prev => prev.includes(key) ? prev.filter(f => f !== key) : [...prev, key]);
    };

    const filteredResources = resources.filter(r => filters.includes(r.category));

    const getCategoryStyle = (category) => {
        const config = categoryConfig.find(c => c.key === category);
        return config || categoryConfig[0];
    };

    return (
        <div className="flex-1 flex overflow-hidden relative h-full">
            {/* Map Background */}
            <div className="absolute inset-0 z-0">
                <div className="w-full h-full bg-slate-200 relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-blue-50"></div>
                    {/* Simulated pins */}
                    {[
                        { top: '25%', left: '33%', color: 'bg-red-500', icon: 'medical_services' },
                        { top: '50%', left: '50%', color: 'bg-blue-500', icon: 'home_work' },
                        { top: '33%', right: '25%', color: 'bg-green-500', icon: 'water_drop' },
                        { top: '75%', left: '50%', color: 'bg-yellow-500', icon: 'electric_bolt' },
                        { top: '66%', left: '25%', color: 'bg-purple-500', icon: 'local_shipping' },
                        { top: '50%', right: '33%', color: 'bg-orange-500', icon: 'group' },
                    ].map((pin, i) => (
                        <div key={i} className={`absolute p-2 ${pin.color} text-white rounded-full shadow-lg cursor-pointer border-2 border-white hover:scale-110 transition-transform`}
                            style={{ top: pin.top, left: pin.left, right: pin.right }}>
                            <span className="material-symbols-outlined filled text-lg leading-none">{pin.icon}</span>
                        </div>
                    ))}
                </div>

                {/* Zoom Controls */}
                <div className="absolute top-4 left-4 z-10 flex flex-col gap-2">
                    <button className="size-10 bg-white shadow-xl rounded-lg flex items-center justify-center text-slate-600 hover:text-primary transition-colors">
                        <span className="material-symbols-outlined">add</span>
                    </button>
                    <button className="size-10 bg-white shadow-xl rounded-lg flex items-center justify-center text-slate-600 hover:text-primary transition-colors">
                        <span className="material-symbols-outlined">remove</span>
                    </button>
                    <button className="size-10 bg-white shadow-xl rounded-lg flex items-center justify-center text-primary transition-colors">
                        <span className="material-symbols-outlined">my_location</span>
                    </button>
                </div>

                {/* Privacy Banner */}
                <div className="absolute top-4 left-1/2 -translate-x-1/2 z-10">
                    <div className="bg-white/95 backdrop-blur-md px-6 py-3 rounded-full shadow-2xl border border-slate-200 flex items-center gap-4">
                        <span className="material-symbols-outlined text-primary">visibility_off</span>
                        <p className="text-sm font-medium">
                            <span className="font-bold">Location Privacy:</span>
                            <span className="text-slate-600 ml-1">Approximate location shown until request acceptance.</span>
                        </p>
                    </div>
                </div>
            </div>

            {/* Left Panel: Categories */}
            <div className="relative z-20 w-80 m-4 flex flex-col gap-4 pointer-events-none">
                <div className="bg-white rounded-xl shadow-2xl p-4 border border-slate-200 pointer-events-auto overflow-y-auto max-h-[calc(100vh-12rem)]">
                    <h3 className="text-sm font-bold text-slate-900 mb-4 flex items-center justify-between">
                        Categories
                        <span className="text-[10px] bg-slate-100 px-2 py-0.5 rounded text-slate-500">{filters.length} ACTIVE</span>
                    </h3>
                    <div className="space-y-2">
                        {categoryConfig.map(cat => (
                            <label key={cat.key} className="flex items-center justify-between p-2 rounded-lg bg-slate-50 cursor-pointer border border-transparent hover:border-primary/20">
                                <div className="flex items-center gap-3">
                                    <div className={`size-2 rounded-full ${cat.color}`}></div>
                                    <span className="text-sm font-medium">{cat.label}</span>
                                </div>
                                <input
                                    type="checkbox"
                                    checked={filters.includes(cat.key)}
                                    onChange={() => toggleFilter(cat.key)}
                                    className="rounded text-primary focus:ring-primary/30"
                                />
                            </label>
                        ))}
                    </div>
                    <div className="mt-4 pt-4 border-t border-slate-100">
                        <button onClick={() => navigate('/post-resource')} className="w-full py-2 bg-primary text-white text-sm font-bold rounded-lg shadow-lg shadow-primary/20 flex items-center justify-center gap-2">
                            <span className="material-symbols-outlined text-lg">add_location</span>
                            List a Resource
                        </button>
                    </div>
                </div>
            </div>

            {/* Right Panel: Nearby Resources */}
            <div className="relative z-20 w-96 ml-auto m-4 flex flex-col pointer-events-none">
                <div className="bg-white rounded-xl shadow-2xl flex flex-col pointer-events-auto overflow-hidden border border-slate-200 max-h-full">
                    <div className="p-4 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
                        <div>
                            <h3 className="font-bold text-slate-900">Nearby Resources</h3>
                            <p className="text-xs text-slate-500">Found {filteredResources.length || 12} points within 2km</p>
                        </div>
                        <button className="p-2 hover:bg-slate-200 rounded-full">
                            <span className="material-symbols-outlined text-slate-400">tune</span>
                        </button>
                    </div>
                    <div className="flex-1 overflow-y-auto p-4 space-y-4">
                        {filteredResources.length > 0 ? filteredResources.map((res, i) => {
                            const style = getCategoryStyle(res.category);
                            return (
                                <div key={res.id || i} onClick={() => navigate(`/resource/${res.id}`)} className="p-4 rounded-xl border border-slate-100 bg-white hover:border-primary/50 transition-all cursor-pointer group">
                                    <div className="flex justify-between items-start mb-2">
                                        <span className={`px-2 py-0.5 rounded ${style.color}/10 ${style.textColor} text-[10px] font-bold uppercase tracking-wide`}
                                            style={{ backgroundColor: `${style.color === 'bg-red-500' ? '#fef2f2' : style.color === 'bg-blue-500' ? '#eff6ff' : style.color === 'bg-green-500' ? '#f0fdf4' : '#fefce8'}` }}>
                                            {res.category}
                                        </span>
                                        <span className="text-xs font-semibold text-slate-400">Nearby</span>
                                    </div>
                                    <h4 className="font-bold text-slate-900 mb-1 group-hover:text-primary transition-colors">{res.title}</h4>
                                    <p className="text-xs text-slate-500 mb-3 line-clamp-2">{res.description}</p>
                                    <div className="flex items-center gap-2">
                                        <div className="flex-1 h-8 px-3 rounded-lg bg-slate-100 flex items-center gap-2">
                                            <span className="size-2 rounded-full bg-green-500"></span>
                                            <span className="text-[10px] font-bold text-slate-600">{res.status || 'AVAILABLE'}</span>
                                        </div>
                                        <button className="size-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                                            <span className="material-symbols-outlined text-lg">directions</span>
                                        </button>
                                    </div>
                                </div>
                            );
                        }) : (
                            /* Static fallback items */
                            [
                                { cat: 'Medical Help', title: 'Apollo Pharmacy - Emergency Meds', desc: 'First-aid kits, essential chronic illness medications, and oxygen support available.', dist: '450m away', color: 'text-red-500', bgColor: '#fef2f2' },
                                { cat: 'Shelter', title: 'Adyar Community Hall', desc: 'Capacity for 50 people. Blankets and dry snacks provided. Pets allowed.', dist: '800m away', color: 'text-blue-500', bgColor: '#eff6ff' },
                                { cat: 'Water & Food', title: 'Mylapore Distribution Point', desc: 'Canned food, biscuits, and 5L water cans. Distribution starts at 4:00 PM.', dist: '1.2km away', color: 'text-green-600', bgColor: '#f0fdf4' },
                                { cat: 'Volunteers', title: 'Coastal Rescue Squad', desc: '5 volunteers available for evacuation support near the creek area.', dist: '1.5km away', color: 'text-orange-500', bgColor: '#fff7ed' },
                            ].map((item, i) => (
                                <div key={i} className="p-4 rounded-xl border border-slate-100 bg-white hover:border-primary/50 transition-all cursor-pointer group">
                                    <div className="flex justify-between items-start mb-2">
                                        <span className={`px-2 py-0.5 rounded ${item.color} text-[10px] font-bold uppercase tracking-wide`} style={{ backgroundColor: item.bgColor }}>{item.cat}</span>
                                        <span className="text-xs font-semibold text-slate-400">{item.dist}</span>
                                    </div>
                                    <h4 className="font-bold text-slate-900 mb-1 group-hover:text-primary transition-colors">{item.title}</h4>
                                    <p className="text-xs text-slate-500 mb-3 line-clamp-2">{item.desc}</p>
                                    <div className="flex items-center gap-2">
                                        <div className="flex-1 h-8 px-3 rounded-lg bg-slate-100 flex items-center gap-2">
                                            <span className="size-2 rounded-full bg-green-500"></span>
                                            <span className="text-[10px] font-bold text-slate-600">AVAILABLE</span>
                                        </div>
                                        <button className="size-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                                            <span className="material-symbols-outlined text-lg">directions</span>
                                        </button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
