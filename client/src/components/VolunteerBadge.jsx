import { ShieldCheck } from 'lucide-react';

export default function VolunteerBadge({ rank = 'Verified Responder', score = 95 }) {
    return (
        <div className="flex items-center gap-3 bg-gradient-to-r from-teal-50 to-green-50 p-2.5 px-4 rounded-full border border-teal-100 shadow-sm w-fit">
            <div className="bg-teal-500 rounded-full p-1.5 shadow-md border-2 border-white">
                <ShieldCheck className="h-4 w-4 text-white" />
            </div>
            <div className="flex flex-col">
                <span className="text-sm font-bold text-teal-800 tracking-tight leading-none">{rank}</span>
                <span className="text-xs text-teal-600 font-semibold mt-1">Trust Score: {score}%</span>
            </div>
        </div>
    );
}
