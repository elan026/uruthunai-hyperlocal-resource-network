import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import useReducedMotion from '../hooks/useReducedMotion';

/**
 * StaggerContainer — Animates children with staggered delays.
 * Pairs with StaggerItem for a coordinated entrance effect.
 *
 * @param {Object} props
 * @param {React.ReactNode} props.children
 * @param {number} props.staggerDelay - Delay between children in seconds (default: 0.1)
 * @param {number} props.startDelay - Delay before first child (default: 0.1)
 * @param {boolean} props.once - Trigger once (default: true)
 * @param {string} props.className - Additional classes
 */
export function StaggerContainer({
    children,
    staggerDelay = 0.1,
    startDelay = 0.1,
    once = true,
    className = '',
    ...rest
}) {
    const ref = useRef(null);
    const isInView = useInView(ref, { once, margin: '-40px 0px' });
    const prefersReduced = useReducedMotion();

    return (
        <motion.div
            ref={ref}
            initial="hidden"
            animate={isInView ? 'visible' : 'hidden'}
            variants={{
                hidden: {},
                visible: {
                    transition: {
                        staggerChildren: prefersReduced ? 0 : staggerDelay,
                        delayChildren: prefersReduced ? 0 : startDelay,
                    },
                },
            }}
            className={className}
            {...rest}
        >
            {children}
        </motion.div>
    );
}

/**
 * StaggerItem — Individual child inside a StaggerContainer.
 * Animates with fade + translate-y.
 *
 * @param {Object} props
 * @param {React.ReactNode} props.children
 * @param {string} props.className - Additional classes
 * @param {'up' | 'scale'} props.variant - Animation style (default: 'up')
 */
export function StaggerItem({
    children,
    className = '',
    variant = 'up',
    ...rest
}) {
    const prefersReduced = useReducedMotion();

    const variants = {
        up: {
            hidden: prefersReduced ? { opacity: 1 } : { opacity: 0, y: 24 },
            visible: {
                opacity: 1,
                y: 0,
                transition: {
                    duration: 0.5,
                    ease: [0.25, 0.46, 0.45, 0.94],
                },
            },
        },
        scale: {
            hidden: prefersReduced ? { opacity: 1 } : { opacity: 0, scale: 0.95 },
            visible: {
                opacity: 1,
                scale: 1,
                transition: {
                    duration: 0.5,
                    ease: [0.25, 0.46, 0.45, 0.94],
                },
            },
        },
    };

    return (
        <motion.div
            variants={variants[variant] || variants.up}
            className={className}
            {...rest}
        >
            {children}
        </motion.div>
    );
}
