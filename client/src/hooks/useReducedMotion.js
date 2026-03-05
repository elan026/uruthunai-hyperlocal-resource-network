import { useState, useEffect } from 'react';

/**
 * Detects if the user prefers reduced motion.
 * Listens for changes in real-time.
 * @returns {boolean}
 */
export default function useReducedMotion() {
    const [prefersReduced, setPrefersReduced] = useState(false);

    useEffect(() => {
        const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
        setPrefersReduced(mq.matches);

        const handler = (e) => setPrefersReduced(e.matches);
        mq.addEventListener('change', handler);
        return () => mq.removeEventListener('change', handler);
    }, []);

    return prefersReduced;
}
