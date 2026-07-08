import type { Policy } from "@/generated/prisma/enums";
import { POLICY_ORDER } from "@/lib/policy";

export type TaskForAggregate = {
  policy: Policy;
  currentHours: number;
  afterHours: number;
  userId: string;
  userName: string;
};

export type PolicyAggregate = {
  policy: Policy;
  currentHours: number;
  afterHours: number;
  count: number;
};

export type MemberAggregate = {
  userId: string;
  userName: string;
  currentHours: number;
  afterHours: number;
  count: number;
};

export function aggregateByPolicy(
  tasks: TaskForAggregate[],
): PolicyAggregate[] {
  return POLICY_ORDER.map((policy) => {
    const filtered = tasks.filter((t) => t.policy === policy);
    return {
      policy,
      currentHours: sum(filtered.map((t) => t.currentHours)),
      afterHours: sum(filtered.map((t) => t.afterHours)),
      count: filtered.length,
    };
  });
}

export function aggregateByMember(
  tasks: TaskForAggregate[],
): MemberAggregate[] {
  const map = new Map<string, MemberAggregate>();

  for (const t of tasks) {
    const entry = map.get(t.userId) ?? {
      userId: t.userId,
      userName: t.userName,
      currentHours: 0,
      afterHours: 0,
      count: 0,
    };
    entry.currentHours += t.currentHours;
    entry.afterHours += t.afterHours;
    entry.count += 1;
    map.set(t.userId, entry);
  }

  return Array.from(map.values()).sort(
    (a, b) => b.currentHours - a.currentHours,
  );
}

function sum(values: number[]): number {
  return Math.round(values.reduce((a, b) => a + b, 0) * 10) / 10;
}
