import { motion } from 'framer-motion';

export default function AnimatedButton({ children, className, ...props }) {
  return (
    <motion.button
      className={`btn-hover-effect ${className}`}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      transition={{ type: 'spring', stiffness: 400, damping: 17 }}
      {...props}
    >
      {children}
    </motion.button>
  );
}
