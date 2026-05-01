// Framer Motion variants — reuse everywhere per design spec

export const pageVariants = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.22, ease: [0.25, 0.1, 0.25, 1] } },
  exit: { opacity: 0, y: -8, transition: { duration: 0.16 } },
}

export const staggerContainer = {
  animate: { transition: { staggerChildren: 0.06 } },
}

export const fadeUp = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.3 } },
}

export const fadeIn = {
  initial: { opacity: 0 },
  animate: { opacity: 1, transition: { duration: 0.2 } },
}

export const cardHover = {
  rest: { y: 0, boxShadow: '0 1px 3px rgba(0,0,0,0.1), 0 1px 2px rgba(0,0,0,0.06)' },
  hover: { y: -2, boxShadow: '0 4px 6px rgba(0,0,0,0.07), 0 2px 4px rgba(0,0,0,0.06)', transition: { duration: 0.15 } },
}

export const drawerVariants = {
  initial: { x: '100%' },
  animate: { x: 0, transition: { type: 'spring', damping: 30, stiffness: 300 } },
  exit: { x: '100%', transition: { duration: 0.2 } },
}

export const backdropVariants = {
  initial: { opacity: 0 },
  animate: { opacity: 1, transition: { duration: 0.2 } },
  exit: { opacity: 0, transition: { duration: 0.15 } },
}

export const modalVariants = {
  initial: { opacity: 0, scale: 0.95 },
  animate: { opacity: 1, scale: 1, transition: { duration: 0.18, ease: [0.25, 0.1, 0.25, 1] } },
  exit: { opacity: 0, scale: 0.95, transition: { duration: 0.12 } },
}

export const toastVariants = {
  initial: { opacity: 0, x: 100 },
  animate: { opacity: 1, x: 0, transition: { type: 'spring', damping: 25, stiffness: 300 } },
  exit: { opacity: 0, x: 100, transition: { duration: 0.15 } },
}

export const sidebarVariants = {
  expanded: { width: 240 },
  collapsed: { width: 64 },
}

export const commandPaletteVariants = {
  initial: { opacity: 0, scale: 0.96 },
  animate: { opacity: 1, scale: 1, transition: { duration: 0.18 } },
  exit: { opacity: 0, scale: 0.96, transition: { duration: 0.12 } },
}
