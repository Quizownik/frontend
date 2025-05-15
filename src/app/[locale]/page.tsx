'use client';

import { motion } from 'framer-motion';
import {useTranslations} from "next-intl";
import QuizCategoryButton from "@/app/[locale]/components/QuizCategoryButton";
import {useState} from "react";
import LoginPage from "@/app/[locale]/login/page";

export default function Start() {
    const t = useTranslations('HomePage');
    const [isLoggedIn] = useState(true);

    if (!isLoggedIn) {
        return <LoginPage />;
    }

  return (
      <main className="min-h-screen flex flex-col items-center justify-center font-quiz px-4">
        <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="text-xl mb-8 text-center"
        >
            🎉{t('chooseCategory')}🎉
        </motion.p>

        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-4">
          <QuizCategoryButton color="blue" emoji="🧠" label="Nauka" />
          <QuizCategoryButton color="green" emoji="🎵" label="Muzyka" />
          <QuizCategoryButton color="pink" emoji="⚽" label="Sport" />
          <QuizCategoryButton color="yellow" emoji="🎮" label="Gry" />
        </div>
      </main>
  );
}