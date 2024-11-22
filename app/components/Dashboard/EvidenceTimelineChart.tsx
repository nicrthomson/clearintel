"use client";

import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import { useAnalytics } from "@/app/hooks/useAnalytics";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

export function EvidenceTimelineChart() {
  const { data, loading } = useAnalytics();

  if (loading || !data) {
    return <div>Loading analytics...</div>;
  }

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom' as const,
      },
      title: {
        display: true,
        text: 'Evidence Added Over Time'
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          stepSize: 1
        }
      }
    }
  };

  const chartData = {
    labels: data.evidenceTimeline.map(item => item.date),
    datasets: [
      {
        label: 'Evidence Items',
        data: data.evidenceTimeline.map(item => item.count),
        borderColor: 'rgb(75, 192, 192)',
        backgroundColor: 'rgba(75, 192, 192, 0.5)',
        tension: 0.3
      }
    ]
  };

  return (
    <div style={{ height: '300px' }}>
      <Line options={options} data={chartData} />
    </div>
  );
} 