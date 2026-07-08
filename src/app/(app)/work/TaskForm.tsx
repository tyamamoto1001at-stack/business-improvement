"use client";

import { useActionState, useEffect, useMemo, useState } from "react";
import { Frequency, Policy } from "@/generated/prisma/enums";
import {
  FREQUENCY_LABELS,
  FREQUENCY_ORDER,
  POLICY_LABELS,
  POLICY_ORDER,
  suggestPlannedHours,
} from "@/lib/ledger";
import { createTaskAction, updateTaskAction, type TaskFormState } from "./actions";

type Category = { id: string; name: string };

export type TaskFormValues = {
  id: string;
  name: string;
  categoryId: string;
  frequency: Frequency;
  currentHours: number;
  policy: Policy;
  plannedHours: number;
  note: string | null;
};

export function TaskForm({
  categories,
  task,
  onClose,
}: {
  categories: Category[];
  task?: TaskFormValues;
  onClose: () => void;
}) {
  const isEdit = !!task;
  const boundAction = useMemo(
    () => (isEdit ? updateTaskAction.bind(null, task!.id) : createTaskAction),
    [isEdit, task]
  );
  const [state, formAction, pending] = useActionState<TaskFormState, FormData>(
    boundAction,
    undefined
  );

  const [currentHours, setCurrentHours] = useState(task?.currentHours ?? 0);
  const [policy, setPolicy] = useState<Policy>(task?.policy ?? Policy.MAINTAIN);
  const [plannedHours, setPlannedHours] = useState(task?.plannedHours ?? 0);

  const suggestion = suggestPlannedHours(policy, currentHours);

  // 方針が変わった直後のレンダー中に、想定工数の提案を再適用する
  // (useEffectではなくレンダー中の調整にすることで余計な再レンダーを避ける)
  const [prevPolicy, setPrevPolicy] = useState(policy);
  if (prevPolicy !== policy) {
    setPrevPolicy(policy);
    const next = suggestPlannedHours(policy, currentHours);
    if (next.value !== null && next.value !== plannedHours) {
      setPlannedHours(next.value);
    }
  }

  useEffect(() => {
    if (state?.ok) {
      onClose();
    }
  }, [state, onClose]);

  const currentHoursLocked = suggestion.lockCurrentHoursAtZero;
  const plannedHoursLocked = suggestion.lockPlannedHoursAtZero;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-navy-dark/50 px-4 py-8">
      <div className="ledger-card max-h-full w-full max-w-lg overflow-y-auto rounded-sm p-6">
        <div className="mb-5 flex items-center justify-between">
          <h2 className="font-serif text-lg font-bold text-navy">
            {isEdit ? "業務を編集" : "業務を追加"}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="text-sm text-navy/50 hover:text-navy"
          >
            閉じる ✕
          </button>
        </div>

        <form action={formAction} className="flex flex-col gap-4">
          <Field label="業務名" error={state && !state.ok ? state.fieldErrors?.name : undefined}>
            <input
              name="name"
              defaultValue={task?.name}
              required
              maxLength={200}
              className="ledger-input"
              placeholder="例: 月次経費精算の取りまとめ"
            />
          </Field>

          <Field
            label="カテゴリ"
            error={state && !state.ok ? state.fieldErrors?.categoryId : undefined}
          >
            <select
              name="categoryId"
              defaultValue={task?.categoryId ?? ""}
              required
              className="ledger-input"
            >
              <option value="" disabled>
                選択してください
              </option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </Field>

          <Field label="頻度" error={state && !state.ok ? state.fieldErrors?.frequency : undefined}>
            <select
              name="frequency"
              defaultValue={task?.frequency ?? Frequency.MONTHLY}
              required
              className="ledger-input"
            >
              {FREQUENCY_ORDER.map((f) => (
                <option key={f} value={f}>
                  {FREQUENCY_LABELS[f]}
                </option>
              ))}
            </select>
          </Field>

          <div className="grid grid-cols-2 gap-4">
            <Field
              label="現状の月間工数 (h)"
              error={state && !state.ok ? state.fieldErrors?.currentHours : undefined}
            >
              <input
                name="currentHours"
                type="number"
                min={0}
                max={1000}
                step={0.5}
                required
                disabled={currentHoursLocked}
                value={currentHoursLocked ? 0 : currentHours}
                onChange={(e) => setCurrentHours(Number(e.target.value))}
                className="ledger-input disabled:bg-line/40 disabled:text-navy/50"
              />
            </Field>

            <Field label="方針" error={state && !state.ok ? state.fieldErrors?.policy : undefined}>
              <select
                name="policy"
                value={policy}
                onChange={(e) => setPolicy(e.target.value as Policy)}
                required
                className="ledger-input"
              >
                {POLICY_ORDER.map((p) => (
                  <option key={p} value={p}>
                    {POLICY_LABELS[p]}
                  </option>
                ))}
              </select>
            </Field>
          </div>

          <Field
            label="方針適用後の想定工数 (h)"
            hint={
              plannedHoursLocked
                ? "廃止のため0h固定です"
                : suggestion.value !== null
                  ? `自動提案値: ${suggestion.value}h (手動で調整できます)`
                  : "手入力してください"
            }
            error={state && !state.ok ? state.fieldErrors?.plannedHours : undefined}
          >
            <input
              name="plannedHours"
              type="number"
              min={0}
              max={1000}
              step={0.5}
              required
              disabled={plannedHoursLocked}
              value={plannedHoursLocked ? 0 : plannedHours}
              onChange={(e) => setPlannedHours(Number(e.target.value))}
              className="ledger-input disabled:bg-line/40 disabled:text-navy/50"
            />
          </Field>

          <Field label="理由メモ" error={state && !state.ok ? state.fieldErrors?.note : undefined}>
            <textarea
              name="note"
              defaultValue={task?.note ?? ""}
              rows={3}
              maxLength={1000}
              className="ledger-input resize-none"
              placeholder="方針を選んだ理由や背景など"
            />
          </Field>

          {state && !state.ok && (
            <p className="rounded-sm border border-rose-300 bg-rose-50 px-3 py-2 text-sm text-rose-800">
              {state.error}
            </p>
          )}

          <div className="mt-2 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-sm border border-line px-4 py-2 text-sm font-medium text-navy hover:bg-line/30"
            >
              キャンセル
            </button>
            <button
              type="submit"
              disabled={pending}
              className="rounded-sm bg-navy px-4 py-2 text-sm font-semibold text-white hover:bg-navy-light disabled:opacity-60"
            >
              {pending ? "保存中..." : "保存"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function Field({
  label,
  hint,
  error,
  children,
}: {
  label: string;
  hint?: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="flex flex-col gap-1.5 text-sm">
      <span className="font-medium text-navy">{label}</span>
      {children}
      {hint && !error && <span className="text-xs text-navy/50">{hint}</span>}
      {error && <span className="text-xs text-rose-700">{error}</span>}
    </label>
  );
}
