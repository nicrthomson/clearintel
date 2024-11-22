"use client"

import { TrendingUp } from "lucide-react"
import { Cell, Pie, PieChart, Tooltip } from "recharts"
import { useAnalytics } from "@/app/hooks/useAnalytics"

type CaseStatus = 'open' | 'closed' | 'pending'

const STATUS_COLORS: Record<CaseStatus, string> = {
  open: "#22c55e",     // green
  closed: "#ef4444",   // red
  pending: "#f59e0b",  // amber
} as const

export function CaseStatusChart() {
  const { data, loading } = useAnalytics()

  if (loading || !data) {
    return <div>Loading analytics...</div>
  }

  const chartData = data.caseStats.map(stat => ({
    name: stat.status.charAt(0).toUpperCase() + stat.status.slice(1),
    value: stat._count,
    status: stat.status.toLowerCase() as CaseStatus
  }))

  const totalCases = chartData.reduce((sum, item) => sum + item.value, 0)

  return (
    <div className="space-y-4">
      <PieChart width={300} height={250} className="mx-auto">
        <Pie
          data={chartData}
          dataKey="value"
          nameKey="name"
          cx="50%"
          cy="50%"
          innerRadius={60}
          outerRadius={80}
          paddingAngle={5}
        >
          {chartData.map((entry, index) => (
            <Cell 
              key={`cell-${index}`}
              fill={STATUS_COLORS[entry.status]}
            />
          ))}
        </Pie>
        <Tooltip />
      </PieChart>

      <div className="flex-col gap-2">
        <div className="flex items-center gap-2 font-medium justify-center">
          {totalCases} Total Cases
          <TrendingUp className="h-4 w-4" />
        </div>
        <div className="flex gap-4 text-sm justify-center mt-2">
          {(Object.entries(STATUS_COLORS) as [CaseStatus, string][]).map(([status, color]) => (
            <div key={status} className="flex items-center gap-2">
              <div 
                className="h-3 w-3 rounded-full" 
                style={{ backgroundColor: color }}
              />
              <span className="capitalize">{status}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}