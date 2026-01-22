"use client";

import { useEffect, useMemo, useState } from "react";

/* ------------------ Utils ------------------ */
type ClassValue = string | false | null | undefined;
const cn = (...c: ClassValue[]) => c.filter(Boolean).join(" ");

/* ------------------ Design tokens ------------------ */
const TITLE_GRADIENT =
  "bg-gradient-to-r from-black via-orange-800 to-slate-400 bg-clip-text text-transparent";
const SECTION_Y = "py-12 md:py-16";

// Typography scale (consistent)
const H1 = "text-5xl md:text-6xl font-semibold tracking-tight";
const H2 = "text-3xl md:text-4xl font-semibold tracking-tight";
const H3 = "text-xl font-semibold";
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

/* ------------------ Data ------------------ */

type Offer = {
  title: string;
  tagline: string;
  price: string;
  vehicles: string;
  includes: string;
  img: string;
};

type Level = {
  id: string;
  badge: string;
  title: string;
  promise: string;
  priceFrom: string;
  vehicles: string;
  offers: Offer[];
};

const LEVELS: Level[] = [
  {
    id: "niveau-1",
    badge: "Niveau 1",
    title: "Découverte & Initiation",
    promise: "Vivre ses premières sensations. Apprendre les bases. En toute sécurité.",
    priceFrom: "À partir de 25 000 FCFA / 38 €",
    vehicles: "Karting • Véhicules tourisme école",
    offers: [
      {
        title: "Karting découverte",
        tagline: "Découverte plaisir, sécurité et premiers repères de trajectoire.",
        price: "25 000 FCFA / 38 €",
        vehicles: "Karts 4T 270cc sécurisés",
        includes: "Briefing • Piste • Temps & classement",
        img: "/slide-5.jpg",
      },
      {
        title: "Stage pilotage tourisme",
        tagline: "Position de conduite, trajectoires, freinage — puis pratique progressive.",
        price: "65 000 FCFA / 99 €",
        vehicles: "Citroën C3 • Peugeot 208 (sécurité)",
        includes: "Théorie • Pratique • Débriefing",
        img: "/slide-13.webp",
      },
      {
        title: "Baptême de vitesse",
        tagline: "Expérience passager avec pilote professionnel. Sensations garanties.",
        price: "35 000 FCFA / 53 €",
        vehicles: "BMW M Performance • Mercedes AMG",
        includes: "Briefing • Tours reconnaissance • Tours performance",
        img: "/slide-12.webp",
      },
    ],
  },
  {
    id: "niveau-2",
    badge: "Niveau 2",
    title: "Perfectionnement",
    promise: "Transformer l’instinct en technique. Maîtriser la performance.",
    priceFrom: "À partir de 125 000 FCFA / 190 €",
    vehicles: "Sportives • GT préparées",
    offers: [
      {
        title: "Stage pilotage sportif",
        tagline: "Trajectoires avancées, freinage performance, transferts de masse.",
        price: "125 000 FCFA / 190 €",
        vehicles: "BMW M3 • Porsche Boxster (préparées)",
        includes: "Journée complète • Déjeuner • Coaching",
        img: "/slide-2.jpg",
      },
      {
        title: "Compétition amateur",
        tagline: "Chronométrage, simulations de course et évaluation finale.",
        price: "350 000 FCFA / 533 €",
        vehicles: "BMW M3 Cup • Clio Cup",
        includes: "3 jours intensifs • Sélection",
        img: "/slide-10.webp",
      },
    ],
  },
  {
    id: "niveau-3",
    badge: "Niveau 3",
    title: "Professionnel",
    promise: "Préparer une carrière en compétition de haut niveau (programme sélectif).",
    priceFrom: "Programme sur sélection",
    vehicles: "GT compétition • Monoplaces",
    offers: [
      {
        title: "Pilote professionnel",
        tagline: "Technique, préparation mentale, stratégie course, médias & sponsors.",
        price: "1 300 000 FCFA / 1 980 €",
        vehicles: "Formule 4 • GT préparées",
        includes: "2 semaines • Coaching 6 mois inclus",
        img: "/slide-1.jpg",
      },
    ],
  },
];

