import { defineCollection, z } from "astro:content";
import { glob } from "astro/loaders";

function quietGlob(options: Parameters<typeof glob>[0]) {
  const loader = glob(options);

  return {
    ...loader,
    name: "quiet-glob-loader",

    async load(context: Parameters<typeof loader.load>[0]) {
      const logger = new Proxy(context.logger, {
        get(target, property, receiver) {
          if (property === "warn") {
            return (message: string) => {
              if (!message.startsWith("No files found matching")) {
                target.warn(message);
              }
            };
          }

          const value = Reflect.get(target, property, receiver);

          return typeof value === "function"
            ? value.bind(target)
            : value;
        },
      });

      await loader.load({
        ...context,
        logger,
      });

      if ([...context.store.keys()].length === 0) {
        context.store.set({
          id: "__empty",
          data: {},
          body: "",
          digest: "empty",
        });
      }
    },
  };
}

const tekst = (pole: string) =>
  z
    .string()
    .trim()
    .min(1, {
      message: `Pole „${pole}” nie może być puste.`,
    });

const data = z.coerce.date({
  message: "Podaj prawidłową datę w formacie RRRR-MM-DD.",
});


/* =========================
   AKTUALNOŚCI
   ========================= */

const aktualnosci = defineCollection({
  loader: quietGlob({
    pattern: "[!_]*.md",
    base: "./src/content/aktualnosci",

    generateId: ({ entry }) =>
      entry
        .replace(/\.md$/, "")
        .replace(/^\d{4}-\d{2}-\d{2}-/, ""),
  }),

  schema: ({ image }) =>
    z.object({
      tytul: tekst("tytul"),

      data,

      lead: tekst("lead"),

      obraz: image().optional(),

      obrazAlt: z
        .string()
        .trim()
        .optional(),
    }),
});


/* =========================
   ZESPÓŁ
   ========================= */

const zespol = defineCollection({
  loader: quietGlob({
    pattern: "[!_]*.md",
    base: "./src/content/zespol",
  }),

  schema: ({ image }) =>
    z
      .object({
        imieNazwisko: tekst("imieNazwisko"),

        rola: tekst("rola"),

        kolejnosc: z.coerce
          .number()
          .int({
            message:
              "Pole „kolejnosc” musi być liczbą całkowitą.",
          }),

        afiliacja: z
          .string()
          .trim()
          .optional(),

        email: z
          .string()
          .trim()
          .email({
            message:
              "Pole „email” musi zawierać prawidłowy adres e-mail.",
          })
          .optional(),

        orcid: z
          .string()
          .trim()
          .url({
            message:
              "Pole „orcid” musi zawierać pełny adres, np. https://orcid.org/0000-0000-0000-0000.",
          })
          .optional(),

        bio: z
          .string()
          .trim()
          .optional(),

        foto: image().optional(),

        fotoAlt: z
          .string()
          .trim()
          .optional(),
      })

      .refine(
        (entry) =>
          Boolean(entry.foto) ===
          Boolean(entry.fotoAlt),
        {
          message:
            "Pola „foto” i „fotoAlt” muszą występować razem.",
          path: ["fotoAlt"],
        },
      ),
});


/* =========================
   MATERIAŁY
   ========================= */

const materialy = defineCollection({
  loader: quietGlob({
    pattern: "[!_]*.md",
    base: "./src/content/materialy",
  }),

  schema: z.object({
    tytul: tekst("tytul"),

    data,

    typ: z.enum(
      [
        "raport",
        "rekomendacje",
        "prezentacja",
        "publikacja",
        "inne",
      ],
      {
        message:
          "Wybierz dozwolony typ materiału.",
      },
    ),

    plik: tekst("plik"),

    rozmiarKB: z.coerce
      .number()
      .positive({
        message:
          "Rozmiar pliku musi być większy od zera.",
      }),
  }),
});


/* =========================
   WYDARZENIA
   ========================= */

const wydarzenia = defineCollection({
  loader: quietGlob({
    pattern: "[!_]*.md",
    base: "./src/content/wydarzenia",
  }),

  schema: ({ image }) =>
    z
      .object({
        tytul: tekst("tytul"),

        typ: z.enum(
          [
            "konferencja",
            "seminarium",
            "warsztat",
            "debata",
            "inne",
          ],
          {
            message:
              "Wybierz dozwolony typ wydarzenia.",
          },
        ),

        dataStart: data,

        dataKoniec: data.optional(),

        miejsce: z
          .string()
          .trim()
          .optional(),

        lead: tekst("lead"),

        obraz: image().optional(),

        obrazAlt: z
          .string()
          .trim()
          .optional(),

        program: z
          .string()
          .trim()
          .optional(),

        opublikowane: z.boolean({
          message:
            "Określ, czy wydarzenie ma być opublikowane.",
        }),
      })

      .refine(
        (entry) =>
          Boolean(entry.obraz) ===
          Boolean(entry.obrazAlt),
        {
          message:
            "Pola „obraz” i „obrazAlt” muszą występować razem.",
          path: ["obrazAlt"],
        },
      )

      .refine(
        (entry) =>
          !entry.dataKoniec ||
          entry.dataKoniec >= entry.dataStart,
        {
          message:
            "Data zakończenia nie może być wcześniejsza niż data rozpoczęcia.",
          path: ["dataKoniec"],
        },
      ),
});


/* =========================
   PARTNERZY
   ========================= */

const partnerzy = defineCollection({
  loader: quietGlob({
    pattern: "[!_]*.md",
    base: "./src/content/partnerzy",
  }),

  schema: ({ image }) =>
    z.object({
      nazwa: tekst("nazwa"),

      logo: image(),

      url: z
        .string()
        .url({
          message:
            "Pole „url” musi zawierać pełny, prawidłowy adres.",
        })
        .optional(),

      kolejnosc: z.coerce
        .number()
        .int({
          message:
            "Pole „kolejnosc” musi być liczbą całkowitą.",
        }),
    }),
});


export const collections = {
  aktualnosci,
  zespol,
  materialy,
  wydarzenia,
  partnerzy,
};
