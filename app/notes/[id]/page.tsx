import type { Metadata, ResolvingMetadata } from "next";
import Link from "next/link";
import { fetchNoteById } from "@/lib/api";
import css from "./NotePreview.module.css";

export async function generateMetadata(
  { params }: { params: Promise<{ id: string }> },
  _parent: ResolvingMetadata
): Promise<Metadata> {
  const { id } = await params;
  try {
    const note = await fetchNoteById(id);
    const title = `${note.title} – NoteHub`;
    const description = note.content?.slice(0, 160) || "Note details";
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
    return {
      title,
      description,
      openGraph: {
        title,
        description,
        url: `${siteUrl}/notes/${encodeURIComponent(id)}`,
        images: [{ url: "https://ac.goit.global/fullstack/react/notehub-og-meta.jpg" }],
      },
    };
  } catch {
    const title = "Note details – NoteHub";
    const description = "Note details";
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
    return {
      title,
      description,
      openGraph: {
        title,
        description,
        url: `${siteUrl}/notes/${encodeURIComponent(id)}`,
        images: [{ url: "https://ac.goit.global/fullstack/react/notehub-og-meta.jpg" }],
      },
    };
  }
}

export default async function NotePage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams?: Promise<{ from?: string }>;
}) {
  const { id } = await params;
  const sp = (await searchParams) ?? {};
  const from = typeof sp.from === "string" && sp.from ? sp.from : "/notes/filter/All";

  const note = await fetchNoteById(id);

  return (
    <main className={css.container}>
      <div className={css.card}>
        <div className={css.header}>
          <Link href={from} className={css.backLink}>
            ← Back
          </Link>
          <h1 className={css.title}>{note.title}</h1>
        </div>

        <div className={css.tag}>{note.tag}</div>
        <div className={css.content}>{note.content}</div>

        <div className={css.date}>
          {note.updatedAt
            ? new Date(note.updatedAt).toLocaleString()
            : note.createdAt
            ? new Date(note.createdAt).toLocaleString()
            : ""}
        </div>
      </div>
    </main>
  );
}
