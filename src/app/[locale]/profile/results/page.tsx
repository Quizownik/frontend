'use client';
import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { useAuthGuard } from '@/app/[locale]/actions/useAuthGuard';
import { LoadingSpinner } from '@/app/[locale]/components/LoadingSpinner';
import { getLocale } from '@/app/[locale]/lib/utils';
import Link from 'next/link';

// Typ dla wyników quizów
type ResultResponse = {
    quizId: number;
    userId: number;
    finishedAt: string; // LocalDateTime jako string w formacie ISO
    duration: number; // Long
    questionOrder: number[]; // List<Integer>
    chosenAnswers: number[]; // List<Integer>
    correct: number; // Integer
    fails: number; // Integer
    quizName?: string; // Dodatkowe pole, które możemy uzupełnić jeśli dostępne
};

export default function ResultsPage() {
    const t = useTranslations('ResultsPage');
    const { loading, authorized } = useAuthGuard();
    const [results, setResults] = useState<ResultResponse[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!loading && authorized) {
            fetchResults();
        }
    }, [loading, authorized]);

    const fetchResults = async () => {
        setIsLoading(true);
        const locale = getLocale();

        try {
            const response = await fetch(`/${locale}/api/result/my`);

            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }

            const data = await response.json();
            setResults(data);
            setIsLoading(false);
        } catch (err) {
            console.error('Błąd pobierania wyników quizów:', err);
            setError('Nie udało się załadować wyników quizów. Spróbuj ponownie później.');
            setIsLoading(false);
        }
    };

    // Funkcja formatująca czas trwania (sekundy) na format mm:ss
    const formatDuration = (seconds: number): string => {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
    };

    // Funkcja formatująca datę i czas
    const formatDateTime = (dateTimeStr: string): string => {
        const date = new Date(dateTimeStr);
        return date.toLocaleString();
    };

    // Funkcja obliczająca procent poprawnych odpowiedzi
    const calculatePercentage = (correct: number, fails: number): number => {
        const total = correct + fails;
        return total === 0 ? 0 : Math.round((correct / total) * 100);
    };

    if (loading || isLoading) return <LoadingSpinner />;
    if (!authorized) return null;
    if (error) return <div className="text-red-500 text-center p-8">{error}</div>;

    return (
        <main className="min-h-screen font-quiz px-4 py-10">
            <motion.h1
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="text-4xl sm:text-5xl md:text-6xl text-quizPink font-bold mb-6 text-center"
            >
                {t('title')}
            </motion.h1>

            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3, duration: 0.5 }}
                className="max-w-4xl mx-auto bg-white rounded-xl shadow-lg overflow-hidden"
            >
                <div className="p-6">
                    <Link
                        href="/profile"
                        className="inline-flex items-center text-quizBlue hover:underline mb-6"
                    >
                        <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                        {t('backToProfile')}
                    </Link>

                    <h2 className="text-2xl font-semibold mb-6">{t('resultsSubtitle')}</h2>

                    {results.length === 0 ? (
                        <div className="text-center py-8 text-gray-500">
                            {t('noResults')}
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-gray-100">
                                        <th className="px-6 py-3 border-b">{t('quizId')}</th>
                                        <th className="px-6 py-3 border-b">{t('finishedAt')}</th>
                                        <th className="px-6 py-3 border-b">{t('duration')}</th>
                                        <th className="px-6 py-3 border-b">{t('score')}</th>
                                        <th className="px-6 py-3 border-b">{t('actions')}</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {results.map((result, index) => {
                                        const correctPercentage = calculatePercentage(result.correct, result.fails);
                                        const scoreColorClass =
                                            correctPercentage >= 80 ? 'text-green-600' :
                                            correctPercentage >= 60 ? 'text-yellow-600' :
                                            'text-red-600';

                                        return (
                                            <motion.tr
                                                key={`${result.quizId}-${result.finishedAt}`}
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ delay: index * 0.1 }}
                                                className="hover:bg-gray-50"
                                            >
                                                <td className="px-6 py-4 border-b">
                                                    {result.quizId}
                                                </td>
                                                <td className="px-6 py-4 border-b">
                                                    {formatDateTime(result.finishedAt)}
                                                </td>
                                                <td className="px-6 py-4 border-b">
                                                    {formatDuration(result.duration)}
                                                </td>
                                                <td className={`px-6 py-4 border-b font-semibold ${scoreColorClass}`}>
                                                    {result.correct}/{result.correct + result.fails} ({correctPercentage}%)
                                                </td>
                                                <td className="px-6 py-4 border-b">
                                                    <Link
                                                        href={`/quizzes/${result.quizId}`}
                                                        className="text-quizBlue hover:underline"
                                                    >
                                                        {t('retakeQuiz')}
                                                    </Link>
                                                </td>
                                            </motion.tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </motion.div>
        </main>
    );
}
