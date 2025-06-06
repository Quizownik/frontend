import React, {useEffect, useState} from 'react';
import {useTranslations} from 'next-intl';
import {getLocale} from '@/app/[locale]/lib/utils';
import {Question} from '@/app/[locale]/lib/types';
import CategoryChip from "@/app/[locale]/components/categoryChip";

export default function AddQuizForm({onQuizAdded}: { onQuizAdded: () => void }) {
    const t = useTranslations('AdminPage');
    const qt = useTranslations('QuizzesPage');

    const [formData, setFormData] = useState<{
        name: string;
        category: string;
    }>({
        name: '',
        category: 'Mixed', // Default value
    });

    const [selectedQuestionIds, setSelectedQuestionIds] = useState<number[]>([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [availableQuestions, setAvailableQuestions] = useState<Question[]>([]);
    const [questionFilter, setQuestionFilter] = useState<string>('All');

    useEffect(() => {
        fetchAvailableQuestions();
    }, []);

    const fetchAvailableQuestions = async () => {
        const locale = getLocale();
        try {
            const response = await fetch(`/${locale}/api/questions/category?category=All&page=0&size=100`);
            if (response.ok) {
                const data = await response.json();
                setAvailableQuestions(data.content || []);
            }
        } catch (err) {
            console.error('Error fetching questions:', err);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const {name, value} = e.target;
        setFormData({...formData, [name]: value});
    };

    const handleQuestionSelection = (questionId: number) => {
        setSelectedQuestionIds(prevIds => {
            // Jeśli pytanie jest już zaznaczone, usuń je z tablicy
            if (prevIds.includes(questionId)) {
                return prevIds.filter(id => id !== questionId);
            }
            // W przeciwnym razie dodaj je do tablicy
            else {
                return [...prevIds, questionId];
            }
        });
    };

    const handleFilterChange = (category: string) => {
        setQuestionFilter(category);
    };

    const filteredQuestions = questionFilter === 'All'
        ? availableQuestions
        : availableQuestions.filter(q => q.category === questionFilter);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError(null);

        // Sprawdź, czy wybrano co najmniej jedno pytanie
        if (selectedQuestionIds.length === 0) {
            setError(t('noQuestionsSelected'));
            setIsSubmitting(false);
            return;
        }

        try {
            const quizData = {
                name: formData.name,
                category: formData.category,
                questionIds: selectedQuestionIds
            };

            const locale = getLocale();
            const response = await fetch(`/${locale}/api/quizzes/create`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(quizData),
            });

            if (!response.ok) {
                const errorData = await response.text();
                throw new Error(errorData || 'Failed to create quiz');
            }

            onQuizAdded();
        } catch (err) {
            console.error('Error creating quiz:', err);
            setError(err instanceof Error ? err.message : 'An unknown error occurred');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="bg-gray-50 p-6 rounded-lg mb-8 border border-gray-200">
            <h3 className="text-xl font-medium mb-4">{t('addNewQuiz')}</h3>

            {error && (
                <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 mb-6">
                    <p>{error}</p>
                </div>
            )}

            <form onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 gap-6 mb-6">
                    <div>
                        <label className="block mb-1 font-medium">{t('name')}:</label>
                        <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-quizPink"
                            required
                        />
                    </div>

                    <div>
                        <label className="block mb-1 font-medium">{t('category')}:</label>
                        <select
                            name="category"
                            value={formData.category}
                            onChange={handleChange}
                            className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-quizPink"
                            required
                        >
                            <option value="Grammar">Grammar</option>
                            <option value="Vocabulary">Vocabulary</option>
                            <option value="Mixed">Mixed</option>
                        </select>
                    </div>
                </div>

                {/* Sekcja wyboru pytań */}
                <div className="mb-6">
                    <div className="flex justify-between items-center mb-2">
                        <h4 className="font-medium">{t('availableQuestions')}:</h4>
                        <div className="text-sm text-blue-600">
                            {t('selectedQuestionsCount')}: {selectedQuestionIds.length}
                        </div>
                    </div>

                    {/* Filtry kategorii pytań */}
                    <div className="mb-3 flex flex-wrap gap-2">
                        <button
                            type="button"
                            onClick={() => handleFilterChange('All')}
                            className={`px-3 py-1 text-sm rounded ${
                                questionFilter === 'All' 
                                    ? 'bg-quizBlue text-white' 
                                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                            }`}
                        >
                            {qt('allLabel')}
                        </button>

                        <button
                            type="button"
                            onClick={() => handleFilterChange('Grammar')}
                            className={`px-3 py-1 text-sm rounded ${
                                questionFilter === 'Grammar' 
                                    ? 'bg-quizBlue text-white' 
                                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                            }`}
                        >
                            {qt('grammarLabel')}
                        </button>

                        <button
                            type="button"
                            onClick={() => handleFilterChange('Vocabulary')}
                            className={`px-3 py-1 text-sm rounded ${
                                questionFilter === 'Vocabulary' 
                                    ? 'bg-quizBlue text-white' 
                                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                            }`}
                        >
                            {qt('vocabularyLabel')}
                        </button>
                    </div>

                    <div className="bg-white p-3 border rounded max-h-80 overflow-y-auto">
                        {filteredQuestions.length === 0 ? (
                            <p className="text-gray-500">{t('noQuestionsAvailable')}</p>
                        ) : (
                            <table className="w-full text-sm">
                                <thead>
                                <tr>
                                    <th className="text-left py-2 px-3"></th>
                                    <th className="text-left py-2 px-3">ID</th>
                                    <th className="text-left py-2 px-3">{t('question')}</th>
                                    <th className="text-left py-2 px-3">{t('category')}</th>
                                </tr>
                                </thead>
                                <tbody>
                                {filteredQuestions.map(q => (
                                    <tr
                                        key={q.id}
                                        className={`${selectedQuestionIds.includes(q.id) ? 'bg-blue-50' : ''} hover:bg-gray-100 cursor-pointer`}
                                        onClick={() => handleQuestionSelection(q.id)}
                                    >
                                        <td className="py-2 px-3">
                                            <input
                                                type="checkbox"
                                                checked={selectedQuestionIds.includes(q.id)}
                                                onChange={() => handleQuestionSelection(q.id)}
                                                className="w-4 h-4 text-quizBlue focus:ring-quizBlue rounded"
                                                onClick={(e) => e.stopPropagation()}
                                            />
                                        </td>
                                        <td className="py-2 px-3">{q.id}</td>
                                        <td className="py-2 px-3 max-w-xs truncate">{q.question}</td>
                                        <td className="py-2 px-3">
                                            <CategoryChip name={q.category} textToDisplay={q.category} />
                                        </td>
                                    </tr>
                                ))}
                                </tbody>
                            </table>
                        )}
                    </div>
                    <p className="text-sm text-gray-600 mt-2">
                        {t('selectQuestionsHelp')}
                    </p>
                </div>

                <div className="flex justify-end">
                    <button
                        type="submit"
                        disabled={isSubmitting || selectedQuestionIds.length === 0}
                        className={`px-6 py-2 bg-quizPink text-white rounded hover:bg-pink-600 transition ${
                            (isSubmitting || selectedQuestionIds.length === 0) ? 'opacity-70 cursor-not-allowed' : ''
                        }`}
                    >
                        {isSubmitting ? t('saving') : t('saveQuiz')}
                    </button>
                </div>
            </form>
        </div>
    );
}

