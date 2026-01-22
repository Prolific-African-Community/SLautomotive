"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

/* ------------------ Utils ------------------ */
type ClassValue = string | false | null | undefined;
const cn = (...c: ClassValue[]) => c.filter(Boolean).join(" ");

/* ------------------ Design tokens ------------------ */
const TITLE_GRADIENT =
  "bg-gradient-to-r from-black via-orange-800 to-slate-400 bg-clip-text text-transparent";
const SECTION_Y = "py-12 md:py-16";

const H1 = "text-5xl md:text-6xl font-semibold tracking-tight";
const H2 = "text-3xl md:text-4xl font-semibold tracking-tight";
const LEAD = "text-base md:text-lg text-slate-600 leading-relaxed";
const BODY = "text-base text-slate-600 leading-relaxed";

/* ------------------ Small UI helpers ------------------ */
function Separator() {
  return (
    <div className="max-w-7xl mx-auto px-6">
      <div className="h-px bg-gradient-to-r from-transparent via-orange-200 to-transparent" />
    </div>
  );
}

/* ------------------ Page ------------------ */
export default function InvestisseurPage() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

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
          <a href="/" className="flex items-center gap-3 no-underline">
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
            className="bg-orange-600 text-white px-6 py-3 rounded-full text-sm font-semibold hover:bg-orange-700 transition no-underline"
          >
            Contact
          </a>
        </nav>
      </header>

      {/* HERO */}
      <section className="min-h-[80vh] flex items-center pt-40 px-6 bg-slate-100">
        <div className="max-w-5xl mx-auto text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
            SL Automotive
          </p>
          <h1 className={cn("mt-4", H1, TITLE_GRADIENT)}>
            Investir dans un projet automobile structuré
          </h1>
          <p className={cn("mt-8 max-w-3xl mx-auto", LEAD)}>
            Un projet ancré localement, pensé pour la performance, la formation
            et l’expérience, avec une vision long terme et une gouvernance maîtrisée.
          </p>

          <div className="mt-10 flex flex-wrap gap-4 justify-center">
            <a
              href="#dossier"
              className="bg-orange-600 text-white px-8 py-3 rounded-full font-semibold hover:bg-orange-700 transition no-underline"
            >
              Demander le dossier investisseur
            </a>
            <a
              href="/contact"
              className="bg-black text-white px-8 py-3 rounded-full font-semibold transition no-underline"
            >
              Entrer en discussion
            </a>
          </div>
        </div>
      </section>

      {/* INVESTMENT PILLARS (CARDS) */}
      <section className={cn(SECTION_Y, "px-6 bg-white")}>
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            <h2 className={cn(H2, TITLE_GRADIENT)}>Une thèse claire. Des piliers concrets.</h2>
            <p className={cn("mt-4 max-w-3xl mx-auto", LEAD)}>
              L’opportunité repose sur des fondamentaux simples, lisibles et actionnables.
            </p>
          </div>

          <div className="mt-14 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[{
              t: "Actifs réels",
              d: "Infrastructures physiques exploitables, génératrices de valeur et de revenus.",
            },{
              t: "Revenus diversifiés",
              d: "Formation, expériences, B2B, événements et partenariats.",
            },{
              t: "Déploiement progressif",
              d: "Montée en charge maîtrisée, sans dépendance à un seul scénario.",
            },{
              t: "Gouvernance structurée",
              d: "Rôles clairs, pilotage opérationnel et supervision stratégique.",
            }].map((x) => (
              <div
                key={x.t}
                className={cn(
                  "group relative rounded-2xl bg-slate-50 p-7 ring-1 ring-slate-200 transition-all duration-300",
                  "hover:-translate-y-1 hover:shadow-xl"
                )}
              >
                <div className="absolute left-0 top-0 h-full w-[4px] bg-gradient-to-b from-orange-600 to-slate-400 opacity-0 group-hover:opacity-100 transition" />
                <div className="absolute inset-x-0 top-0 h-[4px] bg-gradient-to-r from-orange-700 to-slate-400 opacity-0 group-hover:opacity-100 transition" />
                <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-900">
                  {x.t}
                </h3>
                <p className={cn("mt-4", BODY)}>{x.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Separator />

      {/* INVESTOR FIT */}
      <section className={cn(SECTION_Y, "px-6 bg-slate-50")}>
        <div className="max-w-7xl mx-auto">
          <h2 className={cn(H2, TITLE_GRADIENT)}>À qui s’adresse le projet</h2>
          <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-6">
            {[{
              t: "Investisseurs long terme",
              d: "Vision patrimoniale, logique de développement durable et maîtrisé.",
            },{
              t: "Profils entrepreneuriaux",
              d: "Intérêt pour les projets concrets, opérationnels et pilotés.",
            },{
              t: "Passion automobile",
              d: "Affinité avec l’univers auto, sport mécanique ou événementiel.",
            },{
              t: "Approche raisonnée",
              d: "Recherche de structure, pas de promesse spéculative.",
            }].map((x) => (
              <div
                key={x.t}
                className="group relative rounded-2xl bg-white p-7 ring-1 ring-slate-200 transition-all hover:shadow-lg"
              >
                <div className="absolute left-0 top-0 h-full w-[4px] bg-gradient-to-b from-orange-600 to-slate-400 opacity-0 group-hover:opacity-100 transition" />
                <p className="text-sm font-semibold text-slate-900">{x.t}</p>
                <p className={cn("mt-3", BODY)}>{x.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Separator />

      {/* DOSSIER */}
      <section id="dossier" className={cn(SECTION_Y, "px-6 bg-slate-100")}>
        <div className="max-w-3xl mx-auto text-center">
          <h2 className={cn(H2, TITLE_GRADIENT)}>Accéder au dossier investisseur</h2>
          <p className={cn("mt-4", LEAD)}>
            Les informations financières détaillées et modalités d’investissement
            sont communiquées sur demande.
          </p>

          <form className="mt-10 grid gap-5">
            <input
              type="text"
              placeholder="Nom"
              className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
            <input
              type="email"
              placeholder="Email"
              className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
            <textarea
              rows={4}
              placeholder="Profil / message"
              className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
            <button
              type="submit"
              className="bg-orange-600 text-white px-8 py-3 rounded-full font-semibold hover:bg-orange-700 transition"
            >
              Envoyer la demande
            </button>
          </form>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-black text-slate-400 text-center py-6 text-xs">
        © {new Date().getFullYear()} SL Automotive
      </footer>
    </main>
  );
}
