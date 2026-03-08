import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../hooks/useAuth';

export default function AdminEmergency() {
    const { adminToken } = useAuth();
    const [emergencyMode, setEmergencyMode] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        const fetchEmergencyStatus = async () => {
            try {
                const res = await axios.get('http://localhost:5000/api/admin/emergency', {
                    headers: { Authorization: `Bearer ${adminToken}` }
                });
                setEmergencyMode(res.data.isEmergency);
            } catch (error) {
                console.error('Failed to fetch emergency data', error);
            }
        };

        if (adminToken) fetchEmergencyStatus();
    }, [adminToken]);

    const toggleEmergency = async () => {
        setIsLoading(true);
        try {
            const newState = !emergencyMode;
            await axios.post('http://localhost:5000/api/admin/emergency', {
                active: newState
            }, { headers: { Authorization: `Bearer ${adminToken}` } });
            setEmergencyMode(newState);
        } catch (error) {
            console.error('Failed to toggle emergency mode', error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="p-4 sm:p-8 pb-32 max-w-5xl mx-auto space-y-6 sm:space-y-8">
            <div className="mb-2">
                <h1 className="text-3xl font-black text-slate-900 tracking-tight">Emergency Control Center</h1>
                <p className="text-slate-500 mt-1">Platform-wide disaster management and community alert systems.</p>
            </div>

            {/* Emergency Mode Toggle */}
            <div className={`rounded-3xl p-6 sm:p-8 border-4 transition-all shadow-sm ${emergencyMode ? 'bg-red-50 border-red-500 shadow-red-500/20' : 'bg-white border-slate-200'}`}>
                <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                    <div className="flex items-center gap-5 w-full">
                        <div className={`h-16 w-16 rounded-2xl flex items-center justify-center shrink-0 ${emergencyMode ? 'bg-red-600 shadow-lg shadow-red-500/40 animate-pulse' : 'bg-slate-100'}`}>
                            <span className={`material-symbols-outlined text-4xl ${emergencyMode ? 'text-white' : 'text-slate-400'}`}>warning</span>
                        </div>
                        <div>
                            <h2 className={`text-xl sm:text-2xl font-black tracking-tight ${emergencyMode ? 'text-red-700' : 'text-slate-900'}`}>
                                {emergencyMode ? 'SYSTEM RED: EMERGENCY ACTIVE' : 'SYSTEM GREEN: STANDARD OPERATIONS'}
                            </h2>
                            <p className={`mt-1 font-medium text-xs sm:text-sm md:text-base ${emergencyMode ? 'text-red-600/80' : 'text-slate-500'}`}>
                                {emergencyMode
                                    ? 'Emergency mode is actively bypassing standard limits and pushing alerts to all local users.'
                                    : 'The system is running under normal operational load constraints.'}
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={toggleEmergency}
                        disabled={isLoading}
                        className={`px-8 py-4 w-full md:w-auto rounded-xl font-black text-white transition-all shrink-0 ${isLoading ? 'opacity-50 cursor-not-allowed' : ''
                            } ${emergencyMode
                                ? 'bg-slate-900 hover:bg-slate-800'
                                : 'bg-red-600 hover:bg-red-700 shadow-xl shadow-red-500/30'
                            }`}
                    >
                        {isLoading ? 'PROCESSING...' : (emergencyMode ? 'DEACTIVATE EMERGENCY' : 'ACTIVATE EMERGENCY OVERRIDE')}
                    </button>
                </div>
            </div>

            {/* Future expansions like sending manual push notifications to areas could go here */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-sm opacity-50 select-none">
                <h3 className="font-black text-slate-900 flex items-center gap-2 mb-4">
                    <span className="material-symbols-outlined text-primary">campaign</span>
                    Broadcast Community Alert (Coming Soon)
                </h3>
                <div className="space-y-4">
                    <input type="text" disabled placeholder="Alert Title..." className="w-full bg-slate-50 border border-slate-200 px-4 py-3 rounded-xl font-bold cursor-not-allowed" />
                    <textarea disabled placeholder="Describe the crisis and instructions..." className="w-full bg-slate-50 border border-slate-200 px-4 py-3 rounded-xl font-medium h-32 cursor-not-allowed"></textarea>
                    <button disabled className="px-6 py-3 bg-slate-200 text-slate-500 font-bold rounded-xl w-full cursor-not-allowed">Deploy Broadcast</button>
                </div>
            </div>
        </div>
    );
}
