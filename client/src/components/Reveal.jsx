import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import useReducedMotion from '../hooks/useReducedMotion';

/**
 * Reveal — Scroll-triggered scale + fade animation.
 * Subtler than FadeUp, great for cards and content blocks.
 *
 * @param {Object} props
 * @param {React.ReactNode} props.children
 * @param {number} props.delay - Delay in seconds (default: 0)
 * @param {number} props.duration - Duration in seconds (default: 0.7)
 * @param {boolean} props.once - Trigger once (default: true)
 * @param {string} props.direction - 'up' | 'down' | 'left' | 'right' | 'scale' (default: 'up')
 * @param {string} props.className - Additional classes
 */
export default function Reveal({
    children,
    delay = 0,
    duration = 0.7,
    once = true,
    direction = 'up',
    className = '',
    ...rest
}) {
    const ref = useRef(null);
    const isInView = useInView(ref, { once, margin: '-40px 0px' });
    const prefersReduced = useReducedMotion();

    const directionMap = {
        up: { y: 24, x: 0, scale: 1 },
        down: { y: -24, x: 0, scale: 1 },
        left: { y: 0, x: -40, scale: 1 },
        right: { y: 0, x: 40, scale: 1 },
        scale: { y: 0, x: 0, scale: 0.95 },
    };

    const dir = directionMap[direction] || directionMap.up;

    return (
        <motion.div
            ref={ref}
            initial={prefersReduced
                ? { opacity: 1 }
                : { opacity: 0, y: dir.y, x: dir.x, scale: dir.scale }
            }
            animate={isInView
                ? { opacity: 1, y: 0, x: 0, scale: 1 }
                : prefersReduced
                    ? { opacity: 1 }
                    : { opacity: 0, y: dir.y, x: dir.x, scale: dir.scale }
            }
            transition={{
                duration: prefersReduced ? 0 : duration,
                delay: prefersReduced ? 0 : delay,
                ease: [0.16, 1, 0.3, 1],
            }}
            className={className}
            {...rest}
        >
            {children}
        </motion.div>
    );
}
