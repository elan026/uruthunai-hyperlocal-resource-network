import { useState, useEffect } from 'react';
import { resourceService } from '../services/api';
import CategoryFilter from '../components/CategoryFilter';
import ResourceCard from '../components/ResourceCard';
import MapPanel from '../components/MapPanel';
import { AlignLeft, Map as MapIcon } from 'lucide-react';

export default function ResourceMap() {
    const [selectedCategory, setSelectedCategory] = useState('All');

    const categories = [
        { name: 'All', color: '#CBD5E1' },
        { name: 'Medical Help', color: '#EF4444' }, // Red
        { name: 'Shelter', color: '#3B82F6' },     // Blue
        { name: 'Water & Food', color: '#10B981' }, // Green
        { name: 'Electricity / Generator', color: '#F59E0B' }, // Yellow
        { name: 'Transport', color: '#8B5CF6' },    // Purple
        { name: 'Volunteers', color: '#F97316' },   // Orange
    ];

    const [resources, setResources] = useState([]);

    useEffect(() => {
        const fetchResources = async () => {
            try {
                const res = await resourceService.getAll();
                setResources(res.data);
            } catch (err) {
                console.error("Failed to fetch resources", err);
            }
        };
        fetchResources();
    }, []);

    const filteredResources = selectedCategory === 'All'
        ? resources
        : resources.filter(r => r.category === selectedCategory);

    return (
        <div className="flex h-[calc(100vh-80px)] overflow-hidden">
            {/* Left Filter Panel */}
            <div className="w-72 bg-gray-50/50 border-r border-gray-200 p-6 overflow-y-auto flex-shrink-0">
                <h2 className="text-xl font-extrabold text-navy-900 tracking-tight mb-6 flex gap-2 items-center"><AlignLeft className="w-5 h-5 text-gray-400" /> Filters</h2>
                <CategoryFilter
                    categories={categories}
                    selectedCategory={selectedCategory}
                    onSelect={setSelectedCategory}
                />
            </div>

            {/* Middle Map Area */}
            <div className="flex-1 p-6 flex flex-col relative bg-white h-full relative z-0">
                <h2 className="text-2xl font-extrabold text-navy-900 tracking-tight mb-4 flex gap-2 items-center"><MapIcon className="w-6 h-6 text-teal-600" /> Live Resource Map</h2>
                <div className="flex-1 min-h-[500px] border-4 border-white shadow-xl rounded-[40px] overflow-hidden relative">
                    <MapPanel locationDesc="Approximate locations shown for user privacy." />
                </div>
            </div>

            {/* Right Resource List Panel */}
            <div className="w-96 bg-gray-50/50 border-l border-gray-200 p-6 overflow-y-auto flex-shrink-0">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-extrabold text-navy-900 tracking-tight">{filteredResources.length} Results</h2>
                    <span className="text-sm font-bold text-teal-600">Near You</span>
                </div>

                <div className="space-y-4">
                    {filteredResources.map(res => (
                        <ResourceCard key={res.id} resource={{ ...res, time: new Date(res.created_at).toLocaleTimeString() }} />
                    ))}

                    {filteredResources.length === 0 && (
                        <div className="text-center p-8 bg-white rounded-3xl border border-gray-100 flex flex-col items-center">
                            <span className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center text-xl mb-4">🤷</span>
                            <h3 className="font-bold text-gray-800">No resources found</h3>
                            <p className="text-gray-500 text-sm mt-2">Try selecting a different category or adjusting your search radius.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
