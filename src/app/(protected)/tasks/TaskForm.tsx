"use client";

import Link from "next/link";
import { useActionState, useState } from "react";

import { Button } from "@/components/ui/Button";
import { FieldError, Input, Label, Select, Textarea } from "@/components/ui/Field";
import { Frequency, Policy } from "@/generated/prisma/client";
import {
  FREQUENCY_LABELS,
  FREQUENCY_ORDER,
  POLICY_LABELS,
  POLICY_ORDER,
  currentHoursConstraint,
  suggestAfterHours,
} from "@/lib/constants";

import type { TaskFormState } from "./actions";

type CategoryOption = { id: string; name: string };

type TaskDefaults = {
  name: string;
  categoryId: string;
  frequency: Frequency;
  currentHours: number;
  policy: Policy;
  afterHours: number;
  memo: string;
};

const emptyDefaults: TaskDefaults = {
  name: "",
  categoryId: "",
  frequency: "MONTHLY",
  currentHours: 0,
  policy: "MAINTAIN",
  afterHours: 0,
  memo: "",
};

export function TaskForm({
  categories,
  defaults,
  action,
  submitLabel,
}: {
  categories: CategoryOption[];
  defaults?: Partial<TaskDefaults>;
  action: (prevState: TaskFormState, formData: FormData) => Promise<TaskFormState>;
  submitLabel: string;
}) {
  const initial = { ...emptyDefaults, ...defaults };
  const [state, formAction, isPending] = useActionState<TaskFormState, FormData>(action, {});

  const [policy, setPolicy] = useState<Policy>(initial.policy);
  const [currentHours, setCurrentHours] = useState<number>(initial.currentHours);
  const [afterHours, setAfterHours] = useState<number>(initial.afterHours);

  const currentConstraint = currentHoursConstraint(policy);
  const currentLocked = currentConstraint.locked;
  const afterLocked = policy === "ABOLISH";

  function handlePolicyChange(nextPolicy: Policy) {
    setPolicy(nextPolicy);
    const constraint = currentHoursConstraint(nextPolicy);
    const effectiveCurrent = constraint.locked ? constraint.value! : currentHours;
    if (constraint.locked) setCurrentHours(constraint.value!);
    const suggestion = suggestAfterHours(nextPolicy, effectiveCurrent);
    setAfterHours(suggestion.value);
  }

  return (
    <form action={formAction} className="space-y-5">
      <div>
        <Label htmlFor="name">業務名</Label>
        <Input id="name" name="name" type="text" defaultValue={initial.name} required />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="categoryId">カテゴリ</Label>
          <Select id="categoryId" name="categoryId" defaultValue={initial.categoryId} required>
            <option value="" disabled>
              選択してください
            </option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </Select>
          {categories.length === 0 && (
            <p className="mt-1 text-xs text-seal">
              カテゴリが未登録です。管理者にカテゴリ登録を依頼してください。
            </p>
          )}
        </div>
        <div>
          <Label htmlFor="frequency">頻度</Label>
          <Select id="frequency" name="frequency" defaultValue={initial.frequency} required>
            {FREQUENCY_ORDER.map((freq) => (
              <option key={freq} value={freq}>
                {FREQUENCY_LABELS[freq]}
              </option>
            ))}
          </Select>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="currentHours">現状の月間工数(h/月)</Label>
          <Input
            id="currentHours"
            name="currentHours"
            type="number"
            step="0.5"
            min="0"
            value={currentHours}
            readOnly={currentLocked}
            onChange={(e) => setCurrentHours(Number(e.target.value))}
            required
          />
          {currentLocked && (
            <p className="mt-1 text-xs text-navy-400">「新規」は現状工数が0hで固定されます。</p>
          )}
        </div>
        <div>
          <Label htmlFor="policy">方針</Label>
          <Select
            id="policy"
            name="policy"
            value={policy}
            onChange={(e) => handlePolicyChange(e.target.value as Policy)}
            required
          >
            {POLICY_ORDER.map((p) => (
              <option key={p} value={p}>
                {POLICY_LABELS[p]}
              </option>
            ))}
          </Select>
        </div>
      </div>

      <div>
        <Label htmlFor="afterHours">方針適用後の想定月間工数(h/月)</Label>
        <Input
          id="afterHours"
          name="afterHours"
          type="number"
          step="0.5"
          min="0"
          value={afterHours}
          readOnly={afterLocked}
          onChange={(e) => setAfterHours(Number(e.target.value))}
          required
          className="max-w-xs"
        />
        <p className="mt-1 text-xs text-navy-400">
          方針選択時に自動提案されます(新規は手入力、廃止は0h固定)。数値は自由に調整できます。
        </p>
      </div>

      <div>
        <Label htmlFor="memo">理由メモ</Label>
        <Textarea id="memo" name="memo" rows={3} defaultValue={initial.memo} />
      </div>

      <FieldError>{state.error}</FieldError>

      <div className="flex items-center gap-3">
        <Button type="submit" disabled={isPending}>
          {isPending ? "保存中…" : submitLabel}
        </Button>
        <Link href="/tasks" className="text-sm text-navy-500 underline underline-offset-2">
          キャンセル
        </Link>
      </div>
    </form>
  );
}
