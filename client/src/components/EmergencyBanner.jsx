import { ShieldAlert } from 'lucide-react';

export default function EmergencyBanner({ message }) {
    return (
        <div className="bg-gradient-to-r from-red-600 to-red-700 rounded-2xl shadow-[0_8px_30px_rgb(220,38,38,0.3)] p-6 mb-8 text-white flex items-center gap-6 border border-red-500 relative overflow-hidden">
            <div className="absolute -right-10 -top-10 opacity-10">
                <ShieldAlert className="w-48 h-48" />
            </div>
            <div className="bg-red-800/50 p-4 rounded-full shadow-inner z-10">
                <ShieldAlert className="w-10 h-10 text-red-100 animate-pulse" />
            </div>
            <div className="z-10 flex-1">
                <h2 className="text-2xl font-extrabold tracking-tight mb-1">EMERGENCY ALERT</h2>
                <p className="text-red-100 text-lg font-medium leading-relaxed">{message || 'High alert situation in your area. Follow authorities\' instructions.'}</p>
            </div>
        </div>
    );
}