const MECH = {
  id: "mecanicien",
  badge: "Parcours Métiers",
  title: "Mécanicien Sport Automobile",
  promise:
    "Le paddock ne tourne pas sans eux. Une formation technique en environnement compétition.",
  price: "450 000 FCFA / 685 €",
  vehicles: "Karts • GT • Voitures de course",
  image: "/slide-14.webp",
  bullets: [
    "Mécanique spécifique sport auto",
    "Préparation & réglages châssis",
    "Diagnostics avancés",
    "Sécurité paddock & procédures",
    "Gestion du stress en course",
  ],
};

/* ------------------ Page ------------------ */
export default function FormationsPage() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);


  // Sticky highlight (Niveaux)
  const [activeLevelId, setActiveLevelId] = useState<string>(LEVELS[0].id);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Observe sections to highlight current level
  useEffect(() => {
    const els = LEVELS.map((l) => document.getElementById(l.id)).filter(
      Boolean
    ) as HTMLElement[];
    if (!els.length) return;

    const io = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => (b.intersectionRatio ?? 0) - (a.intersectionRatio ?? 0));
        if (visible[0]?.target?.id) setActiveLevelId(visible[0].target.id);
      },
      { root: null, threshold: [0.2, 0.35, 0.5] }
    );

    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

  const tags = useMemo(
    () => ["Karting", "Pilotage automobile", "Compétition", "Métiers du sport auto"],
    []
  );

  return (
    <main className="bg-slate-50 text-slate-900 font-sans leading-relaxed">
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
    <div className="lg:hidden bg-black/95 backdrop-blur border-t border-white/10">
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
      <section className="min-h-[80vh] flex items-center pt-40 px-6 bg-slate-100">
        <div className="max-w-5xl mx-auto text-center">
          {/* Left */}
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
              Stanley Racing Academy
            </p>
            <h1 className={cn("mt-4 text-5xl md:text-6xl font-semibold", H1, TITLE_GRADIENT)}>
              Formations & expériences
            </h1>
            <p className={cn("mt-8 text-lg text-slate-600 max-w-3xl mx-auto", LEAD)}>
              Le pilotage n’est pas un loisir. C’est une discipline. Nos parcours
              sont pensés pour transmettre la maîtrise — du premier tour de piste
              à la préparation professionnelle.
            </p>

            <div className="mt-9 flex flex-wrap gap-3 justify-center">
              {tags.map((t) => (
                <span
                  key={t}
                  className="inline-flex items-center rounded-full border border-slate-200 bg-white px-4 py-2 text-sm text-slate-700"
                >
                  {t}
                </span>
              ))}
            </div>

            <div className="mt-10 flex text-center flex-wrap gap-4 justify-center">
              <a
                href="/reserver"
                className="bg-orange-600 text-white px-8 py-3 rounded-full font-semibold hover:bg-orange-700 transition no-underline"
              >
                Réserver une session
              </a>
              <a
                href="#niveaux"
                className="bg-black text-white px-8 py-3 rounded-full font-semibold hover:border-slate-400 transition no-underline"
              >
                Comparer les niveaux
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* NIVEAUX NAV */}
      <section id="niveaux" className={cn(SECTION_Y, "px-6 bg-white")}>
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            <h2 className={cn(H2, TITLE_GRADIENT)}>
              Trois niveaux. Une progression claire.
            </h2>
            <p className={cn("mt-4 max-w-3xl mx-auto", LEAD)}>
              Comprenez le parcours en 10 secondes, puis plongez dans les détails.
            </p>
          </div>

          <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
            {LEVELS.map((l) => {
              const active = activeLevelId === l.id;
              return (
                <a
                  key={l.id}
                  href={`#${l.id}`}
                  className={cn(
                    "group relative rounded-2xl bg-slate-100 p-7 transition-all duration-300 no-underline",
                    "shadow-sm hover:shadow-lg hover:-translate-y-1",
                    active ? "ring-2 ring-orange-500/30" : "ring-1 ring-slate-200"
                  )}
                >
                  <div className="absolute inset-x-0 top-0 h-[4px] bg-gradient-to-r from-orange-700 to-slate-400 opacity-0 group-hover:opacity-100 transition" />
                  <p className="text-xs uppercase tracking-[0.22em] text-slate-500 font-semibold">
                    {l.badge}
                  </p>
                  <h3 className={cn("mt-2", H3, "text-slate-900")}>{l.title}</h3>
                  <p className={cn("mt-4", BODY)}>{l.promise}</p>
                  <div className="mt-6 flex flex-wrap gap-2">
                    <span className="rounded-full bg-white px-3 py-1.5 text-xs text-slate-700 ring-1 ring-slate-200">
                      {l.vehicles}
                    </span>
                    <span className="rounded-full bg-white px-3 py-1.5 text-xs text-slate-700 ring-1 ring-slate-200">
                      {l.priceFrom}
                    </span>
                  </div>
                </a>
              );
            })}
          </div>
        </div>
      </section>

      <Separator />

      {/* DETAILS: LEVELS */}
      {LEVELS.map((level, levelIdx) => (
        <section
          key={level.id}
          id={level.id}
          className={cn(
            SECTION_Y,
            "px-6",
            levelIdx % 2 === 0 ? "bg-slate-50" : "bg-white"
          )}
        >
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 gap-10 items-start">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">
                  {level.badge}
                </p>
                <h2 className={cn("mt-3", H2, TITLE_GRADIENT)}>{level.title}</h2>
                <p className={cn("mt-6 max-w-2xl", LEAD)}>{level.promise}</p>

                <div className="mt-6 flex flex-wrap gap-3">
                  <span className="inline-flex items-center rounded-full bg-white px-4 py-2 text-sm text-slate-700 ring-1 ring-slate-200">
                    Véhicules : {level.vehicles}
                  </span>
                  <span className="inline-flex items-center rounded-full bg-white px-4 py-2 text-sm text-slate-700 ring-1 ring-slate-200">
                    {level.priceFrom}
                  </span>
                </div>

                <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-6">
                  {level.offers.map((o) => (
                    <div
                      key={o.title}
                      className={cn(
                        "group relative rounded-2xl bg-white p-6 transition-all duration-300",
                        "shadow-sm hover:shadow-xl hover:-translate-y-1 ring-1 ring-slate-200"
                      )}
                    >
                      <div className="absolute inset-x-0 top-0 h-[4px] bg-gradient-to-r from-orange-700 to-orange-300 opacity-0 group-hover:opacity-100 transition" />

                      <div className="h-44 w-full rounded-xl overflow-hidden bg-slate-100">
                        <img
                          src={o.img}
                          alt={o.title}
                          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.04]"
                          loading="lazy"
                          draggable={false}
                        />
                      </div>

                      <div className="mt-5">
                        <div className="flex items-start justify-between gap-4">
                          <h3 className={cn(H3, "text-slate-900")}>{o.title}</h3>
                          <span className="shrink-0 rounded-full bg-orange-50 px-3 py-1.5 text-xs font-semibold text-orange-800 ring-1 ring-orange-100">
                            {o.price}
                          </span>
                        </div>

                        <p className={cn("mt-3", BODY)}>{o.tagline}</p>

                        <div className="mt-5 space-y-2">
                          <p className="text-sm text-slate-700">
                            <span className="font-semibold">Véhicules :</span> {o.vehicles}
                          </p>
                          <p className="text-sm text-slate-700">
                            <span className="font-semibold">Inclus :</span> {o.includes}
                          </p>
                        </div>

                        <div className="mt-6 flex flex-wrap gap-3">
                          <a
                            href="/reserver?product=performance-45&step=slots"
                            className="inline-flex items-center justify-center rounded-full bg-orange-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-orange-700 transition no-underline"
                          >
                            Réserver
                          </a>
                          <a
                            href="/contact"
                            className="inline-flex items-center justify-center rounded-full bg-black px-5 py-2.5 text-sm font-semibold text-white transition no-underline"
                          >
                            Nous contacter
                          </a>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>
      ))}

      <Separator />

      {/* MECHANIC */}
      <section id={MECH.id} className={cn(SECTION_Y, "px-6 bg-white")}>
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">
              {MECH.badge}
            </p>
            <h2 className={cn("mt-3", H2, TITLE_GRADIENT)}>{MECH.title}</h2>
            <p className={cn("mt-6", LEAD)}>{MECH.promise}</p>

            <div className="mt-6 flex flex-wrap gap-3">
              <span className="inline-flex items-center rounded-full bg-white px-4 py-2 text-sm text-slate-700 ring-1 ring-slate-200">
                Véhicules : {MECH.vehicles}
              </span>
              <span className="inline-flex items-center rounded-full bg-orange-50 px-3 py-1.5 text-xs font-semibold text-orange-800 ring-1 ring-orange-100">
                {MECH.price}
              </span>
            </div>

            <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
              {MECH.bullets.map((b) => (
                <div
                  key={b}
                  className="rounded-2xl bg-slate-50 p-5 shadow-sm ring-1 ring-slate-200"
                >
                  <p className="text-sm font-semibold text-slate-900">{b}</p>
                </div>
              ))}
            </div>

            <div className="mt-10 flex flex-wrap gap-4">
              <a
                href="/contact"
                className="bg-orange-600 text-white px-8 py-3 rounded-full font-semibold hover:bg-orange-700 transition no-underline"
              >
                Demander le programme
              </a>
              <a
                href="/reserver?product=performance-45&step=slots"
                className="bg-black text-white px-8 py-3 rounded-full font-semibold hover:border-slate-400 transition no-underline"
              >
                Réserver
              </a>
            </div>
          </div>

          <div className="flex justify-center lg:justify-end">
            <div className="relative w-full max-w-xl rounded-3xl overflow-hidden bg-white shadow-lg ring-1 ring-slate-200">
              <img
                src={MECH.image}
                alt={MECH.title}
                className="w-full h-[520px] object-cover"
                loading="lazy"
                draggable={false}
              />
            </div>
          </div>
        </div>
      </section>

      <Separator />

      {/* SAFETY */}
      <section className={cn(SECTION_Y, "px-6 bg-slate-100")}>
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            <h2 className={cn(H2, TITLE_GRADIENT)}>Sécurité, encadrement, standards</h2>
            <p className={cn("mt-4 max-w-3xl mx-auto", LEAD)}>
              La performance n’a de valeur que si elle est maîtrisée. Chaque session
              est encadrée, briefée et structurée.
            </p>
          </div>

          <div className="mt-12 grid grid-cols-1 md:grid-cols-4 gap-6">
            {[
              {
                t: "Encadrement certifié",
                d: "Briefings, coaching et supervision par des professionnels.",
              },
              {
                t: "Équipement fourni",
                d: "Casques et équipements adaptés selon l’activité.",
              },
              {
                t: "Véhicules préparés",
                d: "Parc contrôlé et configuré pour la sécurité et la pédagogie.",
              },
              {
                t: "Protocoles structurés",
                d: "Méthodes inspirées des standards internationaux.",
              },
            ].map((x) => (
              <div
                key={x.t}
                className="group relative rounded-b-2xl bg-white p-7 shadow-sm ring-1 ring-slate-200 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
              >
                <div className="absolute inset-x-0 top-0 h-[4px] bg-gradient-to-r from-orange-700 to-slate-400 opacity-0 group-hover:opacity-100 transition" />
                <p className="text-sm font-semibold text-slate-900">{x.t}</p>
                <p className={cn("mt-3", BODY)}>{x.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-6 bg-slate-900 text-white">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-3xl font-semibold">Prêt à passer à l’action ?</h2>
          <p className="mt-4 text-base md:text-lg text-slate-300">
            Vous ne repartirez pas comme vous êtes venu. Choisissez un niveau,
            réservez une session, et vivez l’expérience.
          </p>
          <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
            <a
              href="/reserver?product=performance-45&step=slots"
              className="bg-orange-600 text-white px-10 py-4 rounded-full font-semibold hover:bg-orange-700 transition no-underline"
            >
              Réserver une session
            </a>
            <a
              href="/contact"
              className="bg-white text-slate-900 px-10 py-4 rounded-full font-semibold hover:bg-slate-100 transition no-underline"
            >
              Nous contacter
            </a>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-black text-slate-400 text-center py-6 text-xs">
        © {new Date().getFullYear()} SL Automotive — Stanley Racing Academy
      </footer>
    </main>
  );
}





