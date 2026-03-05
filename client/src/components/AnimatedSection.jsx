import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import useReducedMotion from '../hooks/useReducedMotion';

/**
 * FadeUp — Scroll-triggered fade + translate-y animation.
 * GPU-accelerated with IntersectionObserver (via useInView).
 *
 * @param {Object} props
 * @param {React.ReactNode} props.children
 * @param {number} props.delay - Animation delay in seconds (default: 0)
 * @param {number} props.duration - Animation duration in seconds (default: 0.6)
 * @param {number} props.y - Initial Y offset in px (default: 30)
 * @param {boolean} props.once - Animate only once (default: true)
 * @param {string} props.className - Additional classes
 * @param {string} props.as - HTML element to render (default: 'div')
 */
export default function FadeUp({
    children,
    delay = 0,
    duration = 0.6,
    y = 30,
    once = true,
    className = '',
    as = 'div',
    ...rest
}) {
    const ref = useRef(null);
    const isInView = useInView(ref, { once, margin: '-60px 0px' });
    const prefersReduced = useReducedMotion();

    const Component = motion[as] || motion.div;

    return (
        <Component
            ref={ref}
            initial={prefersReduced ? { opacity: 1 } : { opacity: 0, y }}
            animate={isInView
                ? { opacity: 1, y: 0 }
                : prefersReduced
                    ? { opacity: 1 }
                    : { opacity: 0, y }
            }
            transition={{
                duration: prefersReduced ? 0 : duration,
                delay: prefersReduced ? 0 : delay,
                ease: [0.25, 0.46, 0.45, 0.94],
            }}
            className={className}
            {...rest}
        >
            {children}
        </Component>
    );
}
