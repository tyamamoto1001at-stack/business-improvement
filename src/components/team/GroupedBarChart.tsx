"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

export type GroupedBarDatum = {
  label: string;
  現状: number;
  適用後: number;
};

export function GroupedBarChart({ data, height = 320 }: { data: GroupedBarDatum[]; height?: number }) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={data} margin={{ top: 8, right: 16, left: 0, bottom: 8 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e4dcc4" vertical={false} />
        <XAxis
          dataKey="label"
          tick={{ fontSize: 12, fill: "#3d5075" }}
          angle={-20}
          textAnchor="end"
          height={56}
          interval={0}
        />
        <YAxis
          tick={{ fontSize: 12, fill: "#3d5075" }}
          label={{ value: "h / 月", angle: -90, position: "insideLeft", fontSize: 12, fill: "#3d5075" }}
        />
        <Tooltip
          contentStyle={{
            borderColor: "#c2cee3",
            borderRadius: 8,
            fontSize: 13,
          }}
          formatter={(value) => `${value}h`}
        />
        <Legend wrapperStyle={{ fontSize: 12 }} />
        <Bar dataKey="現状" fill="#2c3b5c" radius={[3, 3, 0, 0]} maxBarSize={36} />
        <Bar dataKey="適用後" fill="#b8863b" radius={[3, 3, 0, 0]} maxBarSize={36} />
      </BarChart>
    </ResponsiveContainer>
  );
}
