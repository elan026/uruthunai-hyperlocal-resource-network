import { useNavigate } from 'react-router-dom';
import { HeartHandshake, ArrowRight, ShieldAlert, Users, Phone, BellRing } from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import EmergencyBanner from '../components/EmergencyBanner';

export default function Landing() {
    const { login } = useAuth();
    const navigate = useNavigate();
    const [phone, setPhone] = useState('9876543210');

    const handleLogin = async () => {
        try {
            await login({
                phone_number: phone,
                name: 'Anitha M.',
                area_code: 'CHN-ADY-01',
                role: 'Resident'
            });
            navigate('/dashboard');
        } catch (err) {
            console.error('Login error', err);
        }
    };

    return (
        <div className="min-h-screen w-full bg-white font-sans text-gray-800 flex flex-col">
            {/* Header / Navbar equivalent for Landing */}
            <header className="flex items-center justify-between px-10 py-5 bg-white border-b border-gray-100 z-50">
                <div className="flex items-center gap-3 text-teal-600 font-bold text-2xl">
                    <HeartHandshake className="h-8 w-8 text-teal-500" />
                    <span className="text-navy-900 tracking-tight">Namma Thunai</span>
                </div>
                <nav className="flex items-center gap-8 font-medium">
                    <a href="#how-it-works" className="text-gray-600 hover:text-teal-600 transition-colors">How it Works</a>
                    <a href="#preparedness" className="text-gray-600 hover:text-teal-600 transition-colors">Preparedness</a>
                </nav>
                <div className="flex items-center gap-4">
                    <button onClick={handleLogin} className="px-6 py-2.5 bg-gray-50 border border-gray-200 text-navy-800 font-semibold rounded-full hover:bg-gray-100 transition-colors">
                        Login
                    </button>
                    <button onClick={handleLogin} className="px-6 py-2.5 bg-teal-600 text-white font-bold rounded-full hover:bg-teal-700 shadow-md transition-all">
                        Join Community
                    </button>
                </div>
            </header>

            <main className="flex-1 w-full max-w-7xl mx-auto px-10 relative">

                {/* Emergency Banner if needed */}
                <div className="mt-8">
                    <EmergencyBanner message="Widespread heatwave alert in Chennai. Check on elderly neighbors." />
                </div>

                {/* Hero Section */}
                <section className="flex flex-col lg:flex-row items-center justify-between py-16 gap-16">
                    <div className="flex-1 space-y-8 pr-8">
                        <div className="inline-flex items-center gap-2 bg-teal-50 text-teal-700 px-4 py-1.5 rounded-full font-bold text-sm border border-teal-100">
                            <Users className="w-4 h-4" /> Community First
                        </div>
                        <h1 className="text-5xl lg:text-7xl font-extrabold text-navy-900 leading-[1.1] tracking-tight">
                            Hyperlocal Support for <br />
                            <span className="text-teal-500">Every Neighborhood</span>
                        </h1>
                        <p className="text-xl text-gray-500 max-w-lg leading-relaxed font-medium">
                            Namma Thunai connects you with neighbors during everyday needs and emergencies. A mutual-aid platform built for Tamil Nadu.
                        </p>
                        <div className="flex gap-4 pt-4">
                            <button onClick={handleLogin} className="flex items-center gap-3 px-8 py-4 bg-teal-600 text-white font-bold rounded-full shadow-lg shadow-teal-500/30 hover:bg-teal-700 hover:-translate-y-1 transition-all text-lg border border-teal-500">
                                Get Started <ArrowRight className="h-5 w-5" />
                            </button>
                            <button className="flex items-center gap-3 px-8 py-4 bg-white text-navy-800 font-bold rounded-full shadow-sm hover:shadow-md border border-gray-200 hover:-translate-y-1 transition-all text-lg">
                                Learn More
                            </button>
                        </div>
                    </div>

                    <div className="flex-1 flex justify-center relative">
                        {/* Illustration area */}
                        <div className="bg-gradient-to-br from-teal-50 to-blue-50 w-full max-w-lg aspect-square rounded-[80px] flex flex-col items-center justify-center border-[12px] border-white shadow-2xl relative overflow-hidden group">
                            <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] mix-blend-multiply"></div>
                            <div className="p-8 bg-white rounded-full shadow-xl z-10 mb-6 border border-teal-50 group-hover:scale-110 transition-transform">
                                <HeartHandshake className="h-32 w-32 text-teal-500" />
                            </div>
                            <h2 className="text-3xl font-extrabold text-navy-800 z-10 tracking-tight tracking-wider">Neighbors Helping Neighbors</h2>
                        </div>
                    </div>
                </section>

                <section id="how-it-works" className="py-20 border-t border-gray-100 mt-10">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl font-extrabold text-navy-900 tracking-tight">How it Works</h2>
                        <p className="text-gray-500 mt-4 text-lg">Community-led disaster preparedness and mutual aid.</p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 hover:shadow-xl transition-all hover:-translate-y-2">
                            <div className="bg-teal-50 p-4 rounded-2xl w-fit mb-6 shadow-inner border border-teal-100">
                                <Users className="h-8 w-8 text-teal-600" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-3">1. Join your Area</h3>
                            <p className="text-gray-500 leading-relaxed font-medium">Verify your localized area code and connect with verified neighbors nearby.</p>
                        </div>
                        <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 hover:shadow-xl transition-all hover:-translate-y-2">
                            <div className="bg-orange-50 p-4 rounded-2xl w-fit mb-6 shadow-inner border border-orange-100">
                                <BellRing className="h-8 w-8 text-orange-600" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-3">2. Alert & Request</h3>
                            <p className="text-gray-500 leading-relaxed font-medium">Quickly post emergency alerts or request vital resources when disaster strikes.</p>
                        </div>
                        <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 hover:shadow-xl transition-all hover:-translate-y-2">
                            <div className="bg-blue-50 p-4 rounded-2xl w-fit mb-6 shadow-inner border border-blue-100">
                                <HeartHandshake className="h-8 w-8 text-blue-600" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-3">3. Mutual Aid</h3>
                            <p className="text-gray-500 leading-relaxed font-medium">Volunteers step in to provide shelter, transport, and supplies directly to you.</p>
                        </div>
                    </div>
                </section>

            </main>
        </div>
    );
}
