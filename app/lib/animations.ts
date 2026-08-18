import { Variants, Transition } from "framer-motion";

export const spring: Transition = {
  type: "spring",
  stiffness: 300,
  damping: 26,
  mass: 0.4,
};

export const springSnappy: Transition = {
  type: "spring",
  stiffness: 400,
  damping: 28,
  mass: 0.3,
};

export const fastEase: Transition = {
  duration: 0.18,
  ease: [0.16, 1, 0.3, 1],
};

export const pageVariants: Variants = {
  initial: { opacity: 0, y: 8 },
  animate: {
    opacity: 1, y: 0,
    transition: { duration: 0.18, ease: [0.16, 1, 0.3, 1] },
  },
  exit: {
    opacity: 0, y: -6,
    transition: { duration: 0.12, ease: "easeIn" },
  },
};

export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0, transition: fastEase },
};

export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.18 } },
};

export const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.96 },
  visible: { opacity: 1, scale: 1, transition: { type: "spring", stiffness: 300, damping: 28, mass: 0.4 } },
};

export const blurReveal: Variants = {
  hidden: { opacity: 0, y: 10 },
  visible: {
    opacity: 1, y: 0,
    transition: { duration: 0.18, ease: [0.16, 1, 0.3, 1] },
  },
};

export const staggerContainer: Variants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.03, delayChildren: 0.03 },
  },
};

export const staggerSlow: Variants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.05, delayChildren: 0.04 },
  },
};

export const wordReveal: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1, y: 0,
    transition: { duration: 0.22, ease: [0.16, 1, 0.3, 1] },
  },
};

export const underlineVariants: Variants = {
  rest: { scaleX: 0 },
  hover: {
    scaleX: 1,
    transition: { type: "spring", stiffness: 300, damping: 24 },
  },
};
