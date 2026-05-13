"use client";

import React, { useEffect, useState } from "react";

/* ------------------ Utils ------------------ */
type ClassValue = string | false | null | undefined;
const cn = (...c: ClassValue[]) => c.filter(Boolean).join(" ");

/* ------------------ Design tokens ------------------ */
const YELLOW = "text-yellow-300";
const SECTION_Y = "py-16 md:py-20";

const H1 =
  "text-5xl md:text-7xl font-black uppercase tracking-[-0.04em] leading-[0.95]";
const H2 =
  "text-3xl md:text-5xl font-black uppercase tracking-[-0.035em] leading-[1]";
const H3 = "text-xl md:text-2xl font-black uppercase tracking-[-0.02em] leading-[1]";
const LEAD = "text-base md:text-lg text-zinc-300 leading-relaxed";
const BODY = "text-sm md:text-base text-zinc-400 leading-relaxed";

const inputClass =
  "w-full rounded-none border border-zinc-700 bg-black px-4 py-3 text-sm text-white placeholder:text-zinc-500 outline-none focus:border-yellow-300";

const services = [
  {
    title: "Diagnostic",
    desc: "Lecture électronique, analyse des défauts et contrôle mécanique.",
  },
  {
    title: "Révision",
    desc: "Vidange, filtres, niveaux, contrôles essentiels et entretien périodique.",
  },
  {
    title: "Pneus & roues",
    desc: "Montage, équilibrage, permutation, pression et contrôle usure.",
  },
  {
    title: "Freinage",
    desc: "Plaquettes, disques, liquide de frein et contrôle sécurité.",
  },
  {
    title: "Moteur",
    desc: "Distribution, embrayage, turbo, fuites et perte de puissance.",
  },
  {
    title: "Électronique",
    desc: "Batterie, capteurs, calculateurs, voyants et défauts électriques.",
  },
];

const priceRows = [
  ["Diagnostic électronique", "à partir de 49 €"],
  ["Révision standard", "à partir de 89 €"],
  ["Montage pneu", "à partir de 19 €"],
  ["Équilibrage roue", "à partir de 12 €"],
  ["Contrôle freinage", "à partir de 29 €"],
];

