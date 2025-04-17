'use client';

import { motion } from 'framer-motion';
import QuizButton from "@/app/components/QuizButton";

export default function Home() {
  return (
      <main className="min-h-screen bg-quizYellow flex flex-col items-center justify-center font-quiz px-4">
        <motion.h1
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-6xl text-quizPink font-bold mb-6 text-center"
        >
          Quizownik 🎉
        </motion.h1>

        <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-xl text-gray-800 mb-8 text-center"
        >
          Wybierz kategorię i sprawdź swoją wiedzę!
        </motion.p>

        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-4">
          <QuizButton color="quizBlue" emoji="🧠" label="Nauka" />
          <QuizButton color="quizGreen" emoji="🎵" label="Muzyka" />
          <QuizButton color="quizPink" emoji="⚽" label="Sport" />
          <QuizButton color="white" emoji="🎮" label="Gry" border />
        </div>
      </main>
  );
}