import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { useMemo } from "react";
import { useTranslations } from "next-intl";

interface QuizStatsSummary {
    name: string;
    totalSolves: number;
    median: number;
}

interface QuizzesSummaryModalProps {
    quizzesSummary: QuizStatsSummary[];
    onClose: () => void;
}
export default function QuizzesSummaryModal({ quizzesSummary, onClose }: QuizzesSummaryModalProps) {
    const t = useTranslations('AdminPage');

    // Dane do wykresów
    const totalSolvesData = useMemo(() =>
        quizzesSummary
            .filter(q => q.totalSolves > 0)
            .map(q => ({ name: q.name, value: q.totalSolves })),
        [quizzesSummary]
    );

    const medianData = useMemo(() =>
        quizzesSummary
            .filter(q => q.median > 0)
            .map(q => ({ name: q.name, value: q.median })),
        [quizzesSummary]
    );

    const hasTotalSolvesData = totalSolvesData.length > 0;
    const hasMedianData = medianData.length > 0;

    const tooltipStyle = {
        backgroundColor: '#334155', // slate-700
        borderColor: '#475569', // slate-600
        color: '#ffffff', // slate-50
        borderRadius: '6px',
        padding: '8px 12px',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
        fontSize: '12px',
    };

    const labelStyle = {
        color: '#e2e8f0', // slate-200
        fontWeight: 'bold',
        marginBottom: '4px',
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-gray-100 p-6 rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-auto">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-semibold flex-1 text-center text-background">{t('quizzesSummary')}</h3>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-700 text-2xl">✕</button>
                </div>
                <div className="flex flex-col gap-8">
                    <Card className="flex-1 bg-background shadow-md">
                        <CardHeader>
                            <CardTitle>{t('totalSolves')}</CardTitle>
                            {!hasTotalSolvesData && (
                                <CardDescription>{t('charts.noData')}</CardDescription>
                            )}
                        </CardHeader>
                        <CardContent>
                            {hasTotalSolvesData ? (
                                <ResponsiveContainer width="100%" height={300}>
                                    <BarChart data={totalSolvesData}>
                                        <XAxis dataKey="name" angle={-45} textAnchor="end" height={70} />
                                        <YAxis />
                                        <Tooltip
                                            contentStyle={tooltipStyle}
                                            labelStyle={labelStyle}
                                            formatter={(value) => [`${value}`, t('solves')]}
                                        />
                                        <Bar dataKey="value" fill="var(--chart-1)" name={t('solves')} />
                                    </BarChart>
                                </ResponsiveContainer>
                            ) : (
                                <div className="h-[300px] flex items-center justify-center text-gray-500">
                                    {t('charts.noDataAvailable')}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                    <Card className="flex-1 bg-background shadow-md">
                        <CardHeader>
                            <CardTitle>{t('medianResults')}</CardTitle>
                            {!hasMedianData && (
                                <CardDescription>{t('charts.noData')}</CardDescription>
                            )}
                        </CardHeader>
                        <CardContent>
                            {hasMedianData ? (
                                <ResponsiveContainer width="100%" height={300}>
                                    <BarChart data={medianData}>
                                        <XAxis dataKey="name" angle={-45} textAnchor="end" height={70} />
                                        <YAxis domain={[0, 100]} />
                                        <Tooltip
                                            contentStyle={tooltipStyle}
                                            labelStyle={labelStyle}
                                            formatter={(value) => [`${value}%`, t('median')]}
                                        />
                                        <Bar dataKey="value" fill="var(--chart-2)" name={t('median')} />
                                    </BarChart>
                                </ResponsiveContainer>
                            ) : (
                                <div className="h-[300px] flex items-center justify-center text-gray-500">
                                    {t('charts.noDataAvailable')}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}

