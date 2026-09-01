import rss from "@astrojs/rss";
import { getCollection } from "astro:content";

export async function GET(context) {
  const news = (await getCollection("aktualnosci", ({ id }) => id !== "__empty")).sort(
    (a, b) => b.data.data.getTime() - a.data.data.getTime(),
  );
  const base = import.meta.env.BASE_URL.endsWith("/")
    ? import.meta.env.BASE_URL
    : `${import.meta.env.BASE_URL}/`;

  return rss({
    title: "Aktualności — NAUKA | BIZNES",
    description: "Aktualności projektu NAUKA | BIZNES.",
    site: context.site,
    items: news.map((entry) => ({
      title: entry.data.tytul,
      description: entry.data.lead,
      pubDate: entry.data.data,
      link: `${base}aktualnosci/${entry.id}/`,
    })),
    customData: "<language>pl</language>",
  });
}
