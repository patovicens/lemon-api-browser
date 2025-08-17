export const ANIMATION_CONFIG = {
  SPRING: {
    FAST: { damping: 15, stiffness: 400 },
    MEDIUM: { damping: 30, stiffness: 300 },
    SLOW: { damping: 25, stiffness: 200 },
  },
  
  VALUES: {
    SLIDE_DISTANCE: 300,
    SCALE_PRESS: 0.9,
    ROTATION_FULL: 360,
    ROTATION_HALF: 180,
  },
  
  TIMING: {
    SWAP_DELAY: 200,
  },
} as const;
