import {useTranslations} from "next-intl";
import {useEffect, useState} from "react";
import {Question, PageResponseQuestions} from "@/app/[locale]/lib/types";
import {getLocale} from "@/app/[locale]/lib/utils";
import {LoadingSpinner} from "@/app/[locale]/components/LoadingSpinner";
import AddQuestionForm from "@/app/[locale]/components/admin/AddQuestionForm";
import CategoryChip from "@/app/[locale]/components/categoryChip";
import EditQuestionForm from "@/app/[locale]/components/admin/EditQuestionForm";
import {ErrorPopup} from "@/app/[locale]/components/ErrorPopup";

export default function QuestionsManager() {
    const t = useTranslations('AdminPage');
    const qt = useTranslations('QuizzesPage');
    const [questions, setQuestions] = useState<Question[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [showAddForm, setShowAddForm] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState<string>('Grammar');
    const [currentPage, setCurrentPage] = useState<number>(0);
    const [totalPages, setTotalPages] = useState<number>(1);
    const pageSize = 10;
    const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const [deleteQuestionId, setDeleteQuestionId] = useState<number | null>(null);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);

    const categories = ['Grammar', 'Vocabulary'];

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
            setErrorMessage(t('fetchError'));
        }
    };

    const handleEditQuestion = (question: Question) => {
        setEditingQuestion(question);
    };

    const handleDeleteConfirmation = (questionId: number) => {
        setDeleteQuestionId(questionId);
    };

    const handleDeleteQuestion = async () => {
        if (!deleteQuestionId) return;

        setIsDeleting(true);
        const locale = getLocale();

        try {
            const response = await fetch(`/${locale}/api/questions/delete`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ id: deleteQuestionId }),
            });

            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }

            // Odświeżenie listy po usunięciu
            fetchQuestions();
            setSuccessMessage(t('questionDeleted'));
        } catch (err) {
            console.error('Error deleting question:', err);
            setErrorMessage(t('deleteError'));
        } finally {
            setIsDeleting(false);
            setDeleteQuestionId(null);
        }
    };

    const handleQuestionUpdated = () => {
        fetchQuestions();
        setEditingQuestion(null);
        setSuccessMessage(t('questionUpdated'));
    };

    const handleQuestionAdded = () => {
        fetchQuestions();
        setShowAddForm(false);
        setSuccessMessage(t('questionAdded'));
    };

    const changePage = (page: number) => {
        if (page >= 0 && page < totalPages) {
            fetchQuestions(page);
        }
    };

    return (
        <div>
            {errorMessage && (
                <ErrorPopup
                    message={errorMessage}
                    onClose={() => setErrorMessage(null)}
                    autoCloseTime={5000}
                />
            )}

            {successMessage && (
                <div className="bg-green-50 border-l-4 border-green-500 text-green-700 p-4 mb-4 rounded">

                    <button
                        onClick={() => setSuccessMessage(null)}
                        className="text-green-700  ml-2"
                    >
                        <span className="font-bold">×</span> {successMessage}
                    </button>

                </div>
            )}

            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">{t('questionsList')}</h2>
                <button
                    onClick={() => setShowAddForm(!showAddForm)}
                    className="px-4 py-2 bg-quizPink text-white rounded hover:bg-pink-500 transition"
                >
                    {showAddForm ? t('cancelAddQuestion') : t('addNewQuestion')}
                </button>
            </div>

            {showAddForm && (
                <AddQuestionForm onQuestionAdded={handleQuestionAdded} />
            )}

            {editingQuestion && (
                <EditQuestionForm
                    question={editingQuestion}
                    onQuestionUpdated={handleQuestionUpdated}
                    onCancel={() => setEditingQuestion(null)}
                />
            )}

            <div className="mb-4">
                <div className="flex space-x-2 mb-4">
                    {categories.map(category => (
                        <button
                            key={category}
                            onClick={() => setSelectedCategory(category)}
                            className={`px-4 py-2 rounded ${
                                selectedCategory === category
                                    ? 'bg-quizBlue text-white'
                                    : 'bg-gray-200 text-gray-700'
                            }`}
                        >
                            {category}
                        </button>
                    ))}
                </div>
            </div>

            {isLoading ? (
                <div className="flex justify-center my-10">
                    <LoadingSpinner />
                </div>
            ) : (
                <>
                    {questions.length > 0 ? (
                        <div className="overflow-x-auto">
                            <table className="min-w-full bg-white border border-gray-200">
                                <thead className="bg-gray-100">
                                <tr>
                                    <th className="py-2 px-4 border-b text-left">ID</th>
                                    <th className="py-2 px-4 border-b text-left">{t('question')}</th>
                                    <th className="py-2 px-4 border-b text-left">{t('level')}</th>
                                    <th className="py-2 px-4 border-b text-left">{t('category')}</th>
                                    <th className="py-2 px-4 border-b text-left">{t('answers')}</th>
                                    <th className="py-2 px-4 border-b text-center">{t('actions')}</th>
                                </tr>
                                </thead>
                                <tbody>
                                {questions.map((question) => (
                                    <tr key={question.id} className="hover:bg-gray-50">
                                        <td className="py-2 px-4 border-b">{question.id}</td>
                                        <td className="py-2 px-4 border-b">{question.question}</td>
                                        <td className="py-2 px-4 border-b text-left">{question.level}</td>
                                        <td className="py-2 px-4 border-b">
                                            <CategoryChip name={question.category} textToDisplay={qt(`${question.category.toLowerCase()}Label`)}/>
                                        </td>
                                        <td className="py-2 px-4 border-b">{question.answers.length}</td>
                                        <td className="py-2 px-4 border-b text-center">
                                            <div className="flex justify-center space-x-2">
                                                <button
                                                    onClick={() => handleEditQuestion(question)}
                                                    className="px-2 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm"
                                                >
                                                    {t('edit')}
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteConfirmation(question.id)}
                                                    className="px-2 py-1 bg-red-500 text-white rounded hover:bg-red-600 text-sm"
                                                >
                                                    {t('delete')}
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div className="text-center py-8 bg-gray-50 rounded-lg">
                            <p className="text-gray-500">{t('noQuestions')}</p>
                        </div>
                    )}

                    {/* Paginacja */}
                    {totalPages > 1 && (
                        <div className="mt-4 flex justify-center space-x-2">
                            <button
                                onClick={() => changePage(currentPage - 1)}
                                disabled={currentPage === 0}
                                className={`px-3 py-1 rounded ${
                                    currentPage === 0
                                        ? 'bg-gray-200 text-gray-500'
                                        : 'bg-quizBlue text-white hover:bg-blue-700'
                                }`}
                            >
                                &lt;
                            </button>
                            {[...Array(totalPages)].map((_, index) => (
                                <button
                                    key={index}
                                    onClick={() => changePage(index)}
                                    className={`px-3 py-1 rounded ${
                                        currentPage === index
                                            ? 'bg-quizPink text-white'
                                            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                    }`}
                                >
                                    {index + 1}
                                </button>
                            ))}
                            <button
                                onClick={() => changePage(currentPage + 1)}
                                disabled={currentPage === totalPages - 1}
                                className={`px-3 py-1 rounded ${
                                    currentPage === totalPages - 1
                                        ? 'bg-gray-200 text-gray-500'
                                        : 'bg-quizBlue text-white hover:bg-blue-700'
                                }`}
                            >
                                &gt;
                            </button>
                        </div>
                    )}
                </>
            )}

            {/* Dialog potwierdzenia usunięcia */}
            {deleteQuestionId && (
                <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
                    <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
                        <h3 className="text-lg font-medium mb-4">{t('confirmDelete')}</h3>
                        <p className="mb-4">{t('deleteQuestionConfirmation')}</p>
                        <div className="flex justify-end space-x-2">
                            <button
                                onClick={() => setDeleteQuestionId(null)}
                                className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
                                disabled={isDeleting}
                            >
                                {t('cancel')}
                            </button>
                            <button
                                onClick={handleDeleteQuestion}
                                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                                disabled={isDeleting}
                            >
                                {isDeleting ? t('deleting') : t('delete')}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
