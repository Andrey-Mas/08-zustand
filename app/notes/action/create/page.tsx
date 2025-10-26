import NoteForm from "@/components/NoteForm/NoteForm";
import css from "./CreateNote.module.css";

export const metadata = {
  title: "Create a new note – NoteHub",
  description: "Start a fresh note. Your draft is saved automatically.",
  openGraph: {
    title: "Create a new note – NoteHub",
    description: "Start a fresh note. Your draft is saved automatically.",
    url: "/notes/action/create",
    images: [
      {
        url: "https://ac.goit.global/fullstack/react/notehub-og-meta.jpg",
      },
    ],
  },
};

export default function CreateNote() {
  return (
    <main className={css.main}>
      <div className={css.container}>
        <h1 className={css.title}>Create note</h1>
        <NoteForm />
      </div>
    </main>
  );
}
