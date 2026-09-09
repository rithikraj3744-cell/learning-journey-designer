// Animation utility classes and configurations

// Tailwind animation classes
export const animations = {
  // Fade animations
  fadeIn: 'animate-[fadeIn_0.3s_ease-in-out]',
  fadeOut: 'animate-[fadeOut_0.3s_ease-in-out]',

  // Slide animations
  slideInFromRight: 'animate-[slideInFromRight_0.3s_ease-out]',
  slideInFromLeft: 'animate-[slideInFromLeft_0.3s_ease-out]',
  slideInFromTop: 'animate-[slideInFromTop_0.3s_ease-out]',
  slideInFromBottom: 'animate-[slideInFromBottom_0.3s_ease-out]',

  // Scale animations
  scaleIn: 'animate-[scaleIn_0.2s_ease-out]',
  scaleOut: 'animate-[scaleOut_0.2s_ease-in]',

  // Bounce animations
  bounce: 'animate-bounce',

  // Pulse animations
  pulse: 'animate-pulse',

  // Spin animations
  spin: 'animate-spin',

  // Custom animations
  wiggle: 'animate-[wiggle_1s_ease-in-out_infinite]',
}

// Transition classes
export const transitions = {
  all: 'transition-all duration-300 ease-in-out',
  colors: 'transition-colors duration-200 ease-in-out',
  transform: 'transition-transform duration-300 ease-in-out',
  opacity: 'transition-opacity duration-200 ease-in-out',
  shadow: 'transition-shadow duration-300 ease-in-out',
  fast: 'transition-all duration-150 ease-in-out',
  slow: 'transition-all duration-500 ease-in-out',
}

// Hover effects
export const hoverEffects = {
  lift: 'hover:-translate-y-1 hover:shadow-lg',
  scale: 'hover:scale-105',
  glow: 'hover:shadow-[0_0_15px_rgba(59,130,246,0.5)]',
  brighten: 'hover:brightness-110',
  button: 'hover:shadow-md active:scale-95',
}

// Focus states for accessibility
export const focusStates = {
  ring: 'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2',
  ringDark: 'focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 focus:ring-offset-gray-900',
  outline: 'focus:outline-2 focus:outline-offset-2 focus:outline-blue-500',
}

// Loading states
export const loadingStates = {
  spinner: 'animate-spin rounded-full border-2 border-gray-300 border-t-blue-600',
  pulse: 'animate-pulse bg-gray-200 dark:bg-gray-700 rounded',
  dots: 'animate-[bounce_1s_infinite]',
}

// Stagger animations for lists
export const staggerAnimation = (index, baseDelay = 50) => {
  return {
    style: {
      animationDelay: `${index * baseDelay}ms`,
    },
    className: animations.fadeIn,
  }
}

// Confetti animation function
export const triggerConfetti = () => {
  if (typeof window !== 'undefined' && window.confetti) {
    window.confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#3B82F6', '#8B5CF6', '#EC4899', '#10B981', '#F59E0B'],
    })
  }
}

// Progress bar animation
export const progressAnimation = (progress) => {
  return {
    width: `${progress}%`,
    transition: 'width 0.5s ease-in-out',
  }
}

// Card entrance animation variants (for framer-motion)
export const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
  exit: { opacity: 0, y: -20, transition: { duration: 0.2 } },
}

// Page transition variants (for framer-motion)
export const pageVariants = {
  initial: { opacity: 0, x: -20 },
  animate: { opacity: 1, x: 0, transition: { duration: 0.3 } },
  exit: { opacity: 0, x: 20, transition: { duration: 0.2 } },
}

// Toast notification animation
export const toastVariants = {
  hidden: { opacity: 0, y: -50, scale: 0.95 },
  visible: { opacity: 1, y: 0, scale: 1, transition: { type: 'spring', stiffness: 300, damping: 30 } },
  exit: { opacity: 0, scale: 0.95, transition: { duration: 0.2 } },
}

export default {
  animations,
  transitions,
  hoverEffects,
  focusStates,
  loadingStates,
  staggerAnimation,
  triggerConfetti,
  progressAnimation,
  cardVariants,
  pageVariants,
  toastVariants,
}
