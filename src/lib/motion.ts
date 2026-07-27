import type { Easing } from "framer-motion";

export const motionPresets = {
    durations: {
        micro: 0.2,   // 200ms — micro-interactions, hover, small state changes
        transition: 0.4, // 400ms — page/modal/section transitions
    },
    easing: {
        easeOutCubic: [0.33, 1, 0.68, 1] as Easing,
        easeInOutQuint: [0.83, 0, 0.17, 1] as Easing,
    },
} as const;

