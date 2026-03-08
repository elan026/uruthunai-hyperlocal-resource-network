import { useAuth } from '../hooks/useAuth';

export default function Profile() {
    const { user, updateProfile } = useAuth();

    const stats = [
        { label: 'Resources Shared', value: '24', icon: 'volunteer_activism', color: 'text-primary' },
        { label: 'Requests Fulfilled', value: '18', icon: 'task_alt', color: 'text-emerald-500' },
        { label: 'Trust Score', value: '92%', icon: 'verified_user', color: 'text-amber-500' },
        { label: 'Community Hours', value: '48h', icon: 'schedule', color: 'text-purple-500' },
    ];

    const badges = [
        { icon: 'local_shipping', label: 'First Responder', desc: 'Responded to 5+ critical requests', color: 'bg-red-50 text-red-500 border-red-100' },
        { icon: 'water_drop', label: 'Water Guardian', desc: 'Shared 100+ liters of clean water', color: 'bg-blue-50 text-blue-500 border-blue-100' },
        { icon: 'handshake', label: 'Trusted Neighbor', desc: '90%+ trust score for 3 months', color: 'bg-emerald-50 text-emerald-500 border-emerald-100' },
        { icon: 'electric_bolt', label: 'Power Provider', desc: 'Shared generator 10+ times', color: 'bg-amber-50 text-amber-500 border-amber-100' },
    ];

    const activities = [
        { title: 'Shared 20L drinking water cans', time: '2 hours ago', icon: 'water_drop', color: 'text-blue-500' },
        { title: 'Fulfilled medical supply request', time: '5 hours ago', icon: 'medical_services', color: 'text-red-500' },
        { title: 'Volunteered for food distribution', time: '1 day ago', icon: 'restaurant', color: 'text-orange-500' },
        { title: 'Posted generator availability', time: '2 days ago', icon: 'electric_bolt', color: 'text-yellow-500' },
        { title: 'Completed safety training module', time: '3 days ago', icon: 'school', color: 'text-purple-500' },
    ];

    return (
        <div className="p-6 md:p-10">
            <div className="max-w-6xl mx-auto space-y-8">
                {/* Profile Header Card */}
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                    {/* Cover */}
                    <div className="h-40 bg-gradient-to-r from-primary to-blue-400 relative">
                        <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '20px 20px' }}></div>
                    </div>
                    {/* Profile Info */}
                    <div className="px-8 pb-8 relative">
                        <div className="flex flex-col md:flex-row md:items-end gap-6 -mt-12">
                            <div className="h-28 w-28 rounded-2xl bg-gradient-to-br from-primary to-blue-600 flex items-center justify-center text-white text-5xl font-black border-4 border-white shadow-xl">
                                {user?.name?.charAt(0) || 'U'}
                            </div>
                            <div className="flex-1">
                                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                                    <div>
                                        <h1 className="text-3xl font-black tracking-tight">{user?.name || 'Community Member'}</h1>
                                        <div className="flex flex-wrap items-center gap-3 mt-2 text-sm text-slate-500">
                                            <span className="flex items-center gap-1">
                                                <span className="material-symbols-outlined text-sm">location_on</span>
                                                {user?.area_code || 'ERD-HQ-01'}
                                            </span>
                                            <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                                            <span className="flex items-center gap-1">
                                                <span className="material-symbols-outlined text-sm filled text-primary">verified</span>
                                                Verified {user?.user_type ? user.user_type.replace('_', ' ') : 'resident'}
                                            </span>
                                            <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                                            <span>Member since Jan 2024</span>
                                        </div>
                                    </div>
                                    <div className="flex flex-col sm:flex-row gap-3 self-start">
                                        <select
                                            value={user?.user_type || 'resident'}
                                            onChange={(e) => updateProfile(user.id, { user_type: e.target.value })}
                                            className="px-4 py-2.5 bg-slate-100 text-slate-700 font-bold rounded-xl border-none ring-0 cursor-pointer hover:bg-slate-200 transition-colors capitalize"
                                        >
                                            <option value="resident">Resident</option>
                                            <option value="volunteer">Volunteer</option>
                                            <option value="activist">Community Activist</option>
                                            <option value="skilled_support">Skilled Support</option>
                                        </select>
                                        <button className="px-6 py-2.5 bg-primary text-white font-bold rounded-xl hover:bg-primary/90 transition-all flex items-center gap-2">
                                            <span className="material-symbols-outlined text-sm">edit</span>
                                            Edit Profile
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {stats.map((stat, i) => (
                        <div key={i} className="bg-white p-5 rounded-2xl border border-slate-200 relative overflow-hidden group hover:shadow-lg transition-shadow">
                            <div className="flex items-center gap-3 mb-3">
                                <span className={`material-symbols-outlined ${stat.color} text-2xl`}>{stat.icon}</span>
                            </div>
                            <h3 className="text-3xl font-black">{stat.value}</h3>
                            <p className="text-xs font-medium text-slate-500 mt-1">{stat.label}</p>
                            <span className={`material-symbols-outlined absolute -right-2 -bottom-2 text-6xl opacity-[0.05] ${stat.color}`}>{stat.icon}</span>
                        </div>
                    ))}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left: Recent Activity */}
                    <div className="lg:col-span-2 space-y-6">
                        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
                            <div className="p-6 border-b border-slate-200 flex items-center justify-between">
                                <h3 className="font-bold text-lg flex items-center gap-2">
                                    <span className="material-symbols-outlined text-primary">history</span>
                                    Recent Activity
                                </h3>
                                <button className="text-sm font-bold text-primary hover:underline">View All</button>
                            </div>
                            <div className="divide-y divide-slate-100">
                                {activities.map((activity, i) => (
                                    <div key={i} className="flex items-start gap-4 p-6 hover:bg-slate-50/50 transition-colors">
                                        <div className="flex-shrink-0 h-10 w-10 rounded-xl bg-slate-100 flex items-center justify-center">
                                            <span className={`material-symbols-outlined ${activity.color}`}>{activity.icon}</span>
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="font-bold text-slate-900 text-sm">{activity.title}</p>
                                            <p className="text-xs text-slate-400 mt-1">{activity.time}</p>
                                        </div>
                                        <button className="text-slate-300 hover:text-primary transition-colors flex-shrink-0">
                                            <span className="material-symbols-outlined text-sm">chevron_right</span>
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Right: Badges & Settings */}
                    <div className="space-y-6">
                        {/* Community Badges */}
                        <div className="bg-white rounded-2xl border border-slate-200 p-6">
                            <h3 className="font-bold text-sm uppercase tracking-widest text-slate-500 mb-4 flex items-center gap-2">
                                <span className="material-symbols-outlined text-amber-500">workspace_premium</span>
                                Community Badges
                            </h3>
                            <div className="grid grid-cols-2 gap-3">
                                {badges.map((badge, i) => (
                                    <div key={i} className={`flex flex-col items-center text-center p-4 rounded-xl border ${badge.color}`}>
                                        <span className="material-symbols-outlined text-3xl mb-2">{badge.icon}</span>
                                        <span className="text-xs font-bold">{badge.label}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Quick Actions */}
                        <div className="bg-white rounded-2xl border border-slate-200 p-6">
                            <h3 className="font-bold text-sm uppercase tracking-widest text-slate-500 mb-4">Quick Actions</h3>
                            <div className="space-y-2">
                                {[
                                    { label: 'Notification Settings', icon: 'notifications', desc: 'Manage alerts and notifications' },
                                    { label: 'Privacy & Security', icon: 'lock', desc: 'Control data sharing preferences' },
                                    { label: 'Area Management', icon: 'map', desc: 'Update registered area code' },
                                    { label: 'Volunteer Status', icon: 'handshake', desc: 'Toggle availability for requests' },
                                ].map((action, i) => (
                                    <button key={i} className="w-full flex items-center gap-4 p-3 rounded-xl hover:bg-slate-50 transition-colors text-left group">
                                        <span className="material-symbols-outlined text-slate-400 group-hover:text-primary transition-colors">{action.icon}</span>
                                        <div className="flex-1">
                                            <p className="text-sm font-bold">{action.label}</p>
                                            <p className="text-[10px] text-slate-400">{action.desc}</p>
                                        </div>
                                        <span className="material-symbols-outlined text-slate-300 text-sm">chevron_right</span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
