import { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import useReducedMotion from '../hooks/useReducedMotion';

/**
 * ParallaxSection — Subtle parallax scrolling effect.
 * Uses Framer Motion's useScroll + useTransform for GPU-accelerated transforms.
 *
 * @param {Object} props
 * @param {React.ReactNode} props.children
 * @param {number} props.speed - Parallax intensity. Positive = slower, negative = faster (default: 0.3)
 * @param {string} props.className - Additional classes
 * @param {'y' | 'x'} props.direction - Parallax direction (default: 'y')
 */
export default function ParallaxSection({
    children,
    speed = 0.3,
    className = '',
    direction = 'y',
    ...rest
}) {
    const ref = useRef(null);
    const prefersReduced = useReducedMotion();

    const { scrollYProgress } = useScroll({
        target: ref,
        offset: ['start end', 'end start'],
    });

    const range = 100 * speed;
    const yValue = useTransform(scrollYProgress, [0, 1], [range, -range]);
    const xValue = useTransform(scrollYProgress, [0, 1], [range, -range]);

    if (prefersReduced) {
        return (
            <div ref={ref} className={className} {...rest}>
                {children}
            </div>
        );
    }

    return (
        <div ref={ref} className={`overflow-hidden ${className}`} {...rest}>
            <motion.div
                style={direction === 'y' ? { y: yValue } : { x: xValue }}
                className="will-change-transform"
            >
                {children}
            </motion.div>
        </div>
    );
}
