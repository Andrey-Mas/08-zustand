"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSearchParams } from "next/navigation";
import { useDebounce } from "@/hooks/useDebounce";
import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { fetchNotes } from "@/lib/api";
import type { FetchNotesResponse, UITag } from "@/types/note";
import SearchBox from "@/components/SearchBox/SearchBox";
import Pagination from "@/components/Pagination/Pagination";
import NoteList from "@/components/NoteList/NoteList";
import css from "./NotesPage.module.css";

export default function NotesClient({ tag }: { tag: UITag }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  useEffect(() => {
    const p = Number(searchParams.get("page") || "1");
    setPage(Number.isFinite(p) && p > 0 ? p : 1);
    const q = searchParams.get("query") || "";
    setQuery(q);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const [page, setPage] = useState(1);
  const [query, setQuery] = useState("");
  const debouncedQuery = useDebounce(query, 400);

  // Build href reflecting current page/query for the current tag
  const fromHref = useMemo(() => {
    const params = new URLSearchParams();
    if (page && page !== 1) params.set("page", String(page));
    if (debouncedQuery) params.set("query", debouncedQuery);
    return `/notes/filter/${encodeURIComponent(tag)}${params.toString() ? `?${params}` : ""}`;
  }, [page, debouncedQuery, tag]);

  // Keep URL in sync (no scroll)
  useEffect(() => {
    router.replace(fromHref, { scroll: false });
  }, [fromHref, router]);

  // Reset page when query or tag changes
  useEffect(() => {
    setPage(1);
  }, [debouncedQuery, tag]);

  // Fetch notes
  const { data, isFetching, isError, error } = useQuery<FetchNotesResponse>({
    queryKey: ["notes", { page, query: debouncedQuery, tag: tag }],
    queryFn: () => fetchNotes({ page, query: debouncedQuery, tag: tag }),
    placeholderData: keepPreviousData,
  });

  const totalPages = data?.totalPages ?? 1;
  const notes = data?.items ?? [];

  return (
    <main className={css.app}>
      <div className={css.toolbar}>
        <h1 >Notes — {tag}</h1>
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
          {notes.length > 0 ? <NoteList notes={notes} /> : <p className={css.errorText}>No notes found.</p>}
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
