"use client";

import { useState, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createNote } from "@/lib/api";
import type { BackendTag } from "@/types/note";
import { useNoteStore, initialDraft } from "@/lib/store/noteStore";
import css from "./NoteForm.module.css";

type Props = {
  backTo?: string;

  // керовані пропси (необов’язкові)
  title?: string;
  content?: string;
  tag?: BackendTag;

  onChange?: (patch: Partial<{ title: string; content: string; tag: BackendTag }>) => void;
  onSuccess?: () => void;
  onCancel?: () => void;
};

export default function NoteForm({
  backTo,
  title: titleProp,
  content: contentProp,
  tag: tagProp,
  onChange,
  onSuccess,
  onCancel,
}: Props) {
  const router = useRouter();
  const qc = useQueryClient();

  // ========= Draft from Zustand =========
  const draft = useNoteStore((s) => s.draft);
  const setDraft = useNoteStore((s) => s.setDraft);
  const clearDraft = useNoteStore((s) => s.clearDraft);

  // якщо прийшли керовані пропси — працюємо у керованому режимі
  const isControlled = useMemo(
    () =>
      onChange != null ||
      titleProp != null ||
      contentProp != null ||
      tagProp != null,
    [onChange, titleProp, contentProp, tagProp],
  );

  // локальний стан — тільки для некерованого режиму (повністю не використовуємо, тримаємо як fallback)
  const [titleLocal, setTitleLocal] = useState("");
  const [contentLocal, setContentLocal] = useState("");
  const [tagLocal, setTagLocal] = useState<BackendTag>("Todo");

  // джерело істини для значень полів
  const title = isControlled ? (titleProp ?? "") : (draft?.title ?? titleLocal);
  const content = isControlled ? (contentProp ?? "") : (draft?.content ?? contentLocal);
  const tag = isControlled ? (tagProp ?? "Todo") : ((draft?.tag as BackendTag) ?? tagLocal);

  // під час монтування у некерованому режимі — якщо немає draft, виставляємо initialDraft
  useEffect(() => {
    if (!isControlled) {
      if (!draft) {
        setDraft(initialDraft);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isControlled]);

  const mutation = useMutation({
    mutationFn: async () => {
      const res = await createNote({ title, content, tag });
      return res;
    },
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["notes"] });
      // очищаємо чернетку лише при успішному створенні
      clearDraft();
      if (onSuccess) onSuccess();
      // повернення на попередню сторінку
      router.back();
    },
  });

  return (
    <form
      className={css.form}
      onSubmit={(e) => {
        e.preventDefault();
        if (!title.trim() || !content.trim()) return;
        mutation.mutate();
      }}
    >
      <label className={css.formGroup}>
        <span >Title</span>
        <input
          className={css.input}
          name="title"
          value={title}
          onChange={(e) => {
            const v = e.target.value;
            if (isControlled && onChange) onChange({ title: v });
            else setDraft({ title: v });
          }}
          required
        />
      </label>

      <label className={css.formGroup}>
        <span >Content</span>
        <textarea
          className={css.textarea}
          name="content"
          value={content}
          onChange={(e) => {
            const v = e.target.value;
            if (isControlled && onChange) onChange({ content: v });
            else setDraft({ content: v });
          }}
          required
        />
      </label>

      <label className={css.formGroup}>
        <span >Tag</span>
        <select
          className={css.select}
          name="tag"
          value={tag}
          onChange={(e) => {
            const v = e.target.value as BackendTag;
            if (isControlled && onChange) onChange({ tag: v });
            else setDraft({ tag: v });
          }}
        >
          <option value="Todo">Todo</option>
          <option value="Work">Work</option>
          <option value="Personal">Personal</option>
          <option value="Meeting">Meeting</option>
          <option value="Shopping">Shopping</option>
        </select>
      </label>

      <div className={css.actions}>
        <button className={css.submitButton} type="submit" disabled={mutation.isPending}>
          {mutation.isPending ? "Saving..." : "Save"}
        </button>
        <button
          className={css.cancelButton}
          type="button"
          onClick={() => {
            if (onCancel) onCancel();
            // не очищаємо draft — просто йдемо назад
            router.back();
          }}
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
