'use client';
import {motion} from 'framer-motion';
import Link from 'next/link';
import {categoryColors} from "@/app/[locale]/lib/categoryColors";
import {useAuthGuard} from "@/app/[locale]/actions/useAuthGuard";
import {LoadingSpinner} from "@/app/[locale]/components/LoadingSpinner";
import {useEffect, useState} from "react";
import {getLocale} from "@/app/[locale]/lib/utils";

// Typy dla odpowiedzi z quizami
type Answer = {
    id: number;
    answer: string;
    question?: string;
    createdBy?: number;
    lastModifiedBy?: number;
    correct?: boolean;
    isCorrect?: boolean;
};

type Question = {
    id: number;
    question: string;
    category: string;
    answers: Answer[];
    quizzes?: string[];
    createdBy?: number;
    lastModifiedBy?: number;
    createDate?: string;
    lastModified?: string;
};

type Quiz = {
    id: number;
    name: string;
    createdBy?: number;
    category: string;
    position: number;
    questions: Question[];
};

// Struktury dla paginacji
type Sort = {
    sorted: boolean;
    empty: boolean;
    unsorted: boolean;
};

type Pageable = {
    pageNumber: number;
    pageSize: number;
    sort: Sort;
    offset: number;
    paged: boolean;
    unpaged: boolean;
};

type PageResponse = {
    content: Quiz[];
    pageable: Pageable;
    last: boolean;
    totalElements: number;
    totalPages: number;
    size: number;
    number: number; // Aktualny numer strony
    sort: Sort;
    first: boolean;
    numberOfElements: number;
    empty: boolean;
};

export default function QuizzesPage() {
    const {loading, authorized} = useAuthGuard();
    const [quizzesPage, setQuizzesPage] = useState<PageResponse | null>(null);
    const [currentPage, setCurrentPage] = useState<number>(0);
    const [pageSize, setPageSize] = useState<number>(10); // Domyślny rozmiar strony

    useEffect(() => {
        if (!loading && authorized) {
            fetchQuizzes(currentPage, pageSize);
        }
    }, [loading, authorized, currentPage, pageSize]);

    // Funkcja do pobierania quizów z parametrami paginacji
    const fetchQuizzes = (page: number, size: number) => {
        const locale = getLocale();

        fetch(`/${locale}/api/quizzes?page=${page}&size=${size}`)
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP error! Status: ${response.status}`);
                }
                return response.json();
            })
            .then(data => {
                console.log('Received quiz data:', data);
                setQuizzesPage(data);
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

    const handlePageSizeChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        const newSize = parseInt(event.target.value, 10);
        setPageSize(newSize);
        setCurrentPage(0); // Reset do pierwszej strony po zmianie rozmiaru strony
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

            <section className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
                {quizzesPage?.content && quizzesPage.content.map((quiz, index) => {
                    const borderColor = categoryColors[quiz.category] || 'border-gray-300';
                    return (
                        <motion.div
                            key={quiz.id}
                            initial={{opacity: 0, y: 10}}
                            animate={{opacity: 1, y: 0}}
                            transition={{delay: index * 0.2}}
                            className={`bg-gray-100 p-6 rounded-xl shadow-md hover:shadow-xl transition duration-300 border-l-4 ${borderColor}`}
                        >
                            <h2 className="text-xl font-bold text-quizBlue mb-2">{quiz.name}</h2>
                            <p className="text-sm text-black mb-4">Kategoria: {quiz.category}</p>
                            <p className="text-sm text-gray-600 mb-4">
                                {quiz.questions.length} pytania
                            </p>
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

            {/* Panel kontrolny paginacji */}
            {quizzesPage && quizzesPage.totalPages > 1 && (
                <div className="mt-10 flex flex-col items-center space-y-4">
                    <div className="flex items-center space-x-2">
                        <span className="text-white">Quizy na stronę:</span>
                        <select
                            value={pageSize}
                            onChange={handlePageSizeChange}
                            className="bg-white rounded px-2 py-1 text-quizBlue"
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
                            disabled={quizzesPage.first}
                            className={`px-4 py-2 rounded ${quizzesPage.first ? 'bg-gray-500 cursor-not-allowed' : 'bg-quizBlue hover:bg-blue-600'} text-white`}
                        >
                            Poprzednia
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
                            Następna
                        </button>
                    </div>

                    <div className="text-white text-sm">
                        Strona {quizzesPage.number + 1} z {quizzesPage.totalPages} (łącznie {quizzesPage.totalElements} quizów)
                    </div>
                </div>
            )}
        </main>
    );
}

