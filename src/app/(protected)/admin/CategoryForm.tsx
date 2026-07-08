"use client";

import { useActionState } from "react";

import { Button } from "@/components/ui/Button";
import { FieldError, Input } from "@/components/ui/Field";

import { createCategoryAction, type CategoryFormState } from "./actions";

const initialState: CategoryFormState = {};

export function CategoryForm() {
  const [state, formAction, isPending] = useActionState(createCategoryAction, initialState);

  return (
    <form action={formAction} className="flex items-start gap-2">
      <div className="flex-1">
        <Input name="name" type="text" placeholder="新しいカテゴリ名" required />
        <FieldError>{state.error}</FieldError>
      </div>
      <Button type="submit" disabled={isPending}>
        {isPending ? "追加中…" : "追加"}
      </Button>
    </form>
  );
}
