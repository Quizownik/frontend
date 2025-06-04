import {useTranslations} from "next-intl";
import {useEffect, useState} from "react";
import {QuizLabel} from "@/app/[locale]/lib/types";
import {getLocale} from "@/app/[locale]/lib/utils";
import {LoadingSpinner} from "@/app/[locale]/components/LoadingSpinner";
import AddQuizForm from "@/app/[locale]/components/admin/AddQuizForm";
import Link from "next/link";

export default function QuizzesManager() {
    const t = useTranslations('AdminPage');
    const [quizzes, setQuizzes] = useState<QuizLabel[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [showAddForm, setShowAddForm] = useState(false);

    useEffect(() => {
        fetchQuizzes();
    }, []);

    const fetchQuizzes = async () => {
        setIsLoading(true);
        const locale = getLocale();

        try {
            const response = await fetch(`/${locale}/api/quizzes?size=100`);
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            const data = await response.json();
            console.log(data);
            setQuizzes(data.content || []);
            setIsLoading(false);
        } catch (err) {
            console.error('Error fetching quizzes:', err);
            setIsLoading(false);
        }
    };

    if (isLoading) return <LoadingSpinner/>;

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-semibold">{t('quizzesList')}</h2>
                <button
                    onClick={() => setShowAddForm(!showAddForm)}
                    className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition flex items-center"
                >
                    <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                              d="M12 6v6m0 0v6m0-6h6m-6 0H6"/>
                    </svg>
                    {showAddForm ? t('cancelAddQuiz') : t('addNewQuiz')}
                </button>
            </div>

            {showAddForm && <AddQuizForm onQuizAdded={() => {
                fetchQuizzes();
                setShowAddForm(false);
            }}/>}

            {quizzes.length === 0 ? (
                <p className="text-gray-500 text-center py-8">{t('noQuizzes')}</p>
            ) : (
                <div className="overflow-x-auto">
                    <table className="min-w-full bg-white">
                        <thead>
                        <tr className="bg-gray-100">
                            <th className="py-3 px-4 border-b text-left">ID</th>
                            <th className="py-3 px-4 border-b text-left">{t('name')}</th>
                            <th className="py-3 px-4 border-b text-left">{t('category')}</th>
                            <th className="py-3 px-4 border-b text-left">{t('questionsCount')}</th>
                            <th className="py-3 px-4 border-b text-left">{t('actions')}</th>
                        </tr>
                        </thead>
                        <tbody>
                        {quizzes.map((quiz) => (
                            <tr key={quiz.id} className="hover:bg-gray-50">
                                <td className="py-3 px-4 border-b">{quiz.id}</td>
                                <td className="py-3 px-4 border-b">{quiz.name}</td>
                                <td className="py-3 px-4 border-b">{quiz.category}</td>
                                <td className="py-3 px-4 border-b">{quiz.numberOfQuestions || 0}</td>
                                <td className="py-3 px-4 border-b">
                                    <Link
                                        href={`/admin/quizzes/${quiz.id}`}
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
        </div>
    );
}