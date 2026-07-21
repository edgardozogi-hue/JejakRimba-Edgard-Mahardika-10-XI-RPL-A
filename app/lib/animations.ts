import { Variants, Transition } from "framer-motion";

export const spring: Transition = {
  type: "spring",
  stiffness: 100,
  damping: 20,
};

export const springSnappy: Transition = {
  type: "spring",
  stiffness: 260,
  damping: 22,
};

export const easeOutExpo: Transition = {
  duration: 0.6,
  ease: [0.77, 0, 0.175, 1],
};

export const pageVariants: Variants = {
  initial: { opacity: 0, y: 30, scale: 0.98 },
  animate: {
    opacity: 1, y: 0, scale: 1,
    transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] },
  },
  exit: {
    opacity: 0, y: -15, scale: 0.98,
    transition: { duration: 0.25, ease: "easeIn" },
  },
};

export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: easeOutExpo },
};

export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.6 } },
};

export const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: { opacity: 1, scale: 1, transition: { type: "spring", stiffness: 200, damping: 25 } },
};

export const blurReveal: Variants = {
  hidden: { opacity: 0, y: 20, filter: "blur(6px)" },
  visible: {
    opacity: 1, y: 0, filter: "blur(0px)",
    transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] },
  },
};

export const staggerContainer: Variants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.08, delayChildren: 0.1 },
  },
};

export const staggerSlow: Variants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.12, delayChildren: 0.15 },
  },
};

export const wordReveal: Variants = {
  hidden: { opacity: 0, y: 60, rotateX: -15 },
  visible: {
    opacity: 1, y: 0, rotateX: 0,
    transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] },
  },
};

export const underlineVariants: Variants = {
  rest: { scaleX: 0 },
  hover: {
    scaleX: 1,
    transition: { type: "spring", stiffness: 200, damping: 20 },
  },
};
