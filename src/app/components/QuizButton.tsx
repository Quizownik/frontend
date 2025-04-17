import { motion } from 'framer-motion';

export default function QuizButton({ color, emoji, label, border = false }: { color: string; emoji: string; label: string; border?: boolean }) {
    return (
        <motion.button
            whileHover={{ scale: 1.05 }}
            className={`
        px-6 py-3 rounded-xl text-lg shadow-lg transition
        ${border ? 'border-2 border-black text-black bg-white' : `bg-${color} text-white`}
      `}
        >
            {emoji} {label}
        </motion.button>
    );
}