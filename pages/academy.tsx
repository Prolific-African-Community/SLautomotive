"use client";

import { useEffect, useState } from "react";

/* ------------------ Utils ------------------ */
type ClassValue = string | false | null | undefined;
const cn = (...c: ClassValue[]) => c.filter(Boolean).join(" ");

/* ------------------ Design tokens ------------------ */
const TITLE_GRADIENT =
  "bg-gradient-to-r from-black via-orange-800 to-slate-400 bg-clip-text text-transparent";
const SECTION_Y = "py-28";

export default function AcademyPage() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <main className="bg-slate-50 text-slate-900">
         {/* HEADER */}
<header
  className={cn(
    "fixed top-0 w-full z-50 transition-all",
    scrolled
      ? "bg-white/90 backdrop-blur border-b border-white/80"
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
      className="lg:hidden inline-flex items-center justify-center rounded-md p-2 text-slate-200 hover:bg-white/80 transition"
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
    <div className="lg:hidden bg-white backdrop-blur border-t border-white">
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
      <section className="min-h-[70vh] flex items-center pt-40 px-6">
        <div className="max-w-5xl mx-auto text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
            Stanley Racing Academy
          </p>
          <h1 className={cn("mt-4 text-5xl md:text-6xl font-semibold", TITLE_GRADIENT)}>
            L’Académie
          </h1>
          <p className="mt-8 text-lg text-slate-600 max-w-3xl mx-auto">
            Une institution dédiée à la formation, à la transmission et à la structuration du sport automobile en Afrique de l’Ouest, selon des standards internationaux.
          </p>
        </div>
      </section>

      {/* VISION & MISSION */}
      <section className={cn(SECTION_Y, "px-6 bg-white")}>
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-12 items-start">
          <div>
            <h2 className={cn("text-3xl font-semibold", TITLE_GRADIENT)}>Vision</h2>
            <p className="mt-6 text-slate-600 text-lg">
              Faire de Stanley Racing Academy le hub de référence du sport automobile en Afrique de l’Ouest, capable de former des pilotes, des encadrants et des professionnels selon des standards reconnus à l’international.
            </p>
          </div>
          <div>
            <h2 className={cn("text-3xl font-semibold", TITLE_GRADIENT)}>Mission</h2>
            <p className="mt-6 text-slate-600 text-lg">
              Structurer des parcours de formation progressifs, accessibles et exigeants, alliant sécurité, performance, pédagogie moderne et transmission d’une culture du sport automobile durable.
            </p>
          </div>
        </div>
      </section>

      {/* VALUES */}
      <section className={cn(SECTION_Y, "px-6 bg-slate-50")}>
        <div className="max-w-7xl mx-auto">
          <h2 className={cn("text-3xl md:text-4xl font-semibold text-center mb-16", TITLE_GRADIENT)}>
            Nos valeurs
          </h2>
          <div className="grid md:grid-cols-4 gap-8">
            {["Sécurité", "Excellence", "Passion", "Transmission"].map((v) => (
              <div key={v} className="group relative bg-white rounded-2xl p-8 shadow-sm text-center transition-all duration-300 hover:-translate-y-2 hover:shadow-xl">
                <span className="absolute inset-x-0 top-0 h-[3px] bg-gradient-to-r from-orange-600 to-slate-400 opacity-0 group-hover:opacity-100 transition" />
                <h3 className="text-xl font-bold mb-4 transition-colors duration-300 group-hover:text-orange-600">{v}</h3>
                <p className="text-slate-600 text-sm">
                  {v === "Sécurité" && "Priorité absolue à la protection des pilotes, des équipes et du public."}
                  {v === "Excellence" && "Standards techniques et pédagogiques inspirés des meilleures pratiques internationales."}
                  {v === "Passion" && "Transmettre l’amour du pilotage et du sport automobile à tous les niveaux."}
                  {v === "Transmission" && "Former durablement et créer une filière locale de compétences."}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

            {/* MODELE ACADEMIQUE */}
      <section className={cn(SECTION_Y, "px-6 bg-white")}>
        <div className="max-w-7xl mx-auto">
          <h2 className={cn("text-3xl md:text-4xl font-semibold mb-12", TITLE_GRADIENT)}>
            Notre modèle académique
          </h2>
          <div className="grid md:grid-cols-4 gap-8">
            {["Progression structurée", "Séparation loisir / performance", "Standards européens adaptés", "Encadrement certifié"].map((t) => (
              <div key={t} className="group relative bg-slate-50 rounded-2xl p-8 transition-all duration-300 hover:-translate-y-2 hover:shadow-lg">
                <span className="absolute left-0 top-0 h-full w-[3px] bg-gradient-to-b from-orange-600 to-slate-400 opacity-0 group-hover:opacity-100 transition" />
                <h3 className="text-lg font-bold mb-3 group-hover:text-orange-600 transition">{t}</h3>
                <p className="text-slate-600 text-sm">
                  {t === "Progression structurée" && "Un parcours clair du premier contact avec le pilotage jusqu’à la préparation professionnelle."}
                  {t === "Séparation loisir / performance" && "Des programmes distincts pour le loisir, le perfectionnement et la compétition."}
                  {t === "Standards européens adaptés" && "Méthodologies inspirées des circuits européens, adaptées au contexte africain."}
                  {t === "Encadrement certifié" && "Supervision par des professionnels formés sur des circuits internationaux."}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PUBLICS */}
      <section className={cn(SECTION_Y, "px-6 bg-slate-50")}>
        <div className="max-w-6xl mx-auto text-center">
          <h2 className={cn("text-3xl md:text-4xl font-semibold mb-12", TITLE_GRADIENT)}>
            À qui s’adresse l’Académie ?
          </h2>
          <div className="grid md:grid-cols-3 gap-10">
            {["Jeunes pilotes & particuliers", "Passionnés & amateurs confirmés", "Entreprises & institutions"].map((p) => (
              <div key={p} className="group relative bg-white rounded-2xl p-8 shadow-sm transition-all duration-300 hover:-translate-y-2 hover:shadow-lg">
                <span className="absolute inset-x-0 top-0 h-[3px] bg-gradient-to-r from-orange-600 to-slate-400 opacity-0 group-hover:opacity-100 transition" />
                <h3 className="text-xl font-bold mb-4">{p}</h3>
                <p className="text-slate-600 text-sm">
                  {p === "Jeunes pilotes & particuliers" && "Initiation, découverte et accompagnement des talents dès les premiers niveaux."}
                  {p === "Passionnés & amateurs confirmés" && "Perfectionnement, stages avancés et préparation à la compétition amateur."}
                  {p === "Entreprises & institutions" && "Programmes dédiés au team building, à la formation et aux événements professionnels."}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SECURITE */}
      <section className={cn(SECTION_Y, "px-6 bg-white")}>
        <div className="max-w-5xl mx-auto">
          <h2 className={cn("text-3xl md:text-4xl font-semibold mb-8", TITLE_GRADIENT)}>
            Sécurité & standards
          </h2>
          <p className="text-slate-600 text-lg">
            La sécurité est au cœur de notre approche. Chaque programme est conçu selon des protocoles stricts, un encadrement qualifié et des équipements adaptés, inspirés des standards internationaux du sport automobile.
          </p>
        </div>
      </section>

      {/* VISION LONG TERME */}
      <section className={cn(SECTION_Y, "px-6 bg-slate-50")}>
        <div className="max-w-5xl mx-auto text-center">
          <h2 className={cn("text-3xl md:text-4xl font-semibold mb-8", TITLE_GRADIENT)}>
            Vision long terme
          </h2>
          <p className="text-slate-600 text-lg">
            Stanley Racing Academy est conçue comme une plateforme scalable, avec une montée en gamme progressive, un développement régional en Afrique de l’Ouest et des partenariats internationaux pour structurer durablement l’écosystème du sport automobile.
          </p>
        </div>
      </section>

      {/* CTA */}
      <section className="py-28 px-6 bg-slate-900 text-white">
        <div className="max-w-xl mx-auto text-center">
          <h2 className="text-3xl font-semibold mb-6">Découvrir nos formations</h2>
          <p className="text-slate-300 mb-10">
            Du premier tour de piste à la préparation professionnelle, découvrez nos parcours de formation.
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




