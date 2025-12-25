"use client"

import dynamic from "next/dynamic"

const ResponsiveContainer = dynamic(() => import("recharts").then(m => m.ResponsiveContainer), { ssr: false })
const BarChart = dynamic(() => import("recharts").then(m => m.BarChart), { ssr: false })
const Bar = dynamic(() => import("recharts").then(m => m.Bar), { ssr: false })
const CartesianGrid = dynamic(() => import("recharts").then(m => m.CartesianGrid), { ssr: false })
const XAxis = dynamic(() => import("recharts").then(m => m.XAxis), { ssr: false })
const YAxis = dynamic(() => import("recharts").then(m => m.YAxis), { ssr: false })
const Tooltip = dynamic(() => import("recharts").then(m => m.Tooltip), { ssr: false })

type Props = {
  data: Array<{ [k: string]: number | string }>
}

export function CommunityTrendsChart({ data }: Props) {
  return (
    <div className="h-64">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data}>
          <CartesianGrid vertical={false} />
          <XAxis dataKey="month" tickLine={false} axisLine={false} />
          <YAxis allowDecimals={false} />
          <Tooltip />
          <Bar dataKey="cholera" fill="#60a5fa" radius={4} />
          <Bar dataKey="typhoid" fill="#f59e0b" radius={4} />
          <Bar dataKey="hepatitis" fill="#34d399" radius={4} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
