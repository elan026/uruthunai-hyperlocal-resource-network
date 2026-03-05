/**
 * Stagger container variant.
 * Parent container that staggers its direct children's animations.
 */
export const staggerContainer = {
    hidden: {},
    visible: (staggerDelay = 0.1) => ({
        transition: {
            staggerChildren: staggerDelay,
            delayChildren: 0.1,
        },
    }),
};

/**
 * Stagger item variant — used on direct children inside a stagger container.
 */
export const staggerItem = {
    hidden: {
        opacity: 0,
        y: 24,
    },
    visible: {
        opacity: 1,
        y: 0,
        transition: {
            duration: 0.5,
            ease: [0.25, 0.46, 0.45, 0.94],
        },
    },
};

/**
 * Stagger scale variant — subtle scale + fade for grid items.
 */
export const staggerScale = {
    hidden: {
        opacity: 0,
        scale: 0.95,
    },
    visible: {
        opacity: 1,
        scale: 1,
        transition: {
            duration: 0.5,
            ease: [0.25, 0.46, 0.45, 0.94],
        },
    },
};
