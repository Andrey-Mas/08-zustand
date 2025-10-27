// app/notes/filter/[...slug]/page.tsx
import { HydrationBoundary, dehydrate, QueryClient } from "@tanstack/react-query";
import NotesClient from "./Notes.client";
import { fetchNotes } from "@/lib/api";
import type { UITag } from "@/types/note";

type Params = { slug?: string[] };
type Search = { page?: string; query?: string };

const VALID_TAGS: ReadonlyArray<UITag> = ["All","Todo","Work","Personal","Meeting","Shopping"];

import type { Metadata, ResolvingMetadata } from "next";

export async function generateMetadata(
  { params }: { params: Promise<{ slug?: string[] }> },
  parent: ResolvingMetadata
): Promise<Metadata> {
  const { slug } = await params;
  const tag = Array.isArray(slug) && slug[0] ? slug[0] : "All";
  const title = `Notes – Filter: ${tag} | NoteHub`;
  const description = `Browse notes filtered by "${tag}".`;
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: `${siteUrl}/notes/filter/${encodeURIComponent(tag)}`,
      images: [{ url: "https://ac.goit.global/fullstack/react/notehub-og-meta.jpg" }],
    },
  };
}

export default async function NotesPage({
  params,
  searchParams,
}: {
  params: Promise<Params>;
  searchParams?: Promise<Search>;
}) {
  const { slug } = await params;
  const sp = (await searchParams) ?? {};

  const rawTag = Array.isArray(slug) && slug.length > 0 ? decodeURIComponent(slug[0]) : "All";
  const tag: UITag = (VALID_TAGS as readonly string[]).includes(rawTag) ? (rawTag as UITag) : "All";

  const page = typeof sp.page === "string" ? Math.max(1, parseInt(sp.page, 10) || 1) : 1;
  const query = typeof sp.query === "string" ? sp.query : "";

  // Prefetch on the server with the SAME key as in Notes.client
  const qc = new QueryClient();
  await qc.prefetchQuery({
    queryKey: ["notes", { page, query, tag }],
    queryFn: () => fetchNotes({ page, query, tag }),
  });

  return (
    <HydrationBoundary state={dehydrate(qc)}>
      <NotesClient tag={tag} />
    </HydrationBoundary>
  );
}
