import React, {useMemo, useEffect} from "react";
import {useTranslations} from "next-intl";
import {Card, CardHeader, CardTitle, CardContent, CardDescription} from "@/components/ui/card";
import {
    Bar,
    BarChart,
    CartesianGrid,
    XAxis,
    YAxis,
    Tooltip,
    RadialBarChart,
    RadialBar,
    PolarGrid,
    PolarRadiusAxis,
    Label
} from "recharts";
import {ChartConfig, ChartContainer} from "@/components/ui/chart";

type CategoryStats = {
    category: string;
    averageScore: number;
    solvedPerDayAgo: {
        [key: string]: number;
    };
};

interface CategoryStatisticsModalProps {
    categoryStats: CategoryStats[];
    onClose: () => void;
}

const chartConfig = {
    views: {
        label: "Views",
    },
    chart1: {
        label: "Solves",
        color: "var(--chart-1)",
    },
} satisfies ChartConfig;

const medianChartConfig = {
    visitors: {
        label: "Visitors",
    },
    safari: {
        label: "Safari",
        color: "var(--chart-2)",
    },
} satisfies ChartConfig;

const tooltipStyle = {
    backgroundColor: '#334155', // slate-700
    borderColor: '#475569', // slate-600
    color: '#f8fafc', // slate-50
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

export default function CategoryStatisticsModal({categoryStats, onClose}: CategoryStatisticsModalProps) {
    const t = useTranslations('ResultsPage');
    const ct = useTranslations('AdminPage.charts');

    // Dodajemy debug log, aby sprawdzić dane wejściowe
    useEffect(() => {
        console.log("Otrzymane dane kategorii:", categoryStats);
    }, [categoryStats]);

    const prepareChartData = (stats: CategoryStats) => {
        if (!stats || !stats.solvedPerDayAgo) {
            console.log("Brak danych dla kategorii:", stats?.category);
            return [];
        }

        return Object.entries(stats.solvedPerDayAgo)
            .map(([dayAgo, count]) => ({
                dayAgo: Number(dayAgo),
                count: count as number,
                date: (() => {
                    const d = new Date();
                    d.setDate(d.getDate() - Number(dayAgo));
                    const date = new Date(d.toISOString().slice(0, 10));
                    return date.toLocaleDateString("pl-PL", {
                        day: "2-digit",
                        month: "2-digit"
                    });
                })(),
            }))
            .sort((a, b) => a.dayAgo - b.dayAgo);
    };

    const solvesSumData = useMemo(() => {
        if (!categoryStats || categoryStats.length === 0) return [];
        return categoryStats.map(stats => ({
            category: stats.category || "Unknown",
            totalSolves: Object.values(stats.solvedPerDayAgo || {}).reduce((acc, curr) => acc + (curr as number), 0)
        }));
    }, [categoryStats]);

    const medianPerCategoryData = useMemo(() => {
        if (!categoryStats || categoryStats.length === 0) return [];
        return categoryStats.map(stats => ({
            category: stats.category || "Unknown",
            median: Math.round((stats?.averageScore || 0) * 100)
        }));
    }, [categoryStats]);

    const categoriesData = useMemo(() => {
        if (!categoryStats || categoryStats.length === 0) {
            console.log("Brak danych statystycznych dla kategorii");
            return [];
        }

        return categoryStats.map(stats => {
            const chartData = prepareChartData(stats);
            const total = chartData.reduce((acc, curr) => acc + curr.count, 0);
            const averageScorePercent = Math.round((stats?.averageScore || 0) * 100);

            return {
                category: stats.category || "Unknown",
                chartData,
                total,
                averageScorePercent,
                score: [
                    {name: ct('median'), value: averageScorePercent, fill: "var(--chart-2)"},
                ]
            };
        });
    }, [categoryStats, ct]);

    // Jeśli nie ma danych, wyświetl komunikat
    if (!categoryStats || categoryStats.length === 0 || categoriesData.length === 0) {
        return (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div className="bg-white p-6 rounded-lg shadow-xl max-w-md w-full">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-xl font-semibold flex-1 text-center">{t('categoryStatsTitle')}</h3>
                        <button onClick={onClose} className="text-gray-500 hover:text-gray-700 text-2xl">✕</button>
                    </div>
                    <div className="text-center py-8">
                        <p className="text-gray-600">{ct('noDataAvailable')}</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-xl max-w-5xl w-full max-h-[90vh] overflow-auto">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-semibold flex-1 text-center">{t('categoryStatsTitle')}</h3>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-700 text-2xl">✕</button>
                </div>
                {/* Total Solves */}
                <Card className="w-full mt-8 mb-8 shadow-2xl">
                    <CardHeader>
                        <CardTitle>{ct('totalSolvesTitle')}</CardTitle>
                        <CardDescription>{ct('totalSolvesDescription')}</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <ChartContainer className="aspect-auto h-[300px] w-full" config={chartConfig}>
                            <BarChart data={solvesSumData} margin={{left: 12, right: 12}}>
                                <CartesianGrid vertical={false}/>
                                <XAxis dataKey="category"/>
                                <YAxis/>
                                <Tooltip
                                    contentStyle={tooltipStyle}
                                    labelStyle={labelStyle}
                                    formatter={(value) => [`${value}`, t('solves')]}
                                />
                                <Bar dataKey="totalSolves" fill="var(--chart-1)" name={t('solves')}/>
                            </BarChart>
                        </ChartContainer>
                    </CardContent>
                </Card>

                {/* Median Per Category */}
                <Card className="w-full mb-8 shadow-2xl">
                    <CardHeader>
                        <CardTitle>{ct('medianPerCategoryTitle')}</CardTitle>
                        <CardDescription>{ct('medianPerCategoryDescription')}</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <ChartContainer className="aspect-auto h-[300px] w-full" config={chartConfig}>
                            <BarChart data={medianPerCategoryData} margin={{left: 12, right: 12}}>
                                <CartesianGrid vertical={false}/>
                                <XAxis dataKey="category"/>
                                <YAxis domain={[0, 100]}/>
                                <Tooltip
                                    contentStyle={tooltipStyle}
                                    labelStyle={labelStyle}
                                    formatter={(value) => [`${value}%`, t('score')]}
                                />
                                <Bar dataKey="median" fill="var(--chart-2)" name={t('score')}/>
                            </BarChart>
                        </ChartContainer>
                    </CardContent>
                </Card>

                <div className="space-y-8">
                    {categoriesData.map((data, index) => (
                        <div key={data.category} className="bg-slate-50 p-4 rounded-lg shadow-xl">
                            <h4 className="text-lg font-medium mb-4 text-center">{data.category}</h4>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Average Score */}
                                <Card className="flex flex-col bg-background shadow-sm">
                                    <CardHeader className="items-center pb-0">
                                        <CardTitle>{ct('medianTitle')}</CardTitle>
                                        <CardDescription>{ct('medianDescription')}</CardDescription>
                                    </CardHeader>
                                    <CardContent className="flex-1 pb-0">
                                        {data.averageScorePercent > 0 ? (
                                            <ChartContainer
                                                config={medianChartConfig}
                                                className="mx-auto aspect-square max-h-[250px]"
                                            >
                                                <RadialBarChart
                                                    key={data.averageScorePercent}
                                                    data={data.score}
                                                    width={300}
                                                    height={300}
                                                    cx="50%"
                                                    cy="50%"
                                                    innerRadius={80}
                                                    outerRadius={140}
                                                    barSize={25}
                                                    startAngle={90}
                                                    endAngle={data.averageScorePercent / 100 * 360 + 90}
                                                >
                                                    <PolarGrid
                                                        gridType="circle"
                                                        radialLines={false}
                                                        stroke="none"
                                                        className="first:fill-muted last:fill-background"
                                                        polarRadius={[86, 74]}
                                                    />
                                                    <RadialBar dataKey="value" background/>
                                                    <PolarRadiusAxis tick={false} tickLine={false} axisLine={false}
                                                                     angle={90} domain={[0, 100]}>
                                                        <Label
                                                            content={({viewBox}) => {
                                                                if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                                                                    return (
                                                                        <text
                                                                            x={viewBox.cx}
                                                                            y={viewBox.cy}
                                                                            textAnchor="middle"
                                                                            dominantBaseline="middle"
                                                                        >
                                                                            <tspan
                                                                                x={viewBox.cx}
                                                                                y={viewBox.cy}
                                                                                className="fill-foreground text-4xl font-bold"
                                                                            >
                                                                                {data.averageScorePercent}
                                                                            </tspan>
                                                                            <tspan
                                                                                x={viewBox.cx}
                                                                                y={(viewBox.cy || 0) + 24}
                                                                                className="fill-muted-foreground"
                                                                            >
                                                                                %
                                                                            </tspan>
                                                                        </text>
                                                                    )
                                                                }
                                                                return null;
                                                            }}
                                                        />
                                                    </PolarRadiusAxis>
                                                </RadialBarChart>
                                            </ChartContainer>
                                        ) : (
                                            <div className="h-[250px] flex items-center justify-center text-gray-500">
                                                {ct('noDataAvailable')}
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>

                                {/* Daily Solves */}
                                <Card className="py-0 w-full">
                                    <CardHeader className="flex flex-col items-stretch border-b !p-0 sm:flex-row">
                                        <div
                                            className="flex flex-1 flex-col justify-center gap-1 px-6 pt-4 pb-3 sm:!py-4">
                                            <CardTitle>{ct('dailySolvesTitle')}</CardTitle>
                                            <CardDescription>
                                                {ct('dailySolvesDescription')}
                                            </CardDescription>
                                        </div>
                                        <div className="flex items-center px-6 pt-4 pb-3">
                                            <span className="text-muted-foreground text-xs mr-2">{ct('total')}:</span>
                                            <span
                                                className="text-lg leading-none font-bold sm:text-3xl">{data.total}</span>
                                        </div>
                                    </CardHeader>
                                    <CardContent className="px-2 sm:p-6">
                                        {data.chartData.length > 0 ? (
                                            <ChartContainer className="aspect-auto h-[250px] w-full"
                                                            config={chartConfig}>
                                                <BarChart
                                                    data={data.chartData}
                                                    margin={{left: 12, right: 12}}
                                                >
                                                    <CartesianGrid vertical={false}/>
                                                    <XAxis
                                                        dataKey="date"
                                                        tickLine={false}
                                                        axisLine={false}
                                                        tickMargin={8}
                                                        minTickGap={16}
                                                    />
                                                    <YAxis/>
                                                    <Tooltip
                                                        contentStyle={tooltipStyle}
                                                        labelStyle={labelStyle}
                                                        formatter={(value) => [`${value}`, t('solves')]}
                                                    />
                                                    <Bar dataKey="count" fill="var(--chart-1)" name={t('solves')}/>
                                                </BarChart>
                                            </ChartContainer>
                                        ) : (
                                            <div className="h-[250px] flex items-center justify-center text-gray-500">
                                                {ct('noDataAvailable')}
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
