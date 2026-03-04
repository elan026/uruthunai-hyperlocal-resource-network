import { useState, useEffect } from 'react';
import { Users, ShieldCheck, Star, MapPin, Search } from 'lucide-react';
import VolunteerBadge from '../components/VolunteerBadge';

export default function Volunteers() {
    const [volunteers, setVolunteers] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        const fetchVolunteers = async () => {
            try {
                // Fetch users with role Volunteer or Medical Support
                const res = await axios.get('http://localhost:5000/api/resources');
                // For now, use the users data from resources as a proxy
                // In production, you'd have a dedicated /api/users?role=Volunteer endpoint
            } catch (err) {
                console.error("Failed to fetch volunteers", err);
            }
        };
        fetchVolunteers();

        // Seed with demo data for display
        setVolunteers([
            { id: 1, name: 'Karthik R.', role: 'Volunteer', area_code: 'CHN-ADY-01', trust_score: 92, skills: ['First Aid', 'Rescue'], status: 'Active' },
            { id: 2, name: 'Priya S.', role: 'Medical Support', area_code: 'CHN-ADY-02', trust_score: 88, skills: ['Nursing', 'CPR'], status: 'Active' },
            { id: 3, name: 'Ravi M.', role: 'Volunteer', area_code: 'CHN-ADY-01', trust_score: 75, skills: ['Transport', 'Supply Chain'], status: 'Standby' },
            { id: 4, name: 'Lakshmi D.', role: 'Volunteer', area_code: 'CHN-MYL-03', trust_score: 95, skills: ['Shelter Mgmt', 'Cooking'], status: 'Active' },
            { id: 5, name: 'Suresh K.', role: 'Medical Support', area_code: 'CHN-ADY-01', trust_score: 83, skills: ['Pharmacy', 'First Aid'], status: 'Offline' },
            { id: 6, name: 'Deepa V.', role: 'Volunteer', area_code: 'CHN-TBR-01', trust_score: 70, skills: ['Communication', 'Elderly Care'], status: 'Active' },
        ]);
    }, []);

    const filteredVolunteers = volunteers.filter(v =>
        v.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        v.skills.some(s => s.toLowerCase().includes(searchQuery.toLowerCase())) ||
        v.area_code.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const statusColor = (status) => {
        if (status === 'Active') return 'bg-green-100 text-green-700 border-green-200';
        if (status === 'Standby') return 'bg-yellow-100 text-yellow-700 border-yellow-200';
        return 'bg-gray-100 text-gray-500 border-gray-200';
    };

    const activeCount = volunteers.filter(v => v.status === 'Active').length;
    const totalCount = volunteers.length;

    return (
        <div className="p-8 max-w-7xl mx-auto pb-32">
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6 mb-10">
                <div>
                    <h1 className="text-4xl font-extrabold text-navy-900 tracking-tight">Volunteer Network</h1>
                    <p className="text-gray-500 font-medium text-lg mt-2">Verified community responders ready to help during emergencies.</p>
                </div>
                <div className="flex gap-4">
                    <div className="bg-green-50 border border-green-200 px-6 py-3 rounded-2xl text-center">
                        <span className="text-3xl font-black text-green-700">{activeCount}</span>
                        <span className="block text-sm font-bold text-green-600">Active Now</span>
                    </div>
                    <div className="bg-navy-50 border border-navy-200 px-6 py-3 rounded-2xl text-center">
                        <span className="text-3xl font-black text-navy-800">{totalCount}</span>
                        <span className="block text-sm font-bold text-navy-600">Total Registered</span>
                    </div>
                </div>
            </div>

            {/* Search */}
            <div className="relative mb-8 max-w-lg">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                    type="text"
                    placeholder="Search by name, skill, or area code..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-12 pr-4 py-4 bg-white border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-teal-500 transition-all font-medium text-gray-800 shadow-sm"
                />
            </div>

            {/* Volunteer Grid */}
            <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
                {filteredVolunteers.map(vol => (
                    <div key={vol.id} className="bg-white p-6 rounded-[32px] border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all group">
                        <div className="flex items-start justify-between mb-5">
                            <div className="flex items-center gap-4">
                                <div className="w-14 h-14 bg-gradient-to-tr from-teal-400 to-blue-500 rounded-full flex items-center justify-center text-white font-black text-xl shadow-lg ring-4 ring-white">
                                    {vol.name.charAt(0)}
                                </div>
                                <div>
                                    <h3 className="font-bold text-navy-900 text-lg leading-tight group-hover:text-teal-600 transition-colors">{vol.name}</h3>
                                    <span className="text-sm text-gray-500 font-medium">{vol.role}</span>
                                </div>
                            </div>
                            <span className={`text-xs font-bold px-3 py-1.5 rounded-full border ${statusColor(vol.status)}`}>
                                {vol.status}
                            </span>
                        </div>

                        <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
                            <MapPin className="w-4 h-4 text-teal-500" />
                            <span className="font-medium">{vol.area_code}</span>
                        </div>

                        <VolunteerBadge score={vol.trust_score} />

                        <div className="flex flex-wrap gap-2 mt-5">
                            {vol.skills.map(skill => (
                                <span key={skill} className="bg-gray-50 text-gray-600 text-xs font-bold px-3 py-1.5 rounded-full border border-gray-200">
                                    {skill}
                                </span>
                            ))}
                        </div>
                    </div>
                ))}
            </div>

            {filteredVolunteers.length === 0 && (
                <div className="bg-white rounded-[32px] p-16 text-center border border-gray-100 mt-8">
                    <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="font-bold text-gray-800 text-xl">No volunteers found</h3>
                    <p className="text-gray-500 mt-2">Try a different search query or area code.</p>
                </div>
            )}
        </div>
    );
}
