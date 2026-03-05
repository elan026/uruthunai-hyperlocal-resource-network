import { motion, useScroll, useSpring } from 'framer-motion';
import useReducedMotion from '../hooks/useReducedMotion';

/**
 * ScrollProgressBar — Thin progress indicator at the top of the viewport.
 * Shows page scroll percentage with a spring-damped animation.
 *
 * @param {Object} props
 * @param {string} props.color - Bar color (default: Tailwind primary)
 * @param {number} props.height - Bar height in px (default: 3)
 */
export default function ScrollProgressBar({
    color = '#308ce8',
    height = 3,
}) {
    const prefersReduced = useReducedMotion();
    const { scrollYProgress } = useScroll();

    const scaleX = useSpring(scrollYProgress, {
        stiffness: 100,
        damping: 30,
        restDelta: 0.001,
    });

    if (prefersReduced) return null;

    return (
        <motion.div
            style={{
                scaleX,
                transformOrigin: '0%',
                background: color,
                height: `${height}px`,
            }}
            className="fixed top-0 left-0 right-0 z-[9999]"
        />
    );
}
