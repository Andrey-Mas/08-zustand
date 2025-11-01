"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useDebounce } from "@/hooks/useDebounce";
import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { fetchNotes } from "@/lib/api";
import type { FetchNotesResponse, UITag } from "@/types/note";
import SearchBox from "@/components/SearchBox/SearchBox";
import Pagination from "@/components/Pagination/Pagination";
import NoteList from "@/components/NoteList/NoteList";
import css from "./NotesPage.module.css";

type Props = { tag: UITag };

export default function NotesClient({ tag }: Props) {
  // локальний стан без синхронізації з URL
  const [page, setPage] = useState(1);
  const [query, setQuery] = useState("");

  // дебаунсимо лише для фетчингу, не для ресету
  const debouncedQuery = useDebounce(query, 400);

  // скидаємо сторінку лише при реальній зміні tag або raw query
  useEffect(() => {
    setPage(1);
  }, [tag]);

  useEffect(() => {
    setPage(1);
  }, [query]);

  const { data, isFetching, isError, error } = useQuery<FetchNotesResponse>({
    queryKey: ["notes", { page, query: debouncedQuery, tag }],
    queryFn: () => fetchNotes({ page, query: debouncedQuery, tag }),
    placeholderData: keepPreviousData,
  });

  const totalPages = data?.totalPages ?? 1;
  const notes = data?.items ?? [];

  return (
    <main className={css.app}>
      <div className={css.toolbar}>
        <h1>Notes — {tag}</h1>
        <div>
          <Link href="/notes/action/create" className={css.button}>
            + Create note
          </Link>
        </div>
      </div>

      <div className={css.searchRow}>
        <SearchBox value={query} onChange={setQuery} isLoading={isFetching} />
      </div>

      {isError ? (
        <p className={css.errorText}>{(error as Error).message}</p>
      ) : notes.length > 0 ? (
        <>
          <NoteList notes={notes} />
          {totalPages > 1 && (
            <Pagination
              currentPage={page}
              totalPages={totalPages}
              onPageChange={setPage}
            />
          )}
        </>
      ) : (
        <p className={css.errorText}>No notes found.</p>
      )}
    </main>
  );
}
