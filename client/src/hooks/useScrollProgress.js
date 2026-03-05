import { useState, useEffect, useCallback, useRef } from 'react';

/**
 * Returns current scroll progress as a 0-1 value.
 * Uses requestAnimationFrame for jank-free updates.
 * 
 * @param {HTMLElement|null} container - Optional scroll container. Defaults to document.
 * @returns {number} Scroll progress 0..1
 */
export default function useScrollProgress(container = null) {
    const [progress, setProgress] = useState(0);
    const rafId = useRef(null);

    const updateProgress = useCallback(() => {
        let scrollTop, scrollHeight, clientHeight;

        if (container) {
            scrollTop = container.scrollTop;
            scrollHeight = container.scrollHeight;
            clientHeight = container.clientHeight;
        } else {
            scrollTop = window.scrollY || document.documentElement.scrollTop;
            scrollHeight = document.documentElement.scrollHeight;
            clientHeight = window.innerHeight;
        }

        const maxScroll = scrollHeight - clientHeight;
        const currentProgress = maxScroll > 0 ? scrollTop / maxScroll : 0;
        setProgress(Math.min(1, Math.max(0, currentProgress)));
    }, [container]);

    useEffect(() => {
        const target = container || window;

        const handleScroll = () => {
            if (rafId.current) cancelAnimationFrame(rafId.current);
            rafId.current = requestAnimationFrame(updateProgress);
        };

        target.addEventListener('scroll', handleScroll, { passive: true });
        updateProgress(); // initial

        return () => {
            target.removeEventListener('scroll', handleScroll);
            if (rafId.current) cancelAnimationFrame(rafId.current);
        };
    }, [container, updateProgress]);

    return progress;
}
