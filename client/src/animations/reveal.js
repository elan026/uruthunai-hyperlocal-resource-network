/**
 * Reveal animation — clip/scale based reveal.
 * Uses only transform/opacity for GPU acceleration.
 */
export const reveal = {
    hidden: {
        opacity: 0,
        scale: 0.96,
    },
    visible: (delay = 0) => ({
        opacity: 1,
        scale: 1,
        transition: {
            duration: 0.7,
            delay,
            ease: [0.16, 1, 0.3, 1],
        },
    }),
};

/**
 * Slide reveal — horizontal curtain reveal effect.
 */
export const slideReveal = {
    hidden: {
        opacity: 0,
        x: -60,
    },
    visible: (delay = 0) => ({
        opacity: 1,
        x: 0,
        transition: {
            duration: 0.8,
            delay,
            ease: [0.16, 1, 0.3, 1],
        },
    }),
};

/**
 * Page transition variants for AnimatePresence.
 */
export const pageTransition = {
    initial: {
        opacity: 0,
        y: 12,
    },
    animate: {
        opacity: 1,
        y: 0,
        transition: {
            duration: 0.5,
            ease: [0.25, 0.46, 0.45, 0.94],
        },
    },
    exit: {
        opacity: 0,
        y: -8,
        transition: {
            duration: 0.3,
            ease: [0.25, 0.46, 0.45, 0.94],
        },
    },
};
