"use client";

import { useState, useTransition } from "react";
import {
  FREQUENCY_LABEL,
  FREQUENCY_ORDER,
} from "@/lib/frequency";
import { POLICY_LABEL, POLICY_ORDER, suggestAfterHours } from "@/lib/policy";
import type { Frequency, Policy } from "@/generated/prisma/enums";

export type TaskFormValues = {
  id?: string;
  name: string;
  categoryId: string;
  frequency: Frequency;
  policy: Policy;
  currentHours: number;
  afterHours: number;
  note: string;
};

const EMPTY_VALUES: TaskFormValues = {
  name: "",
  categoryId: "",
  frequency: "MONTHLY",
  policy: "MAINTAIN",
  currentHours: 0,
  afterHours: 0,
  note: "",
};

export function TaskForm({
  categories,
  initialValues,
  submitLabel,
  onSubmit,
  onCancel,
}: {
  categories: { id: string; name: string }[];
  initialValues?: TaskFormValues;
  submitLabel: string;
  onSubmit: (formData: FormData) => Promise<void>;
  onCancel: () => void;
}) {
  const base = initialValues ?? EMPTY_VALUES;

  const [name, setName] = useState(base.name);
  const [categoryId, setCategoryId] = useState(
    base.categoryId || categories[0]?.id || "",
  );
  const [frequency, setFrequency] = useState<Frequency>(base.frequency);
  const [policy, setPolicy] = useState<Policy>(base.policy);
  const [currentHours, setCurrentHours] = useState(
    String(base.policy === "NEW" ? 0 : base.currentHours),
  );
  const [afterHours, setAfterHours] = useState(String(base.afterHours));
  const [afterHoursTouched, setAfterHoursTouched] = useState(true);
  const [note, setNote] = useState(base.note);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const isNew = policy === "NEW";
  const isAbolish = policy === "ABOLISH";

  function applyPolicy(nextPolicy: Policy) {
    setPolicy(nextPolicy);
    const baseCurrent = nextPolicy === "NEW" ? 0 : Number(currentHours) || 0;
    if (nextPolicy === "NEW") {
      setCurrentHours("0");
    }
    const suggestion = suggestAfterHours(nextPolicy, baseCurrent);
    if (suggestion !== null) {
      setAfterHours(String(suggestion));
    } else {
      setAfterHours("");
    }
    setAfterHoursTouched(false);
  }

  function handleCurrentHoursChange(value: string) {
    setCurrentHours(value);
    if (!afterHoursTouched && policy !== "ABOLISH") {
      const suggestion = suggestAfterHours(policy, Number(value) || 0);
      if (suggestion !== null) {
        setAfterHours(String(suggestion));
      }
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const formData = new FormData();
    formData.set("name", name);
    formData.set("categoryId", categoryId);
    formData.set("frequency", frequency);
    formData.set("policy", policy);
    formData.set("currentHours", isNew ? "0" : currentHours);
    formData.set("afterHours", isAbolish ? "0" : afterHours);
    formData.set("note", note);

    startTransition(async () => {
      try {
        await onSubmit(formData);
      } catch (err) {
        setError(err instanceof Error ? err.message : "保存に失敗しました");
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-navy-900">業務名</label>
        <input
          required
          maxLength={200}
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="rounded-md border border-paper-line bg-white px-3 py-2 text-sm focus:border-navy-700 focus:outline-none focus:ring-1 focus:ring-navy-700"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-navy-900">
            カテゴリ
          </label>
          <select
            required
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            className="rounded-md border border-paper-line bg-white px-3 py-2 text-sm focus:border-navy-700 focus:outline-none focus:ring-1 focus:ring-navy-700"
          >
            {categories.length === 0 && <option value="">未設定</option>}
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-navy-900">頻度</label>
          <select
            value={frequency}
            onChange={(e) => setFrequency(e.target.value as Frequency)}
            className="rounded-md border border-paper-line bg-white px-3 py-2 text-sm focus:border-navy-700 focus:outline-none focus:ring-1 focus:ring-navy-700"
          >
            {FREQUENCY_ORDER.map((f) => (
              <option key={f} value={f}>
                {FREQUENCY_LABEL[f]}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-navy-900">方針</label>
        <div className="flex flex-wrap gap-2">
          {POLICY_ORDER.map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => applyPolicy(p)}
              className={
                "rounded-full border px-3 py-1 text-sm transition-colors " +
                (policy === p
                  ? "border-navy-900 bg-navy-900 text-white"
                  : "border-paper-line bg-white text-navy-900 hover:border-navy-700")
              }
            >
              {POLICY_LABEL[p]}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-navy-900">
            現状の月間工数(h)
          </label>
          <input
            required
            type="number"
            min={0}
            max={1000}
            step={0.5}
            disabled={isNew}
            value={currentHours}
            onChange={(e) => handleCurrentHoursChange(e.target.value)}
            className="rounded-md border border-paper-line bg-white px-3 py-2 text-sm focus:border-navy-700 focus:outline-none focus:ring-1 focus:ring-navy-700 disabled:bg-navy-50 disabled:text-foreground/50"
          />
          {isNew && (
            <p className="text-xs text-foreground/50">
              新規業務のため現状工数は0h固定です
            </p>
          )}
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-navy-900">
            方針適用後の想定工数(h)
          </label>
          <input
            required
            type="number"
            min={0}
            max={1000}
            step={0.5}
            disabled={isAbolish}
            value={afterHours}
            onChange={(e) => {
              setAfterHours(e.target.value);
              setAfterHoursTouched(true);
            }}
            className="rounded-md border border-paper-line bg-white px-3 py-2 text-sm focus:border-navy-700 focus:outline-none focus:ring-1 focus:ring-navy-700 disabled:bg-navy-50 disabled:text-foreground/50"
          />
          {isAbolish && (
            <p className="text-xs text-foreground/50">
              廃止のため適用後工数は0h固定です
            </p>
          )}
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-navy-900">
          理由メモ
        </label>
        <textarea
          rows={3}
          maxLength={2000}
          value={note}
          onChange={(e) => setNote(e.target.value)}
          className="rounded-md border border-paper-line bg-white px-3 py-2 text-sm focus:border-navy-700 focus:outline-none focus:ring-1 focus:ring-navy-700"
        />
      </div>

      {error && (
        <p className="rounded-md border border-policy-abolish-border bg-policy-abolish-bg px-3 py-2 text-sm text-policy-abolish">
          {error}
        </p>
      )}

      <div className="mt-2 flex justify-end gap-2">
        <button
          type="button"
          onClick={onCancel}
          className="rounded-md border border-paper-line px-4 py-2 text-sm font-medium text-navy-900 hover:bg-navy-50"
        >
          キャンセル
        </button>
        <button
          type="submit"
          disabled={isPending}
          className="rounded-md bg-navy-900 px-4 py-2 text-sm font-semibold text-white hover:bg-navy-800 disabled:opacity-60"
        >
          {isPending ? "保存中..." : submitLabel}
        </button>
      </div>
    </form>
  );
}
