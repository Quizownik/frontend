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
    const [quizToDelete, setQuizToDelete] = useState<QuizLabel | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const [deleteError, setDeleteError] = useState<string | null>(null);

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

    const confirmDelete = (quiz: QuizLabel) => {
        setQuizToDelete(quiz);
        setDeleteError(null);
    };

    const cancelDelete = () => {
        setQuizToDelete(null);
        setDeleteError(null);
    };

    const deleteQuiz = async () => {
        if (!quizToDelete) return;

        setIsDeleting(true);
        setDeleteError(null);
        const locale = getLocale();

        try {
            const response = await fetch(`/${locale}/api/quizzes/delete?id=${quizToDelete.id}`, {
                method: 'DELETE',
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.message || `HTTP error! Status: ${response.status}`);
            }

            // Odśwież listę quizów po usunięciu
            fetchQuizzes();
            setQuizToDelete(null);
        } catch (error) {
            console.error('Error deleting quiz:', error);
            setDeleteError(error instanceof Error ? error.message : 'Wystąpił błąd podczas usuwania quizu');
        } finally {
            setIsDeleting(false);
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

            {/* Okno dialogowe potwierdzenia usunięcia */}
            {quizToDelete && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white p-6 rounded-lg shadow-xl max-w-md w-full">
                        <h3 className="text-xl font-semibold mb-4">{t('confirmDelete')}</h3>
                        <p className="mb-6">
                            {t('deleteQuizConfirmation', {name: quizToDelete.name})}
                        </p>

                        {deleteError && (
                            <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">
                                {deleteError}
                            </div>
                        )}

                        <div className="flex justify-end space-x-3">
                            <button
                                onClick={cancelDelete}
                                className="px-4 py-2 border border-gray-300 rounded text-gray-700 hover:bg-gray-100 transition"
                                disabled={isDeleting}
                            >
                                {t('cancel')}
                            </button>
                            <button
                                onClick={deleteQuiz}
                                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition flex items-center"
                                disabled={isDeleting}
                            >
                                {isDeleting ? (
                                    <>
                                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        {t('deleting')}
                                    </>
                                ) : t('delete')}
                            </button>
                        </div>
                    </div>
                </div>
            )}

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
                                        onClick={() => confirmDelete(quiz)}
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

