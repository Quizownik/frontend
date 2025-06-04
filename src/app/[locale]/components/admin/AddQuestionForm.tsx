import {useTranslations} from "next-intl";
import {useState} from "react";
import {getLocale} from "@/app/[locale]/lib/utils";

export default function AddQuestionForm({onQuestionAdded}: { onQuestionAdded: () => void }) {
    const t = useTranslations('AdminPage');
    const [formData, setFormData] = useState<{
        question: string;
        category: string;
        answers: { answer: string; isCorrect: boolean }[];
    }>({
        question: '',
        category: 'Grammar',
        answers: [
            {answer: '', isCorrect: true},
            {answer: '', isCorrect: false},
            {answer: '', isCorrect: false},
            {answer: '', isCorrect: false}
        ]
    });

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const {name, value} = e.target;
        setFormData({...formData, [name]: value});
    };

    const handleAnswerChange = (index: number, field: 'answer' | 'isCorrect', value: string | boolean) => {
        const newAnswers = [...formData.answers];
        newAnswers[index] = {...newAnswers[index], [field]: value};
        setFormData({...formData, answers: newAnswers});
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError(null);

        // Validation
        if (formData.answers.some(a => !a.answer.trim())) {
            setError(t('allAnswersRequired'));
            setIsSubmitting(false);
            return;
        }

        if (!formData.answers.some(a => a.isCorrect)) {
            setError(t('correctAnswerRequired'));
            setIsSubmitting(false);
            return;
        }

        try {
            const locale = getLocale();
            const response = await fetch(`/${locale}/api//questions/create`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            });

            if (!response.ok) {
                const errorData = await response.text();
                throw new Error(errorData || 'Failed to create question');
            }

            onQuestionAdded();
        } catch (err) {
            console.error('Error creating question:', err);
            setError(err instanceof Error ? err.message : 'An unknown error occurred');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="bg-gray-50 p-6 rounded-lg mb-8 border border-gray-200">
            <h3 className="text-xl font-medium mb-4">{t('addNewQuestion')}</h3>

            {error && (
                <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 mb-6">
                    <p>{error}</p>
                </div>
            )}

            <form onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 gap-6 mb-6">
                    <div>
                        <label className="block mb-1 font-medium">{t('question')}:</label>
                        <textarea
                            name="question"
                            value={formData.question}
                            onChange={handleChange}
                            className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-quizBlue"
                            rows={3}
                            required
                        />
                    </div>

                    <div>
                        <label className="block mb-1 font-medium">{t('category')}:</label>
                        <select
                            name="category"
                            value={formData.category}
                            onChange={handleChange}
                            className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-quizBlue"
                            required
                        >
                            <option value="Grammar">Grammar</option>
                            <option value="Vocabulary">Vocabulary</option>
                            <option value="Mixed">Mixed</option>
                        </select>
                    </div>

                    <div>
                        <label className="block mb-3 font-medium">{t('answers')}:</label>
                        {formData.answers.map((answer, index) => (
                            <div key={index} className="flex items-center mb-3">
                                <input
                                    type="radio"
                                    name="correctAnswer"
                                    checked={answer.isCorrect}
                                    onChange={() => {
                                        // Set current as correct and all others as incorrect
                                        const newAnswers = formData.answers.map((a, i) => ({
                                            ...a,
                                            isCorrect: i === index
                                        }));
                                        setFormData({...formData, answers: newAnswers});
                                    }}
                                    className="mr-2"
                                    required={index === 0}
                                />
                                <input
                                    type="text"
                                    value={answer.answer}
                                    onChange={(e) => handleAnswerChange(index, 'answer', e.target.value)}
                                    className="flex-1 px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-quizBlue"
                                    placeholder={`${t('answer')} ${index + 1}`}
                                    required
                                />
                            </div>
                        ))}
                        <p className="text-sm text-gray-600 mt-1">{t('selectCorrectAnswer')}</p>
                    </div>
                </div>

                <div className="flex justify-end">
                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className={`px-6 py-2 bg-quizBlue text-white rounded hover:bg-blue-700 transition ${isSubmitting ? 'opacity-70 cursor-not-allowed' : ''}`}
                    >
                        {isSubmitting ? t('saving') : t('saveQuestion')}
                    </button>
                </div>
            </form>
        </div>
    );
}