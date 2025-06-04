import {useTranslations} from "next-intl";
import {useEffect, useState} from "react";
import {Question} from "@/app/[locale]/lib/types";
import {getLocale} from "@/app/[locale]/lib/utils";
import {LoadingSpinner} from "@/app/[locale]/components/LoadingSpinner";
import Link from "next/link";
import AddQuestionForm from "@/app/[locale]/components/admin/AddQuestionForm";

export default function QuestionsManager() {
    const t = useTranslations('AdminPage');
    const [questions, setQuestions] = useState<Question[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [showAddForm, setShowAddForm] = useState(false);

    useEffect(() => {
        fetchQuestions();
    }, []);

    const fetchQuestions = async () => {
        setIsLoading(true);
        const locale = getLocale();

        try {
            const response = await fetch(`/${locale}/api/admin/questions?size=100`);
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            const data = await response.json();
            setQuestions(data.content || []);
            setIsLoading(false);
        } catch (err) {
            console.error('Error fetching questions:', err);
            setIsLoading(false);
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
                                <td className="py-3 px-4 border-b">{question.category}</td>
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
        </div>
    );
}