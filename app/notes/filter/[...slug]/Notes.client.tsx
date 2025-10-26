"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useDebounce } from "@/hooks/useDebounce";
import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { fetchNotes } from "@/lib/api";
import type { FetchNotesResponse, UITag } from "@/types/note";
import SearchBox from "@/components/SearchBox/SearchBox";
import Pagination from "@/components/Pagination/Pagination";
import NoteList from "@/components/NoteList/NoteList";
import css from "./NotesPage.module.css";

export default function NotesClient({
  initialPage,
  initialQuery,
  initialTag,
}: {
  initialPage: number;
  initialQuery: string;
  initialTag: UITag;
}) {
  const router = useRouter();
  const [page, setPage] = useState(initialPage);
  const [query, setQuery] = useState(initialQuery);
  const debouncedQuery = useDebounce(query, 400);

  // Build href reflecting current page/query for the current tag
  const fromHref = useMemo(() => {
    const params = new URLSearchParams();
    if (page && page !== 1) params.set("page", String(page));
    if (debouncedQuery) params.set("query", debouncedQuery);
    return `/notes/filter/${encodeURIComponent(initialTag)}${params.toString() ? `?${params}` : ""}`;
  }, [page, debouncedQuery, initialTag]);

  // Keep URL in sync (no scroll)
  useEffect(() => {
    router.replace(fromHref, { scroll: false });
  }, [fromHref, router]);

  // Reset page when query or tag changes
  useEffect(() => {
    setPage(1);
  }, [debouncedQuery, initialTag]);

  // Fetch notes
  const { data, isFetching, isError, error } = useQuery<FetchNotesResponse>({
    queryKey: ["notes", { page, query: debouncedQuery, tag: initialTag }],
    queryFn: () => fetchNotes({ page, query: debouncedQuery, tag: initialTag }),
    placeholderData: keepPreviousData,
  });

  const totalPages = data?.totalPages ?? 1;
  const notes = data?.items ?? [];

  return (
    <main className={css.app}>
      <div className={css.toolbar}>
        <h1 >Notes — {initialTag}</h1>
        <div >
          <Link href="/notes/action/create" className={css.button}>+ Create note</Link>
        </div>
      </div>

      <div className={css.searchRow}>
        <div className={css.searchRow}>
        <SearchBox value={query} onChange={setQuery} isLoading={isFetching} />
      </div>
      </div>

      {isError ? (
        <p className={css.errorText}>{(error as Error).message}</p>
      ) : (
        <>
          <NoteList notes={notes} />
          <Pagination
            currentPage={page}
            totalPages={totalPages}
            onPageChange={setPage}
          />
        </>
      )}
    </main>
  );
}
