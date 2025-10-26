import type { Metadata } from "next";
import css from "./Home.module.css";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

export const metadata: Metadata = {
  title: "404 – Page not found | NoteHub",
  description: "The page you are looking for does not exist.",
  openGraph: {
    title: "404 – Page not found | NoteHub",
    description: "The page you are looking for does not exist.",
    url: siteUrl + "/404",
    images: [
      {
        url: "https://ac.goit.global/fullstack/react/notehub-og-meta.jpg",
      },
    ],
  },
};

export default function NotFound() {
  return (
    <main className={css.container}>
      <h1 className={css.title}>404 - Page not found</h1>
      <p className={css.description}>
        Sorry, the page you are looking for does not exist.
      </p>
    </main>
  );
}
