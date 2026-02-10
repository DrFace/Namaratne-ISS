import React from 'react';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

export default function BarChart({
    barChartData
}:{
    barChartData: any;
}){
    const labels = barChartData?.labels;


    const state = {
        labels:  labels,
        datasets: [
            {
                label: 'Credit Earning',
                backgroundColor: '#4c51bf',
                borderColor: '#4c51bf',
                borderWidth: 1,
                data:barChartData?.creditEarning,
            },
            {
                label: 'Commission Earning',
                backgroundColor: '#797a7b',
                borderColor: '#797a7b',
                borderWidth: 1,
                data: barChartData?.commissionEarning,
            }
        ]
    };

    return (
        <div className="col-span-12 shadow-default xl:col-span-4">
           <div className="relative">
                <div id="chartTwo" className="min-h-[200px] max-h-[400px]">
                    <Bar
                        data={state}
                        options={{
                            responsive: true,
                            maintainAspectRatio: false,
                            plugins: {
                                legend: {
                                    position: 'top',
                                },
                                title: {
                                    display: true,
                                    text: 'Earnings last 7 days',
                                },
                            },
                            // scales: {
                            //     x: {
                            //         ticks: {
                            //             maxRotation: 90,
                            //             minRotation: 0
                            //         }
                            //     },
                            //     y: {
                            //         ticks: {
                            //             beginAtZero: true
                            //         }
                            //     }
                            // }
                        }}
                        height={800}
                    />
                </div>
            </div>
        </div>
    );
}
