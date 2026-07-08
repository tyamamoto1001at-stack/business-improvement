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
import { POLICY_LABEL } from "@/lib/policy";
import type { MemberAggregate, PolicyAggregate } from "@/lib/team-aggregate";

const BEFORE_COLOR = "#384876"; // navy-700
const AFTER_COLOR = "#a9803f"; // gold-600

export function PolicyBeforeAfterChart({ data }: { data: PolicyAggregate[] }) {
  const chartData = data.map((d) => ({
    name: POLICY_LABEL[d.policy],
    現状: d.currentHours,
    適用後: d.afterHours,
    count: d.count,
  }));

  return (
    <ResponsiveContainer width="100%" height={320}>
      <BarChart data={chartData} margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#ded7c2" />
        <XAxis dataKey="name" tick={{ fontSize: 12, fill: "#262420" }} />
        <YAxis
          tick={{ fontSize: 12, fill: "#262420" }}
          label={{ value: "月間工数(h)", angle: -90, position: "insideLeft", fontSize: 12 }}
        />
        <Tooltip
          formatter={(value) => `${value}h`}
          contentStyle={{
            background: "#fffdf7",
            border: "1px solid #ded7c2",
            borderRadius: 6,
            fontSize: 12,
          }}
        />
        <Legend wrapperStyle={{ fontSize: 12 }} />
        <Bar dataKey="現状" fill={BEFORE_COLOR} radius={[3, 3, 0, 0]} />
        <Bar dataKey="適用後" fill={AFTER_COLOR} radius={[3, 3, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}

export function MemberBeforeAfterChart({ data }: { data: MemberAggregate[] }) {
  const chartData = data.map((d) => ({
    name: d.userName,
    現状: d.currentHours,
    適用後: d.afterHours,
    count: d.count,
  }));

  const height = Math.max(320, chartData.length * 44);

  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart
        data={chartData}
        layout="vertical"
        margin={{ top: 8, right: 24, left: 8, bottom: 0 }}
      >
        <CartesianGrid strokeDasharray="3 3" stroke="#ded7c2" />
        <XAxis
          type="number"
          tick={{ fontSize: 12, fill: "#262420" }}
          label={{ value: "月間工数(h)", position: "insideBottom", offset: -2, fontSize: 12 }}
        />
        <YAxis
          type="category"
          dataKey="name"
          width={100}
          tick={{ fontSize: 12, fill: "#262420" }}
        />
        <Tooltip
          formatter={(value) => `${value}h`}
          contentStyle={{
            background: "#fffdf7",
            border: "1px solid #ded7c2",
            borderRadius: 6,
            fontSize: 12,
          }}
        />
        <Legend wrapperStyle={{ fontSize: 12 }} />
        <Bar dataKey="現状" fill={BEFORE_COLOR} radius={[0, 3, 3, 0]} />
        <Bar dataKey="適用後" fill={AFTER_COLOR} radius={[0, 3, 3, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
