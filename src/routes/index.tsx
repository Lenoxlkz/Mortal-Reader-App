import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState, type ReactNode } from "react";
import { ArrowUpRight, BookOpen, Radio, Smartphone, Unlink } from "lucide-react";
import { FALLBACK, formatUtc, loadLive, type LiveSnap } from "@/lib/mortal-live";

export const Route = createFileRoute("/")({ component: Home });

const NOTICES = [
  "Esta aplicación ha sido concebida exclusivamente como una herramienta «Todo en Uno». Su esencia no trasciende más allá de esta funcionalidad unificada.",
  "Es imperativo aclarar que los anuncios emergentes o las páginas caídas que no respondan son responsabilidad absoluta de los autores de dichas páginas externas. Esta aplicación no guarda relación alguna con dichos contenidos ni su gestión.",
  "No podemos garantizar que el usuario se vea exento de presenciar publicidad en sitios de terceros.",
];

function Home() {
  const [snap, setSnap] = useState<LiveSnap>(FALLBACK);
  const [phase, setPhase] = useState<"boot" | "live" | "local">("boot");

  useEffect(() => {
    const controller = new AbortController();
    loadLive(controller.signal).then((next) => {
      if (controller.signal.aborted) return;
      if (next) {
        setSnap(next);
        setPhase("live");
      } else {
        setPhase("local");
      }
    });
    return () => controller.abort();
  }, []);

  const releaseUrl = snap.release?.url ?? `${snap.repo}/releases`;
  const status = phase === "live" ? "En vivo" : phase === "local" ? "Copia local" : "Sincronizando";

  return (
    <main id="contenido" className="bg-bg text-fg">
      <a
        href="#contenido"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-20 focus:bg-fg focus:px-3 focus:py-2 focus:text-bg"
      >
        Saltar al contenido
      </a>

      <header className="sticky top-0 z-10 border-b border-line bg-bg/90 backdrop-blur-md">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-5">
          <span className="eyebrow text-xs text-muted">Mortal Reader</span>
          <div className="flex items-center gap-4">
            <span className="inline-flex items-center gap-2 text-xs text-muted">
              <i className="live-dot" aria-hidden />
              <span className="hidden sm:inline">{status}</span>
            </span>
            <a
              href={snap.repo}
              className="inline-flex min-h-11 items-center gap-1 text-sm text-fg"
            >
              Repositorio
              <ArrowUpRight className="size-4" aria-hidden />
            </a>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-5 pb-20">
        <section className="grid items-end gap-10 pt-10 lg:grid-cols-[1.15fr_0.85fr] lg:pt-16">
          <div>
            <p className="eyebrow rise text-xs text-muted">Puente local</p>
            <h1 className="wordmark rise mt-4 text-5xl text-fg sm:text-7xl">
              Mortal
              <br />
              <i>Reader</i>
            </h1>
            <span className="cut mt-6 max-w-xs" />
            <p className="rise mt-6 max-w-xl text-lg leading-relaxed text-fg">
              Colecciona sitios para leer y reproducir, en distintos idiomas. La app solo abre el puente.
              Sin cuenta. Todo se queda en el dispositivo.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <a
                href={releaseUrl}
                className="inline-flex min-h-11 items-center bg-fg px-5 text-sm font-medium text-bg"
              >
                Versión {snap.versionName}
              </a>
              <a
                href={snap.repo}
                className="inline-flex min-h-11 items-center border border-line px-5 text-sm text-fg"
              >
                Código
              </a>
            </div>
          </div>
          <Device />
        </section>

        <section className="mt-14 grid gap-px border border-line bg-line sm:grid-cols-3" aria-label="Estado del repositorio">
          <Stat k="Versión" v={snap.versionName} />
          <Stat k="Sitios en el puente" v={String(snap.sitesEnabled)} />
          <Stat k="Publicado" v={snap.release ? formatUtc(snap.release.publishedAt) : "—"} />
        </section>
        <p className="mt-3 text-sm text-muted">
          {status === "En vivo"
            ? `Leído del repositorio${snap.commit ? ` · ${snap.commit}` : ""}.`
            : "Mostrando la última copia conocida. Las direcciones no se publican aquí."}
        </p>

        <section className="mt-16 grid gap-8 lg:grid-cols-[0.8fr_1.2fr]">
          <div>
            <p className="eyebrow text-xs text-muted">El catálogo</p>
            <h2 className="display mt-3 text-4xl text-fg">Un punto por sitio.</h2>
            <p className="mt-4 max-w-sm text-base leading-relaxed text-muted">
              El número se actualiza cuando cambia el repositorio. Los enlaces viven solo dentro de la app.
            </p>
          </div>
          <div>
            <div className="constellation" aria-hidden>
              {Array.from({ length: Math.min(snap.sitesEnabled, 240) }, (_, i) => (
                <span key={i} className={i === snap.sitesEnabled - 1 ? "star on" : "star"} />
              ))}
            </div>
            <p className="mt-4 text-sm text-muted">{snap.sitesEnabled} sitios habilitados. Ninguna URL sale del teléfono.</p>
          </div>
        </section>

        <section className="mt-16 grid gap-4 md:grid-cols-3">
          <Principle
            icon={<Smartphone className="size-5" aria-hidden />}
            index="01"
            title="Sin cuenta"
            body="No hay login ni perfil. Lo que usas se queda en ese dispositivo."
          />
          <Principle
            icon={<BookOpen className="size-5" aria-hidden />}
            index="02"
            title="Todo en uno"
            body="Lectura y reproducción, en varios idiomas, dentro de una sola herramienta."
          />
          <Principle
            icon={<Unlink className="size-5" aria-hidden />}
            index="03"
            title="Solo un puente"
            body="La app no aloja el contenido. Abre el sitio. El resto es de quien lo publica."
          />
        </section>

        <section className="mt-16 border-t border-line pt-10">
          <div className="eyebrow flex items-center gap-2 text-xs text-muted">
            <Radio className="size-4" aria-hidden />
            Aviso
          </div>
          <ul className="mt-6 grid gap-4">
            {NOTICES.map((text) => (
              <li key={text} className="border border-line bg-surface p-5 text-base leading-relaxed text-fg">
                <span className="mr-2 text-accent" aria-hidden>
                  ✦
                </span>
                {text}
              </li>
            ))}
          </ul>
        </section>

        {snap.release ? (
          <section className="mt-16 grid gap-6 border border-line p-5 sm:p-8 md:grid-cols-[1fr_auto] md:items-end">
            <div>
              <p className="eyebrow text-xs text-muted">Última actualización</p>
              <h2 className="mt-3 text-2xl font-medium text-fg">{snap.release.name}</h2>
              <p className="mt-3 max-w-xl text-sm leading-relaxed whitespace-pre-line text-muted">{snap.release.body}</p>
            </div>
            <a
              href={snap.release.url}
              className="inline-flex min-h-11 items-center justify-center border border-line px-5 text-sm text-fg"
            >
              Ver release
            </a>
          </section>
        ) : null}

        <footer className="mt-16 flex flex-col gap-3 border-t border-line pt-6 text-sm text-muted sm:flex-row sm:items-center sm:justify-between">
          <p>Mortal Reader. El contenido no es de esta app.</p>
          <a href={snap.repo} className="text-fg">
            Lenoxlkz / Mortal-Reader-App
          </a>
        </footer>
      </div>
    </main>
  );
}

