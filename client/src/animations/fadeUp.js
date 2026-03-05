/**
 * Fade-up animation variant for Framer Motion.
 * GPU-accelerated: uses only transform + opacity.
 */
export const fadeUp = {
    hidden: {
        opacity: 0,
        y: 30,
    },
    visible: (delay = 0) => ({
        opacity: 1,
        y: 0,
        transition: {
            duration: 0.6,
            delay,
            ease: [0.25, 0.46, 0.45, 0.94],
        },
    }),
};

/**
 * Fade-down variant
 */
export const fadeDown = {
    hidden: {
        opacity: 0,
        y: -30,
    },
    visible: (delay = 0) => ({
        opacity: 1,
        y: 0,
        transition: {
            duration: 0.6,
            delay,
            ease: [0.25, 0.46, 0.45, 0.94],
        },
    }),
};

/**
 * Fade-left variant
 */
export const fadeLeft = {
    hidden: {
        opacity: 0,
        x: -40,
    },
    visible: (delay = 0) => ({
        opacity: 1,
        x: 0,
        transition: {
            duration: 0.6,
            delay,
            ease: [0.25, 0.46, 0.45, 0.94],
        },
    }),
};

/**
 * Fade-right variant
 */
export const fadeRight = {
    hidden: {
        opacity: 0,
        x: 40,
    },
    visible: (delay = 0) => ({
        opacity: 1,
        x: 0,
        transition: {
            duration: 0.6,
            delay,
            ease: [0.25, 0.46, 0.45, 0.94],
        },
    }),
};
