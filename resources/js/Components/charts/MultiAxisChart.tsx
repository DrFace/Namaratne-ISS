import React from 'react';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
} from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend
);

export const options = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
        mode: 'index' as const,
        intersect: false,
    },
    stacked: false,
    plugins: {
        title: {
            display: true,
            text: 'Last 7 days jobs, proposals and offers',
        },
    },
    scales: {
        y: {
            type: 'linear' as const,
            display: true,
            position: 'left' as const,
        },
        // y1: {
        //   type: 'linear' as const,
        //   display: true,
        //   position: 'right' as const,
        //   grid: {
        //     drawOnChartArea: false,
        //   },
        // },
    },

};


export function MultiAxisChart({
    multiAxisData,
}: {
    multiAxisData: any;
}) {

    const labels = multiAxisData?.labels || [];


    const data = {
        labels,
        datasets: [
            {
                label: 'Jobs',
                data: multiAxisData?.jobs || [],
                borderColor: 'rgb(255, 99, 132)',
                backgroundColor: 'rgb(255, 99, 132)',
                yAxisID: 'y',
            },
            {
                label: 'Proposals',
                data: multiAxisData?.proposals || [],
                borderColor: 'rgb(53, 162, 235)',
                backgroundColor: 'rgb(53, 162, 235)',
                yAxisID: 'y',
            },
            {
                label: 'Offers',
                data: multiAxisData?.offers || [],
                borderColor: 'rgb(40, 480, 22)',
                backgroundColor: 'rgb(40, 480, 22)',
                yAxisID: 'y',
            },
        ],
    };


    return (
        <div className="col-span-12 shadow-default xl:col-span-4">
            <div className="relative">
                <div id="chartTwo" className="min-h-[200px] max-h-[400px]">
                    <Line options={options} data={data}  height={400} />;
                </div>
            </div>
        </div>
    );
}
