import {useEffect, useRef} from "react";
import {QuizStats} from "@/app/[locale]/lib/types"
import {useTranslations} from "next-intl";

interface StatisticsModalProps {
    quizStats: QuizStats | null;
    onClose?: () => void;
}


export default function StatisticsModal({quizStats, onClose}: StatisticsModalProps) {
    const t = useTranslations("Statistics")


    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-xl max-w-md w-full">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-semibold">Statystyki quizu</h3>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-700 text-2xl">✕</button>
                </div>
                {quizStats ? (
                    <div>
                        <p><b>Nazwa:</b> {quizStats.name}</p>
                        <p><b>Kategoria:</b> {quizStats.category}</p>
                        <p><b>Poziom:</b> {quizStats.level}</p>
                        <p><b>Mediana wyniku:</b> {quizStats.medianScore}</p>
                        <p><b>Rozwiązania:</b> {quizStats.totalSolutions}</p>
                    </div>
                ) : (
                    <div>Brak danych.</div>
                )}
            </div>
        </div>
    );
}