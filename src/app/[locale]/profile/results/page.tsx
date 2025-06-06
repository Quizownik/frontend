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
    quizName: string;
    finishedAt: string; // LocalDateTime jako string w formacie ISO
    duration: number; // Long
    questionOrder: number[]; // List<Integer>
    chosenAnswers: number[]; // List<Integer>
    correct: number; // Integer
    fails: number; // Integer
};

// Typ dla paginacji
type PageResponse = {
    content: ResultResponse[];
    pageable: {
        pageNumber: number;
        pageSize: number;
        sort: {
            sorted: boolean;
            empty: boolean;
            unsorted: boolean;
        };
        offset: number;
        paged: boolean;
        unpaged: boolean;
    };
    last: boolean;
    totalElements: number;
    totalPages: number;
    size: number;
    number: number; // Aktualny numer strony
    sort: {
        sorted: boolean;
        empty: boolean;
        unsorted: boolean;
    };
    first: boolean;
    numberOfElements: number;
    empty: boolean;
};

export default function ResultsPage() {
    const t = useTranslations('ResultsPage');
    const { loading, authorized } = useAuthGuard();
    const [resultsPage, setResultsPage] = useState<PageResponse | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [currentPage, setCurrentPage] = useState(0);
    const [pageSize, setPageSize] = useState(10);

    useEffect(() => {
        if (!loading && authorized) {
            fetchResults(currentPage, pageSize);
        }
    }, [loading, authorized, currentPage, pageSize]);

    const fetchResults = async (page: number, size: number) => {
        setIsLoading(true);
        const locale = getLocale();

        try {
            const response = await fetch(`/${locale}/api/result/my?page=${page}&size=${size}`);

            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }

            const data = await response.json();
            setResultsPage(data);
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

    // Funkcje do obsługi paginacji
    const goToNextPage = () => {
        if (resultsPage && !resultsPage.last) {
            setCurrentPage(prev => prev + 1);
        }
    };

    const goToPreviousPage = () => {
        if (resultsPage && !resultsPage.first) {
            setCurrentPage(prev => prev - 1);
        }
    };

    const goToPage = (page: number) => {
        if (resultsPage && page >= 0 && page < resultsPage.totalPages) {
            setCurrentPage(page);
        }
    };

    const handlePageSizeChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        const newSize = parseInt(event.target.value, 10);
        setPageSize(newSize);
        setCurrentPage(0); // Reset do pierwszej strony po zmianie rozmiaru strony
    };

    if (loading || isLoading) return <LoadingSpinner />;
    if (!authorized) return null;
    if (error) return <div className="text-red-500 text-center p-8">{error}</div>;

    return (
        <main className="min-h-screen font-quiz px-4 py-10 text-black">
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

                    <h2 className="text-2xl font-semibold mb-6 text-center text-gray-500">{t('resultsSubtitle')}</h2>

                    {!resultsPage || resultsPage.content.length === 0 ? (
                        <div className="text-center py-8 text-gray-900">
                            {t('noResults')}
                        </div>
                    ) : (
                        <>
                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="bg-gray-100">
                                            <th className="px-6 py-3 border-b">{t('quizName')}</th>
                                            <th className="px-6 py-3 border-b">{t('finishedAt')}</th>
                                            <th className="px-6 py-3 border-b">{t('duration')}</th>
                                            <th className="px-6 py-3 border-b">{t('score')}</th>
                                            <th className="px-6 py-3 border-b">{t('actions')}</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {resultsPage.content.map((result, index) => {
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
                                                        {result.quizName}
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

                            {/* Panel kontrolny paginacji */}
                            {resultsPage.totalPages > 1 && (
                                <div className="mt-10 flex flex-col items-center space-y-4">
                                    <div className="flex items-center space-x-2">
                                        <span className="text-gray-700">{t('pagination.resultsPerPage')}:</span>
                                        <select
                                            value={pageSize}
                                            onChange={handlePageSizeChange}
                                            className="bg-white border rounded px-2 py-1 text-quizBlue"
                                        >
                                            <option value="5">5</option>
                                            <option value="10">10</option>
                                            <option value="20">20</option>
                                            <option value="50">50</option>
                                        </select>
                                    </div>

                                    <div className="flex items-center space-x-2">
                                        <button
                                            onClick={goToPreviousPage}
                                            disabled={resultsPage.first}
                                            className={`px-4 py-2 rounded ${resultsPage.first ? 'bg-gray-300 cursor-not-allowed' : 'bg-quizBlue hover:bg-blue-600 text-white'}`}
                                        >
                                            {t('pagination.previous')}
                                        </button>

                                        <div className="flex space-x-1">
                                            {/* Przyciski numeracji stron */}
                                            {Array.from({length: resultsPage.totalPages}, (_, i) => (
                                                <button
                                                    key={i}
                                                    onClick={() => goToPage(i)}
                                                    className={`w-8 h-8 flex items-center justify-center rounded ${i === resultsPage.number ? 'bg-quizPink text-white' : 'bg-white border hover:bg-gray-100'}`}
                                                >
                                                    {i + 1}
                                                </button>
                                            ))}
                                        </div>

                                        <button
                                            onClick={goToNextPage}
                                            disabled={resultsPage.last}
                                            className={`px-4 py-2 rounded ${resultsPage.last ? 'bg-gray-300 cursor-not-allowed' : 'bg-quizBlue hover:bg-blue-600 text-white'}`}
                                        >
                                            {t('pagination.next')}
                                        </button>
                                    </div>

                                    <div className="text-gray-600 text-sm">
                                        {t('pagination.pageInfo', {
                                            current: resultsPage.number + 1,
                                            total: resultsPage.totalPages,
                                            count: resultsPage.totalElements
                                        })}
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </motion.div>
        </main>
    );
}
