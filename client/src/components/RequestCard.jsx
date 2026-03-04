import { AlertTriangle, MapPin, Clock } from 'lucide-react';

export default function RequestCard({ request, isEmergency = false }) {
    return (
        <div className={`p-5 rounded-2xl border flex flex-col gap-3 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all cursor-pointer group ${isEmergency ? 'border-red-200 bg-red-50' : 'border-gray-100 bg-white'}`}>
            <div className="flex justify-between items-start">
                <span className={`text-xs font-bold px-3 py-1.5 rounded-full border uppercase tracking-wider ${isEmergency ? 'bg-red-100 text-red-700 border-red-200' : 'bg-orange-50 text-orange-700 border-orange-100'}`}>
                    {request.urgency || 'Essential'}
                </span>
                <span className={`text-xs flex items-center gap-1 font-medium ${isEmergency ? 'text-red-500' : 'text-gray-400'}`}>
                    <Clock className="w-3.5 h-3.5" /> {request.time || '10m ago'}
                </span>
            </div>

            <h4 className={`font-bold text-lg leading-tight mt-1 ${isEmergency ? 'text-red-900 group-hover:text-red-700' : 'text-gray-900 group-hover:text-orange-600'} transition-colors`}>
                {request.type} Needed
            </h4>
            <p className={`text-sm line-clamp-2 leading-relaxed ${isEmergency ? 'text-red-800/80' : 'text-gray-500'}`}>
                {request.description}
            </p>

            <div className={`flex items-center gap-2 text-sm p-2.5 rounded-xl border mt-2 ${isEmergency ? 'bg-red-100/50 border-red-200 text-red-900' : 'bg-gray-50 border-gray-100 text-gray-500'}`}>
                <MapPin className={`h-4 w-4 ${isEmergency ? 'text-red-600' : 'text-orange-500'}`} />
                <span className="font-medium">Area: {request.area || 'Local'}</span>
            </div>
        </div>
    );
}
