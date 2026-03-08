import { useState, useEffect } from 'react';

export default function Volunteers() {
    const [volunteers, setVolunteers] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        setVolunteers([
            { id: 1, name: 'Karthik R.', role: 'Volunteer', area_code: '638001 - Erode City', trust_score: 92, skills: ['First Aid', 'Rescue'], status: 'Active' },
            { id: 2, name: 'Priya S.', role: 'Medical Support', area_code: '638052 - Perundurai', trust_score: 88, skills: ['Nursing', 'CPR'], status: 'Active' },
            { id: 3, name: 'Ravi M.', role: 'Volunteer', area_code: '638001 - Erode City', trust_score: 75, skills: ['Transport', 'Supply Chain'], status: 'Standby' },
            { id: 4, name: 'Lakshmi D.', role: 'Volunteer', area_code: '638301 - Bhavani', trust_score: 95, skills: ['Shelter Mgmt', 'Cooking'], status: 'Active' },
            { id: 5, name: 'Suresh K.', role: 'Medical Support', area_code: '638001 - Erode City', trust_score: 83, skills: ['Pharmacy', 'First Aid'], status: 'Offline' },
            { id: 6, name: 'Deepa V.', role: 'Volunteer', area_code: '638452 - Gobichettipalayam', trust_score: 70, skills: ['Communication', 'Elderly Care'], status: 'Active' },
        ]);
    }, []);

    const filteredVolunteers = volunteers.filter(v =>
        v.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        v.skills.some(s => s.toLowerCase().includes(searchQuery.toLowerCase())) ||
        v.area_code.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const statusStyle = (status) => {
        if (status === 'Active') return { color: 'text-emerald-600', bg: 'bg-emerald-50 border-emerald-200', dot: 'bg-emerald-500' };
        if (status === 'Standby') return { color: 'text-amber-600', bg: 'bg-amber-50 border-amber-200', dot: 'bg-amber-500' };
        return { color: 'text-slate-400', bg: 'bg-slate-50 border-slate-200', dot: 'bg-slate-400' };
    };

    const activeCount = volunteers.filter(v => v.status === 'Active').length;

    const avatarColors = ['bg-blue-200 text-blue-700', 'bg-rose-200 text-rose-700', 'bg-emerald-200 text-emerald-700', 'bg-purple-200 text-purple-700', 'bg-amber-200 text-amber-700', 'bg-cyan-200 text-cyan-700'];

    return (
        <div className="p-6 lg:p-10">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 mb-8">
                    <div>
                        <h2 className="text-3xl font-black tracking-tight">Volunteer Network</h2>
                        <p className="text-slate-500 mt-1">Verified community responders ready to help during emergencies.</p>
                    </div>
                    <div className="flex gap-3">
                        <div className="bg-emerald-50 border border-emerald-200 px-5 py-3 rounded-xl text-center">
                            <span className="text-2xl font-black text-emerald-700 block">{activeCount}</span>
                            <span className="text-xs font-bold text-emerald-600">Active</span>
                        </div>
                        <div className="bg-slate-50 border border-slate-200 px-5 py-3 rounded-xl text-center">
                            <span className="text-2xl font-black text-slate-900 block">{volunteers.length}</span>
                            <span className="text-xs font-bold text-slate-500">Total</span>
                        </div>
                    </div>
                </div>

                {/* Search */}
                <div className="relative mb-8 max-w-md">
                    <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">search</span>
                    <input
                        type="text"
                        placeholder="Search by name, skill, or area..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary text-sm"
                    />
                </div>

                {/* Volunteer Grid */}
                <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-5">
                    {filteredVolunteers.map((vol, i) => {
                        const ss = statusStyle(vol.status);
                        return (
                            <div key={vol.id} className="bg-white p-6 rounded-2xl border border-slate-200 hover:shadow-xl hover:-translate-y-1 transition-all group">
                                <div className="flex items-start justify-between mb-4">
                                    <div className="flex items-center gap-4">
                                        <div className={`size-14 rounded-xl ${avatarColors[i % avatarColors.length]} flex items-center justify-center text-xl font-black shadow-sm`}>
                                            {vol.name.charAt(0)}
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-slate-900 text-lg leading-tight group-hover:text-primary transition-colors">{vol.name}</h3>
                                            <span className="text-sm text-slate-500">{vol.role}</span>
                                        </div>
                                    </div>
                                    <span className={`text-[10px] font-bold px-3 py-1.5 rounded-full border flex items-center gap-1.5 ${ss.bg} ${ss.color}`}>
                                        <span className={`size-2 rounded-full ${ss.dot}`}></span>
                                        {vol.status}
                                    </span>
                                </div>

                                <div className="flex items-center gap-2 text-sm text-slate-500 mb-4">
                                    <span className="material-symbols-outlined text-primary text-sm">location_on</span>
                                    <span className="font-medium">{vol.area_code}</span>
                                </div>

                                {/* Trust Score */}
                                <div className="mb-4">
                                    <div className="flex justify-between items-center mb-1">
                                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Trust Score</span>
                                        <span className="text-sm font-black">{vol.trust_score}%</span>
                                    </div>
                                    <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                                        <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${vol.trust_score}%` }}></div>
                                    </div>
                                </div>

                                {/* Skills */}
                                <div className="flex flex-wrap gap-2">
                                    {vol.skills.map(skill => (
                                        <span key={skill} className="bg-slate-50 text-slate-600 text-xs font-bold px-3 py-1 rounded-lg border border-slate-200">
                                            {skill}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        );
                    })}
                </div>

                {filteredVolunteers.length === 0 && (
                    <div className="bg-white rounded-2xl p-16 text-center border border-slate-200 mt-8">
                        <span className="material-symbols-outlined text-5xl text-slate-300 mb-4">groups</span>
                        <h3 className="font-bold text-slate-800 text-xl">No volunteers found</h3>
                        <p className="text-slate-500 mt-2">Try a different search query or Pincode.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
