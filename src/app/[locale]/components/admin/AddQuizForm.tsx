
import React, {useEffect, useState} from 'react';
import {useTranslations} from 'next-intl';
import {getLocale} from '@/app/[locale]/lib/utils';
import {Question} from '@/app/[locale]/lib/types';


export default function AddQuizForm({onQuizAdded}: { onQuizAdded: () => void }) {
    const t = useTranslations('AdminPage');
    const [formData, setFormData] = useState<{
        name: string;
        category: string;
        position: number;
        questionIds: string
    }>({
        name: '',
        category: 'Grammar', // Default value
        position: 0,
        questionIds: '',
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [availableQuestions, setAvailableQuestions] = useState<Question[]>([]);

    useEffect(() => {
        fetchAvailableQuestions();
    }, []);

    const fetchAvailableQuestions = async () => {
        const locale = getLocale();
        try {
            const response = await fetch(`/${locale}/api/admin/questions?size=100`);
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

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError(null);

        try {
            // Convert questionIds from comma-separated string to array of numbers
            const questionIdsArray = formData.questionIds
                .split(',')
                .map(id => id.trim())
                .filter(id => id !== '')
                .map(id => parseInt(id, 10));

            const quizData = {
                name: formData.name,
                category: formData.category,
                position: formData.position,
                questionIds: questionIdsArray
            };

            const locale = getLocale();
            const response = await fetch(`/${locale}/api/admin/quizzes`, {
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

                    <div>
                        <label className="block mb-1 font-medium">{t('position')}:</label>
                        <input
                            type="number"
                            name="position"
                            value={formData.position}
                            onChange={handleChange}
                            className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-quizPink"
                            required
                        />
                    </div>

                    <div>
                        <label className="block mb-1 font-medium">{t('questionIds')}:</label>
                        <textarea
                            name="questionIds"
                            value={formData.questionIds}
                            onChange={handleChange}
                            className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-quizPink h-24"
                            placeholder="Comma-separated IDs (e.g., 1,2,3)"
                            required
                        />
                        <p className="text-sm text-gray-600 mt-1">{t('questionIdsHelp')}</p>
                    </div>
                </div>

                {/* Available questions list */}
                <div className="mb-6">
                    <h4 className="font-medium mb-2">{t('availableQuestions')}:</h4>
                    <div className="bg-white p-3 border rounded max-h-48 overflow-y-auto">
                        {availableQuestions.length === 0 ? (
                            <p className="text-gray-500">{t('noQuestionsAvailable')}</p>
                        ) : (
                            <table className="w-full text-sm">
                                <thead>
                                <tr>
                                    <th className="text-left py-2 px-3">ID</th>
                                    <th className="text-left py-2 px-3">{t('question')}</th>
                                    <th className="text-left py-2 px-3">{t('category')}</th>
                                </tr>
                                </thead>
                                <tbody>
                                {availableQuestions.map(q => (
                                    <tr key={q.id} className="hover:bg-gray-100">
                                        <td className="py-1 px-3">{q.id}</td>
                                        <td className="py-1 px-3">{q.question}</td>
                                        <td className="py-1 px-3">{q.category}</td>
                                    </tr>
                                ))}
                                </tbody>
                            </table>
                        )}
                    </div>
                </div>

                <div className="flex justify-end">
                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className={`px-6 py-2 bg-quizPink text-white rounded hover:bg-pink-600 transition ${isSubmitting ? 'opacity-70 cursor-not-allowed' : ''}`}
                    >
                        {isSubmitting ? t('saving') : t('saveQuiz')}
                    </button>
                </div>
            </form>
        </div>
    );
}