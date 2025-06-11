import {useTranslations} from "next-intl";
import {useEffect, useState} from "react";
import {PageResponse, QuizLabel, QuizStats} from "@/app/[locale]/lib/types";
import {getLocale} from "@/app/[locale]/lib/utils";
import {LoadingSpinner} from "@/app/[locale]/components/LoadingSpinner";
import AddQuizForm from "@/app/[locale]/components/admin/AddQuizForm";
import EditQuizForm from "@/app/[locale]/components/admin/EditQuizForm";
import CategoryChip from "@/app/[locale]/components/categoryChip";
import GenerateQuizModal from "@/app/[locale]/components/admin/GenerateQuizModal";
import StatisticsModal from "@/app/[locale]/components/admin/StatisticsModal";

export default function QuizzesManager() {
    const t = useTranslations('AdminPage');
    const qt = useTranslations('QuizzesPage');
    const [quizzes, setQuizzes] = useState<QuizLabel[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [showAddForm, setShowAddForm] = useState(false);
    const [showGenerateModal, setShowGenerateModal] = useState(false);
    const [quizToEdit, setQuizToEdit] = useState<number | null>(null);
    const [quizToDelete, setQuizToDelete] = useState<QuizLabel | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const [deleteError, setDeleteError] = useState<string | null>(null);
    const [currentPage, setCurrentPage] = useState<number>(0);
    const [totalPages, setTotalPages] = useState<number>(1);
    const [selectedCategory, setSelectedCategory] = useState<string>('All');
    const [showStatisticsModal, setShowStatisticsModal] = useState(false);
    const [quizStats, setQuizStats] = useState<QuizStats[]>([]);
    const [currentQuizStats, setCurrentQuizStats] = useState<QuizStats | null>(null);

    const handleShowStatistics = (quizId: number) => {
        setShowStatisticsModal(true);
        //search for the quiz stats by quizId
        const stats = quizStats.find(stat => stat.quizId === quizId);
        if (stats) {
            setCurrentQuizStats(stats);
        } else {
            console.error(`No stats found for quiz ID ${quizId}`);
            setCurrentQuizStats(null);
        }

    }
    const handleCloseStatistics = () => setShowStatisticsModal(false);

    const pageSize = 10;

    useEffect(() => {
        fetchQuizzes(currentPage, selectedCategory);
        fetchQuizStats();
    }, [currentPage, selectedCategory]);

    const fetchQuizStats = async () => {
        setIsLoading(true);
        const locale = getLocale();

        try {
            const response = await fetch(`/${locale}/api/result/admin/stats`);
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            const data = await response.json();
            setQuizStats(data || []);
            setIsLoading(false);
        } catch (err) {
            console.error('Error fetching quiz stats:', err);
            setIsLoading(false);
        }
    };

    const fetchQuizzes = async (page = 0, category = 'All') => {
        setIsLoading(true);
        const locale = getLocale();

        try {
            const response = await fetch(`/${locale}/api/quizzes/getWithoutLevel?category=${category}&page=${page}&size=${pageSize}`);
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            const data = await response.json() as PageResponse;
            setQuizzes(data.content || []);
            setTotalPages(data.totalPages || 1);
            setCurrentPage(data.number || 0);
            setIsLoading(false);
        } catch (err) {
            console.error('Error fetching quizzes:', err);
            setIsLoading(false);
        }
    };

    const changePage = (page: number) => {
        if (page >= 0 && page < totalPages) {
            setCurrentPage(page);
        }
    };

    const changeCategory = (category: string) => {
        setSelectedCategory(category);
        setCurrentPage(0); // Reset do pierwszej strony po zmianie kategorii
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
            fetchQuizzes(currentPage, selectedCategory);
            setQuizToDelete(null);
        } catch (error) {
            console.error('Error deleting quiz:', error);
            setDeleteError(error instanceof Error ? error.message : 'Wystąpił błąd podczas usuwania quizu');
        } finally {
            setIsDeleting(false);
        }
    };

    const handleEditQuiz = (quizId: number) => {
        setQuizToEdit(quizId);
        setShowAddForm(false); // Zamknij formularz dodawania jeśli był otwarty
    };

    const handleCancelEdit = () => {
        setQuizToEdit(null);
    };

    const handleQuizUpdated = () => {
        fetchQuizzes(currentPage, selectedCategory);
        setQuizToEdit(null);
    };

    if (isLoading) return <LoadingSpinner/>;

    return (
        <div>


            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-semibold">{t('quizzesList')}</h2>
                <button
                    onClick={() => setShowGenerateModal(true)}
                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition flex items-center ml-2"
                >
                    <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4"/>
                    </svg>
                    {t('generateQuiz')}
                </button>
                {!quizToEdit && (
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
                )}
            </div>

            {showGenerateModal && (
                <GenerateQuizModal
                    onClose={() => setShowGenerateModal(false)}
                    onQuizGenerated={() => fetchQuizzes(0, selectedCategory)}
                />
            )}

            {/* Przyciski kategorii - pokazywane tylko gdy nie edytujemy quizu */}
            {!quizToEdit && (
                <div className="mb-6">
                    <div className="flex flex-wrap gap-2">
                        <button
                            onClick={() => changeCategory('All')}
                            className={`px-4 py-2 rounded-lg transition-colors ${
                                selectedCategory === 'All'
                                    ? 'bg-quizBlue text-white'
                                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                            }`}
                        >
                            {qt('allLabel')}
                        </button>

                        <button
                            onClick={() => changeCategory('Mixed')}
                            className={`px-4 py-2 rounded-lg transition-colors ${
                                selectedCategory === 'Mixed'
                                    ? 'bg-quizBlue text-white'
                                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                            }`}
                        >
                            {qt('mixedLabel')}
                        </button>

                        <button
                            onClick={() => changeCategory('Grammar')}
                            className={`px-4 py-2 rounded-lg transition-colors ${
                                selectedCategory === 'Grammar'
                                    ? 'bg-quizBlue text-white'
                                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                            }`}
                        >
                            {qt('grammarLabel')}
                        </button>

                        <button
                            onClick={() => changeCategory('Vocabulary')}
                            className={`px-4 py-2 rounded-lg transition-colors ${
                                selectedCategory === 'Vocabulary'
                                    ? 'bg-quizBlue text-white'
                                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                            }`}
                        >
                            {qt('vocabularyLabel')}
                        </button>
                    </div>
                </div>
            )}

            {/* Formularz dodawania quizu */}
            {showAddForm && !quizToEdit && <AddQuizForm onQuizAdded={() => {
                fetchQuizzes(0, selectedCategory);
                setCurrentPage(0);
                setShowAddForm(false);
            }}/>}

            {/* Formularz edycji quizu */}
            {quizToEdit && (
                <EditQuizForm
                    quizId={quizToEdit}
                    onQuizUpdated={handleQuizUpdated}
                    onCancel={handleCancelEdit}
                />
            )}

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
                                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                                             xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor"
                                                    strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor"
                                                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        {t('deleting')}
                                    </>
                                ) : t('delete')}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {showStatisticsModal && (
                <StatisticsModal quizStats={currentQuizStats} onClose={handleCloseStatistics} />
            )}

            {/* Lista quizów - pokazywana tylko gdy nie edytujemy quizu */}
            {!quizToEdit && quizzes.length === 0 ? (
                <p className="text-gray-500 text-center py-8">{t('noQuizzes')}</p>
            ) : !quizToEdit && (
                <>
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
                                    <td className="py-3 px-4 border-b">
                                        <CategoryChip name={quiz.category}
                                                      textToDisplay={qt(`${quiz.category.toLowerCase()}Label`)}/>
                                    </td>
                                    <td className="py-3 px-4 border-b">{quiz.numberOfQuestions || 0}</td>
                                    <td className="flex flex-row py-3 px-4 border-b gap-2">
                                        <button
                                            onClick={() => handleShowStatistics(quiz.id)}
                                            className="px-2 py-1 bg-green-500 text-white rounded hover:bg-green-600 text-sm"
                                        >
                                            {t('statistics')}
                                        </button>
                                        <button
                                            onClick={() => handleEditQuiz(quiz.id)}
                                            className="px-2 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm"
                                        >
                                            {t('edit')}
                                        </button>
                                        <button
                                            className="px-2 py-1 bg-red-500 text-white rounded hover:bg-red-600 text-sm"
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
        </div>
    );
}