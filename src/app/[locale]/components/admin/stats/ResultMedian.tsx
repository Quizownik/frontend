"use client"

import {
    Label,
    PolarGrid,
    PolarRadiusAxis,
    RadialBar,
    RadialBarChart,
} from "recharts"

import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import {ChartConfig, ChartContainer} from "@/components/ui/chart"
import { useTranslations } from "next-intl"

export const description = "A radial chart with a custom shape"

const chartConfig = {
    visitors: {
        label: "Visitors",
    },
    safari: {
        label: "Safari",
        color: "var(--chart-2)",
    },
} satisfies ChartConfig

export function ResultMedian({median}: { median: number }) {
    const t = useTranslations('AdminPage.charts');

    if (!median || median === 0) {
        return (
            <Card className="flex flex-col bg-background shadow-sm">
                <CardHeader className="items-center pb-0">
                    <CardTitle>{t('medianTitle')}</CardTitle>
                    <CardDescription>{t('noData')}</CardDescription>
                </CardHeader>
                <CardContent className="flex-1 pb-0">
                    <div className="text-center text-muted-foreground">{t('noDataAvailable')}</div>
                </CardContent>
            </Card>
        )
    }
    // Przygotuj dane do wykresu radialnego
    const chartData = [
        { name: t('median'), value: median, fill: "var(--chart-2)" },
    ];

    return (
        <Card className="flex flex-col bg-background shadow-sm w-full">
            <CardHeader className="items-center pb-0">
                <CardTitle>{t('medianTitle')}</CardTitle>
                <CardDescription>{t('medianDescription')}</CardDescription>
            </CardHeader>
            <CardContent className="flex-1 pb-0">
                <ChartContainer
                    config={chartConfig}
                    className="mx-auto aspect-square max-h-[250px]"
                >
                    <RadialBarChart
                        key={median}
                        data={chartData}
                        width={300}
                        height={300}
                        cx="50%"
                        cy="50%"
                        innerRadius={80}
                        outerRadius={140}
                        barSize={25}
                        startAngle={90}
                        endAngle={median / 100 * 360 + 90}
                    >
                        <PolarGrid
                            gridType="circle"
                            radialLines={false}
                            stroke="none"
                            className="first:fill-muted last:fill-background"
                            polarRadius={[86, 74]}
                        />
                        <RadialBar dataKey="value" background />
                        <PolarRadiusAxis tick={false} tickLine={false} axisLine={false} angle={90} domain={[0, 100]}>
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
                                                    {median}
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
                                }}
                            />
                        </PolarRadiusAxis>
                    </RadialBarChart>
                </ChartContainer>
            </CardContent>
            <CardFooter className="flex-col gap-2 text-sm">
                <div className="text-muted-foreground leading-none">
                    {t('medianInfoText')}
                </div>
            </CardFooter>
        </Card>
    )
}
