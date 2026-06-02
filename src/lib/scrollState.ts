/**
 * Module-level mutable object shared between GSAP (writes) and R3F useFrame (reads).
 * Avoids React re-renders on every scroll tick — both sides operate outside the React tree.
 */
export const scrollState = {
  progress: 0,
};
