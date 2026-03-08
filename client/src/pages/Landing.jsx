import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { motion } from 'framer-motion';
import FadeUp from '../components/AnimatedSection';
import Reveal from '../components/Reveal';
import { StaggerContainer, StaggerItem } from '../components/StaggerContainer';
import ParallaxSection from '../components/ParallaxSection';

export default function Landing() {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState(0);

    const openAuthModal = () => {
        navigate('/login');
    };

    return (
        <div className="relative flex min-h-screen w-full flex-col overflow-x-hidden bg-bg-light font-sans text-slate-900">
            {/* Header */}
            <motion.header
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
                className="sticky top-0 z-50 w-full border-b border-slate-200 bg-white/80 backdrop-blur-md"
            >
                <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 lg:px-10">
                    <div className="flex items-center gap-3">
                        <motion.div
                            whileHover={{ rotate: [0, -5, 5, 0], scale: 1.05 }}
                            transition={{ duration: 0.4 }}
                            className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-white"
                        >
                            <span className="material-symbols-outlined">diversity_3</span>
                        </motion.div>
                        <h1 className="text-xl font-bold tracking-tight text-slate-900">Uruthunai</h1>
                    </div>
                    <nav className="hidden flex-1 justify-center gap-8 md:flex">
                        {['How it Works', 'About Us', 'Community', 'Resources'].map((item) => (
                            <a
                                key={item}
                                className="nav-underline pb-1 text-sm font-semibold text-slate-600 hover:text-primary transition-colors"
                                href={`#${item.toLowerCase().replace(/\s+/g, '-')}`}
                            >
                                {item}
                            </a>
                        ))}
                    </nav>
                    <div className="flex items-center gap-3">
                        <button onClick={openAuthModal} className="hidden text-sm font-bold text-slate-700 hover:text-primary sm:block px-4 py-2 transition-colors">Login</button>
                        <motion.button
                            onClick={openAuthModal}
                            whileHover={{ scale: 1.03, boxShadow: '0 10px 30px rgba(48, 140, 232, 0.2)' }}
                            whileTap={{ scale: 0.97 }}
                            className="rounded-lg bg-primary px-5 py-2.5 text-sm font-bold text-white shadow-sm transition-colors"
                        >
                            Join Community
                        </motion.button>
                    </div>
                </div>
            </motion.header>

            <main className="flex-1">
                {/* Emergency Alert Banner */}
                <FadeUp delay={0.3} y={10} className="bg-blue-50 px-6 py-3 border-b border-blue-100">
                    <div className="mx-auto max-w-7xl flex flex-col sm:flex-row items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                            <span className="material-symbols-outlined text-red-600 animate-pulse icon-hover">warning</span>
                            <div>
                                <p className="text-sm font-bold text-slate-900 leading-none">Red Alert: Heavy Rainfall Warning</p>
                                <p className="text-xs text-slate-700 mt-1">IMD predicts extremely heavy rainfall in coastal districts. Please stay indoors and monitor community updates.</p>
                            </div>
                        </div>
                        <motion.button
                            onClick={() => navigate('/alerts')}
                            whileHover={{ scale: 1.04 }}
                            whileTap={{ scale: 0.97 }}
                            className="flex items-center gap-2 rounded-full bg-primary px-4 py-1.5 text-xs font-bold text-white hover:bg-primary/90 transition-all"
                        >
                            View Alerts
                            <span className="material-symbols-outlined text-sm">chevron_right</span>
                        </motion.button>
                    </div>
                </FadeUp>

                {/* Hero Section */}
                <section className="relative overflow-hidden px-6 py-16 lg:px-10 lg:py-24">
                    <div className="mx-auto max-w-7xl">
                        <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2">
                            <div className="flex flex-col gap-8">
                                <div className="flex flex-col gap-4">
                                    <FadeUp delay={0.1}>
                                        <span className="inline-flex w-fit items-center rounded-full bg-primary/10 px-3 py-1 text-xs font-bold tracking-wider text-primary uppercase">
                                            Community-Led Resilience
                                        </span>
                                    </FadeUp>
                                    <FadeUp delay={0.2} y={40}>
                                        <h1 className="text-4xl sm:text-5xl font-black leading-[1.1] tracking-tight text-slate-900 lg:text-7xl">
                                            Uru<span className="text-primary">thunai</span>
                                        </h1>
                                    </FadeUp>
                                    <FadeUp delay={0.35}>
                                        <p className="text-lg font-medium text-slate-600 lg:text-xl">
                                            From the scars of the 2004 Tsunami, the resilience shown during Cyclone Gaja, and the solidarity of the Chennai Floods—our strength lies in each other. Uruthunai empowers Tamil Nadu neighborhoods through rapid mutual aid and disaster preparedness.
                                        </p>
                                    </FadeUp>
                                </div>
                                <FadeUp delay={0.5}>
                                    <div className="flex flex-wrap gap-4">
                                        <motion.button
                                            onClick={openAuthModal}
                                            whileHover={{ scale: 1.03, boxShadow: '0 16px 40px rgba(48, 140, 232, 0.25)' }}
                                            whileTap={{ scale: 0.97 }}
                                            className="flex min-w-[160px] items-center justify-center rounded-xl bg-primary px-8 py-4 text-base font-bold text-white shadow-lg shadow-primary/20 transition-colors"
                                        >
                                            Join Community
                                        </motion.button>
                                        <motion.button
                                            whileHover={{ scale: 1.02, backgroundColor: 'rgb(248 250 252)' }}
                                            whileTap={{ scale: 0.97 }}
                                            className="flex min-w-[160px] items-center justify-center rounded-xl border border-slate-200 bg-white px-8 py-4 text-base font-bold text-slate-900 transition-colors"
                                        >
                                            Learn More
                                        </motion.button>
                                    </div>
                                </FadeUp>
                                <FadeUp delay={0.6}>
                                    <div className="flex items-center gap-4 border-t border-slate-100 pt-8">
                                        <div className="flex -space-x-3">
                                            {['A', 'R', 'S'].map((initial, i) => (
                                                <motion.div
                                                    key={initial}
                                                    initial={{ opacity: 0, scale: 0.5, x: -10 }}
                                                    animate={{ opacity: 1, scale: 1, x: 0 }}
                                                    transition={{ delay: 0.7 + i * 0.1, duration: 0.4, ease: 'easeOut' }}
                                                    className={`h-10 w-10 rounded-full border-2 border-white flex items-center justify-center text-xs font-bold ${i === 0 ? 'bg-primary/30 text-primary' : i === 1 ? 'bg-blue-200 text-blue-700' : 'bg-emerald-200 text-emerald-700'}`}
                                                >
                                                    {initial}
                                                </motion.div>
                                            ))}
                                        </div>
                                        <p className="text-sm font-medium text-slate-500">Trusted by <span className="font-bold text-slate-900">1,200+ residents</span> across Erode</p>
                                    </div>
                                </FadeUp>
                            </div>

                            {/* Hero Visual with Parallax & Floating Cards */}
                            <Reveal delay={0.3} direction="right">
                                <div className="relative">
                                    <ParallaxSection speed={0.15}>
                                        <div className="absolute -left-10 -top-10 h-64 w-64 rounded-full bg-primary/20 blur-[80px]"></div>
                                    </ParallaxSection>
                                    <ParallaxSection speed={-0.1}>
                                        <div className="absolute -bottom-10 -right-10 h-64 w-64 rounded-full bg-secondary/20 blur-[80px]"></div>
                                    </ParallaxSection>

                                    <motion.div
                                        whileHover={{ scale: 1.02 }}
                                        transition={{ duration: 0.5, ease: 'easeOut' }}
                                        className="relative aspect-[4/3] w-full overflow-hidden rounded-[2rem] border-[6px] border-white/50 bg-white/20 shadow-2xl backdrop-blur-sm z-10"
                                    >
                                        <img src="/app_overview.png" alt="Uruthunai App Infrastructure" className="h-full w-full object-cover" />
                                        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-slate-900/10 to-transparent"></div>

                                        <div className="absolute bottom-6 left-6 right-6">
                                            <div className="rounded-2xl border border-white/20 bg-white/10 p-4 backdrop-blur-md">
                                                <div className="flex items-center gap-4">
                                                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-accent/20 text-accent">
                                                        <span className="material-symbols-outlined material-symbols-outlined-filled text-2xl">verified</span>
                                                    </div>
                                                    <div>
                                                        <h4 className="text-white font-bold text-sm">Hyperlocal Network Active</h4>
                                                        <p className="text-white/80 text-xs">Real-time resource sharing enabled</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </motion.div>

                                    <motion.div
                                        initial={{ y: 20, opacity: 0 }}
                                        animate={{ y: 0, opacity: 1 }}
                                        transition={{ delay: 0.8, type: 'spring', bounce: 0.4 }}
                                        className="absolute -left-8 top-1/4 z-20 hidden md:block"
                                    >
                                        <div className="flex items-center gap-3 rounded-xl border border-slate-100 bg-white/95 p-3 shadow-xl backdrop-blur-md">
                                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-orange-100 text-orange-600">
                                                <span className="material-symbols-outlined text-[20px]">water_damage</span>
                                            </div>
                                            <div className="pr-4">
                                                <p className="text-sm font-bold leading-tight text-slate-900">Severe Inundation Warning</p>
                                                <p className="text-xs text-slate-500">Pallikaranai Marshes • 2 mins ago</p>
                                            </div>
                                        </div>
                                    </motion.div>

                                    <motion.div
                                        initial={{ y: -20, opacity: 0 }}
                                        animate={{ y: 0, opacity: 1 }}
                                        transition={{ delay: 1.1, type: 'spring', bounce: 0.4 }}
                                        className="absolute -right-6 bottom-1/3 z-20 hidden md:block"
                                    >
                                        <div className="flex items-center gap-3 rounded-xl border border-slate-100 bg-white/95 p-3 shadow-xl backdrop-blur-md">
                                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                                                <span className="material-symbols-outlined text-[20px]">medical_services</span>
                                            </div>
                                            <div className="pr-4">
                                                <p className="text-sm font-bold leading-tight text-slate-900">First Aid Needed</p>
                                                <p className="text-xs font-medium text-success">Volunteer En Route</p>
                                            </div>
                                        </div>
                                    </motion.div>
                                </div>
                            </Reveal>
                        </div>
                    </div>
                </section>

                {/* Interactive Feature Demo */}
                <section id="how-it-works" className="bg-white px-4 sm:px-6 py-16 sm:py-24 lg:px-10">
                    <div className="mx-auto max-w-7xl">
                        <FadeUp className="mb-16 flex flex-col items-center text-center">
                            <h2 className="text-sm font-bold uppercase tracking-widest text-primary">Solidarity in Action</h2>
                            <h3 className="mt-4 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">Never Face It Alone</h3>
                            <p className="mt-4 max-w-2xl text-lg text-slate-600">
                                When traditional lines of communication fail—as we experienced during Cyclone Vardah and the 2015 floods—hyperlocal networks save lives. Explore how the platform works.
                            </p>
                        </FadeUp>

                        <div className="grid grid-cols-1 gap-12 lg:grid-cols-12 items-center">
                            {/* Tabs */}
                            <div className="lg:col-span-5 flex flex-col gap-4">
                                {[
                                    { icon: 'share_location', title: 'Community Resource Map', desc: 'Instantly view who has clean drinking water, backup power, or medical supplies within your immediate zone.' },
                                    { icon: 'notifications_active', title: 'Hyperlocal Emergency Alerts', desc: 'Receive real-time, verified alerts about reservoir discharges, power cuts, and rescue boat deployments.' },
                                    { icon: 'handshake', title: 'Volunteer Coordination', desc: 'Request immediate physical assistance for vulnerable neighbors, elderly residents, or stranded families.' },
                                ].map((tab, idx) => (
                                    <motion.button
                                        key={idx}
                                        onClick={() => setActiveTab(idx)}
                                        className={`flex flex-col sm:flex-row gap-4 text-left items-start sm:items-center rounded-2xl p-4 sm:p-6 transition-all duration-300 ${activeTab === idx ? 'bg-primary/5 border-2 border-primary/20 shadow-lg shadow-primary/5' : 'bg-transparent border-2 border-transparent hover:bg-slate-50'}`}
                                    >
                                        <div className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-xl transition-colors ${activeTab === idx ? 'bg-primary text-white' : 'bg-slate-100 text-slate-500'}`}>
                                            <span className="material-symbols-outlined text-3xl">{tab.icon}</span>
                                        </div>
                                        <div>
                                            <h4 className={`text-xl font-bold ${activeTab === idx ? 'text-primary' : 'text-slate-900'}`}>{tab.title}</h4>
                                            <p className="mt-2 text-sm text-slate-600 leading-relaxed">{tab.desc}</p>
                                        </div>
                                    </motion.button>
                                ))}
                            </div>

                            {/* Viewer */}
                            <div className="lg:col-span-7">
                                <Reveal delay={0.2} direction="up">
                                    <div className="relative aspect-square sm:aspect-video w-full overflow-hidden rounded-[2.5rem] bg-slate-100 border-8 border-slate-50 shadow-2xl">

                                        {/* Dynamic Content Based on Tab selection */}
                                        <motion.div
                                            key={activeTab}
                                            initial={{ opacity: 0, x: 20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ duration: 0.4 }}
                                            className="h-full w-full bg-cover bg-center"
                                        >
                                            {activeTab === 0 && (
                                                <div className="relative w-full h-full flex flex-col w-full h-full justify-end bg-mint-50">
                                                    <img src="/resource_map_mockup.png" alt="Resource Map" className="absolute inset-0 w-full h-full object-cover" />
                                                    <div className="relative z-10 w-full bg-gradient-to-t from-slate-900/80 via-slate-900/40 to-transparent p-6 pt-24 text-white">
                                                        <div className="flex gap-2 overflow-x-auto pb-2">
                                                            {['Water (12)', 'Medical (3)', 'Power (5)', 'Food (8)'].map((filter, i) => (
                                                                <span key={i} className="whitespace-nowrap rounded-full border border-white/20 bg-black/40 px-4 py-2 text-xs font-bold backdrop-blur-md cursor-pointer hover:bg-primary transition-colors">
                                                                    {filter}
                                                                </span>
                                                            ))}
                                                        </div>
                                                    </div>
                                                </div>
                                            )}

                                            {activeTab === 1 && (
                                                <div className="w-full h-full bg-slate-900 p-8 flex flex-col justify-center gap-4 relative overflow-hidden">
                                                    <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '32px 32px' }}></div>
                                                    <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="relative z-10 mx-auto w-full max-w-sm rounded-2xl bg-red-500 p-6 text-white shadow-xl">
                                                        <div className="flex items-center gap-3 border-b border-red-400/50 pb-4">
                                                            <span className="material-symbols-outlined text-4xl animate-pulse">warning</span>
                                                            <div>
                                                                <h4 className="text-lg font-black">CRITICAL ALERT</h4>
                                                                <p className="text-xs text-red-100">Adyar, Zone 13</p>
                                                            </div>
                                                        </div>
                                                        <div className="pt-4">
                                                            <p className="text-sm font-medium">Excessive discharge from Chembarambakkam reservoir expected. Low-lying areas in Adyar basin please initiate community evacuation protocol immediately.</p>
                                                        </div>
                                                    </motion.div>
                                                    <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} transition={{ delay: 0.2 }} className="relative z-10 mx-auto w-full max-w-sm rounded-2xl bg-white p-4 shadow-xl">
                                                        <div className="flex items-center gap-3">
                                                            <div className="h-10 w-10 rounded-full bg-orange-100 flex items-center justify-center text-orange-600"><span className="material-symbols-outlined">power_off</span></div>
                                                            <div>
                                                                <h4 className="text-sm font-bold text-slate-900">Power Maintenance</h4>
                                                                <p className="text-xs text-slate-500">Scheduled at 14:00 for your block</p>
                                                            </div>
                                                        </div>
                                                    </motion.div>
                                                </div>
                                            )}

                                            {activeTab === 2 && (
                                                <div className="relative w-full h-full p-8 flex flex-col justify-center items-center">
                                                    <img src="/app_overview.png" alt="Volunteers" className="absolute inset-0 w-full h-full object-cover blur-sm opacity-20 mix-blend-multiply" />
                                                    <div className="relative z-10 flex w-full max-w-md flex-col gap-4">
                                                        {[
                                                            { name: 'Karthik S.', role: 'Medical Reg', needs: 'Need First Aid Kit', urg: 'High' },
                                                            { name: 'Priya R.', role: 'Resident', needs: 'Help moving furniture', urg: 'Medium' },
                                                        ].map((req, i) => (
                                                            <div key={i} className="flex flex-col sm:flex-row gap-4 items-center justify-between rounded-2xl bg-white p-5 shadow-xl border border-slate-100 transform transition-transform hover:scale-105">
                                                                <div className="flex items-center gap-4 w-full">
                                                                    <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-lg">{req.name[0]}</div>
                                                                    <div>
                                                                        <h4 className="text-sm font-bold text-slate-900">{req.needs}</h4>
                                                                        <div className="flex items-center gap-2 mt-1">
                                                                            <span className="text-xs text-slate-500">{req.name}</span>
                                                                            <span className={`px-2 py-[2px] rounded text-[10px] font-bold ${req.urg === 'High' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'}`}>{req.urg} Prio</span>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                                <button className="w-full sm:w-auto mt-2 sm:mt-0 whitespace-nowrap rounded-lg bg-primary px-4 py-2 text-xs font-bold text-white hover:bg-primary-dark transition-colors">Help Info</button>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                        </motion.div>
                                    </div>
                                </Reveal>
                            </div>
                        </div>
                    </div>
                </section>

                {/* CTA Section */}
                <section className="px-6 py-20 lg:px-10">
                    <Reveal direction="scale">
                        <div className="mx-auto max-w-5xl overflow-hidden rounded-3xl bg-primary px-8 py-16 text-center text-white shadow-2xl shadow-primary/40 relative">
                            <div className="relative z-10">
                                <FadeUp y={20}>
                                    <h2 className="text-2xl sm:text-5xl font-black">Our strength is our community.</h2>
                                </FadeUp>
                                <FadeUp delay={0.2} y={20}>
                                    <p className="mx-auto mt-6 max-w-2xl text-lg text-white/80">
                                        Tamil Nadu has weathered the toughest storms because we stand together. Uruthunai simply gives that spirit of "Namma Thunai" a digital voice. Join the network before the next crisis hits.
                                    </p>
                                </FadeUp>
                                <FadeUp delay={0.4}>
                                    <div className="mt-10 flex flex-wrap justify-center gap-4">
                                        <motion.button
                                            onClick={openAuthModal}
                                            whileHover={{ scale: 1.04, boxShadow: '0 12px 30px rgba(0,0,0,0.15)' }}
                                            whileTap={{ scale: 0.97 }}
                                            className="rounded-xl bg-white px-8 py-4 text-base font-bold text-primary transition-colors"
                                        >
                                            Get Started Now
                                        </motion.button>
                                        <motion.button
                                            whileHover={{ scale: 1.04, backgroundColor: 'rgba(255,255,255,0.2)' }}
                                            whileTap={{ scale: 0.97 }}
                                            className="rounded-xl border border-white/30 bg-white/10 px-8 py-4 text-base font-bold text-white transition-colors"
                                        >
                                            View Help Guide
                                        </motion.button>
                                    </div>
                                </FadeUp>
                            </div>
                            <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '24px 24px' }}></div>
                        </div>
                    </Reveal>
                </section>
            </main>

            {/* Footer */}
            <FadeUp as="footer" className="border-t border-slate-200 bg-white px-6 py-12 lg:px-10">
                <div className="mx-auto max-w-7xl">
                    <div className="flex flex-col items-center justify-between gap-8 md:flex-row">
                        <div className="flex items-center gap-3">
                            <div className="flex h-8 w-8 items-center justify-center rounded bg-primary text-white">
                                <span className="material-symbols-outlined text-lg">diversity_3</span>
                            </div>
                            <span className="text-lg font-bold">Uruthunai</span>
                        </div>
                        <p className="text-sm text-slate-500">© 2024 Uruthunai Foundation. Built for Tamil Nadu.</p>
                        <div className="flex gap-6">
                            {['public', 'shield', 'alternate_email'].map((icon) => (
                                <motion.a
                                    key={icon}
                                    whileHover={{ y: -3, color: '#8B5CF6' }}
                                    className="text-slate-400 transition-colors cursor-pointer"
                                    href="#"
                                >
                                    <span className="material-symbols-outlined">{icon}</span>
                                </motion.a>
                            ))}
                        </div>
                    </div>
                </div>
            </FadeUp>
        </div>
    );
}
