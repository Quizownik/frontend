'use client';
import {motion} from 'framer-motion';
import Link from 'next/link';
import {categoryColors} from "@/app/[locale]/lib/categoryColors";
import {useAuthGuard} from "@/app/[locale]/actions/useAuthGuard";
import {LoadingSpinner} from "@/app/[locale]/components/LoadingSpinner";
import {useEffect, useState} from "react";
import {getLocale} from "@/app/[locale]/lib/utils";
import {useTranslations} from "next-intl";
import {PageResponse} from "@/app/[locale]/lib/types";

export default function QuizzesPage() {
    const t = useTranslations('QuizzesPage');

    const {loading, authorized} = useAuthGuard();
    const [quizzesPage, setQuizzesPage] = useState<PageResponse | null>(null);
    const [currentPage, setCurrentPage] = useState<number>(0);
    const [pageSize] = useState<number>(9); // Domyślny rozmiar strony
    const [category, setCategory] = useState<string>("All"); // Domyślna kategoria
    const [level, setLevel] = useState<string>("Default"); // Domyślny poziom

    useEffect(() => {
        if (!loading && authorized) {
            fetchQuizzes(currentPage, pageSize, category, level);
        }
    }, [loading, authorized, currentPage, pageSize, category, level]);

    // Funkcja zmieniająca kategorię
    const changeCategory = (newCategory: string) => {
        setCategory(newCategory);
        setCurrentPage(0); // Reset do pierwszej strony po zmianie kategorii
    };

    const changeLevel = (newLevel: string) => {
        setLevel(newLevel);
        setCurrentPage(0);
    }

    // Funkcja do pobierania quizów z parametrami paginacji i kategorią
    const fetchQuizzes = (page: number, size: number, category: string, level: string) => {
        const locale = getLocale();

        fetch(`/${locale}/api/quizzes?page=${page}&size=${size}&category=${encodeURIComponent(category)}&level=${encodeURIComponent(level)}&sort=name`)
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP error! Status: ${response.status}`);
                }
                return response.json();
            })
            .then(data => {
                console.log('Received quiz data:', data);

                // Sprawdź czy dane są tablicą (bez paginacji) i przekształć je do formatu PageResponse
                if (Array.isArray(data)) {
                    const totalItems = data.length;
                    const totalPages = Math.ceil(totalItems / size);

                    // Oblicz, które elementy należą do bieżącej strony
                    const start = page * size;
                    const end = Math.min(start + size, totalItems);
                    const paginatedContent = data.slice(start, end);

                    // Utwórz obiekt zgodny z interfejsem PageResponse
                    const pageResponse: PageResponse = {
                        content: paginatedContent,
                        pageable: {
                            pageNumber: page,
                            pageSize: size,
                            sort: { sorted: false, empty: true, unsorted: true },
                            offset: page * size,
                            paged: true,
                            unpaged: false
                        },
                        last: page >= totalPages - 1,
                        totalElements: totalItems,
                        totalPages: totalPages,
                        size: size,
                        number: page,
                        sort: { sorted: false, empty: true, unsorted: true },
                        first: page === 0,
                        numberOfElements: paginatedContent.length,
                        empty: paginatedContent.length === 0
                    };

                    setQuizzesPage(pageResponse);
                } else {
                    // Jeśli dane są już w formacie PageResponse
                    setQuizzesPage(data);
                }
            })
            .catch(error => {
                console.error('Błąd pobierania quizów:', error);
            });
    };

    // Funkcje do obsługi paginacji
    const goToNextPage = () => {
        if (quizzesPage && !quizzesPage.last) {
            setCurrentPage(prev => prev + 1);
        }
    };

    const goToPreviousPage = () => {
        if (quizzesPage && !quizzesPage.first) {
            setCurrentPage(prev => prev - 1);
        }
    };

    const goToPage = (page: number) => {
        if (quizzesPage && page >= 0 && page < quizzesPage.totalPages) {
            setCurrentPage(page);
        }
    };

    if (loading) return <LoadingSpinner/>;
    if (!authorized) return null;

    return (
        <main className="min-h-screen font-quiz px-4 py-10 shadow-xl">
            <motion.h1
                initial={{opacity: 0, y: -40}}
                animate={{opacity: 1, y: 0}}
                transition={{duration: 1}}
                className="text-4xl sm:text-5xl md:text-6xl text-quizPink font-bold mb-6 text-center"
            >
                {t('title')}
            </motion.h1>

            <motion.p
                initial={{opacity: 0, y: -20}}
                animate={{opacity: 1, y: 0}}
                transition={{delay: 0.3}}
                className="text-lg sm:text-xl text-center text-gray-100 mb-6"
            >
                {t('subtitle')}
            </motion.p>

            {/* Przyciski do wyboru kategorii */}
            <div className="flex flex-wrap gap-8 mb-4">
                <h2 className="text-center text-xl pl-2 uppercase">{t('categoryLabel')}</h2>
                <div className="flex flex-wrap w-4/5 gap-8 justify-center">
                    <button
                        onClick={() => changeCategory("All")}
                        className={`px-6 py-3 rounded-lg font-semibold text-black transition-all transform hover:scale-105 ${category === "All" ? 'bg-quizGreen shadow-lg' : 'bg-gray-300 hover:bg-green-400'}`}
                    >
                        {t('allLabel')}
                    </button>
                    <button
                        onClick={() => changeCategory("Mixed")}
                        className={`px-6 py-3 rounded-lg font-semibold text-black transition-all transform hover:scale-105 ${category === "Mixed" ? 'bg-quizPink shadow-lg' : 'bg-gray-300 hover:bg-pink-500'}`}
                    >
                        {t('mixedLabel')}
                    </button>
                    <button
                        onClick={() => changeCategory("Grammar")}
                        className={`px-6 py-3 rounded-lg font-semibold text-black transition-all transform hover:scale-105 ${category === "Grammar" ? 'bg-quizYellow shadow-lg' : 'bg-gray-300 hover:bg-yellow-500'}`}
                    >
                        {t('grammarLabel')}
                    </button>
                    <button
                        onClick={() => changeCategory("Vocabulary")}
                        className={`px-6 py-3 rounded-lg font-semibold text-black transition-all transform hover:scale-105 ${category === "Vocabulary" ? 'bg-quizBlue shadow-lg' : 'bg-gray-300 hover:bg-blue-500'}`}
                    >
                        {t('vocabularyLabel')}
                    </button>
                </div>

            </div>

            {/* Kontener dla quizów i poziomu */}
            <div className="flex flex-wrap justify-center gap-4 mb-10">
                {/* Przyciski do wyboru poziomu */}
                <div className="flex flex-col flex-wrap justify-items-start gap-8">
                    <div className="h-1 w-full bg-quizPink rounded-full"></div>
                    <h2 className="text-center text-xl uppercase">{t('levelLabel')}</h2>
                    <button
                        onClick={() => changeLevel("Default")}
                        className={`px-6 py-3 rounded-lg font-semibold text-black transition-all transform hover:scale-105 ${level === "Default" ? 'bg-quizGreen shadow-lg' : 'bg-gray-300 hover:bg-green-400'}`}
                    >
                        {t('defaultLabel')}
                    </button>
                    <button
                        onClick={() => changeLevel("Mixed")}
                        className={`px-6 py-3 rounded-lg font-semibold text-black transition-all transform hover:scale-105 ${level === "Mixed" ? 'bg-quizPink shadow-lg' : 'bg-gray-300 hover:bg-pink-500'}`}
                    >
                        {t('mixedLabel')}
                    </button>
                    <button
                        onClick={() => changeLevel("Easy")}
                        className={`px-6 py-3 rounded-lg font-semibold text-black transition-all transform hover:scale-105 ${level === "Easy" ? 'bg-quizYellow shadow-lg' : 'bg-gray-300 hover:bg-yellow-500'}`}
                    >
                        {t('easyLabel')}
                    </button>
                    <button
                        onClick={() => changeLevel("Medium")}
                        className={`px-6 py-3 rounded-lg font-semibold text-black transition-all transform hover:scale-105 ${level === "Medium" ? 'bg-quizBlue shadow-lg' : 'bg-gray-300 hover:bg-blue-500'}`}
                    >
                        {t('mediumLabel')}
                    </button>
                    <button
                        onClick={() => changeLevel("Hard")}
                        className={`px-6 py-3 rounded-lg font-semibold text-black transition-all transform hover:scale-105 ${level === "Hard" ? 'bg-red-400 shadow-lg' : 'bg-gray-300 hover:bg-red-700'}`}
                    >
                        {t('hardLabel')}
                    </button>
                </div>

                {/* Wyświetlanie quizów */}
                <section className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 w-4/5 mx-auto items-start">
                    {quizzesPage?.content && quizzesPage.content.map((quiz, index) => {
                        const borderColor = categoryColors[quiz.category] || 'border-black';

                        // Style dla opanowanych quizów
                        const isQuizMastered = quiz.isMastered;
                        const cardClasses = `
                        bg-gray-100 p-6 rounded-xl shadow-md transition duration-300 border-l-8
                        ${borderColor} 
                        ${isQuizMastered
                            ? 'opacity-60 grayscale relative overflow-hidden'
                            : 'hover:shadow-xl'}
                    `;

                        return (
                            <motion.div
                                key={quiz.id}
                                initial={{opacity: 0, y: 10}}
                                animate={{opacity: 1, y: 0}}
                                transition={{delay: index * 0.2}}
                                className={cardClasses}
                            >
                                {isQuizMastered && (
                                    <div className="absolute top-2 right-2 bg-black text-xs text-white px-2 py-1 rounded-full">
                                        {t("masteredLabel")}
                                    </div>
                                )}

                                <h2 className="text-xl font-bold text-quizBlue mb-2 break-words whitespace-normal">{quiz.name}</h2>
                                <p className="text-sm text-black mb-1">{t("categoryLabel")}: {quiz.category}</p>
                                <p className="text-sm text-gray-600 mb-4">Level: {quiz.level}</p>

                                <Link
                                    href={`/quizzes/${quiz.id}`}
                                    className={`inline-block text-white font-semibold px-4 py-2 rounded-lg transition ${isQuizMastered ? 'bg-gray-500' : 'bg-quizPink hover:bg-pink-400'}`}
                                >
                                    {isQuizMastered ? t("repeatQuiz") : t("startQuiz")}
                                </Link>
                            </motion.div>
                        );
                    })}
                </section>
            </div>


            {/* Panel kontrolny paginacji */}
            {quizzesPage && quizzesPage.totalPages > 1 && (
                <div className="mt-10 flex flex-col items-center space-y-4">
                    <div className="flex items-center space-x-2">
                        <button
                            onClick={goToPreviousPage}
                            disabled={quizzesPage.first}
                            className={`px-4 py-2 rounded ${quizzesPage.first ? 'bg-gray-500 cursor-not-allowed' : 'bg-quizBlue hover:bg-blue-600'} text-white`}
                        >
                            {t('pagination.previous')}
                        </button>

                        <div className="flex space-x-1">
                            {/* Przyciski numeracji stron */}
                            {Array.from({length: quizzesPage.totalPages}, (_, i) => (
                                <button
                                    key={i}
                                    onClick={() => goToPage(i)}
                                    className={`w-8 h-8 flex items-center justify-center rounded ${i === quizzesPage.number ? 'bg-quizPink text-white' : 'bg-white text-quizBlue hover:bg-gray-200'}`}
                                >
                                    {i + 1}
                                </button>
                            ))}
                        </div>

                        <button
                            onClick={goToNextPage}
                            disabled={quizzesPage.last}
                            className={`px-4 py-2 rounded ${quizzesPage.last ? 'bg-gray-500 cursor-not-allowed' : 'bg-quizBlue hover:bg-blue-600'} text-white`}
                        >
                            {t('pagination.next')}
                        </button>
                    </div>

                    <div className="text-white text-sm">
                        {t('pagination.pageInfo', {
                            current: quizzesPage.number + 1,
                            total: quizzesPage.totalPages,
                            count: quizzesPage.totalElements
                        })}
                    </div>
                </div>
            )}
        </main>
    );
}

