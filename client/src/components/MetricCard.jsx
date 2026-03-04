import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

export default function MetricCard({ title, value, trend, subtitle, colorClass = "text-navy-800" }) {
    return (
        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
            <h3 className="text-gray-500 font-medium mb-1">{title}</h3>
            <div className="flex items-end gap-3">
                <span className={`text-4xl font-extrabold tracking-tight ${colorClass}`}>{value}</span>
                {trend && (
                    <div className={`flex items-center gap-1 text-sm font-bold pb-1 ${trend > 0 ? 'text-green-600' : trend < 0 ? 'text-red-600' : 'text-gray-400'}`}>
                        {trend > 0 ? <TrendingUp className="w-4 h-4" /> : trend < 0 ? <TrendingDown className="w-4 h-4" /> : <Minus className="w-4 h-4" />}
                        {Math.abs(trend)}%
                    </div>
                )}
            </div>
            {subtitle && <p className="text-sm text-gray-400 mt-2">{subtitle}</p>}
        </div>
    );
}
