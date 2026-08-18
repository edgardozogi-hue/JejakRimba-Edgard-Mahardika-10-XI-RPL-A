"use client";

import {
  ResponsiveContainer,
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";

export default function RevenueChart({
  data,
}: {
  data: { label: string; value: number }[];
}) {
  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(120,120,120,0.15)" vertical={false} />
          <XAxis
            dataKey="label"
            tick={{ fontSize: 11, fill: "#8a8a8a" }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tick={{ fontSize: 11, fill: "#8a8a8a" }}
            axisLine={false}
            tickLine={false}
            width={48}
            tickFormatter={(v: number) =>
              v >= 1000000 ? `${(v / 1000000).toFixed(1)}jt` : `${(v / 1000).toFixed(0)}rb`
            }
          />
          <Tooltip
            cursor={{ fill: "rgba(196,98,45,0.08)" }}
            contentStyle={{
              background: "#1c1917",
              border: "1px solid rgba(120,120,120,0.2)",
              borderRadius: 12,
              fontSize: 12,
              color: "#f5f5f4",
            }}
            formatter={(value) => [`Rp ${Number(value ?? 0).toLocaleString("id-ID")}`, ""]}
          />
          <Bar dataKey="value" fill="#c4622d" radius={[6, 6, 0, 0]} maxBarSize={40} />
          <Line
            type="monotone"
            dataKey="value"
            stroke="#7a9c8e"
            strokeWidth={2}
            dot={{ r: 3, fill: "#7a9c8e" }}
            activeDot={{ r: 4 }}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}