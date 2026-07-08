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

const COLOR_BEFORE = "#1f2a44";
const COLOR_AFTER = "#b08d3f";

type PolicyDatum = { policy: string; label: string; current: number; planned: number };
type MemberDatum = { userId: string; name: string; current: number; planned: number };

export function TeamCharts({
  policyData,
  memberData,
}: {
  policyData: PolicyDatum[];
  memberData: MemberDatum[];
}) {
  return (
    <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
      <ChartCard title="方針別 Before / After">
        <ResponsiveContainer width="100%" height={320}>
          <BarChart data={policyData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#d8d0b8" />
            <XAxis dataKey="label" tick={{ fontSize: 12, fill: "#1f2a44" }} />
            <YAxis
              tick={{ fontSize: 12, fill: "#1f2a44" }}
              label={{ value: "月間工数(h)", angle: -90, position: "insideLeft", fontSize: 11, fill: "#1f2a44" }}
            />
            <Tooltip formatter={(value) => `${value}h`} />
            <Legend />
            <Bar dataKey="current" name="現状" fill={COLOR_BEFORE} radius={[3, 3, 0, 0]} />
            <Bar dataKey="planned" name="適用後" fill={COLOR_AFTER} radius={[3, 3, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>

      <ChartCard title="メンバー別 Before / After">
        {memberData.length === 0 ? (
          <EmptyState />
        ) : (
          <ResponsiveContainer width="100%" height={320}>
            <BarChart data={memberData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#d8d0b8" />
              <XAxis dataKey="name" tick={{ fontSize: 12, fill: "#1f2a44" }} />
              <YAxis
                tick={{ fontSize: 12, fill: "#1f2a44" }}
                label={{ value: "月間工数(h)", angle: -90, position: "insideLeft", fontSize: 11, fill: "#1f2a44" }}
              />
              <Tooltip formatter={(value) => `${value}h`} />
              <Legend />
              <Bar dataKey="current" name="現状" fill={COLOR_BEFORE} radius={[3, 3, 0, 0]} />
              <Bar dataKey="planned" name="適用後" fill={COLOR_AFTER} radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </ChartCard>
    </div>
  );
}

function ChartCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="ledger-card rounded-sm p-5">
      <h2 className="mb-4 font-serif text-base font-bold text-navy">{title}</h2>
      {children}
    </div>
  );
}

function EmptyState() {
  return (
    <div className="flex h-[320px] items-center justify-center text-sm text-navy/50">
      集計対象の業務データがありません。
    </div>
  );
}
