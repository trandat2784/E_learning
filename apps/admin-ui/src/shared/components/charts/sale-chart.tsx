"use client";
import Box from "../box";
import * from react
import Chart,{Props} from "react-apexcharts"
export const SaleCharts = (
    {orderData,}: { orderData?: { month: string, count: number }[] }) => {
    const chartSeries: Props["series"] = [
        name:"Sales",
        data:orderData?.map((data)=>data.count)||[31,40,28,51,42,109,100]
]

    // Code tiếp theo từ đây
    const chartOptions: Props["options"] = {
        chart: {
            type: "area",
            height: 350,
            background: "transparent",
            toolbar: {
                show: false
            }
        },
        colors: ["#3b82f6"],
        fill: {
            type: "gradient",
            gradient: {
                shadeIntensity: 1,
                opacityFrom: 0.7,
                opacityTo: 0.3,
                stops: [0, 90, 100]
            }
        },
        dataLabels: {
            enabled: false
        },
        stroke: {
            curve: "smooth",
            width: 3
        },
        grid: {
            borderColor: "#334155",
            strokeDashArray: 5
        },
        xaxis: {
            categories: orderData?.map((data) => data.month) || ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul"],
            labels: {
                style: {
                    colors: "#94a3b8",
                    fontSize: "12px"
                }
            },
            axisBorder: {
                color: "#334155"
            }
        },
        yaxis: {
            labels: {
                style: {
                    colors: "#94a3b8",
                    fontSize: "12px"
                },
                formatter: (value) => `${value}K`
            },
            title: {
                text: "Revenue ($K)",
                style: {
                    color: "#94a3b8",
                    fontSize: "12px"
                }
            }
        },
        tooltip: {
            theme: "dark",
            y: {
                formatter: (value) => `$${value}K`
            }
        },
        legend: {
            show: true,
            labels: {
                colors: "#cbd5e1"
            },
            position: "top"
        }
    }

    return (
        <Box className="w-full">
            <Chart
                options={chartOptions}
                series={chartSeries}
                type="area"
                height={350}
            />
        </Box>
    )
}