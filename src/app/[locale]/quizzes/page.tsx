'use client';
import { motion } from 'framer-motion';
import Link from 'next/link';
import {categoryColors} from "@/app/[locale]/lib/categoryColors";
import {useAuthGuard} from "@/app/[locale]/actions/useAuthGuard";
import {LoadingSpinner} from "@/app/[locale]/components/LoadingSpinner";

const allQuizzes = [
    { id: '1', title: 'Słówka z życia codziennego', category: 'Słownictwo' },
    { id: '2', title: 'Czasy angielskie – test', category: 'Gramatyka' },
    { id: '3', title: 'Popularne idiomy', category: 'Słownictwo' },
    { id: '4', title: 'Czytanie ze zrozumieniem – poziom A2', category: 'Czytanie' },
    { id: '5', title: 'Listening: podstawowe dialogi', category: 'Słuchanie' },
];

export default function QuizzesPage() {

    const { loading, authorized } = useAuthGuard();
    if (loading) return <LoadingSpinner />;
    if (!authorized) return null;

    if (loading) {
        return <div className="text-center text-xl text-quizPink py-20">Ładowanie...</div>;
    }
    if (!authorized) {
        return null;
    }

    return (
        <main className="min-h-screen font-quiz px-4 py-10 shadow-xl">
            <motion.h1
                initial={{opacity: 0, y: -40}}
                animate={{opacity: 1, y: 0}}
                transition={{duration: 1}}
                className="text-4xl sm:text-5xl md:text-6xl text-quizPink font-bold mb-6 text-center"
            >
                Quizy do nauki angielskiego
            </motion.h1>

            <motion.p
                initial={{opacity: 0, y: -20}}
                animate={{opacity: 1, y: 0}}
                transition={{delay: 0.3}}
                className="text-lg sm:text-xl text-center text-gray-100 mb-10"
            >
                Wybierz kategorię i sprawdź swoją wiedzę z języka angielskiego.
            </motion.p>

            {/* Możesz tu wstawić Client Component do filtrowania quizów po kategoriach */}
            <section className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
                {allQuizzes.map((quiz, index) => {
                    const borderColor = categoryColors[quiz.category] || 'border-gray-300';
                    return (
                        <motion.div
                            key={quiz.id}
                            initial={{opacity: 0, y: 10}}
                            animate={{opacity: 1, y: 0}}
                            transition={{delay: index * 0.2}}
                            className={`bg-gray-100 p-6 rounded-xl shadow-md hover:shadow-xl transition duration-300 border-l-4 ${borderColor}`}
                        >
                            <h2 className="text-xl font-bold text-quizBlue mb-2">{quiz.title}</h2>
                            <p className="text-sm text-black mb-4">Kategoria: {quiz.category}</p>
                            <Link
                                href={`/quizzes/${quiz.id}`}
                                className="inline-block text-white bg-quizPink hover:bg-pink-400 font-semibold px-4 py-2 rounded-lg transition"
                            >
                                Rozpocznij quiz
                            </Link>
                        </motion.div>
                    );
                })}
            </section>
        </main>
    );
}
