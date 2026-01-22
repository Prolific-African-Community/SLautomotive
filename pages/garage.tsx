"use client";

import React, { useEffect, useState } from "react";

/* ------------------ Utils ------------------ */
type ClassValue = string | false | null | undefined;
const cn = (...c: ClassValue[]) => c.filter(Boolean).join(" ");

/* ------------------ Design tokens (aligned with Academy pages) ------------------ */
const TITLE_GRADIENT =
  "bg-gradient-to-r from-black via-orange-800 to-slate-400 bg-clip-text text-transparent";
const SECTION_Y = "py-16 md:py-20";

const H1 = "text-5xl md:text-6xl font-semibold tracking-tight leading-[1.1] pb-2"
const H2 = "text-3xl md:text-4xl font-semibold tracking-tight leading-[1.1] pb-2";
const H3 = "text-xl font-semibold leading-[1.1] pb-2";
const LEAD = "text-base md:text-lg text-slate-600 leading-relaxed";
const BODY = "text-base text-slate-600 leading-relaxed";

export default function GaragePage() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [step, setStep] = useState(1);
  const [intervention, setIntervention] = useState<string | null>(null);
  const [client, setClient] = useState({ firstName: "", lastName: "", email: "", phone: "" });

  const goToAssistant = () => {
    setStep(1);
    const el = document.getElementById("prise-en-charge");
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  };

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
        className="h-16 w-auto"
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
      <section className="min-h-[70vh] flex items-center pt-32 px-6 bg-slate-100">
        <div className="max-w-5xl mx-auto text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
            SL Automotive
          </p>
          <h1 className={cn("mt-4", H1, TITLE_GRADIENT)}>
            Garage & services automobiles
          </h1>
          <p className={cn("mt-8 max-w-3xl mx-auto", LEAD)}>
            Diagnostic, entretien et réparation. Une prise en charge structurée,
            transparente et professionnelle — comme dans un vrai atelier de
            référence.
          </p>
          <div className="mt-10 flex flex-wrap gap-4 justify-center">
            <button onClick={goToAssistant} className="bg-orange-600 text-white px-6 py-3 rounded-full font-semibold border-0 outline-none focus:outline-none focus:ring-0 appearance-none">Diagnostiquer mon véhicule</button>
            <button className="bg-black text-white px-6 py-3 rounded-full font-semibold border-0 outline-none focus:outline-none focus:ring-0 appearance-none">Prendre rendez-vous</button>
          </div>
        </div>
      </section>

      {/* ASSISTANT */}
      <section id="prise-en-charge" className={cn(SECTION_Y, "px-6 bg-white")}>
        <div className="max-w-5xl mx-auto">
          <h2 className={cn("text-center", H2, TITLE_GRADIENT)}>
            Prise en charge guidée
          </h2>
          <p className={cn("mt-4 text-center max-w-2xl mx-auto", LEAD)}>
            Dites-nous ce que vous conduisez et ce que vous ressentez. Un technicien
            s’occupe du reste.
          </p>

          <div className="mt-12 rounded-2xl bg-slate-50 p-8 ring-1 ring-slate-200">
            {step === 1 && (
              <div className="space-y-6">
                <h3 className={H3}>Votre véhicule</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <input className="input" placeholder="Marque" />
                  <input className="input" placeholder="Modèle" />
                  <input className="input" placeholder="Année" />
                  <input className="input" placeholder="Kilométrage" />
                </div>
                <button onClick={() => setStep(2)} className="bg-orange-600 text-white px-6 py-3 rounded-full font-semibold border-0 outline-none focus:outline-none focus:ring-0 appearance-none">
                  Continuer
                </button>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-6">
                <h3 className={H3}>Type d’intervention</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {["Diagnostic","Révision","Pneus & roues","Moteur","Freinage","Électronique"].map((item) => {
                    const selected = intervention === item;
                    return (
                      <button
                        key={item}
                        type="button"
                        onClick={() => setIntervention(item)}
                        className={cn(
                          "rounded-xl px-3 py-3 text-sm transition",
                          selected
                            ? "bg-orange-600 text-white border border-orange-600"
                            : "bg-white border border-slate-200 hover:border-orange-600"
                        )}
                      >
                        {item}
                      </button>
                    );
                  })}
                </div>
                <div className="flex items-center justify-between">
                  <button
                    onClick={() => setStep(1)}
                    className="bg-white text-slate-900 px-6 py-3 rounded-full font-semibold border border-slate-200 hover:border-slate-400 transition"
                  >
                    Précédent
                  </button>
                  <button
                    onClick={() => setStep(3)}
                    className="bg-orange-600 text-white px-6 py-3 rounded-full font-semibold border-0 outline-none focus:outline-none focus:ring-0 appearance-none"
                  >
                    Continuer
                  </button>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-6">
                <h3 className={H3}>Symptômes observés</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {["Voyant allumé","Bruit suspect","Perte de puissance","Vibrations","Démarrage difficile","Fumée"].map((item) => (
                    <label key={item} className="flex items-center gap-2 text-sm">
                      <input type="checkbox" />
                      <span>{item}</span>
                    </label>
                  ))}
                </div>
                <div className="flex items-center justify-between">
                  <button
                    onClick={() => setStep(2)}
                    className="bg-white text-slate-900 px-6 py-3 rounded-full font-semibold border border-slate-200 hover:border-slate-400 transition"
                  >
                    Précédent
                  </button>
                  <button
                    onClick={() => setStep(4)}
                    className="bg-orange-600 text-white px-6 py-3 rounded-full font-semibold border-0 outline-none focus:outline-none focus:ring-0 appearance-none"
                  >
                    Continuer
                  </button>
                </div>
              </div>
            )}

            {step === 4 && (
              <div className="space-y-6">
                <h3 className={H3}>Vos coordonnées</h3>
                <p className={BODY}>
                  Ces informations nous permettent de vous recontacter rapidement
                  avec un diagnostic clair et un devis précis.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <input
                    className="input"
                    placeholder="Prénom"
                    value={client.firstName}
                    onChange={(e) => setClient({ ...client, firstName: e.target.value })}
                  />
                  <input
                    className="input"
                    placeholder="Nom"
                    value={client.lastName}
                    onChange={(e) => setClient({ ...client, lastName: e.target.value })}
                  />
                  <input
                    className="input"
                    type="email"
                    placeholder="Email"
                    value={client.email}
                    onChange={(e) => setClient({ ...client, email: e.target.value })}
                  />
                  <input
                    className="input"
                    type="tel"
                    placeholder="Téléphone"
                    value={client.phone}
                    onChange={(e) => setClient({ ...client, phone: e.target.value })}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <button
                    onClick={() => setStep(3)}
                    className="bg-white text-slate-900 px-6 py-3 rounded-full font-semibold border border-slate-200 hover:border-slate-400 transition"
                  >
                    Précédent
                  </button>
                  <button
                    className="bg-orange-600 text-white px-6 py-3 rounded-full font-semibold border-0 outline-none focus:outline-none focus:ring-0 appearance-none"
                  >
                    Envoyer la demande
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* SERVICES */}
      <section className={cn(SECTION_Y, "px-6 bg-slate-50")}>
        <div className="max-w-7xl mx-auto">
          <h2 className={cn("text-center", H2, TITLE_GRADIENT)}>Nos services</h2>
          <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
            {[{ title: "Diagnostic", desc: "Analyse électronique et mécanique complète." },{ title: "Entretien", desc: "Révisions, vidanges, freins, climatisation." },{ title: "Pneus & roues", desc: "Montage, équilibrage, géométrie." },{ title: "Moteur", desc: "Embrayage, turbo, distribution." },{ title: "Électronique", desc: "Batterie, capteurs, calculateurs." },{ title: "Transmission", desc: "Boîte, cardans, différentiels." }].map((s) => (
              <div
                key={s.title}
                className="group relative rounded-2xl bg-white p-6 ring-1 ring-slate-200 shadow-sm transition-all hover:-translate-y-1 hover:shadow-xl"
              >
                <div className="absolute inset-x-0 top-0 h-[4px] bg-gradient-to-r from-orange-700 to-slate-400 opacity-0 group-hover:opacity-100 transition" />
                <h3 className={cn(H3, "mt-2")}>{s.title}</h3>
                <p className={cn("mt-3", BODY)}>{s.desc}</p>
              </div>
            ))}
          </div>

          <div className="mt-14 flex justify-center">
            <button onClick={goToAssistant} className="bg-orange-600 text-white px-6 py-3 rounded-full font-semibold border-0 outline-none focus:outline-none focus:ring-0 appearance-none">Lancer un diagnostic</button>
          </div>
        </div>
      </section>

      {/* PROCESS */}
      <section className={cn(SECTION_Y, "px-6 bg-white")}>
        <div className="max-w-5xl mx-auto text-center">
          <h2 className={cn(H2, TITLE_GRADIENT)}>Notre méthode</h2>
          <p className={cn("mt-4 max-w-2xl mx-auto", LEAD)}>
            Transparence totale. Aucune intervention sans validation préalable.
          </p>
          <div className="mt-12 grid grid-cols-1 md:grid-cols-5 gap-4">
            {["Analyse","Diagnostic","Devis","Validation","Intervention"].map((x) => (
              <div
                key={x}
                className="rounded-xl bg-slate-50 p-4 ring-1 ring-slate-200 font-semibold"
              >
                {x}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-6 bg-slate-900 text-white">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-3xl font-semibold">Besoin d’un avis technique ?</h2>
          <p className="mt-4 text-base md:text-lg text-slate-300">
            Un technicien vous explique clairement, sans jargon inutile.
          </p>
          <div className="mt-10 flex justify-center">
            <button onClick={goToAssistant} className="bg-orange-600 text-white px-6 py-3 rounded-full font-semibold border-0 outline-none focus:outline-none focus:ring-0 appearance-none">Lancer un diagnostic</button>
          </div>
        </div>
      </section>

      
    </main>
  );
}



