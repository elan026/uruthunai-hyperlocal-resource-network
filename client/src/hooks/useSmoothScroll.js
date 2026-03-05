import { useEffect, useRef } from 'react';
import Lenis from 'lenis';

/**
 * Global smooth scroll hook using Lenis.
 * Call once at the app root level.
 * Returns the Lenis instance ref for external control.
 * 
 * @param {Object} options
 * @param {boolean} options.enabled - Whether smooth scroll is enabled (default: true)
 * @param {number} options.duration - Scroll animation duration (default: 1.2)
 * @param {string} options.orientation - Scroll orientation (default: 'vertical')
 * @param {boolean} options.smoothWheel - Smooth wheel scrolling (default: true)
 */
export default function useSmoothScroll({
    enabled = true,
    duration = 1.2,
    orientation = 'vertical',
    smoothWheel = true,
} = {}) {
    const lenisRef = useRef(null);

    useEffect(() => {
        // Respect prefers-reduced-motion
        const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        if (!enabled || prefersReduced) return;

        const lenis = new Lenis({
            duration,
            orientation,
            smoothWheel,
            easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        });

        lenisRef.current = lenis;

        function raf(time) {
            lenis.raf(time);
            requestAnimationFrame(raf);
        }

        requestAnimationFrame(raf);

        return () => {
            lenis.destroy();
            lenisRef.current = null;
        };
    }, [enabled, duration, orientation, smoothWheel]);

    return lenisRef;
}
