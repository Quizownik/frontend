import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/components/ui/card";
import {ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent} from "@/components/ui/chart";
import {Bar, BarChart, CartesianGrid, XAxis} from "recharts";
import * as React from "react";
import {DailySolvesChartData} from "@/app/[locale]/lib/types";
import { useTranslations } from "next-intl";

const chartConfig = {
    views: {
        label: "Page Views",
    },
    desktop: {
        label: "Desktop",
        color: "var(--chart-2)",
    },
} satisfies ChartConfig

export function DailySolvesCurrent({ chartData, total }: { chartData: DailySolvesChartData; total: number }) {
    const t = useTranslations('AdminPage.charts');

    return (
        <Card className="py-0 w-full">
            <CardHeader className="flex flex-col items-stretch border-b !p-0 sm:flex-row">
                <div className="flex flex-1 flex-col justify-center gap-1 px-6 pt-4 pb-3 sm:!py-0">
                    <CardTitle>{t('dailySolvesTitle')}</CardTitle>
                    <CardDescription>
                        {t('dailySolvesDescription')}
                    </CardDescription>
                </div>
                <div className="flex items-center px-6 pt-4 pb-3">
                    <span className="text-muted-foreground text-xs mr-2">{t('total')}:</span>
                    <span className="text-lg leading-none font-bold sm:text-3xl">{total}</span>
                </div>
            </CardHeader>
            <CardContent className="px-2 sm:p-6">
                <ChartContainer
                    className="aspect-auto h-[250px] w-full" config={chartConfig}>
                    <BarChart
                        data={chartData}
                        margin={{left: 12, right: 12}}
                    >
                        <CartesianGrid vertical={false}/>
                        <XAxis
                            dataKey="date"
                            tickLine={false}
                            axisLine={false}
                            tickMargin={8}
                            minTickGap={16}
                            tickFormatter={(value: string) => {
                                return value;
                            }}
                        />
                        <ChartTooltip
                            content={
                                <ChartTooltipContent
                                    className="w-[150px]"
                                    nameKey="count"
                                    labelFormatter={(value) => {
                                        return value;
                                    }}
                                />
                            }
                        />
                        <Bar dataKey="count" fill="var(--chart-1)"/>
                    </BarChart>
                </ChartContainer>
            </CardContent>
        </Card>
    );
}

