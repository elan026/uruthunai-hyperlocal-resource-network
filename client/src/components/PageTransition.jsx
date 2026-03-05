import { motion, AnimatePresence } from 'framer-motion';
import { useLocation } from 'react-router-dom';
import useReducedMotion from '../hooks/useReducedMotion';

/**
 * PageTransition — Wraps page content with enter/exit animations.
 * Use inside <Routes> or as a wrapper around page content.
 *
 * @param {Object} props
 * @param {React.ReactNode} props.children
 * @param {string} props.className
 */
export default function PageTransition({ children, className = '' }) {
    const location = useLocation();
    const prefersReduced = useReducedMotion();

    if (prefersReduced) {
        return <div className={className}>{children}</div>;
    }

    return (
        <AnimatePresence mode="wait">
            <motion.div
                key={location.pathname}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{
                    duration: 0.45,
                    ease: [0.25, 0.46, 0.45, 0.94],
                }}
                className={className}
            >
                {children}
            </motion.div>
        </AnimatePresence>
    );
}
