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
    if (!median || median === 0) {
        return (
            <Card className="flex flex-col bg-background shadow-sm">
                <CardHeader className="items-center pb-0">
                    <CardTitle>Mediana wyników</CardTitle>
                    <CardDescription>Brak danych</CardDescription>
                </CardHeader>
                <CardContent className="flex-1 pb-0">
                    <div className="text-center text-muted-foreground">Brak dostępnych danych do wyświetlenia.</div>
                </CardContent>
            </Card>
        )
    }
    // Przygotuj dane do wykresu radialnego
    const chartData = [
        { name: "Mediana", value: median, fill: "var(--chart-2)" },
    ];

    return (
        <Card className="flex flex-col bg-background shadow-sm">
            <CardHeader className="items-center pb-0">
                <CardTitle>Mediana wyników</CardTitle>
                <CardDescription>Mediana wszystkich wyników quizu</CardDescription>
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
                    Pokazuje medianę wyników ze wszystkich rozwiązań
                </div>
            </CardFooter>
        </Card>
    )
}
