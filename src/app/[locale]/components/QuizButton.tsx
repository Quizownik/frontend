import { motion } from 'framer-motion';
import {colorClasses} from "@/app/[locale]/lib/colorClasses";

export default function QuizButton({ color, emoji, label}: { color: string; emoji: string; label: string;}) {

    return (
        <motion.button
            whileHover={{ scale: 1.05 }}
            className={`
        px-6 py-3 rounded-xl text-lg shadow-lg transition text-black ${colorClasses[color] || "bg-gray-500"}`}

        >
            {emoji} {label}
        </motion.button>
    );
}