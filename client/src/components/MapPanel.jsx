import { MapPin } from 'lucide-react';

export default function MapPanel({ locationDesc = 'Approximate location shown until request acceptance' }) {
    return (
        <div className="bg-white rounded-3xl overflow-hidden shadow-sm border border-gray-200 flex flex-col h-full h-min-[400px]">
            <div className="flex-1 bg-slate-100 relative min-h-[400px]">
                {/* Simulated Map Background */}
                <div className="absolute inset-0 opacity-40" style={{
                    backgroundImage: 'radial-gradient(#94a3b8 1px, transparent 1px)',
                    backgroundSize: '20px 20px'
                }}></div>

                {/* Central Pin */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center">
                    <div className="animate-bounce">
                        <MapPin className="h-12 w-12 text-teal-600 p-2 bg-white rounded-full shadow-lg border-2 border-teal-100" />
                    </div>
                    <div className="w-4 h-1 bg-black/10 rounded-full blur-[2px] mt-2"></div>
                </div>

                {/* Privacy Badge overlay */}
                <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-navy-800/90 backdrop-blur-sm text-white px-6 py-2.5 rounded-full text-sm font-semibold shadow-xl border border-white/10 flex items-center gap-2 whitespace-nowrap">
                    <span className="w-2 h-2 bg-teal-400 rounded-full animate-pulse"></span>
                    {locationDesc}
                </div>
            </div>
        </div>
    );
}
