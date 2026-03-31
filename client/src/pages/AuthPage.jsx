import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { getLocationsDropdownOptions } from '../data/erodeLocations';

export default function AuthPage() {
    const navigate = useNavigate();
    const { login, sendOtp, updateProfile } = useAuth();

    const [authStep, setAuthStep] = useState(1); // 1 = Phone, 2 = OTP, 3 = Profile Setup
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    // Form State
    const [phone, setPhone] = useState('');
    const [otp, setOtp] = useState('');
    const [name, setName] = useState('');
    const [areaCode, setAreaCode] = useState('');
    const [tempUserId, setTempUserId] = useState(null);

    // Timer for OTP
    const [timer, setTimer] = useState(30);

    useEffect(() => {
        let interval;
        if (authStep === 2 && timer > 0) {
            interval = setInterval(() => setTimer(t => t - 1), 1000);
        }
        return () => clearInterval(interval);
    }, [authStep, timer]);

    const handleSendOtp = async (e) => {
        if (e) e.preventDefault();
        setLoading(true);
        setError('');
        try {
            await sendOtp(phone);
            setAuthStep(2);
            setTimer(30);
            setOtp('');
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to send OTP');
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyOtp = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            const payload = {
                phone_number: phone,
                otp: otp,
            };

            const user = await login(payload);
            
            // If user is new (e.g. name is Anonymous or missing), go to step 3
            if (!user.name || user.name === 'Anonymous') {
                setTempUserId(user.id);
                setAuthStep(3);
            } else {
                navigate('/home');
            }
        } catch (err) {
            setError(err.response?.data?.error || 'Invalid OTP');
        } finally {
            setLoading(false);
        }
    };

    const handleSetupProfile = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            await updateProfile(tempUserId, {
                name: name,
                area_code: areaCode || '638001 - Erode City'
            });
            navigate('/home');
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to update profile');
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="min-h-screen w-full flex bg-slate-50 font-sans text-slate-900">
            {/* Left Section - Branding & Visuals */}
            <div className="hidden lg:flex w-1/2 relative bg-primary flex-col justify-between overflow-hidden">
                <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '24px 24px' }}></div>
                <div className="absolute -left-20 -top-20 h-96 w-96 rounded-full bg-white/10 blur-[100px]"></div>
                <div className="absolute -bottom-20 -right-20 h-96 w-96 rounded-full bg-blue-400/20 blur-[100px]"></div>

                <div className="relative z-10 p-12 h-full flex flex-col justify-between">
                    <Link to="/" className="flex items-center gap-3 w-fit">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white text-primary shadow-lg shadow-black/10">
                            <span className="material-symbols-outlined text-xl">diversity_3</span>
                        </div>
                        <span className="text-2xl font-black text-white tracking-tight">Namma Thunai</span>
                    </Link>

                    <div className="mb-20">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                        >
                            <h1 className="text-4xl lg:text-5xl font-black text-white leading-[1.2] tracking-tight mb-6">
                                Your <span className="text-blue-200">Hyperlocal</span> Safety Network
                            </h1>
                            <p className="text-white/80 text-lg leading-relaxed max-w-md">
                                Join thousands of residents across Tamil Nadu. Share resources, get real-time emergency alerts, and volunteer to help your neighbors.
                            </p>
                        </motion.div>

                        <div className="mt-12 grid grid-cols-2 gap-6 max-w-sm">
                            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 }} className="flex items-center gap-3 rounded-2xl bg-white/10 p-4 backdrop-blur-md border border-white/10">
                                <span className="material-symbols-outlined text-blue-200">verified_user</span>
                                <span className="text-white font-bold text-sm">Verified Network</span>
                            </motion.div>
                            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.5 }} className="flex items-center gap-3 rounded-2xl bg-white/10 p-4 backdrop-blur-md border border-white/10">
                                <span className="material-symbols-outlined text-blue-200">flash_on</span>
                                <span className="text-white font-bold text-sm">Real-time Alerts</span>
                            </motion.div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Right Section - Auth Form */}
            <div className="w-full lg:w-1/2 flex items-center justify-center p-6 lg:p-12 relative">
                {/* Mobile Header elements */}
                <div className="absolute top-6 left-6 lg:hidden flex items-center gap-3">
                    <Link to="/" className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-white shadow-lg shadow-primary/20">
                        <span className="material-symbols-outlined text-xl">diversity_3</span>
                    </Link>
                    <span className="text-xl font-black text-slate-900 tracking-tight">Namma Thunai</span>
                </div>

                <div className="w-full max-w-md">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-white rounded-3xl p-8 lg:p-10 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100"
                    >
                        <div className="mb-8">
                            <h2 className="text-3xl font-black text-slate-900 mb-2">
                                {authStep === 1 && 'Welcome to Namma Thunai'}
                                {authStep === 2 && 'Verify your number'}
                                {authStep === 3 && 'Complete your profile'}
                            </h2>
                            <p className="text-sm text-slate-500 font-medium">
                                {authStep === 1 && 'Enter your phone number to connect with your community.'}
                                {authStep === 2 && `We sent a 6-digit code to ${phone}.`}
                                {authStep === 3 && 'Help neighbors recognize and locate you.'}
                            </p>
                        </div>

                        {error && (
                            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="mb-6 flex items-center gap-3 rounded-xl bg-red-50 p-4 text-red-600 border border-red-100 text-sm font-semibold">
                                <span className="material-symbols-outlined text-[20px]">error</span>
                                {error}
                            </motion.div>
                        )}

                        <AnimatePresence mode="wait">
                            {authStep === 1 && (
                                <motion.form
                                    key="step1"
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: 20 }}
                                    onSubmit={handleSendOtp}
                                    className="space-y-5"
                                >
                                    <div>
                                        <div className="relative">
                                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">+91</span>
                                            <input
                                                type="tel"
                                                value={phone}
                                                onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                                                placeholder="98765 43210"
                                                maxLength={10}
                                                className="w-full rounded-xl border-2 border-slate-100 bg-slate-50 pl-14 pr-4 py-3.5 text-lg font-bold tracking-wide text-slate-900 focus:border-primary focus:bg-white focus:outline-none focus:ring-4 focus:ring-primary/10 transition-all"
                                                required
                                            />
                                        </div>
                                    </div>

                                    <motion.button
                                        whileHover={{ scale: 1.01 }}
                                        whileTap={{ scale: 0.98 }}
                                        type="submit"
                                        disabled={loading || phone.length < 10}
                                        className="w-full rounded-xl bg-primary py-4 mt-2 text-sm font-bold text-white shadow-lg shadow-primary/25 disabled:opacity-50 disabled:shadow-none transition-all flex justify-center items-center gap-2"
                                    >
                                        {loading ? (
                                            <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                                        ) : (
                                            <>
                                                Get OTP
                                                <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                                            </>
                                        )}
                                    </motion.button>

                                    <div className="text-center pt-2">
                                        <p className="text-xs text-slate-400 font-medium">By continuing, you agree to our Terms & Conditions.</p>
                                    </div>
                                </motion.form>
                            )}

                            {authStep === 2 && (
                                <motion.form
                                    key="step2"
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: 20 }}
                                    onSubmit={handleVerifyOtp}
                                    className="space-y-6"
                                >
                                    <div>
                                        <div className="flex items-center justify-between mb-2">
                                            <label className="block text-xs font-black uppercase tracking-widest text-slate-500">6-Digit Code</label>
                                            <button type="button" onClick={() => setAuthStep(1)} className="text-xs font-bold text-primary hover:text-primary-dark transition-colors">Wrong number?</button>
                                        </div>
                                        <input
                                            type="text"
                                            value={otp}
                                            onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                                            placeholder="••••••"
                                            maxLength={6}
                                            className="w-full rounded-xl border-2 border-slate-100 bg-slate-50 px-4 py-4 text-3xl tracking-[0.5em] text-center font-black text-slate-900 focus:border-primary focus:bg-white focus:outline-none focus:ring-4 focus:ring-primary/10 transition-all"
                                            required
                                        />
                                    </div>

                                    <motion.button
                                        whileHover={{ scale: 1.01 }}
                                        whileTap={{ scale: 0.98 }}
                                        type="submit"
                                        disabled={loading || otp.length < 6}
                                        className="w-full rounded-xl bg-primary py-4 text-sm font-bold text-white shadow-lg shadow-primary/25 disabled:opacity-50 disabled:shadow-none transition-all flex justify-center items-center gap-2"
                                    >
                                        {loading ? (
                                            <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                                        ) : (
                                            <>
                                                Verify
                                                <span className="material-symbols-outlined text-[18px]">check_circle</span>
                                            </>
                                        )}
                                    </motion.button>

                                    <div className="text-center pt-2">
                                        <button
                                            type="button"
                                            onClick={handleSendOtp}
                                            disabled={loading || timer > 0}
                                            className="text-xs font-bold text-slate-500 hover:text-primary transition-colors disabled:opacity-50"
                                        >
                                            Resend code {timer > 0 ? `in 0:${timer.toString().padStart(2, '0')}s` : ''}
                                        </button>
                                    </div>
                                </motion.form>
                            )}

                            {authStep === 3 && (
                                <motion.form
                                    key="step3"
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: 20 }}
                                    onSubmit={handleSetupProfile}
                                    className="space-y-5"
                                >
                                    <div>
                                        <label className="mb-2 block text-xs font-black uppercase tracking-widest text-slate-500">Full Name</label>
                                        <input
                                            type="text"
                                            value={name}
                                            onChange={(e) => setName(e.target.value)}
                                            placeholder="e.g. Karthik S"
                                            className="w-full rounded-xl border-2 border-slate-100 bg-slate-50 px-4 py-3.5 text-base font-semibold text-slate-900 focus:border-primary focus:bg-white focus:outline-none focus:ring-4 focus:ring-primary/10 transition-all"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="mb-2 block text-xs font-black uppercase tracking-widest text-slate-500">Primary Neighborhood</label>
                                        <select
                                            value={areaCode}
                                            onChange={(e) => setAreaCode(e.target.value)}
                                            className="w-full rounded-xl border-2 border-slate-100 bg-slate-50 px-4 py-3.5 text-base font-semibold text-slate-900 focus:border-primary focus:bg-white focus:outline-none focus:ring-4 focus:ring-primary/10 transition-all capitalize cursor-pointer"
                                            required
                                        >
                                            <option value="" disabled>Select nearest area</option>
                                            {getLocationsDropdownOptions().map((opt, i) => (
                                                <option key={i} value={opt.value}>{opt.label}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <motion.button
                                        whileHover={{ scale: 1.01 }}
                                        whileTap={{ scale: 0.98 }}
                                        type="submit"
                                        disabled={loading || !name}
                                        className="w-full rounded-xl bg-primary py-4 mt-2 text-sm font-bold text-white shadow-lg shadow-primary/25 disabled:opacity-50 disabled:shadow-none transition-all flex justify-center items-center gap-2"
                                    >
                                        {loading ? (
                                            <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                                        ) : (
                                            <>
                                                Complete Setup
                                                <span className="material-symbols-outlined text-[18px]">task_alt</span>
                                            </>
                                        )}
                                    </motion.button>
                                </motion.form>
                            )}
                        </AnimatePresence>
                    </motion.div>
                </div>
            </div>
        </div>
    );
}
