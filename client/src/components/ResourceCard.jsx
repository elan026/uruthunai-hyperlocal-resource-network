import { MapPin, Clock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function ResourceCard({ resource, showDistance = true }) {
    const navigate = useNavigate();

    return (
        <div
            onClick={() => navigate(`/resource/${resource.id || 1}`)}
            className="p-5 rounded-2xl border border-gray-100 bg-white flex flex-col gap-3 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all cursor-pointer group">
            <div className="flex justify-between items-start">
                <span className="text-xs font-bold text-teal-700 bg-teal-50 px-3 py-1.5 rounded-full border border-teal-100 uppercase tracking-wider">{resource.category}</span>
                <span className="text-xs text-gray-400 flex items-center gap-1 font-medium"><Clock className="w-3.5 h-3.5" /> {resource.time || 'Featured'}</span>
            </div>
            <h4 className="font-bold text-gray-900 text-lg leading-tight mt-1 group-hover:text-teal-600 transition-colors">{resource.title}</h4>
            <p className="text-sm text-gray-500 line-clamp-2 leading-relaxed">{resource.description}</p>

            {showDistance && (
                <div className="flex items-center gap-2 text-sm text-gray-500 bg-gray-50 p-2.5 rounded-xl border border-gray-100 mt-2">
                    <MapPin className="h-4 w-4 text-teal-500" /> <span className="font-medium">Distance: {resource.distance || '~450m'}</span> (Approx)
                </div>
            )}
        </div>
    );
}
