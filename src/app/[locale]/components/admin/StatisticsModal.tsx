"use client";

import {QuizStats} from "@/app/[locale]/lib/types"
import * as React from "react"
import {DailySolvesCurrent} from "@/app/[locale]/components/admin/stats/DailySolvesCurrent";
import CategoryChip from "@/app/[locale]/components/categoryChip";
import LevelChip from "@/app/[locale]/components/LevelChip";
import {ResultMedian} from "@/app/[locale]/components/admin/stats/ResultMedian";

interface StatisticsModalProps {
    quizStats: QuizStats | null;
    onClose?: () => void;
}

export default function StatisticsModal({quizStats, onClose}: StatisticsModalProps) {
    // Przekształcenie danych do formatu dla wykresu
    const chartData = React.useMemo(() => {
        if (!quizStats || !quizStats.solvedPerDayAgo) return [];
        // Zamień solvedPerDayAgo: {0: 5, 1: 3, ...} na [{dayAgo: 0, count: 5}, ...]
        console.log(quizStats);
        return Object.entries(quizStats.solvedPerDayAgo)
            .map(([dayAgo, count]) => ({
                dayAgo: Number(dayAgo),
                count: count as number,
                date: (() => {
                    console.log("dayAgo", dayAgo);
                    const d = new Date();
                    d.setDate(d.getDate() - Number(dayAgo) + 1); // +1, bo 0 to dzisiaj
                    console.log(d.toISOString().slice(0, 10));
                    const date = new Date(d.toISOString().slice(0, 10));
                    return date.toLocaleDateString("pl-PL", {
                        day: "2-digit",
                        month: "2-digit",
                        year: "2-digit"
                    });
                })(),
            }))
            .sort((a, b) => a.dayAgo - b.dayAgo);
    }, [quizStats]);

    // Suma rozwiązań
    const total = React.useMemo(() => chartData.reduce((acc, curr) => acc + curr.count, 0), [chartData]);

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-auto">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-semibold">Statystyki quizu</h3>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-700 text-2xl">✕</button>
                </div>
                {quizStats ? (
                    <div className="flex flex-row justify-around items-center gap-6 mb-4">
                        <div className="flex flex-col gap-7">
                            <p><b>Nazwa:</b> {quizStats.name}</p>
                            <p><b>Kategoria:</b> <CategoryChip name={quizStats.category}
                                                               textToDisplay={quizStats.category}/></p>
                            <p><b>Poziom:</b> <LevelChip name={quizStats.level} textToDisplay={quizStats.level}/></p>
                        </div>

                        <ResultMedian median={Number((quizStats.medianScore * 100).toFixed(2))}/>
                    </div>
                ) : (
                    <div>Brak danych.</div>
                )}
                <DailySolvesCurrent chartData={chartData} total={total}/>


            </div>
        </div>
    );
}

