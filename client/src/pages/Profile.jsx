import { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from '../hooks/useAuth';
import { getLocationsDropdownOptions } from '../data/erodeLocations';
import axios from 'axios';

const TABS = [
    { id: 'profile', label: 'Personal Info', icon: 'person' },
    { id: 'security', label: 'Login & Security', icon: 'lock' },
    { id: 'account', label: 'Account', icon: 'manage_accounts' },
];

export default function Profile() {
    const { user, updateProfile, loadProfile, deleteProfile, logout } = useAuth();
    const [activeTab, setActiveTab] = useState('profile');
    const [isEditing, setIsEditing] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [avatarUploading, setAvatarUploading] = useState(false);
    const [saveSuccess, setSaveSuccess] = useState(false);
    const fileInputRef = useRef(null);

    const [profileData, setProfileData] = useState(null);
    const [formData, setFormData] = useState({
        name: '', area_code: '', user_type: 'resident', skills: ''
    });

    const fetchData = useCallback(async () => {
        if (user?.id) {
            try {
                const data = await loadProfile(user.id);
                setProfileData(data);
                // Parse skills from JSON array if needed
                let skillsStr = '';
                if (data.skills) {
                    try {
                        const arr = JSON.parse(data.skills);
                        skillsStr = Array.isArray(arr) ? arr.join(', ') : data.skills;
                    } catch {
                        skillsStr = data.skills;
                    }
                }
                setFormData({
                    name: data.name || '',
                    area_code: data.area_code || '',
                    user_type: data.user_type || 'resident',
                    skills: skillsStr
                });
            } catch (err) {
                console.error("Failed to load user profile", err);
            }
        }
    }, [user?.id, loadProfile]);

    useEffect(() => { fetchData(); }, [fetchData]);

    const handleSave = async () => {
        setIsLoading(true);
        try {
            await updateProfile(user.id, formData);
            await fetchData();
            setIsEditing(false);
            setSaveSuccess(true);
            setTimeout(() => setSaveSuccess(false), 3000);
        } catch {
            alert('Failed to update profile');
        } finally {
            setIsLoading(false);
        }
    };

    const handleDelete = async () => {
        if (window.confirm("Are you ABSOLUTELY sure you want to delete your account? This cannot be undone.")) {
            setIsLoading(true);
            try {
                await deleteProfile(user.id);
            } catch {
                alert('Failed to delete account');
                setIsLoading(false);
            }
        }
    };

    const handleAvatarClick = () => fileInputRef.current?.click();

    const handleAvatarChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        if (file.size > 5 * 1024 * 1024) { alert('Image must be under 5MB'); return; }
        setAvatarUploading(true);
        try {
            const payload = new FormData();
            payload.append('avatar', file);
            const res = await axios.post(
                `http://localhost:5000/api/auth/profile/${user.id}/avatar`,
                payload, { headers: { 'Content-Type': 'multipart/form-data' } }
            );
            setProfileData(prev => ({ ...prev, profile_pic: res.data.profile_pic }));
        } catch {
            alert('Failed to upload profile picture');
        } finally {
            setAvatarUploading(false);
        }
    };

    const getAvatarUrl = () => profileData?.profile_pic ? `http://localhost:5000${profileData.profile_pic}` : null;

    if (!profileData) return (
        <div className="p-6 md:p-10 flex justify-center items-center min-h-[50vh]">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
    );

    return (
        <div className="p-6 md:p-10 pb-32">
            <div className="max-w-5xl mx-auto">
                {/* Page Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-black tracking-tight text-slate-900">Settings</h1>
                    <p className="text-slate-500 mt-1">Manage your profile, security, and account preferences.</p>
                </div>

                {/* Success Toast */}
                {saveSuccess && (
                    <div className="mb-6 bg-emerald-50 border border-emerald-200 text-emerald-700 px-5 py-3 rounded-xl flex items-center gap-3 animate-pulse">
                        <span className="material-symbols-outlined filled text-emerald-500">check_circle</span>
                        <span className="font-bold text-sm">Profile updated successfully!</span>
                    </div>
                )}

                <div className="flex flex-col lg:flex-row gap-8">
                    {/* Left Sidebar — Tabs */}
                    <div className="lg:w-64 shrink-0">
                        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden sticky top-6">
                            {/* Profile Mini Card */}
                            <div className="p-5 border-b border-slate-100 text-center">
                                <div className="relative group mx-auto w-fit">
                                    <input type="file" ref={fileInputRef} onChange={handleAvatarChange} accept="image/jpeg,image/png,image/webp,image/gif" className="hidden" />
                                    {getAvatarUrl() ? (
                                        <img src={getAvatarUrl()} alt="Profile" className="h-44 w-44 rounded-2xl object-cover border-2 border-slate-100 shadow-md mx-auto" />
                                    ) : (
                                        <div className="h-44 w-44 rounded-2xl bg-gradient-to-br from-primary to-blue-600 flex items-center justify-center text-white text-6xl font-black border-2 border-white shadow-md mx-auto">
                                            {profileData.name?.charAt(0) || 'U'}
                                        </div>
                                    )}
                                    <button onClick={handleAvatarClick} disabled={avatarUploading}
                                        className="absolute inset-0 rounded-2xl bg-black/0 group-hover:bg-black/40 transition-all flex items-center justify-center cursor-pointer">
                                        <span className={`material-symbols-outlined text-white text-xl opacity-0 group-hover:opacity-100 transition-opacity ${avatarUploading ? 'animate-spin' : ''}`}>
                                            {avatarUploading ? 'progress_activity' : 'photo_camera'}
                                        </span>
                                    </button>
                                </div>
                                <h3 className="font-bold text-slate-900 mt-3 text-sm">{profileData.name}</h3>
                                <p className="text-[11px] text-slate-500 font-medium mt-0.5">{profileData.phone_number}</p>
                            </div>

                            {/* Tab Navigation */}
                            <nav className="p-2 space-y-1">
                                {TABS.map(tab => (
                                    <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all text-left ${activeTab === tab.id
                                            ? 'bg-primary/10 text-primary'
                                            : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                                            }`}>
                                        <span className={`material-symbols-outlined text-lg ${activeTab === tab.id ? 'filled' : ''}`}>{tab.icon}</span>
                                        {tab.label}
                                    </button>
                                ))}
                            </nav>
                        </div>
                    </div>

                    {/* Right Content */}
                    <div className="flex-1 min-w-0">
                        {/* ─── TAB: Personal Info ─── */}
                        {activeTab === 'profile' && (
                            <div className="space-y-6">
                                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                                    <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
                                        <div>
                                            <h2 className="font-bold text-slate-900">Personal Information</h2>
                                            <p className="text-xs text-slate-500 mt-0.5">Your basic profile details visible to the community.</p>
                                        </div>
                                        {!isEditing && (
                                            <button onClick={() => setIsEditing(true)}
                                                className="px-4 py-2 bg-slate-100 text-slate-700 font-bold text-xs rounded-lg hover:bg-slate-200 transition-colors flex items-center gap-1.5">
                                                <span className="material-symbols-outlined text-sm">edit</span> Edit
                                            </button>
                                        )}
                                    </div>

                                    {isEditing ? (
                                        <div className="p-6 space-y-5">
                                            <div>
                                                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 block">Full Name</label>
                                                <input type="text" value={formData.name}
                                                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                                                    className="w-full bg-slate-50 border border-slate-200 px-4 py-3 rounded-xl font-semibold focus:ring-2 focus:ring-primary focus:outline-none focus:border-primary transition-all" />
                                            </div>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                                <div>
                                                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 block">Pincode / Area</label>
                                                    <select value={formData.area_code}
                                                        onChange={e => setFormData({ ...formData, area_code: e.target.value })}
                                                        className="w-full bg-slate-50 border border-slate-200 px-4 py-3 rounded-xl font-semibold focus:ring-2 focus:ring-primary focus:outline-none cursor-pointer capitalize">
                                                        <option value="" disabled>Select Area</option>
                                                        {getLocationsDropdownOptions().map((opt, i) => (
                                                            <option key={i} value={opt.value}>{opt.label}</option>
                                                        ))}
                                                    </select>
                                                </div>
                                                <div>
                                                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 block">Role</label>
                                                    <select value={formData.user_type}
                                                        onChange={e => setFormData({ ...formData, user_type: e.target.value })}
                                                        className="w-full bg-slate-50 border border-slate-200 px-4 py-3 rounded-xl font-semibold focus:ring-2 focus:ring-primary focus:outline-none capitalize cursor-pointer">
                                                        <option value="resident">Resident</option>
                                                        <option value="volunteer">Volunteer</option>
                                                        <option value="org">Organization</option>
                                                    </select>
                                                </div>
                                            </div>
                                            <div>
                                                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 block">Skills (comma separated)</label>
                                                <input type="text" placeholder="e.g. First Aid, CPR, Transport"
                                                    value={formData.skills}
                                                    onChange={e => setFormData({ ...formData, skills: e.target.value })}
                                                    className="w-full bg-slate-50 border border-slate-200 px-4 py-3 rounded-xl font-semibold focus:ring-2 focus:ring-primary focus:outline-none transition-all" />
                                            </div>
                                            <div className="flex gap-3 pt-2">
                                                <button onClick={handleSave} disabled={isLoading}
                                                    className="px-6 py-2.5 bg-primary text-white font-bold rounded-xl hover:bg-primary/90 transition-colors flex items-center gap-2 shadow-sm">
                                                    <span className="material-symbols-outlined text-sm">{isLoading ? 'progress_activity' : 'check'}</span>
                                                    {isLoading ? 'Saving...' : 'Save Changes'}
                                                </button>
                                                <button onClick={() => { setIsEditing(false); fetchData(); }}
                                                    className="px-6 py-2.5 bg-slate-100 text-slate-600 font-bold rounded-xl hover:bg-slate-200 transition-colors">
                                                    Cancel
                                                </button>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="p-6">
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                {[
                                                    { label: 'Full Name', value: profileData.name || '—', icon: 'badge' },
                                                    { label: 'Phone Number', value: profileData.phone_number, icon: 'phone' },
                                                    { label: 'Area / Pincode', value: profileData.area_code || '—', icon: 'location_on' },
                                                    { label: 'Role', value: profileData.user_type || 'Resident', icon: 'work' },
                                                ].map((item, i) => (
                                                    <div key={i} className="flex items-start gap-3 p-4 bg-slate-50 rounded-xl border border-slate-100">
                                                        <span className="material-symbols-outlined text-primary text-lg mt-0.5">{item.icon}</span>
                                                        <div>
                                                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{item.label}</p>
                                                            <p className="text-sm font-bold text-slate-800 mt-0.5 capitalize">{item.value}</p>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                            {profileData.skills && (
                                                <div className="mt-6 p-4 bg-slate-50 rounded-xl border border-slate-100">
                                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Skills</p>
                                                    <div className="flex flex-wrap gap-2">
                                                        {(() => {
                                                            let skillList = [];
                                                            try {
                                                                const parsed = JSON.parse(profileData.skills);
                                                                skillList = Array.isArray(parsed) ? parsed : [profileData.skills];
                                                            } catch {
                                                                skillList = profileData.skills.split(',').map(s => s.trim()).filter(Boolean);
                                                            }
                                                            return skillList.map((skill, i) => (
                                                                <span key={i} className="px-3 py-1 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-700">{skill}</span>
                                                            ));
                                                        })()}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>

                                {/* Stats */}
                                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                                    <div className="px-6 py-4 border-b border-slate-100">
                                        <h2 className="font-bold text-slate-900">Activity & Trust</h2>
                                    </div>
                                    <div className="p-6 grid grid-cols-2 md:grid-cols-4 gap-4">
                                        {[
                                            { label: 'Resources Shared', value: profileData.resources_posted || '0', icon: 'volunteer_activism', color: 'text-primary bg-primary/10' },
                                            { label: 'Requests Fulfilled', value: profileData.requests_fulfilled || '0', icon: 'task_alt', color: 'text-emerald-500 bg-emerald-50' },
                                            { label: 'Trust Score', value: `${profileData.trust_score || 50}%`, icon: 'verified_user', color: 'text-amber-500 bg-amber-50' },
                                            { label: 'Status', value: profileData.verification_status === 'verified' ? 'Verified' : 'Pending', icon: 'shield', color: 'text-purple-500 bg-purple-50' },
                                        ].map((stat, i) => (
                                            <div key={i} className="text-center p-4 rounded-xl border border-slate-100 bg-slate-50/50">
                                                <div className={`h-10 w-10 rounded-xl ${stat.color} mx-auto flex items-center justify-center mb-3`}>
                                                    <span className="material-symbols-outlined text-lg">{stat.icon}</span>
                                                </div>
                                                <h3 className="text-2xl font-black">{stat.value}</h3>
                                                <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400 mt-1">{stat.label}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* ─── TAB: Login & Security ─── */}
                        {activeTab === 'security' && (
                            <div className="space-y-6">
                                {/* Phone / Login Method */}
                                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                                    <div className="px-6 py-4 border-b border-slate-100">
                                        <h2 className="font-bold text-slate-900">Login Method</h2>
                                        <p className="text-xs text-slate-500 mt-0.5">Your account uses OTP-based phone authentication.</p>
                                    </div>
                                    <div className="p-6 space-y-4">
                                        <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-100">
                                            <div className="flex items-center gap-4">
                                                <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center">
                                                    <span className="material-symbols-outlined text-primary text-xl">smartphone</span>
                                                </div>
                                                <div>
                                                    <p className="text-sm font-bold text-slate-800">Phone Number (OTP)</p>
                                                    <p className="text-xs text-slate-500 mt-0.5">{profileData.phone_number} • Primary login method</p>
                                                </div>
                                            </div>
                                            <span className="px-3 py-1 text-[10px] font-black bg-emerald-100 text-emerald-700 rounded-full uppercase tracking-widest">Active</span>
                                        </div>
                                        <div className="px-4 py-3 bg-blue-50 border border-blue-100 rounded-xl flex items-start gap-3">
                                            <span className="material-symbols-outlined text-blue-500 text-lg mt-0.5">info</span>
                                            <p className="text-xs text-blue-700 leading-relaxed">
                                                Your account is secured with OTP-based verification. Each time you log in, a one-time password is sent to your registered phone number. No password is stored.
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* Session Info */}
                                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                                    <div className="px-6 py-4 border-b border-slate-100">
                                        <h2 className="font-bold text-slate-900">Active Session</h2>
                                    </div>
                                    <div className="p-6 space-y-4">
                                        <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-100">
                                            <div className="flex items-center gap-4">
                                                <div className="h-12 w-12 rounded-xl bg-emerald-50 flex items-center justify-center">
                                                    <span className="material-symbols-outlined text-emerald-500 text-xl">computer</span>
                                                </div>
                                                <div>
                                                    <p className="text-sm font-bold text-slate-800">Current Device</p>
                                                    <p className="text-xs text-slate-500 mt-0.5">{navigator.userAgent.includes('Chrome') ? 'Chrome' : navigator.userAgent.includes('Firefox') ? 'Firefox' : 'Browser'} • This device</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
                                                <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest">Online</span>
                                            </div>
                                        </div>
                                        <button onClick={logout}
                                            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-slate-100 text-slate-700 font-bold text-sm rounded-xl hover:bg-slate-200 transition-colors">
                                            <span className="material-symbols-outlined text-lg">logout</span>
                                            Sign Out of This Device
                                        </button>
                                    </div>
                                </div>

                                {/* Verification Status */}
                                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                                    <div className="px-6 py-4 border-b border-slate-100">
                                        <h2 className="font-bold text-slate-900">Verification</h2>
                                    </div>
                                    <div className="p-6">
                                        <div className={`flex items-center gap-4 p-4 rounded-xl border ${profileData.verification_status === 'verified'
                                            ? 'bg-emerald-50 border-emerald-200'
                                            : 'bg-amber-50 border-amber-200'
                                            }`}>
                                            <span className={`material-symbols-outlined text-2xl filled ${profileData.verification_status === 'verified' ? 'text-emerald-500' : 'text-amber-500'
                                                }`}>
                                                {profileData.verification_status === 'verified' ? 'verified' : 'pending'}
                                            </span>
                                            <div>
                                                <p className={`text-sm font-bold ${profileData.verification_status === 'verified' ? 'text-emerald-800' : 'text-amber-800'}`}>
                                                    {profileData.verification_status === 'verified' ? 'Identity Verified' : 'Verification Pending'}
                                                </p>
                                                <p className={`text-xs mt-0.5 ${profileData.verification_status === 'verified' ? 'text-emerald-600' : 'text-amber-600'}`}>
                                                    {profileData.verification_status === 'verified'
                                                        ? 'Your identity has been confirmed by the community admins.'
                                                        : 'Your verification is pending admin approval. You can still use the platform.'}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* ─── TAB: Account ─── */}
                        {activeTab === 'account' && (
                            <div className="space-y-6">
                                {/* Account Overview */}
                                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                                    <div className="px-6 py-4 border-b border-slate-100">
                                        <h2 className="font-bold text-slate-900">Account Details</h2>
                                    </div>
                                    <div className="p-6 space-y-4">
                                        {[
                                            { label: 'Account ID', value: `#${profileData.id}`, icon: 'tag' },
                                            { label: 'Role', value: profileData.role === 'admin' ? 'Administrator' : 'Community Member', icon: 'admin_panel_settings' },
                                            { label: 'Member Since', value: new Date(profileData.created_at).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' }), icon: 'calendar_month' },
                                        ].map((item, i) => (
                                            <div key={i} className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-100">
                                                <div className="flex items-center gap-3">
                                                    <span className="material-symbols-outlined text-slate-400">{item.icon}</span>
                                                    <span className="text-sm font-medium text-slate-600">{item.label}</span>
                                                </div>
                                                <span className="text-sm font-bold text-slate-800">{item.value}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Data Privacy */}
                                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                                    <div className="px-6 py-4 border-b border-slate-100">
                                        <h2 className="font-bold text-slate-900">Privacy & Data</h2>
                                    </div>
                                    <div className="p-6 space-y-4">
                                        <div className="flex items-start gap-4 p-4 bg-slate-50 rounded-xl border border-slate-100">
                                            <span className="material-symbols-outlined text-primary text-lg mt-0.5">visibility_off</span>
                                            <div>
                                                <p className="text-sm font-bold text-slate-800">Location Privacy</p>
                                                <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">Your exact location is never shared publicly. Only approximate neighborhood zones are visible on the Resource Map.</p>
                                            </div>
                                        </div>
                                        <div className="flex items-start gap-4 p-4 bg-slate-50 rounded-xl border border-slate-100">
                                            <span className="material-symbols-outlined text-primary text-lg mt-0.5">shield</span>
                                            <div>
                                                <p className="text-sm font-bold text-slate-800">Data Handling</p>
                                                <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">Your data is stored securely and never shared with third parties. Only verified community members can see your posted resources.</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Danger Zone */}
                                <div className="bg-white rounded-2xl border border-red-200 shadow-sm overflow-hidden">
                                    <div className="px-6 py-4 bg-red-50 border-b border-red-100 flex items-center gap-3 text-red-700">
                                        <span className="material-symbols-outlined text-xl">warning</span>
                                        <h2 className="font-bold">Danger Zone</h2>
                                    </div>
                                    <div className="p-6 space-y-4">
                                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 bg-red-50/50 rounded-xl border border-red-100">
                                            <div>
                                                <h4 className="font-bold text-slate-900 text-sm">Delete Account</h4>
                                                <p className="text-xs text-slate-500 mt-0.5 max-w-md leading-relaxed">Permanently delete your account and all associated data. This action cannot be undone.</p>
                                            </div>
                                            <button onClick={handleDelete} disabled={isLoading}
                                                className="shrink-0 px-5 py-2.5 bg-white border-2 border-red-200 text-red-600 font-bold text-sm rounded-xl hover:bg-red-50 hover:border-red-300 transition-colors flex items-center gap-2">
                                                <span className="material-symbols-outlined text-sm">delete_forever</span>
                                                {isLoading ? 'Processing...' : 'Delete Account'}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
