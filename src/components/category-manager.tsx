"use client";

import { useState, useTransition } from "react";
import { Modal } from "@/components/modal";
import { createCategory, deleteCategory } from "@/lib/actions/categories";

export type CategoryItem = {
  id: string;
  name: string;
  taskCount: number;
};

export function CategoryManager({
  categories,
}: {
  categories: CategoryItem[];
}) {
  const [name, setName] = useState("");
  const [addError, setAddError] = useState<string | null>(null);
  const [isAdding, startAddTransition] = useTransition();

  const [deleteTarget, setDeleteTarget] = useState<CategoryItem | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [isDeleting, startDeleteTransition] = useTransition();

  function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    setAddError(null);

    const formData = new FormData();
    formData.set("name", name);

    startAddTransition(async () => {
      try {
        await createCategory(formData);
        setName("");
      } catch (err) {
        setAddError(err instanceof Error ? err.message : "追加に失敗しました");
      }
    });
  }

  function handleDelete() {
    if (!deleteTarget) return;
    setDeleteError(null);

    startDeleteTransition(async () => {
      try {
        await deleteCategory(deleteTarget.id);
        setDeleteTarget(null);
      } catch (err) {
        setDeleteError(
          err instanceof Error ? err.message : "削除に失敗しました",
        );
      }
    });
  }

  return (
    <section className="ledger-card rounded-lg p-4 sm:p-6">
      <h2 className="font-ledger text-lg font-bold text-navy-900">
        カテゴリ管理
      </h2>
      <p className="mt-1 text-xs text-foreground/50">
        一般ユーザーが業務登録時に選択するカテゴリのマスタです。
      </p>

      <form onSubmit={handleAdd} className="mt-4 flex gap-2">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="新しいカテゴリ名"
          maxLength={50}
          required
          className="flex-1 rounded-md border border-paper-line bg-white px-3 py-2 text-sm focus:border-navy-700 focus:outline-none focus:ring-1 focus:ring-navy-700"
        />
        <button
          type="submit"
          disabled={isAdding}
          className="rounded-md bg-navy-900 px-4 py-2 text-sm font-semibold text-white hover:bg-navy-800 disabled:opacity-60"
        >
          {isAdding ? "追加中..." : "追加"}
        </button>
      </form>
      {addError && (
        <p className="mt-2 rounded-md border border-policy-abolish-border bg-policy-abolish-bg px-3 py-2 text-sm text-policy-abolish">
          {addError}
        </p>
      )}

      <ul className="mt-4 divide-y divide-paper-line">
        {categories.length === 0 && (
          <li className="py-4 text-sm text-foreground/50">
            カテゴリが登録されていません。
          </li>
        )}
        {categories.map((c) => (
          <li key={c.id} className="flex items-center justify-between py-2.5">
            <div>
              <p className="text-sm font-medium text-navy-900">{c.name}</p>
              <p className="text-xs text-foreground/50">
                使用中の業務: {c.taskCount}件
              </p>
            </div>
            <button
              onClick={() => {
                setDeleteError(null);
                setDeleteTarget(c);
              }}
              className="rounded-md border border-policy-abolish-border px-2.5 py-1 text-xs font-medium text-policy-abolish hover:bg-policy-abolish-bg"
            >
              削除
            </button>
          </li>
        ))}
      </ul>

      {deleteTarget && (
        <Modal title="カテゴリの削除" onClose={() => setDeleteTarget(null)}>
          <p className="text-sm text-foreground/80">
            「{deleteTarget.name}」を削除します。この操作は取り消せません。
          </p>
          {deleteError && (
            <p className="mt-3 rounded-md border border-policy-abolish-border bg-policy-abolish-bg px-3 py-2 text-sm text-policy-abolish">
              {deleteError}
            </p>
          )}
          <div className="mt-6 flex justify-end gap-2">
            <button
              onClick={() => setDeleteTarget(null)}
              className="rounded-md border border-paper-line px-4 py-2 text-sm font-medium text-navy-900 hover:bg-navy-50"
            >
              キャンセル
            </button>
            <button
              onClick={handleDelete}
              disabled={isDeleting}
              className="rounded-md bg-policy-abolish px-4 py-2 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-60"
            >
              {isDeleting ? "削除中..." : "削除する"}
            </button>
          </div>
        </Modal>
      )}
    </section>
  );
}
