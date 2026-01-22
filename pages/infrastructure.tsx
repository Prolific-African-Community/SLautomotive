"use client";

import { useEffect, useState } from "react";

/* ------------------ Section data ------------------ */
const COMPLEX_COMPONENTS = [
  {
    title: "Piste de karting",
    desc: "Infrastructure de base dédiée à l’initiation et à la formation technique.",
    img: "/kart-infra.webp",
  },
  {
    title: "Zones d’entraînement",
    desc: "Espaces modulables pour perfectionnement, tests et sécurité.",
    img: "/slide-15.png",
  },
  {
    title: "Paddock & bâtiments",
    desc: "Zones techniques, accueil, briefing et maintenance.",
    img: "/paddock.webp",
  },
  {
    title: "Espaces spectateurs",
    desc: "Zones sécurisées pour événements et compétitions.",
    img: "/spectateur.webp",
  },
];

/* ------------------ Utils ------------------ */
type ClassValue = string | false | null | undefined;
const cn = (...c: ClassValue[]) => c.filter(Boolean).join(" ");

/* ------------------ Design tokens ------------------ */
const TITLE_GRADIENT =
  "bg-gradient-to-r from-black via-orange-800 to-slate-400 bg-clip-text text-transparent";
const SECTION_Y = "py-28";