export default function GaragePage() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [step, setStep] = useState(1);
  const [intervention, setIntervention] = useState<string | null>(null);
  const [client, setClient] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
  });

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
    <main className="min-h-screen bg-[#070707] text-white font-sans leading-relaxed">
      {/* HEADER */}
      <header
        className={cn(
          "fixed top-0 w-full z-50 transition-all",
          scrolled
            ? "bg-black/90 backdrop-blur border-b border-yellow-300/20"
            : "bg-transparent"
        )}
      >
        <nav className="max-w-7xl mx-auto px-5 md:px-6 py-2 flex justify-between items-center">
          <a href="/" className="flex items-center no-underline">
            <img
              src="/logo-sl-automotive2.png"
              alt="SL Automotive logo"
              className="h-24 md:h-24 w-auto"
            />
          </a>

          <div className="hidden lg:flex items-center gap-8 text-xs font-black uppercase tracking-[0.18em]">
            <a href="/dealer" className="text-white no-underline hover:text-yellow-300">
              véhicules disponibles
            </a>
            
            <a href="#services" className="text-white no-underline hover:text-yellow-300">
              Services
            </a>
            <a href="#prix" className="text-white no-underline hover:text-yellow-300">
              Prix
            </a>
          </div>

          <a
            href="#contact"
            className="hidden lg:inline-flex no-underline bg-yellow-300 text-black px-6 py-3 text-xs font-black uppercase tracking-wide hover:bg-white transition"
          >
            Contact
          </a>

          <button
            type="button"
            onClick={() => setMenuOpen((v) => !v)}
            className="lg:hidden inline-flex items-center justify-center border border-zinc-700 p-2 text-white hover:border-yellow-300 transition"
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

        {menuOpen && (
          <div className="lg:hidden bg-black border-t border-zinc-800">
            <div className="px-6 py-6 flex flex-col gap-5 text-sm font-black uppercase tracking-wide">
              {[
                { label: "L'Académie", href: "/academy" },
                { label: "Formations", href: "/formations" },
                { label: "Investisseurs", href: "/investor" },
                { label: "Infrastructure", href: "/infrastructure" },
                { label: "Dealer", href: "/dealer" },
                { label: "Garage", href: "/garage" },
                { label: "Services", href: "#services" },
                { label: "Prix", href: "#prix" },
              ].map(({ label, href }) => (
                <a
                  key={label}
                  href={href}
                  onClick={() => setMenuOpen(false)}
                  className="text-white no-underline hover:text-yellow-300 transition"
                >
                  {label}
                </a>
              ))}

              <a
                href="#contact"
                onClick={() => setMenuOpen(false)}
                className="mt-4 inline-flex justify-center bg-yellow-300 px-6 py-3 text-black font-black no-underline"
              >
                Contact
              </a>
            </div>
          </div>
        )}
      </header>

      {/* HERO */}
      <section className="relative overflow-hidden min-h-screen flex items-center pt-28 px-5 md:px-6 bg-black">
        <div className="absolute inset-0 opacity-[0.08] bg-[linear-gradient(135deg,#fde047_0_10%,transparent_10%_20%,#fde047_20%_30%,transparent_30%_100%)] bg-[length:90px_90px]" />

        <div className="relative max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-[1.05fr_0.95fr] gap-10 items-center">
          <div>
            <div className="inline-flex items-center gap-3 border border-yellow-300/40 bg-yellow-300/10 px-4 py-2">
              <span className="h-2 w-2 bg-yellow-300" />
              <span className="text-xs font-black uppercase tracking-[0.22em] text-yellow-300">
                SL Automotive Garage
              </span>
            </div>

            <h1 className={cn("mt-7", H1)}>
              Detail & precision
              <br />
              <span className={YELLOW}>car service</span>
            </h1>

            <p className={cn("mt-7 max-w-2xl", LEAD)}>
              Diagnostic, entretien, pneus, freinage et réparation. Une prise en
              charge claire, rapide et structurée — sans mauvaise surprise.
            </p>

            <div className="mt-10 flex flex-wrap gap-4">
              <button
                onClick={goToAssistant}
                className="bg-yellow-300 text-black px-7 py-4 text-sm font-black uppercase tracking-wide border-0 hover:bg-white transition"
              >
                Diagnostiquer mon véhicule
              </button>

              <a
                href="#prix"
                className="inline-flex items-center bg-white text-black px-7 py-4 text-sm font-black uppercase tracking-wide no-underline hover:bg-yellow-300 transition"
              >
                Voir les prix
              </a>
            </div>

            <div className="mt-10 grid grid-cols-3 max-w-xl border border-zinc-800">
              {[
                ["24h", "Réponse rapide"],
                ["100%", "Devis validé"],
                ["Pro", "Méthode atelier"],
              ].map(([value, label]) => (
                <div key={label} className="p-4 border-r last:border-r-0 border-zinc-800">
                  <p className="text-2xl font-black text-yellow-300">{value}</p>
                  <p className="mt-1 text-xs uppercase tracking-wide text-zinc-500">{label}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="relative">
            <div className="absolute -inset-4 bg-yellow-300" />
            <div className="relative bg-zinc-950 border border-zinc-800 p-4 md:p-6">
              <div className="h-10 bg-yellow-300 mb-4 flex items-center px-4">
                <div className="flex gap-2">
                  <span className="h-3 w-10 bg-black skew-x-[-25deg]" />
                  <span className="h-3 w-10 bg-black skew-x-[-25deg]" />
                  <span className="h-3 w-10 bg-black skew-x-[-25deg]" />
                </div>
              </div>

              <div className="aspect-[4/3] bg-zinc-900 overflow-hidden">
                <img
                  src="/hero-sl-automotive.png"
                  alt="Garage automobile SL Automotive"
                  className="h-full w-full object-cover opacity-90"
                />
              </div>

              <div className="mt-4 grid grid-cols-2 gap-4">
                <div className="bg-black border border-zinc-800 p-4">
                  <p className="text-xs uppercase tracking-[0.18em] text-zinc-500">
                    Intervention
                  </p>
                  <p className="mt-2 text-lg font-black text-white">Diagnostic complet</p>
                </div>

                <div className="bg-yellow-300 p-4 text-black">
                  <p className="text-xs uppercase tracking-[0.18em]">
                    À partir de
                  </p>
                  <p className="mt-2 text-3xl font-black">49 €</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* INTRO SPLIT */}
      <section className={cn(SECTION_Y, "px-5 md:px-6 bg-white text-black")}>
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-[0.9fr_1.1fr] gap-10 items-center">
          <div className="bg-black p-4">
            <div className="h-8 bg-yellow-300 mb-4 flex items-center px-3">
              <span className="h-3 w-28 bg-black skew-x-[-25deg]" />
            </div>
            <img
              src="/pourquoi-sl.png"
              alt="Détail mécanique"
              className="w-full aspect-[4/3] object-cover grayscale"
            />
          </div>

          <div>
            <p className="text-xs font-black uppercase tracking-[0.22em] text-zinc-500">
              Pourquoi nous choisir
            </p>
            <h2 className={cn("mt-4", H2)}>
              Nous résolvons rapidement les problèmes de votre voiture
            </h2>
            <p className="mt-6 text-base md:text-lg text-zinc-700 leading-relaxed max-w-2xl">
              Notre objectif est simple : comprendre le problème, expliquer les
              options, chiffrer correctement, puis intervenir uniquement après
              votre validation.
            </p>

<div className="mt-10 grid grid-cols-1 md:grid-cols-2 gap-4">
  {[
    {
      title: "Intervention validée",
      desc: "Aucune réparation lancée sans votre accord.",
      icon: "✓",
    },
    {
      title: "Diagnostic clair",
      desc: "Un problème identifié, expliqué et chiffré.",
      icon: "⌕",
    },
    {
      title: "Méthode structurée",
      desc: "Analyse, devis, validation, intervention.",
      icon: "→",
    },
    {
      title: "Suivi professionnel",
      desc: "Une prise en charge sérieuse et propre.",
      icon: "⚙",
    },
  ].map((item) => (
    <div
      key={item.title}
      className="group flex items-start gap-4 rounded-xl border border-zinc-200 bg-white px-5 py-4 shadow-[0_8px_30px_rgba(0,0,0,0.04)] transition hover:border-yellow-300 hover:shadow-[0_12px_40px_rgba(0,0,0,0.08)]"
    >
      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-zinc-100 text-lg font-black text-black transition group-hover:bg-yellow-300">
        {item.icon}
      </div>

      <div>
        <h3 className="text-base font-black leading-tight tracking-[-0.01em] text-black">
          {item.title}
        </h3>

        <p className="mt-1.5 text-sm leading-relaxed text-zinc-600">
          {item.desc}
        </p>
      </div>
    </div>
  ))}
</div>

          </div>
        </div>
      </section>

      {/* ASSISTANT */}
      <section id="prise-en-charge" className={cn(SECTION_Y, "px-5 md:px-6 bg-[#0b0b0b]")}>
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-[0.8fr_1.2fr] gap-8">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.22em] text-yellow-300">
                Prise en charge guidée
              </p>
              <h2 className={cn("mt-4", H2)}>
                Décrivez le problème.
                <br />
                <span className="text-yellow-300">On structure la demande.</span>
              </h2>
              <p className={cn("mt-6", LEAD)}>
                Remplissez les informations essentielles. L’objectif est de préparer
                une demande claire pour gagner du temps au garage.
              </p>

              <div className="mt-8 border border-zinc-800 bg-black p-5">
                <p className="text-xs uppercase tracking-[0.2em] text-zinc-500">
                  Étape actuelle
                </p>
                <p className="mt-2 text-4xl font-black text-yellow-300">0{step}/04</p>
              </div>
            </div>

            <div className="border border-zinc-800 bg-black p-5 md:p-8 relative">
              <div className="absolute top-0 left-0 right-0 h-3 bg-yellow-300">
                <div className="h-full w-40 bg-black skew-x-[-25deg]" />
              </div>

              {step === 1 && (
                <div className="space-y-6 pt-4">
                  <h3 className={H3}>Votre véhicule</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <input className={inputClass} placeholder="Marque" />
                    <input className={inputClass} placeholder="Modèle" />
                    <input className={inputClass} placeholder="Année" />
                    <input className={inputClass} placeholder="Kilométrage" />
                  </div>
                  <button
                    onClick={() => setStep(2)}
                    className="bg-yellow-300 text-black px-6 py-3 text-sm font-black uppercase border-0 hover:bg-white transition"
                  >
                    Continuer
                  </button>
                </div>
              )}

              {step === 2 && (
                <div className="space-y-6 pt-4">
                  <h3 className={H3}>Type d’intervention</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {["Diagnostic", "Révision", "Pneus & roues", "Moteur", "Freinage", "Électronique"].map(
                      (item) => {
                        const selected = intervention === item;
                        return (
                          <button
                            key={item}
                            type="button"
                            onClick={() => setIntervention(item)}
                            className={cn(
                              "px-3 py-4 text-xs md:text-sm font-black uppercase transition border",
                              selected
                                ? "bg-yellow-300 text-black border-yellow-300"
                                : "bg-zinc-950 text-white border-zinc-800 hover:border-yellow-300"
                            )}
                          >
                            {item}
                          </button>
                        );
                      }
                    )}
                  </div>

                  <div className="flex items-center justify-between gap-4">
                    <button
                      onClick={() => setStep(1)}
                      className="bg-transparent text-white px-6 py-3 text-sm font-black uppercase border border-zinc-700 hover:border-white transition"
                    >
                      Précédent
                    </button>
                    <button
                      onClick={() => setStep(3)}
                      className="bg-yellow-300 text-black px-6 py-3 text-sm font-black uppercase border-0 hover:bg-white transition"
                    >
                      Continuer
                    </button>
                  </div>
                </div>
              )}

              {step === 3 && (
                <div className="space-y-6 pt-4">
                  <h3 className={H3}>Symptômes observés</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {[
                      "Voyant allumé",
                      "Bruit suspect",
                      "Perte de puissance",
                      "Vibrations",
                      "Démarrage difficile",
                      "Fumée",
                    ].map((item) => (
                      <label
                        key={item}
                        className="flex items-center gap-3 border border-zinc-800 bg-zinc-950 p-4 text-sm font-semibold"
                      >
                        <input type="checkbox" className="accent-yellow-300" />
                        <span>{item}</span>
                      </label>
                    ))}
                  </div>

                  <div className="flex items-center justify-between gap-4">
                    <button
                      onClick={() => setStep(2)}
                      className="bg-transparent text-white px-6 py-3 text-sm font-black uppercase border border-zinc-700 hover:border-white transition"
                    >
                      Précédent
                    </button>
                    <button
                      onClick={() => setStep(4)}
                      className="bg-yellow-300 text-black px-6 py-3 text-sm font-black uppercase border-0 hover:bg-white transition"
                    >
                      Continuer
                    </button>
                  </div>
                </div>
              )}

              {step === 4 && (
                <div className="space-y-6 pt-4">
                  <h3 className={H3}>Vos coordonnées</h3>
                  <p className={BODY}>
                    Ces informations nous permettent de vous recontacter avec un
                    diagnostic clair et un devis précis.
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <input
                      className={inputClass}
                      placeholder="Prénom"
                      value={client.firstName}
                      onChange={(e) =>
                        setClient({ ...client, firstName: e.target.value })
                      }
                    />
                    <input
                      className={inputClass}
                      placeholder="Nom"
                      value={client.lastName}
                      onChange={(e) =>
                        setClient({ ...client, lastName: e.target.value })
                      }
                    />
                    <input
                      className={inputClass}
                      type="email"
                      placeholder="Email"
                      value={client.email}
                      onChange={(e) =>
                        setClient({ ...client, email: e.target.value })
                      }
                    />
                    <input
                      className={inputClass}
                      type="tel"
                      placeholder="Téléphone"
                      value={client.phone}
                      onChange={(e) =>
                        setClient({ ...client, phone: e.target.value })
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between gap-4">
                    <button
                      onClick={() => setStep(3)}
                      className="bg-transparent text-white px-6 py-3 text-sm font-black uppercase border border-zinc-700 hover:border-white transition"
                    >
                      Précédent
                    </button>
                    <button className="bg-yellow-300 text-black px-6 py-3 text-sm font-black uppercase border-0 hover:bg-white transition">
                      Envoyer la demande
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* SERVICES */}
      <section id="services" className={cn(SECTION_Y, "px-5 md:px-6 bg-white text-black")}>
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.22em] text-zinc-500">
                Services atelier
              </p>
              <h2 className={cn("mt-4", H2)}>Tout ce dont votre voiture a besoin</h2>
            </div>

            <button
              onClick={goToAssistant}
              className="bg-black text-white px-6 py-4 text-sm font-black uppercase border-0 hover:bg-yellow-300 hover:text-black transition"
            >
              Lancer un diagnostic
            </button>
          </div>

          <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-5">
            {services.map((s, index) => (
              <div
                key={s.title}
                className={cn(
                  "group relative overflow-hidden border border-zinc-200 p-6 min-h-[220px] transition hover:-translate-y-1",
                  index === 1 || index === 4
                    ? "bg-yellow-300 text-black"
                    : "bg-black text-white"
                )}
              >
                <div className="absolute top-0 left-0 h-3 w-32 bg-yellow-300 group-hover:w-full transition-all" />
                <p
                  className={cn(
                    "text-xs font-black uppercase tracking-[0.2em]",
                    index === 1 || index === 4 ? "text-black/50" : "text-zinc-500"
                  )}
                >
                  0{index + 1}
                </p>
                <h3 className={cn("mt-8", H3)}>{s.title}</h3>
                <p
                  className={cn(
                    "mt-4 text-sm leading-relaxed",
                    index === 1 || index === 4 ? "text-black/70" : "text-zinc-400"
                  )}
                >
                  {s.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* WARRANTY / METHOD */}
      <section className={cn(SECTION_Y, "px-5 md:px-6 bg-[#0b0b0b]")}>
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-[1.1fr_0.9fr] gap-8 items-stretch">
          <div className="bg-black border border-zinc-800 p-8 md:p-10">
            <p className="text-xs font-black uppercase tracking-[0.22em] text-yellow-300">
              Méthode SL autmotive 
            </p>
            <h2 className={cn("mt-4", H2)}>
              Une intervention claire,
              <br />
              sans improvisation.
            </h2>

        <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
  {[
    {
      step: "01",
      title: "Analyse",
      desc: "Premier contrôle du problème.",
    },
    {
      step: "02",
      title: "Diagnostic",
      desc: "Identification de la cause.",
    },
    {
      step: "03",
      title: "Devis",
      desc: "Chiffrage clair avant action.",
    },
    {
      step: "04",
      title: "Validation",
      desc: "Accord client obligatoire.",
    },
    {
      step: "05",
      title: "Intervention",
      desc: "Réparation ou entretien.",
    },
  ].map((item) => (
    <div
      key={item.title}
      className="flex flex-col items-center text-center border border-zinc-800 bg-zinc-950 px-4 py-2 transition hover:border-yellow-300"
    >
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-yellow-300 text-sm font-black text-black">
        {item.step}
      </div>

      <h3 className="mt-5 text-xs font-black uppercase tracking-[0.12em] text-white">
        {item.title}
      </h3>

      <p className="mt-1 max-w-[140px] text-sm leading-relaxed text-zinc-500">
        {item.desc}
      </p>
    </div>
  ))}
</div>

            <p className={cn("mt-3", BODY)}>
              Aucune réparation lourde n’est lancée sans explication, validation et
              estimation préalable. Le but est de supprimer le flou habituel entre
              client et atelier.
            </p>
          </div>

          <div className="bg-yellow-300 text-black p-8 md:p-10 flex flex-col justify-between">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.22em] text-black/60">
                Engagement
              </p>
              <h3 className="mt-4 text-4xl md:text-5xl font-black uppercase tracking-[-0.04em] leading-none">
                Garantie sur le travail
              </h3>
              <p className="mt-6 text-base font-semibold leading-relaxed text-black/70">
                Nous privilégions les interventions utiles, documentées et cohérentes
                avec l’état réel du véhicule.
              </p>
            </div>

            <div className="mt-10 bg-black text-white p-6">
              <p className="text-3xl font-black text-yellow-300">30 jours</p>
              <p className="mt-2 text-sm text-zinc-400">
                Suivi après intervention selon le type de prestation réalisée.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CORPORATE OFFER */}
      <section className="px-5 md:px-6 py-16 bg-white text-black">
        <div className="max-w-7xl mx-auto">
          <div className="relative overflow-hidden bg-black text-white p-8 md:p-10 min-h-[360px] flex items-end">
            <img
              src="/garage-fleet.jpg"
              alt="Flotte automobile entreprise"
              className="absolute inset-0 h-full w-full object-cover opacity-45"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-black via-black/80 to-transparent" />

            <div className="relative max-w-2xl">
              <p className="text-xs font-black uppercase tracking-[0.22em] text-yellow-300">
                Offre entreprise
              </p>
              <h2 className={cn("mt-4", H2)}>
                Maintenance pour flottes et clients corporate
              </h2>
              <p className="mt-5 text-zinc-300 leading-relaxed">
                Conditions spécifiques pour sociétés, taxis, véhicules utilitaires,
                flottes commerciales et partenaires réguliers.
              </p>

              <div className="mt-8 inline-flex bg-yellow-300 text-black px-6 py-4">
                <span className="text-4xl font-black">-20%</span>
                <span className="ml-3 text-sm font-black uppercase leading-tight">
                  sur certaines
                  <br />
                  prestations récurrentes
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

{/* PRICES */}
<section id="prix" className="px-5 md:px-6 py-16 md:py-20 bg-white text-black">
  <div className="max-w-7xl mx-auto">
    <div className="grid grid-cols-1 lg:grid-cols-[0.85fr_1.15fr] gap-10 lg:gap-16 items-start">
      <div className="lg:sticky lg:top-28">
        <div className="inline-flex items-center gap-3">
          <span className="h-2.5 w-2.5 bg-yellow-300" />
          <p className="text-xs font-black uppercase tracking-[0.22em] text-zinc-500">
            Prix indicatifs
          </p>
        </div>

        <h2 className={cn("mt-4 max-w-xl", H2)}>Tarifs de départ</h2>

        <p className="mt-5 max-w-md text-base leading-relaxed text-zinc-600">
          Les prix exacts dépendent du véhicule, des pièces nécessaires, du temps
          d’intervention et du diagnostic réel.
        </p>

        <div className="mt-8 inline-flex bg-black px-5 py-4 text-white">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.18em] text-yellow-300">
              Devis avant intervention
            </p>
            <p className="mt-1 text-sm text-zinc-400">
              Aucun travail lancé sans validation.
            </p>
          </div>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-[0_16px_50px_rgba(0,0,0,0.06)]">
        <div className="grid grid-cols-[1fr_auto] bg-black px-5 py-4 text-white">
          <p className="text-xs font-black uppercase tracking-[0.18em] text-yellow-300">
            Service
          </p>
          <p className="text-xs font-black uppercase tracking-[0.18em] text-yellow-300">
            Prix
          </p>
        </div>

        {priceRows.map(([label, price], index) => (
          <div
            key={label}
            className="group grid grid-cols-1 sm:grid-cols-[1fr_auto] gap-2 sm:gap-6 border-b border-zinc-100 px-5 py-5 last:border-b-0 transition hover:bg-zinc-50"
          >
            <div className="flex items-start gap-4">
              <span className="mt-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-zinc-100 text-[11px] font-black text-black group-hover:bg-yellow-300 transition">
                {String(index + 1).padStart(2, "0")}
              </span>

              <div>
                <p className="text-base font-black text-black">{label}</p>
                <p className="mt-1 text-sm text-zinc-500">
                  Tarif indicatif selon véhicule et disponibilité.
                </p>
              </div>
            </div>

            <div className="sm:text-right">
              <p className="inline-flex bg-yellow-300 px-4 py-2 text-sm font-black text-black">
                {price}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>
</section>

      {/* CONTACT CTA */}
      <section id="contact" className="px-5 md:px-6 py-20 bg-black text-white">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-[1fr_420px] gap-8">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.22em] text-yellow-300">
              Contact
            </p>
            <h2 className={cn("mt-4", H2)}>
              Besoin d’un avis technique ?
            </h2>
            <p className={cn("mt-6 max-w-2xl", LEAD)}>
              Envoyez votre demande. Nous vous recontactons avec une réponse claire,
              sans jargon inutile.
            </p>

            <div className="mt-10 grid grid-cols-1 md:grid-cols-2 gap-4 max-w-3xl">
              <div className="border border-zinc-800 p-5">
                <p className="text-xs uppercase tracking-[0.2em] text-zinc-500">Téléphone</p>
                <p className="mt-2 font-black text-yellow-300">+352 691 280 494</p>
              </div>
              <div className="border border-zinc-800 p-5">
                <p className="text-xs uppercase tracking-[0.2em] text-zinc-500">Adresse</p>
                <p className="mt-2 font-black">Luxembourg / Grande Région</p>
              </div>
            </div>
          </div>

          <div className="border border-zinc-800 bg-zinc-950 p-6">
            <h3 className="text-2xl font-black uppercase text-yellow-300">
              Faire une demande
            </h3>
            <div className="mt-6 space-y-4">
              <input className={inputClass} placeholder="Nom complet" />
              <input className={inputClass} placeholder="Téléphone" />
              <textarea
                className={cn(inputClass, "min-h-[120px] resize-none")}
                placeholder="Votre problème"
              />
              <button
                onClick={goToAssistant}
                className="w-full bg-yellow-300 text-black px-6 py-4 text-sm font-black uppercase border-0 hover:bg-white transition"
              >
                Lancer la prise en charge
              </button>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
