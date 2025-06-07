import React, {useState} from "react";
import {useTranslations, useLocale} from "next-intl";

export default function GenerateQuizModal({onClose, onQuizGenerated}: {
    onClose: () => void,
    onQuizGenerated: () => void
}) {
    const t = useTranslations('GenerateQuizModal');
    const locale = useLocale();
    const [name, setName] = useState('');
    const [category, setCategory] = useState('Mixed');
    const [count, setCount] = useState(5);
    const [level, setLevel] = useState('Easy');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError(null);
        try {
            const res = await fetch(`/${locale}/api/quizzes/generate`, {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({name, category, count, level}),
            });
            if (!res.ok) {
                const data = await res.text();
                throw new Error(data || t('error'));
            }
            onQuizGenerated();
            onClose();
        } catch (err) {
            setError(err instanceof Error ? err.message : t('error'));
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50"
             onClick={onClose}
        >
            <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-xl w-full max-w-md"
                  onClick={e => e.stopPropagation()}>
                <h3 className="text-xl font-semibold mb-4">{t('title')}</h3>
                {error && <div className="mb-3 text-red-600">{error}</div>}
                <div className="mb-3">
                    <label className="block mb-1 font-medium">{t('quizName')}:</label>
                    <input
                        type="text"
                        value={name}
                        onChange={e => setName(e.target.value)}
                        className="w-full px-3 py-2 border rounded"
                        required
                    />
                </div>
                <div className="mb-3">
                    <label className="mb-1 font-medium">{t('category')}:</label>
                    <select
                        name="category"
                        value={category}
                        onChange={e => setCategory(e.target.value)}
                        className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-quizPink"
                        required
                    >
                        <option value="Grammar">{t('grammar')}</option>
                        <option value="Vocabulary">{t('vocabulary')}</option>
                        <option value="Mixed">{t('mixed')}</option>
                    </select>
                </div>
                <div className="mb-3">
                    <label className="block mb-1 font-medium">{t('questionCount')}:</label>
                    <input
                        type="number"
                        min={1}
                        max={25}
                        value={count}
                        onChange={e => setCount(Number(e.target.value))}
                        className="w-full px-3 py-2 border rounded"
                        required
                    />
                </div>
                <div className="mb-5">
                    <label className="block mb-1 font-medium">{t('level')}:</label>
                    <select
                        value={level}
                        onChange={e => setLevel(e.target.value)}
                        className="w-full px-3 py-2 border rounded"
                        required
                    >
                        <option value="Easy">{t('easy')}</option>
                        <option value="Medium">{t('medium')}</option>
                        <option value="Hard">{t('hard')}</option>
                    </select>
                </div>
                <div className="flex justify-end space-x-2">
                    <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 rounded">{t('cancel')}</button>
                    <button type="submit" disabled={isSubmitting} className="px-4 py-2 bg-quizBlue text-white rounded">
                        {isSubmitting ? t('generating') : t('generate')}
                    </button>
                </div>
            </form>
        </div>
    );
}