export default function InfrastructurePage() {
  const [scrolled, setScrolled] = useState(false);

  // Composantes du complexe: liste + diapo (auto-rotate)
  const [activeComponentIdx, setActiveComponentIdx] = useState(0);
  const [componentsPaused, setComponentsPaused] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Auto-rotate composantes toutes les 5s (pause au hover)
  useEffect(() => {
    if (componentsPaused) return;
    const id: ReturnType<typeof setInterval> = setInterval(() => {
      setActiveComponentIdx((i) => (i + 1) % COMPLEX_COMPONENTS.length);
    }, 5000);
    return () => clearInterval(id);
  }, [componentsPaused]);

  return (
    <main className="bg-slate-50 text-slate-900 font-sans leading-relaxed">
      {/* HEADER */}
      <header
        className={cn(
          "fixed top-0 w-full z-50 transition-all",
          scrolled
            ? "bg-white/90 backdrop-blur border-b border-slate-200"
            : "bg-transparent"
        )}
      >
        <nav className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <a href="/" className="flex items-center gap-3">
            <img
              src="/logo-sl-automotive.png"
              alt="SL Automotive"
              className="h-20 w-auto"
            />
          </a>
          <div className="hidden lg:flex gap-8 text-sm font-semibold uppercase tracking-wide">
            <a href="/academy" className="text-black no-underline hover:text-orange-600">L'Académie</a>
            <a href="/formations" className="text-black no-underline hover:text-orange-600">Formations</a>
            <a href="/investor" className="text-black no-underline hover:text-orange-600">Investisseurs</a>
            <a href="/infrastructure" className="text-black no-underline hover:text-orange-600">Infrastructure</a>
            <a href="/dealer" className="text-black no-underline hover:text-orange-600">Dealer</a>
            <a href="/garage" className="text-black no-underline hover:text-orange-600">Garage</a>
          </div>
          <a
            href="/contact"
            className="no-underline bg-slate-900 text-white px-6 py-3 rounded-full text-sm font-semibold hover:bg-orange-600 transition"
          >
            Contact
          </a>
        </nav>
      </header>

      {/* HERO */}
      <section className="min-h-[70vh] flex items-center pt-40 px-6">
        <div className="max-w-5xl mx-auto text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
            Stanley Racing Academy
          </p>
          <h1 className={cn("mt-4 text-5xl md:text-6xl font-semibold", TITLE_GRADIENT)}>
            Le circuit & les infrastructures
          </h1>
          <p className="mt-8 text-lg text-slate-600 max-w-3xl mx-auto">
            Un complexe conçu pour la formation, la sécurité et la montée en puissance du sport automobile en Afrique de l’Ouest.
          </p>
        </div>
      </section>

      {/* LOCALISATION */}
      <section className={cn(SECTION_Y, "px-6 bg-white")}>
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className={cn("text-3xl md:text-4xl font-semibold", TITLE_GRADIENT)}>
              Localisation stratégique – Lac Rose
            </h2>
            <p className="mt-6 text-slate-600 text-lg">
              Situé à proximité immédiate de Dakar, le site du Lac Rose offre un environnement unique, accessible et adapté au développement d’infrastructures sportives de niveau international.
            </p>
            <p className="mt-4 text-slate-600 text-lg">
              Ce positionnement permet d’accueillir des formations, des événements et des partenariats régionaux tout en bénéficiant d’un cadre sécurisé et maîtrisé.
            </p>
          </div>
          <div className="relative w-full max-w-xl rounded-2xl overflow-hidden shadow-lg">
            <img
              src="/slide-15.png"
              alt="Lac Rose – Localisation du circuit"
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      </section>

                  {/* COMPOSANTS DU SITE */}
      <section className={cn(SECTION_Y, "px-6 bg-slate-50")}>
        <div className="max-w-7xl mx-auto">
          <h2
            className={cn(
              "text-3xl md:text-4xl font-semibold text-center mb-16",
              TITLE_GRADIENT
            )}
          >
            Les composantes du complexe
          </h2>

          <div
            className="grid grid-cols-1 lg:grid-cols-[420px_1fr] gap-10 items-stretch"
            onMouseEnter={() => setComponentsPaused(true)}
            onMouseLeave={() => setComponentsPaused(false)}
          >
            {/* Left: list (style Services) */}
            <div className="flex flex-col gap-3">
              {COMPLEX_COMPONENTS.map((c, idx) => {
                const active = idx === activeComponentIdx;
                return (
                  <button
                    key={c.title}
                    type="button"
                    onClick={() => setActiveComponentIdx(idx)}
                    onMouseEnter={() => setActiveComponentIdx(idx)}
                    onFocus={() => setActiveComponentIdx(idx)}
                    style={
                      active
                        ? {
                            background:
                              "linear-gradient(90deg, #c2410c 0%, #ea580c 55%, #fb923c 100%)",
                          }
                        : undefined
                    }
                    className={cn(
                      "group relative appearance-none border-0 rounded-t-none rounded-b-3xl py-4 p-6 text-lg text-left transition focus:outline-none",
                      !active && "bg-white hover:bg-slate-50 hover:shadow-sm",
                      active && "text-white shadow-md"
                    )}
                  >
                    {/* Top gradient line (subtle; hidden when active) */}
                    <div
                      className={cn(
                        "absolute inset-x-0 top-0 h-[4px] bg-gradient-to-r from-orange-700 to-orange-300 transition",
                        active ? "opacity-0" : "opacity-0 group-hover:opacity-100"
                      )}
                    />

                    <p className={cn("mt-2 font-bold", active ? "text-white" : "text-slate-900")}>
                      {c.title}
                    </p>

                  </button>
                );
              })}
            </div>

            {/* Right: detail / diapo (style Services) */}
            <div
              className={cn(
                "group relative rounded-t-none rounded-b-3xl bg-white p-8 transition",
                "shadow-lg ring-1 ring-slate-200",
                "hover:shadow-md"
              )}
              aria-live="polite"
            >
              <div className="relative w-full h-[360px] rounded-2xl overflow-hidden">
                {COMPLEX_COMPONENTS.map((c, idx) => {
                  const show = idx === activeComponentIdx;
                  return (
                    <img
                      key={c.img}
                      src={c.img}
                      alt={c.title}
                      className={cn(
                        "absolute inset-0 h-full w-full object-cover transition-opacity duration-700",
                        show ? "opacity-100" : "opacity-0"
                      )}
                      draggable={false}
                    />
                  );
                })}
              </div>

              <div className="mt-6 text-center">
                <h3 className="text-2xl font-semibold text-slate-900">
                  {COMPLEX_COMPONENTS[activeComponentIdx]?.title}
                </h3>
                <p className="mt-4 text-slate-600 leading-relaxed">
                  {COMPLEX_COMPONENTS[activeComponentIdx]?.desc}
                </p>

                </div>
              </div>
          </div>
        </div>
      </section>

      {/* SECURITE & NORMES */}
      <section className={cn(SECTION_Y, "px-6 bg-white")}>
        <div className="max-w-5xl mx-auto">
          <h2 className={cn("text-3xl md:text-4xl font-semibold mb-8", TITLE_GRADIENT)}>
            Sécurité & normes
          </h2>
          <p className="text-slate-600 text-lg">
            Les infrastructures sont conçues selon des standards de sécurité inspirés des normes internationales, avec une montée en conformité progressive et contrôlée.
          </p>
        </div>
      </section>

      {/* PHASES */}
      <section className={cn(SECTION_Y, "px-6 bg-slate-50")}>
        <div className="max-w-6xl mx-auto">
          <h2 className={cn("text-3xl md:text-4xl font-semibold text-center mb-16", TITLE_GRADIENT)}>
            Phases de développement
          </h2>
          <div className="grid md:grid-cols-2 gap-10">
            {["Phase 1 – Formation & initiation", "Phase 2 – Extension & homologation"].map((p, i) => (
              <div key={p} className="group relative bg-white rounded-2xl p-8 shadow-sm transition-all duration-300 hover:-translate-y-2 hover:shadow-xl">
                <span className="absolute left-0 top-0 h-full w-[3px] bg-gradient-to-b from-orange-600 to-slate-400 opacity-0 group-hover:opacity-100 transition" />
                <p className="text-xs uppercase tracking-widest text-slate-400 mb-2">Phase {i + 1}</p>
                <h3 className="text-xl font-bold mb-3 group-hover:text-orange-600 transition">{p}</h3>
                <p className="text-slate-600 text-sm">
                  {i === 0 && "Lancement des formations, infrastructures de base et premières expériences."}
                  {i === 1 && "Montée en gamme, extension du site et alignement avec des standards de compétition."}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-28 px-6 bg-slate-900 text-white">
        <div className="max-w-xl mx-auto text-center">
          <h2 className="text-3xl font-semibold mb-6">Découvrir nos formations</h2>
          <p className="text-slate-300 mb-10">
            Un environnement sécurisé et structuré au service de la performance et de l’apprentissage.
          </p>
          <a
            href="/formations"
            className="bg-orange-600 text-white no-underline px-10 py-4 rounded-full font-semibold hover:bg-orange-700 transition"
          >
            Voir les formations
          </a>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-black text-slate-400 text-center py-6 text-xs">
        © {new Date().getFullYear()} SL Automotive — Stanley Racing Academy
      </footer>
    </main>
  );
}




