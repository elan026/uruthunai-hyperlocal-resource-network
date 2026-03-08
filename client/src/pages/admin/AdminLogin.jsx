import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../../hooks/useAuth';
// Import or add an adminApi hook
import axios from 'axios';

export default function AdminLogin() {
    const navigate = useNavigate();
    const { setAdminToken, setUser } = useAuth();

    const [credentials, setCredentials] = useState({ username: '', password: '' });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            const res = await axios.post('http://localhost:5000/api/admin/login', credentials);

            // set token into the AuthContext 
            setAdminToken(res.data.token);
            setUser({ ...res.data.admin, role: 'admin' });
            localStorage.setItem('adminToken', res.data.token);

            navigate('/admin/dashboard');
        } catch (err) {
            setError(err.response?.data?.error || 'Authentication Failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-900 overflow-hidden relative">
            {/* Background elements */}
            <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '32px 32px' }}></div>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-sky-500/10 rounded-full blur-[120px] pointer-events-none"></div>

            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                className="w-full max-w-md bg-white p-10 rounded-3xl shadow-2xl relative z-10"
            >
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-900 text-white mb-6 shadow-xl mx-auto">
                    <span className="material-symbols-outlined text-3xl">admin_panel_settings</span>
                </div>

                <div className="text-center mb-10">
                    <h2 className="text-3xl font-black text-slate-900 tracking-tight">System Restricted</h2>
                    <p className="text-slate-500 font-medium text-sm mt-2">Authorized Administration Only</p>
                </div>

                {error && (
                    <div className="mb-6 flex items-center gap-2 rounded-xl bg-red-50 p-4 text-red-600 border border-red-100 text-sm font-semibold">
                        <span className="material-symbols-outlined">error</span>
                        {error}
                    </div>
                )}

                <form onSubmit={handleLogin} className="space-y-5">
                    <div>
                        <label className="mb-2 block text-xs font-black uppercase tracking-widest text-slate-500">Admin Identifier</label>
                        <input
                            type="text"
                            value={credentials.username}
                            onChange={(e) => setCredentials({ ...credentials, username: e.target.value })}
                            placeholder="Terminal ID"
                            className="w-full rounded-xl border-2 border-slate-200 bg-slate-50 px-4 py-3 text-base font-bold text-slate-900 focus:border-slate-400 focus:bg-white focus:outline-none transition-all"
                            required
                        />
                    </div>
                    <div>
                        <label className="mb-2 block text-xs font-black uppercase tracking-widest text-slate-500">Passphrase</label>
                        <input
                            type="password"
                            value={credentials.password}
                            onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
                            placeholder="••••••••"
                            className="w-full rounded-xl border-2 border-slate-200 bg-slate-50 px-4 py-3 text-base font-bold text-slate-900 focus:border-slate-400 focus:bg-white focus:outline-none transition-all"
                            required
                        />
                    </div>

                    <motion.button
                        whileHover={{ scale: 1.02, backgroundColor: '#0f172a' }}
                        whileTap={{ scale: 0.98 }}
                        type="submit"
                        disabled={loading}
                        className="w-full rounded-xl bg-slate-800 py-4 mt-4 text-sm font-bold text-white shadow-xl shadow-slate-900/20 disabled:opacity-50 transition-all"
                    >
                        {loading ? 'Authenticating...' : 'Access Terminal'}
                    </motion.button>
                </form>

                <div className="mt-8 text-center border-t border-slate-100 pt-6">
                    <p className="text-xs text-slate-400 font-semibold tracking-wider">Default: admin / admin123</p>
                </div>
            </motion.div>
        </div>
    );
}
