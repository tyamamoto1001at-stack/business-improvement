"use client";

import { useActionState, useState, useTransition } from "react";
import { createCategoryAction, deleteCategoryAction } from "./actions";

type Category = { id: string; name: string; taskCount: number };

export function CategoryManager({ categories }: { categories: Category[] }) {
  const [state, formAction, pending] = useActionState(createCategoryAction, undefined);
  const [deletePending, startDeleteTransition] = useTransition();
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [formKey, setFormKey] = useState(0);

  // 追加が成功した直後のレンダー中にフォームをリセットする
  const [prevState, setPrevState] = useState(state);
  if (prevState !== state) {
    setPrevState(state);
    if (state?.ok) {
      setFormKey((k) => k + 1);
    }
  }

  return (
    <div className="ledger-card rounded-sm p-5">
      <h2 className="mb-4 font-serif text-base font-bold text-navy">カテゴリ管理</h2>

      <form key={formKey} action={formAction} className="mb-5 flex items-start gap-2">
        <div className="flex-1">
          <input
            name="name"
            placeholder="新しいカテゴリ名"
            maxLength={100}
            required
            className="ledger-input"
          />
          {state && !state.ok && (
            <p className="mt-1 text-xs text-rose-700">{state.error}</p>
          )}
        </div>
        <button
          type="submit"
          disabled={pending}
          className="rounded-sm bg-navy px-4 py-2 text-sm font-semibold text-white hover:bg-navy-light disabled:opacity-60"
        >
          追加
        </button>
      </form>

      {deleteError && (
        <p className="mb-3 rounded-sm border border-rose-300 bg-rose-50 px-3 py-2 text-sm text-rose-800">
          {deleteError}
        </p>
      )}

      <ul className="divide-y divide-line/70">
        {categories.length === 0 && (
          <li className="py-3 text-sm text-navy/50">カテゴリが登録されていません。</li>
        )}
        {categories.map((c) => (
          <li key={c.id} className="flex items-center justify-between py-2.5 text-sm">
            <div>
              <span className="font-medium text-navy">{c.name}</span>
              <span className="ml-2 text-xs text-navy/50">{c.taskCount}件で使用中</span>
            </div>
            <button
              type="button"
              disabled={deletePending}
              onClick={() => {
                if (!confirm(`カテゴリ「${c.name}」を削除しますか？`)) return;
                setDeleteError(null);
                startDeleteTransition(async () => {
                  const result = await deleteCategoryAction(c.id);
                  if (result && !result.ok) {
                    setDeleteError(result.error);
                  }
                });
              }}
              className="rounded-sm border border-rose-300 px-2.5 py-1 text-xs font-medium text-rose-700 hover:bg-rose-50 disabled:opacity-60"
            >
              削除
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
