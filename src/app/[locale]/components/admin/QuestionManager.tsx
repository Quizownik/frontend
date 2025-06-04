import {useTranslations} from "next-intl";
import {useEffect, useState} from "react";
import {Question, PageResponseQuestions} from "@/app/[locale]/lib/types";
import {getLocale} from "@/app/[locale]/lib/utils";
import {LoadingSpinner} from "@/app/[locale]/components/LoadingSpinner";
import Link from "next/link";
import AddQuestionForm from "@/app/[locale]/components/admin/AddQuestionForm";

export default function QuestionsManager() {
    const t = useTranslations('AdminPage');
    const [questions, setQuestions] = useState<Question[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [showAddForm, setShowAddForm] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState<string>('Mixed');
    const [currentPage, setCurrentPage] = useState<number>(0);
    const [totalPages, setTotalPages] = useState<number>(1);
    const pageSize = 10;

    const categories = ['Mixed', 'Grammar', 'Vocabulary'];

    useEffect(() => {
        fetchQuestions(0, selectedCategory);
    }, [selectedCategory]);

    const fetchQuestions = async (page = currentPage, category = selectedCategory) => {
        setIsLoading(true);
        const locale = getLocale();

        try {
            const response = await fetch(`/${locale}/api/questions/category?category=${encodeURIComponent(category)}&page=${page}&size=${pageSize}`);
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            const data = await response.json() as PageResponseQuestions;
            setQuestions(data.content || []);
            setTotalPages(data.totalPages || 1);
            setCurrentPage(data.number || 0);
            setIsLoading(false);
        } catch (err) {
            console.error('Error fetching questions:', err);
            setIsLoading(false);
        }
    };

    const handleCategoryChange = (category: string) => {
        setSelectedCategory(category);
        setCurrentPage(0);
    };

    const handlePageChange = (newPage: number) => {
        if (newPage >= 0 && newPage < totalPages) {
            setCurrentPage(newPage);
            fetchQuestions(newPage, selectedCategory);
        }
    };

    const getCategoryColorClass = (category: string) => {
        switch (category) {
            case 'Mixed': return 'bg-purple-100 text-purple-800';
            case 'Vocabulary': return 'bg-pink-100 text-pink-800';
            case 'Grammar': return 'bg-blue-100 text-blue-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    if (isLoading) return <LoadingSpinner/>;

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-semibold">{t('questionsList')}</h2>
                <button
                    onClick={() => setShowAddForm(!showAddForm)}
                    className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition flex items-center"
                >
                    <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                              d="M12 6v6m0 0v6m0-6h6m-6 0H6"/>
                    </svg>
                    {showAddForm ? t('cancelAddQuestion') : t('addNewQuestion')}
                </button>
            </div>

            <div className="mb-6">
                <div className="flex justify-center space-x-2 overflow-x-auto pb-2">
                    {categories.map((category) => (
                        <button
                            key={category}
                            onClick={() => handleCategoryChange(category)}
                            className={`px-4 py-2 rounded-full whitespace-nowrap ${
                                selectedCategory === category
                                    ? 'bg-blue-600 text-white'
                                    : 'bg-gray-200 hover:bg-gray-300'
                            }`}
                        >
                            {category}
                        </button>
                    ))}
                </div>
            </div>

            {showAddForm && <AddQuestionForm onQuestionAdded={() => {
                fetchQuestions();
                setShowAddForm(false);
            }}/>}

            {questions.length === 0 ? (
                <p className="text-gray-500 text-center py-8">{t('noQuestions')}</p>
            ) : (
                <div className="overflow-x-auto">
                    <table className="min-w-full bg-white">
                        <thead>
                        <tr className="bg-gray-100">
                            <th className="py-3 px-4 border-b text-left">ID</th>
                            <th className="py-3 px-4 border-b text-left">{t('question')}</th>
                            <th className="py-3 px-4 border-b text-left">{t('category')}</th>
                            <th className="py-3 px-4 border-b text-left">{t('answersCount')}</th>
                            <th className="py-3 px-4 border-b text-left">{t('actions')}</th>
                        </tr>
                        </thead>
                        <tbody>
                        {questions.map((question) => (
                            <tr key={question.id} className="hover:bg-gray-50">
                                <td className="py-3 px-4 border-b">{question.id}</td>
                                <td className="py-3 px-4 border-b">{question.question}</td>
                                <td className="py-3 px-4 border-b">
                                    <span className={`px-2 py-1 rounded-full text-sm ${getCategoryColorClass(question.category)}`}>
                                        {question.category}
                                    </span>
                                </td>
                                <td className="py-3 px-4 border-b">{question.answers?.length || 0}</td>
                                <td className="py-3 px-4 border-b">
                                    <Link
                                        href={`/admin/questions/${question.id}`}
                                        className="text-blue-600 hover:underline mr-3"
                                    >
                                        {t('edit')}
                                    </Link>
                                    <button
                                        className="text-red-600 hover:underline"
                                        onClick={() => {/* Implement delete logic */
                                        }}
                                    >
                                        {t('delete')}
                                    </button>
                                </td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>
            )}

            {totalPages > 1 && (
                <div className="flex justify-center mt-6">
                    <nav className="flex space-x-2">
                        <button
                            onClick={() => handlePageChange(currentPage - 1)}
                            disabled={currentPage === 0}
                            className={`px-3 py-1 rounded ${
                                currentPage === 0
                                    ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                                    : 'bg-gray-200 hover:bg-gray-300'
                            }`}
                        >
                            &laquo;
                        </button>

                        {[...Array(totalPages)].map((_, index) => (
                            <button
                                key={index}
                                onClick={() => handlePageChange(index)}
                                className={`px-3 py-1 rounded ${
                                    currentPage === index
                                        ? 'bg-blue-600 text-white'
                                        : 'bg-gray-200 hover:bg-gray-300'
                                }`}
                            >
                                {index + 1}
                            </button>
                        ))}

                        <button
                            onClick={() => handlePageChange(currentPage + 1)}
                            disabled={currentPage === totalPages - 1}
                            className={`px-3 py-1 rounded ${
                                currentPage === totalPages - 1
                                    ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                                    : 'bg-gray-200 hover:bg-gray-300'
                            }`}
                        >
                            &raquo;
                        </button>
                    </nav>
                </div>
            )}
        </div>
    );
}
