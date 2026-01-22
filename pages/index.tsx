"use client";

import { useEffect, useState } from "react";

/* ------------------ Utils ------------------ */
type ClassValue = string | false | null | undefined;
const cn = (...c: ClassValue[]) => c.filter(Boolean).join(" ");

/* ------------------ Design tokens ------------------ */
const TITLE_GRADIENT =
  "bg-gradient-to-r from-black via-orange-800 to-slate-400 bg-clip-text text-transparent";
const WORDMARK_GRADIENT =
  "bg-gradient-to-r from-black via-yellow-600 to-sky-400 bg-clip-text text-transparent";
const SECTION_Y = "py-24";

/* ------------------ Data ------------------ */

const HERO_SLIDES = [
  { src: "/slide-2.jpg", alt: "Stanley Racing Academy circuit Senegal" },
  { src: "/slide-8.webp", alt: "Motorsport training Africa" },
  { src: "/slide-11.webp", alt: "Motorsport training Africa" },
  { src: "/slide-7.jpg", alt: "Racing academy karting" },
  { src: "/slide-5.jpg", alt: "Motorsport training Africa" },
  { src: "/slide-6.jpg", alt: "Motorsport training Africa" },
  { src: "/slide-14.webp", alt: "Motorsport training Africa" },
];

const FORMATIONS = [
  {
    level: "Level 1",
    title: "Découverte & Initiation",
    description:
      "Karting découverte, premières expériences de pilotage et bases de la sécurité pour débutants et familles.",
    details: `Objectif : découvrir le pilotage en toute sécurité.
Durée : 1 à 2 jours.
Public : débutants, familles, jeunes pilotes.
Prix : sur demande.`,
  },
  {
    level: "Level 2",
    title: "Pilotage avancé",
    description:
      "Techniques de pilotage sportif, trajectoires, maîtrise du freinage et progression vers la performance.",
    details: `Objectif : améliorer les performances et la maîtrise du véhicule.
Durée : 2 à 3 jours.
Public : pilotes amateurs.
Prix : sur demande.`,
  },
  {
    level: "Level 3",
    title: "Professionnel & Compétition",
    description:
      "Préparation de pilotes professionnels, coaching compétition et accompagnement vers les carrières du sport automobile.",
    details: `Objectif : préparer à la compétition professionnelle.
Durée : programme long.
Public : pilotes confirmés.
Prix : sur sélection.`,
  },
];

