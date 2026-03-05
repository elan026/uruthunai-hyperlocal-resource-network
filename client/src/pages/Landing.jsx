import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { motion } from 'framer-motion';
import FadeUp from '../components/AnimatedSection';
import Reveal from '../components/Reveal';
import { StaggerContainer, StaggerItem } from '../components/StaggerContainer';
import ParallaxSection from '../components/ParallaxSection';

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
                        <h1 className="text-xl font-bold tracking-tight text-slate-900">Namma Thunai</h1>
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
                        <button onClick={handleLogin} className="hidden text-sm font-bold text-slate-700 hover:text-primary sm:block px-4 py-2 transition-colors">Login</button>
                        <motion.button
                            onClick={handleLogin}
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
                            <span className="material-symbols-outlined text-primary animate-pulse icon-hover">emergency_home</span>
                            <div>
                                <p className="text-sm font-bold text-slate-900 leading-none">Urgent: Emergency Alert</p>
                                <p className="text-xs text-slate-600 mt-1">Heavy rainfall expected in coastal regions. Check local community boards.</p>
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
                                        <h1 className="text-5xl font-black leading-[1.1] tracking-tight text-slate-900 lg:text-7xl">
                                            Namma <span className="text-primary">Thunai</span>
                                        </h1>
                                    </FadeUp>
                                    <FadeUp delay={0.35}>
                                        <p className="text-lg font-medium text-slate-600 lg:text-xl">
                                            Hyperlocal Support for Every Neighborhood. Empowering Tamil Nadu communities through mutual aid, shared resources, and disaster preparedness.
                                        </p>
                                    </FadeUp>
                                </div>
                                <FadeUp delay={0.5}>
                                    <div className="flex flex-wrap gap-4">
                                        <motion.button
                                            onClick={handleLogin}
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
                                        <p className="text-sm font-medium text-slate-500">Trusted by <span className="font-bold text-slate-900">5,000+ residents</span> across Chennai</p>
                                    </div>
                                </FadeUp>
                            </div>

                            {/* Hero Visual with Parallax */}
                            <Reveal delay={0.3} direction="right">
                                <div className="relative">
                                    <ParallaxSection speed={0.15}>
                                        <div className="absolute -left-4 -top-4 h-64 w-64 rounded-full bg-primary/10 blur-3xl"></div>
                                    </ParallaxSection>
                                    <ParallaxSection speed={-0.1}>
                                        <div className="absolute -bottom-4 -right-4 h-64 w-64 rounded-full bg-blue-400/10 blur-3xl"></div>
                                    </ParallaxSection>
                                    <motion.div
                                        whileHover={{ scale: 1.01 }}
                                        transition={{ duration: 0.4 }}
                                        className="relative aspect-[4/3] w-full overflow-hidden rounded-3xl bg-gradient-to-br from-primary/20 to-blue-100 shadow-2xl flex items-center justify-center"
                                    >
                                        <div className="text-center p-8">
                                            <motion.span
                                                animate={{ y: [0, -6, 0] }}
                                                transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                                                className="material-symbols-outlined text-[120px] text-primary/40 block"
                                            >
                                                diversity_3
                                            </motion.span>
                                            <p className="text-xl font-bold text-slate-700 mt-4">Neighbors Helping Neighbors</p>
                                        </div>
                                        <div className="absolute inset-0 bg-gradient-to-tr from-primary/20 to-transparent"></div>
                                    </motion.div>
                                </div>
                            </Reveal>
                        </div>
                    </div>
                </section>

                {/* How it Works */}
                <section id="how-it-works" className="bg-white px-6 py-20 lg:px-10">
                    <div className="mx-auto max-w-7xl">
                        <FadeUp className="mb-16 flex flex-col items-center text-center">
                            <h2 className="text-sm font-bold uppercase tracking-widest text-primary">Our Framework</h2>
                            <h3 className="mt-4 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">How it Works</h3>
                            <p className="mt-4 max-w-2xl text-lg text-slate-600">
                                Namma Thunai connects neighborhoods into small, tight-knit circles to ensure no one is left behind when a crisis hits.
                            </p>
                        </FadeUp>
                        <StaggerContainer staggerDelay={0.15} className="grid grid-cols-1 gap-8 md:grid-cols-3">
                            {[
                                { icon: 'notifications_active', title: 'Real-time Alerts', desc: 'Receive hyperlocal updates specific to your street. Our system monitors weather and infrastructure data to keep you informed before the storm hits.' },
                                { icon: 'handshake', title: 'Resource Sharing', desc: 'Coordinate tools, clean water, and food within your community circle. Use our simple inventory system to know who has a generator or extra supplies.' },
                                { icon: 'groups', title: 'Verified Volunteers', desc: 'Connect with vetted volunteers and neighbors. Every member is verified to ensure a safe and trustworthy support network for your family.' },
                            ].map((item, i) => (
                                <StaggerItem key={i}>
                                    <motion.div
                                        whileHover={{ y: -6, boxShadow: '0 24px 48px -12px rgba(0, 0, 0, 0.08)' }}
                                        transition={{ duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
                                        className="group flex flex-col rounded-2xl border border-slate-100 bg-bg-light p-8 transition-colors h-full"
                                    >
                                        <motion.div
                                            whileHover={{ rotate: [0, -5, 5, 0] }}
                                            transition={{ duration: 0.4 }}
                                            className="mb-6 flex h-14 w-14 items-center justify-center rounded-xl bg-primary/10 text-primary group-hover:bg-primary group-hover:text-white transition-all duration-300"
                                        >
                                            <span className="material-symbols-outlined text-3xl">{item.icon}</span>
                                        </motion.div>
                                        <h4 className="mb-3 text-xl font-bold text-slate-900">{item.title}</h4>
                                        <p className="text-slate-600">{item.desc}</p>
                                    </motion.div>
                                </StaggerItem>
                            ))}
                        </StaggerContainer>
                    </div>
                </section>

                {/* CTA Section */}
                <section className="px-6 py-20 lg:px-10">
                    <Reveal direction="scale">
                        <div className="mx-auto max-w-5xl overflow-hidden rounded-3xl bg-primary px-8 py-16 text-center text-white shadow-2xl shadow-primary/40 relative">
                            <div className="relative z-10">
                                <FadeUp y={20}>
                                    <h2 className="text-3xl font-black sm:text-5xl">Ready to protect your neighborhood?</h2>
                                </FadeUp>
                                <FadeUp delay={0.2} y={20}>
                                    <p className="mx-auto mt-6 max-w-xl text-lg text-white/80">
                                        Join thousands of residents across Tamil Nadu building a resilient future together. Secure your community's safety today.
                                    </p>
                                </FadeUp>
                                <FadeUp delay={0.4}>
                                    <div className="mt-10 flex flex-wrap justify-center gap-4">
                                        <motion.button
                                            onClick={handleLogin}
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
                            <span className="text-lg font-bold">Namma Thunai</span>
                        </div>
                        <p className="text-sm text-slate-500">© 2024 Namma Thunai Foundation. Built for Tamil Nadu.</p>
                        <div className="flex gap-6">
                            {['public', 'shield', 'alternate_email'].map((icon) => (
                                <motion.a
                                    key={icon}
                                    whileHover={{ y: -3, color: '#308ce8' }}
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
