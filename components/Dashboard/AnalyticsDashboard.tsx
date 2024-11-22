"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronUp } from "lucide-react";
import { Bar, Pie } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
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
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

interface ChartCardProps {
  title: string;
  children: React.ReactNode;
}

function ChartCard({ title, children }: ChartCardProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <Card className="p-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold">{title}</h3>
        <Button 
          variant="ghost" 
          size="sm"
          onClick={() => setIsCollapsed(!isCollapsed)}
        >
          {isCollapsed ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />}
        </Button>
      </div>
      {!isCollapsed && children}
    </Card>
  );
}

export function AnalyticsDashboard() {
  const { data, loading } = useAnalytics();

  if (loading || !data) {
    return <div>Loading analytics...</div>;
  }

  return (
    <div className="grid grid-cols-2 gap-6">
      <ChartCard title="Case Status Distribution">
        <Pie data={{
          labels: data.caseStats.map(stat => stat.status),
          datasets: [{
            data: data.caseStats.map(stat => stat._count),
            backgroundColor: [
              'rgba(54, 162, 235, 0.5)',
              'rgba(75, 192, 192, 0.5)',
              'rgba(255, 99, 132, 0.5)',
            ],
          }]
        }} />
      </ChartCard>

      <ChartCard title="Evidence by Type">
        <Bar
          data={{
            labels: data.evidenceTypeStats.map(stat => stat.typeName),
            datasets: [{
              label: 'Number of Items',
              data: data.evidenceTypeStats.map(stat => stat._count),
              backgroundColor: 'rgba(54, 162, 235, 0.5)',
            }]
          }}
        />
      </ChartCard>

      {/* <ChartCard title="Storage Usage">
        <Bar
          data={{
            labels: data.evidenceTypeStats.map(stat => stat.typeName),
            datasets: [{
              label: 'Storage Used (GB)',
              data: data.evidenceTypeStats.map(stat => 
                Number(stat._sum.size || 0) / (1024 * 1024 * 1024)
              ),
              backgroundColor: 'rgba(75, 192, 192, 0.5)',
            }]
          }}
        />
      </ChartCard>

      <ChartCard title="Recent Activities">
        <div className="space-y-2">
          {data.activityStats.map((stat, index) => (
            <div key={index} className="flex justify-between items-center">
              <span className="text-sm">{stat.description}</span>
              <span className="text-sm text-muted-foreground">{stat._count}</span>
            </div>
          ))}
        </div>
      </ChartCard> */}
    </div>
  );
} 