/* ------------------ Page ------------------ */
export default function StanleyRacingAcademyHome() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [heroIdx, setHeroIdx] = useState(0);
  const [activeFormation, setActiveFormation] = useState<number | null>(null);
  

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const id = setInterval(() => {
      setHeroIdx((i) => (i + 1) % HERO_SLIDES.length);
    }, 4500);
    return () => clearInterval(id);
  }, []);

  return (
    <main className="bg-slate-50 text-slate-900">

       {/* HEADER */}
<header
  className={cn(
    "fixed top-0 w-full z-50 transition-all",
    scrolled
      ? "bg-black/80 backdrop-blur border-b border-white/10"
      : "bg-transparent"
  )}
>
  {/* NAV BAR */}
  <nav className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
    {/* Logo */}
    <a href="/" className="flex items-center">
      <img
        src="/logo-sl-automotive.png"
        alt="SL Automotive logo"
        className="h-28 w-auto"
      />
    </a>

    {/* Desktop menu */}
    <div className="hidden lg:flex gap-8 text-sm font-semibold uppercase tracking-wide">
      <a href="/academy" className="text-black no-underline hover:text-orange-600">L'Académie</a>
      <a href="/formations" className="text-black no-underline hover:text-orange-600">Formations</a>
      <a href="/investor" className="text-black no-underline hover:text-orange-600">Investisseurs</a>
      <a href="/infrastructure" className="text-black no-underline hover:text-orange-600">Infrastructure</a>
      <a href="/dealer" className="text-black no-underline hover:text-orange-600">Dealer</a>
      <a href="/garage" className="text-black no-underline hover:text-orange-600">Garage</a>
    </div>

    {/* Desktop CTA */}
    <a
      href="#contact"
      className="hidden lg:inline-flex no-underline bg-orange-600 text-white px-6 py-3 rounded-full text-sm font-semibold hover:bg-orange-700 transition"
    >
      Contact
    </a>

    {/* Mobile burger */}
    <button
      type="button"
      onClick={() => setMenuOpen((v) => !v)}
      className="lg:hidden inline-flex items-center justify-center rounded-md p-2 text-slate-200 hover:bg-white/10 transition"
      aria-label="Ouvrir le menu"
    >
      <svg
        className="h-6 w-6"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        viewBox="0 0 24 24"
      >
        {menuOpen ? (
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
        ) : (
          <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
        )}
      </svg>
    </button>
  </nav>

  {/* MOBILE MENU */}
  {menuOpen && (
    <div className="lg:hidden bg-white/95 backdrop-blur border-t border-white/10">
      <div className="px-6 py-6 flex flex-col gap-5 text-sm font-semibold uppercase tracking-wide">
        {[
          { label: "L'Académie", href: "/academy" },
          { label: "Formations", href: "/formations" },
          { label: "Investisseurs", href: "/investor" },
          { label: "Infrastructure", href: "/infrastructure" },
          { label: "Dealer", href: "/dealer" },
          { label: "Garage", href: "/garage" },
        ].map(({ label, href }) => (
          <a
            key={label}
            href={href}
            onClick={() => setMenuOpen(false)}
            className="text-black no-underline hover:text-orange-500 transition"
          >
            {label}
          </a>
        ))}

        <a
          href="#contact"
          onClick={() => setMenuOpen(false)}
          className="mt-4 inline-flex justify-center rounded-full bg-orange-600 px-6 py-3 text-white font-semibold hover:bg-orange-700 transition no-underline"
        >
          Contact
        </a>
      </div>
    </div>
  )}
</header>


      {/* HERO */}
      <section className="min-h-[90vh] flex items-center pt-32 px-6">
        <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-16 items-center">
          {/* Left */}
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
              Stanley Racing Academy
            </p>
            <h1 className={cn("mt-4 text-5xl md:text-6xl font-semibold leading-[1.1]", TITLE_GRADIENT)}>
              La première école de pilotage de niveau international en Afrique de l’Ouest
            </h1>
            <p className="mt-8 text-lg text-slate-600 max-w-xl">
              Une académie automobile premium au Sénégal, dirigée par un formateur issu des circuits de Formule 1. De la découverte au haut niveau, selon des standards européens.
            </p>
            <div className="mt-10 flex gap-4">
              <a href="/reserver" className="bg-orange-600 text-white px-8 py-4 rounded-full font-semibold no-underline hover:bg-orange-700 transition">
                Réserver une session
              </a>
              <a href="#academy" className="bg-black text-white px-8 py-4 rounded-full font-semibold no-underline hover:bg-slate-400 transition">
                Découvrir l’Académie
              </a>
            </div>
            <div className="mt-12 grid grid-cols-1 sm:grid-cols-3 gap-2">
              {[
                "Formateur certifié F1",
                "Standards internationaux",
                "Places limitées",
              ].map((p) => (
                <div key={p} className="bg-white rounded-xl p-4 text-sm text-slate-700 shadow-sm">
                  {p}
                </div>
              ))}
            </div>
          </div>

          {/* Right */}
          <div className="hidden md:block">
            <div className="relative w-full h-[420px] rounded-3xl border border-slate-200 overflow-hidden">
              {HERO_SLIDES.map((s, idx) => (
                <img
                  key={s.src}
                  src={s.src}
                  alt={s.alt}
                  className={cn(
                    "absolute inset-0 h-full w-full object-contain object:rounded-2xl p-8 transition duration-700",
                    idx === heroIdx ? "opacity-100" : "opacity-0"
                  )}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ACADEMY */}
      <section id="academy" className={cn(SECTION_Y, "px-6 bg-slate-50")}>
        <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-12 items-center">
          {/* Text */}
          <div>
            <h2 className={cn("text-3xl md:text-4xl font-semibold", TITLE_GRADIENT)}>
              L’Académie
            </h2>
            <p className="mt-6 text-lg text-slate-600">
              Stanley Racing Academy structure la formation au sport automobile en Afrique de l’Ouest autour de standards internationaux de sécurité, de pédagogie et de performance.
            </p>
            <p className="mt-4 text-lg text-slate-600">
              Notre objectif : former les pilotes de demain, du premier tour de piste à la compétition professionnelle, tout en développant un écosystème local durable.
            </p>
            <div className="mt-8">
              <a
                href="/academy"
                className="inline-flex items-center bg-black text-white px-8 py-4 rounded-full font-semibold no-underline hover:bg-orange-600 transition"
              >
                Découvrir l’Académie
              </a>
            </div>
          </div>

          {/* Image */}
          <div className="flex justify-center">
            <div className="relative w-full max-w-md rounded-2xl overflow-hidden shadow-lg">
              <img
                src="/slide-1.jpg"
                alt="Stanley Racing Academy – Formation et pilotage"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>
      </section>

       {/* FORMATIONS – APERÇU UNIQUEMENT */}
      <section className={cn(SECTION_Y, "px-6 bg-white")}>
        <div className="max-w-7xl mx-auto">
          <h2 className={cn("text-3xl md:text-4xl font-semibold text-center mb-16", TITLE_GRADIENT)}>
            Programmes de formation
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            {FORMATIONS.map((f, idx) => (
              <div
                key={f.level}
                onClick={() => setActiveFormation(idx)}
                className="group cursor-pointer relative border border-slate-200 rounded-2xl p-8 transition hover:shadow-lg"
              >
                <span className="absolute top-0 left-0 h-full w-1 bg-orange-600 opacity-0 group-hover:opacity-100 transition" />
                <p className="text-xs uppercase tracking-widest text-slate-500">{f.level}</p>
                <h3 className="mt-3 text-xl font-bold">{f.title}</h3>
                <p className="mt-4 py-6 text-slate-600">{f.description}</p>
                <a href="/formations" className="bg-orange-600 text-white px-6 py-3 rounded-full text-sm font-semibold hover:bg-orange-700 transition no-underline">Découvrir</a>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FONDATEUR */}
      <section id="founder" className={cn(SECTION_Y, "px-6 bg-white")}>
        <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className={cn("text-3xl md:text-4xl font-semibold", TITLE_GRADIENT)}>
              Le Fondateur
            </h2>
            <p className="mt-6 text-slate-600">
              Formé sur des circuits européens de Formule 1, Stanley Lishou apporte une expertise internationale unique en Afrique de l’Ouest.
            </p>
            <p className="mt-4 text-slate-600">
              Son ambition : transmettre un savoir-faire de haut niveau, structurer une filière professionnelle et créer des opportunités durables pour les talents locaux.
            </p>
          </div>
          <div className="flex justify-center md:justify-end">
            {/* Photo fondateur */}
            <div className="w-full max-w-sm">
              <div className="relative overflow-hidden rounded-3xl bg-slate-100 ring-1 ring-slate-200 shadow-sm">
                <img
                  src="/slide-9.jpg"
                  alt="Stanley Lishou — Fondateur"
                  className="w-full aspect-[4/5] object-cover"
                  loading="lazy"
                  draggable={false}
                />
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-white/0 via-white/0 to-slate-200/40" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* INFRASTRUCTURE */}
      <section id="infrastructure" className={cn(SECTION_Y, "px-6 bg-slate-50")}>
        <div className="max-w-6xl mx-auto text-center">
          <h2 className={cn("text-3xl md:text-4xl font-semibold", TITLE_GRADIENT)}>
            Circuit & Infrastructures
          </h2>
          <p className="mt-6 text-lg text-slate-600">
            Située à proximité de Dakar, au Lac Rose, l’académie s’appuie sur des infrastructures évolutives intégrant piste de karting, zones d’entraînement et futurs développements aux normes internationales.
          </p>
          <p className="mt-4 text-slate-600">
            La sécurité, la progression pédagogique et l’expérience pilote sont au cœur de la conception du site.
          </p>
        </div>
                {/* Image infrastructure */}
          <div className="mt-12 flex justify-center">
            <div className="relative w-full max-w-lg rounded-2xl overflow-hidden shadow-lg">
              <img
                src="/slide-15.png"
                alt="Circuit et infrastructures – Lac Rose"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        
      </section>


      {/* FORMATION MODAL */}
      {activeFormation !== null && (
        <div
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center px-6"
          onClick={(e) => e.target === e.currentTarget && setActiveFormation(null)}
        >
          <div className="bg-white max-w-2xl w-full rounded-2xl p-8 relative shadow-xl">
            <button
              onClick={() => setActiveFormation(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-black"
            >
              ✕
            </button>

            <p className="text-sm uppercase tracking-widest text-slate-500">
              {FORMATIONS[activeFormation].level}
            </p>
            <h3 className="mt-2 text-2xl font-bold">
              {FORMATIONS[activeFormation].title}
            </h3>
            <p className="mt-4 text-slate-600">
              {FORMATIONS[activeFormation].description}
            </p>
            <pre className="mt-6 text-sm text-slate-600 whitespace-pre-wrap">
              {FORMATIONS[activeFormation].details}
            </pre>

            <div className="mt-8 flex justify-between items-center">
              <div className="flex gap-2">
                <button
                  disabled={activeFormation === 0}
                  onClick={() => setActiveFormation((i) => (i !== null ? i - 1 : i))}
                  className="px-4 py-2 border rounded disabled:opacity-30"
                >
                  ←
                </button>
                <button
                  disabled={activeFormation === FORMATIONS.length - 1}
                  onClick={() => setActiveFormation((i) => (i !== null ? i + 1 : i))}
                  className="px-4 py-2 border rounded disabled:opacity-30"
                >
                  →
                </button>
              </div>
              <a
                href="/reserver"
                className="bg-orange-600 text-white px-6 py-3 rounded-full font-semibold"
              >
                Réserver
              </a>
            </div>
          </div>
        </div>
      )}

      {/* CTA FINAL */}
      <section className="py-12 px-6 bg-slate-900 text-white">
        <div className="max-w-xl mx-auto text-center">
          <h2 className="text-3xl font-semibold mb-6">Prêt à passer à l’action ?</h2>
          <p className="text-slate-300 mb-10">
            Réservez une première expérience ou découvrez en détail notre académie.
          </p>
          <div className="flex justify-center gap-4">
            <a href="/reserver" className="bg-orange-600 px-8 py-4 rounded-full text-white no-underline font-semibold">Réserver</a>
            <a href="/academy" className="bg-white text-black no-underline px-8 py-4 rounded-full font-semibold">L’Académie</a>
          </div>
        </div>
      </section>


      <section id="contact" className="py-12 px-6 bg-slate-900 text-white">
        <div className="max-w-xl mx-auto text-center">
          <h2 className="text-3xl font-semibold mb-6">Contact</h2>
          <p className="text-slate-300 mb-10">
            Contactez-nous pour en savoir plus sur nos programmes, partenariats ou notre vision d’investissement.
          </p>
          <form className="space-y-4">
            <input className="w-full px-4 py-3 rounded bg-slate-800 border border-slate-700" placeholder="Name" />
            <input className="w-full px-4 py-3 rounded bg-slate-800 border border-slate-700" placeholder="Email" />
            <textarea className="w-full px-4 py-3 rounded bg-slate-800 border border-slate-700" rows={4} placeholder="Message" />
            <button className="w-full bg-white text-slate-900 py-3 rounded font-semibold">Envoyer</button>
          </form>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-black text-slate-400 text-center py-6 text-xs">
        © {new Date().getFullYear()} SL Automotive — Stanley Racing Academy
      </footer>
    </main>
  );
}