function Stat({ k, v }: { k: string; v: string }) {
  return (
    <div className="bg-bg px-5 py-5">
      <p className="eyebrow text-xs text-muted">{k}</p>
      <p className="mt-2 text-2xl text-fg">{v}</p>
    </div>
  );
}

function Principle({
  icon,
  index,
  title,
  body,
}: {
  icon: ReactNode;
  index: string;
  title: string;
  body: string;
}) {
  return (
    <article className="border border-line bg-surface p-5">
      <div className="flex items-center justify-between text-muted">
        <span>{icon}</span>
        <span className="display text-lg">{index}</span>
      </div>
      <h2 className="mt-8 text-xl text-fg">{title}</h2>
      <p className="mt-2 text-sm leading-relaxed text-muted">{body}</p>
    </article>
  );
}

function Device() {
  return (
    <aside className="rise border border-line bg-surface p-4 shadow-none sm:p-5" aria-label="Vista de la app">
      <div className="shell border border-line bg-bg px-5 py-6">
        <div className="mb-8 flex items-center justify-between">
          <span className="eyebrow text-xs text-muted">En el teléfono</span>
          <span className="h-1.5 w-10 bg-accent" />
        </div>
        <ul className="space-y-3">
          <Row name="Lectura" lang="ES" />
          <Row name="Novela" lang="EN" active />
          <Row name="Reproducción" lang="ES" />
        </ul>
        <p className="mt-8 text-sm text-muted">Nada se envía. Nada sale del aparato.</p>
      </div>
    </aside>
  );
}

function Row({ name, lang, active }: { name: string; lang: string; active?: boolean }) {
  return (
    <li
      className={`flex items-center justify-between border px-4 py-3 text-sm ${active ? "border-fg text-fg" : "border-line text-muted"}`}
    >
      <span>{name}</span>
      <span className="text-xs text-muted">{lang}</span>
    </li>
  );
}
