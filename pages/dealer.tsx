"use client";

import React, { useEffect, useMemo, useState } from "react";

/* ------------------ Utils ------------------ */
type ClassValue = string | false | null | undefined;
const cn = (...c: ClassValue[]) => c.filter(Boolean).join(" ");

type Vehicle = {
  stockId: string;
  marque: string;
  modele: string;
  finition?: string;
  annee: number;
  km: number;
  price: number | null;
  image: string;
  boite: string;
  carburant: string;
  puissance: string;
  transmission: string;
  provenance: string;
  entretien: string;
  vinMasked: string;
  options: string[];
  description: string;
  couleur?: string;
};

/* ------------------ Design tokens ------------------ */
const H1 =
  "text-5xl md:text-7xl font-black uppercase tracking-[-0.045em] leading-[0.95]";
const H2 =
  "text-3xl md:text-5xl font-black uppercase tracking-[-0.035em] leading-[1]";
const H3 =
  "text-xl md:text-2xl font-black uppercase tracking-[-0.02em] leading-[1.05]";
const LEAD = "text-base md:text-lg text-zinc-300 leading-relaxed";
const BODY = "text-sm md:text-base text-zinc-400 leading-relaxed";

export default function Dealer() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [selectedCar, setSelectedCar] = useState<Vehicle | null>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const vehicles: Vehicle[] = useMemo(
    () => [
      {
        stockId: "SLA-0001",
        marque: "Audi",
        modele: "S5 Sportback",
        finition: "Quattro",
        annee: 2019,
        km: 62000,
        price: 38900,
        image: "/audi-s5.jpg",
        boite: "Automatique",
        carburant: "Essence",
        puissance: "354 ch (260 kW)",
        transmission: "Quattro",
        provenance: "DE",
        entretien: "Concession Audi",
        vinMasked: "WAUZZZ…1234",
        options: ["Matrix LED", "Virtual Cockpit", "Sièges sport chauffants", "Toit pano"],
        description:
          "Fin de leasing 🇩🇪, historique constructeur complet, contrôle 150 points. Dossier transparent et prêt à être transmis.",
      },
      {
        stockId: "SLA-0002",
        marque: "BMW",
        modele: "330i",
        finition: "M Sport",
        annee: 2020,
        km: 48000,
        price: 32900,
        image: "/bmw-330i.jpg",
        boite: "Automatique",
        carburant: "Essence",
        puissance: "258 ch (190 kW)",
        transmission: "Propulsion",
        provenance: "LU",
        entretien: "BMW Luxembourg",
        vinMasked: "WBA…5678",
        options: ["Driving Assistant", "Live Cockpit Pro", "Shadowline", "Harman/Kardon"],
        description:
          "Première main, suivi constructeur, fin de leasing. Rapport d’état détaillé disponible sur demande.",
      },
      {
        stockId: "SLA-0003",
        marque: "Mercedes-Benz",
        modele: "C220d",
        finition: "AMG Line",
        annee: 2018,
        km: 89000,
        price: null,
        image: "/mb-c220d.jpg",
        boite: "Manuelle",
        carburant: "Diesel",
        puissance: "170 ch (125 kW)",
        transmission: "Propulsion",
        provenance: "DE",
        entretien: "Mercedes-Benz",
        vinMasked: "WDD…9012",
        options: ["LED High Performance", "COMAND", "Pack Stationnement", "Keyless-Go"],
        description:
          "Réservée. Dossier complet, CT à jour, transparence totale. Contacte-nous pour la prochaine dispo.",
      },
    ],
    []
  );

  const formatPrice = (n: number | null) =>
    n != null
      ? new Intl.NumberFormat("fr-LU", {
          style: "currency",
          currency: "EUR",
        }).format(n)
      : "Prix sur demande";

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
            
            
            <a href="/" className="text-white no-underline hover:text-yellow-300">
              Garage
            </a>
            <a href="#stock" className="text-white no-underline hover:text-yellow-300">
              Stock
            </a>
            <a href="/process" className="text-white no-underline hover:text-yellow-300">
              Process
            </a>
            <a href="/dashboard/sourcing" className="text-white no-underline hover:text-yellow-300">
              Sourcing
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
            className="lg:hidden inline-flex items-center justify-center bg-black border border-none p-2 text-white hover:border-yellow-300 transition"
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
                
                
                { label: "Garage", href: "/" },
                { label: "Stock", href: "#stock" },
                { label: "Process", href: "#process" },
                { label: "Sourcing", href: "/dashboard/sourcing" },
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
<section className="relative min-h-screen overflow-hidden bg-black px-5 md:px-6 pt-28">
  {/* Light racing pattern */}
  <div className="absolute inset-0 opacity-[0.05] bg-[linear-gradient(135deg,#fde047_0_10%,transparent_10%_20%,#fde047_20%_30%,transparent_30%_100%)] bg-[length:110px_110px]" />

  <div className="relative z-10 max-w-7xl mx-auto min-h-[calc(100vh-7rem)] grid grid-cols-1 lg:grid-cols-[0.92fr_1.08fr] gap-12 items-center">
    {/* LEFT CONTENT */}
    <div>
      <div className="inline-flex items-center gap-3 border border-yellow-300/40 bg-yellow-300/10 px-4 py-2">
        <span className="h-2 w-2 bg-yellow-300" />
        <span className="text-xs font-black uppercase tracking-[0.22em] text-yellow-300">
          SL Automotive Dealer
        </span>
      </div>

      <h1 className={cn("mt-7", H1)}>
        Occasions
        <br />
        <span className="text-yellow-300">d’exception</span>
        <br />
        zéro surprise
      </h1>

      <p className="mt-7 max-w-xl text-base md:text-lg leading-relaxed text-zinc-300">
        Véhicules sélectionnés, historiques vérifiés, dossiers transparents
        et accompagnement complet jusqu’à la livraison.
      </p>

      <div className="mt-10 flex flex-wrap gap-4">
        <a
          href="#stock"
          className="bg-yellow-300 text-black px-7 py-4 text-sm font-black uppercase tracking-wide no-underline hover:bg-white transition"
        >
          Voir le stock
        </a>

        <a
          href="#process"
          className="bg-white text-black px-7 py-4 text-sm font-black uppercase tracking-wide no-underline hover:bg-yellow-300 transition"
        >
          Notre processus
        </a>
      </div>

      {/* Stats */}
      <div className="mt-12 grid grid-cols-3 max-w-xl border border-zinc-800 bg-black/60">
        {[
          ["150", "Points contrôle"],
          ["100%", "Dossier clair"],
          ["DE/LU", "Sourcing premium"],
        ].map(([value, label]) => (
          <div
            key={label}
            className="p-5 border-r last:border-r-0 border-zinc-800"
          >
            <p className="text-3xl font-black text-yellow-300">{value}</p>
            <p className="mt-2 text-[11px] font-black uppercase tracking-[0.16em] text-zinc-500">
              {label}
            </p>
          </div>
        ))}
      </div>
    </div>

    {/* RIGHT IMAGE CARD */}
    <div className="relative">
      <div className="absolute -inset-4 bg-yellow-300" />

      <div className="relative bg-zinc-950 border border-zinc-800 p-4 md:p-5">
        {/* Top racing strip */}
        <div className="h-10 bg-yellow-300 mb-4 flex items-center px-4">
          <div className="flex gap-2">
            <span className="h-3 w-10 bg-black skew-x-[-25deg]" />
            <span className="h-3 w-10 bg-black skew-x-[-25deg]" />
            <span className="h-3 w-10 bg-black skew-x-[-25deg]" />
          </div>
        </div>

        <div className="relative aspect-[4/3] overflow-hidden bg-black">
          <img
            src="/hero-sl3.png"
            alt="SL Automotive — véhicules premium"
            className="h-full w-full object-cover object-center"
          />

          <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-transparent to-transparent" />

          <div className="absolute left-4 bottom-4 right-4 flex items-end justify-between gap-4">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.18em] text-yellow-300">
                Stock sélectionné
              </p>
              <p className="mt-1 text-xl font-black uppercase text-white">
                Véhicules premium
              </p>
            </div>

            <div className="bg-yellow-300 px-4 py-3 text-black">
              
            </div>
          </div>
        </div>

        {/* Bottom info bar */}
        <div className="mt-4 grid grid-cols-3 gap-3">
          {[
            "Historique vérifié",
            "Import possible",
            "Garantie optionnelle",
          ].map((item) => (
            <div
              key={item}
              className="border border-zinc-800 bg-black px-3 py-3 text-center"
            >
              <p className="text-[11px] font-black uppercase tracking-[0.12em] text-zinc-400">
                {item}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  </div>

  {/* Bottom strip */}
  <div className="absolute bottom-0 left-0 right-0 z-10 h-3 bg-yellow-300">
    <div className="h-full w-64 bg-black skew-x-[-25deg]" />
  </div>
</section>

      {/* STOCK */}
      <section id="stock" className="px-5 md:px-6 py-16 md:py-20 bg-white text-black">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.22em] text-zinc-500">
                Stock disponible
              </p>
              <h2 className={cn("mt-4", H2)}>Sélection du moment</h2>
            </div>

            <a
              href="#contact"
              className="bg-black text-white px-6 py-4 text-sm font-black uppercase no-underline hover:bg-yellow-300 hover:text-black transition"
            >
              Demander un sourcing
            </a>
          </div>

          <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-5">
            {vehicles.map((v, index) => (
              <button
                key={v.stockId}
                type="button"
                onClick={() => setSelectedCar(v)}
                className="group text-left bg-white border border-zinc-200 overflow-hidden transition hover:-translate-y-1 hover:border-yellow-300 hover:shadow-[0_20px_60px_rgba(0,0,0,0.12)]"
                title="Voir le détail"
              >
                <div className="relative h-56 bg-zinc-900 overflow-hidden">
                  <img
                    src={v.image}
                    alt={`${v.marque} ${v.modele}`}
                    className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                  />

                  <div className="absolute top-0 left-0 bg-yellow-300 text-black px-4 py-2 text-xs font-black uppercase tracking-wide">
                    {v.stockId}
                  </div>

                  <div className="absolute bottom-3 right-3 bg-black text-white px-3 py-2 text-xs font-black">
                    {v.annee} • {v.km.toLocaleString("fr-LU")} km
                  </div>
                </div>

                <div className="p-6">
                  <p className="text-xs font-black uppercase tracking-[0.2em] text-zinc-500">
                    0{index + 1} / Véhicule sélectionné
                  </p>

                  <h3 className={cn("mt-3", H3)}>
                    {v.marque} {v.modele}
                    {v.finition ? ` ${v.finition}` : ""}
                  </h3>

                  <div className="mt-5 flex items-center justify-between gap-4 border-t border-zinc-200 pt-4">
                    <p className="text-sm text-zinc-600">
                      {v.boite} • {v.carburant}
                    </p>
                    <p className="bg-yellow-300 px-3 py-2 text-sm font-black text-black">
                      {formatPrice(v.price)}
                    </p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* WHY */}
      <section id="process" className="px-5 md:px-6 py-16 md:py-20 bg-[#0b0b0b] text-white">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-[0.85fr_1.15fr] gap-10 lg:gap-16 items-start">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.22em] text-yellow-300">
              Pourquoi SL Automotive ?
            </p>
            <h2 className={cn("mt-4", H2)}>
              Une méthode claire pour acheter sans mauvaise surprise
            </h2>
            <p className={cn("mt-6 max-w-xl", BODY)}>
              Chaque véhicule doit pouvoir être expliqué, documenté et justifié.
              L’objectif est simple : éviter les achats flous, les frais cachés et
              les mauvaises surprises après livraison.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              {
                label: "Sélection",
                text:
                  "Véhicules récents, fin de leasing, historique complet et entretien constructeur.",
              },
              {
                label: "Transparence",
                text:
                  "Carnet, factures, CT, photos détaillées et défauts signalés avant décision.",
              },
              {
                label: "Sérénité",
                text:
                  "Accompagnement sourcing, import, test drive, dossier complet et garantie possible.",
              },
            ].map(({ label, text }, index) => (
              <div
                key={label}
                className="border border-zinc-800 bg-black p-6 transition hover:border-yellow-300"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-yellow-300 text-sm font-black text-black">
                  0{index + 1}
                </div>

                <h3 className="mt-5 text-base font-black uppercase tracking-[0.12em] text-white">
                  {label}
                </h3>

                <p className="mt-4 text-sm leading-relaxed text-zinc-500">
                  {text}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* NUMBERS */}
      <section className="px-5 md:px-6 py-16 md:py-20 bg-white text-black">
        <div className="max-w-7xl mx-auto">
          <div className="bg-black text-white p-8 md:p-10">
            <p className="text-xs font-black uppercase tracking-[0.22em] text-yellow-300">
              Nos chiffres
            </p>

            <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                { label: "Véhicules inspectés", value: "+600" },
                { label: "Points de contrôle", value: "150" },
                { label: "Clients satisfaits", value: "100%" },
              ].map(({ label, value }) => (
                <div key={label} className="border border-zinc-800 bg-zinc-950 p-6">
                  <h3 className="text-5xl font-black text-yellow-300">{value}</h3>
                  <p className="mt-3 text-sm font-black uppercase tracking-wide text-white">
                    {label}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CONTACT */}
      <section id="contact" className="px-5 md:px-6 py-20 bg-black text-white">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-[1fr_420px] gap-8">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.22em] text-yellow-300">
              Contact
            </p>
            <h2 className={cn("mt-4", H2)}>Parlez-nous de votre projet</h2>
            <p className={cn("mt-6 max-w-2xl", LEAD)}>
              Stock disponible, sourcing personnalisé, import ou dossier véhicule :
              envoyez votre demande et nous revenons vers vous avec une réponse claire.
            </p>

            <div className="mt-10 flex flex-wrap gap-4">
              <a
                className="bg-yellow-300 text-black px-7 py-4 text-sm font-black uppercase no-underline hover:bg-white transition"
                href="https://wa.me/35200000000?text=Bonjour%20SL%20Automotive%2C%20je%20souhaite%20obtenir%20le%20dossier%20d%E2%80%99un%20v%C3%A9hicule."
                target="_blank"
                rel="noreferrer"
              >
                Discuter sur WhatsApp
              </a>

              <a
                className="bg-white text-black px-7 py-4 text-sm font-black uppercase no-underline hover:bg-yellow-300 transition"
                href="/contact"
              >
                Demander le dossier
              </a>
            </div>
          </div>

          <div className="border border-zinc-800 bg-zinc-950 p-6">
            <h3 className="text-2xl font-black uppercase text-yellow-300">
              Demande rapide
            </h3>

            <div className="mt-6 space-y-4">
              <input
                className="w-full border border-zinc-700 bg-black px-4 py-3 text-sm text-white placeholder:text-zinc-500 outline-none focus:border-yellow-300"
                placeholder="Nom complet"
              />
              <input
                className="w-full border border-zinc-700 bg-black px-4 py-3 text-sm text-white placeholder:text-zinc-500 outline-none focus:border-yellow-300"
                placeholder="Téléphone"
              />
              <textarea
                className="min-h-[120px] w-full resize-none border border-zinc-700 bg-black px-4 py-3 text-sm text-white placeholder:text-zinc-500 outline-none focus:border-yellow-300"
                placeholder="Modèle recherché, budget, pays, délai..."
              />
              <a
                href="https://wa.me/35200000000?text=Bonjour%20SL%20Automotive%2C%20je%20souhaite%20faire%20une%20demande%20de%20sourcing."
                target="_blank"
                rel="noreferrer"
                className="flex w-full justify-center bg-yellow-300 px-6 py-4 text-sm font-black uppercase text-black no-underline hover:bg-white transition"
              >
                Envoyer la demande
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="px-5 md:px-6 py-8 bg-black border-t border-zinc-800 text-center text-sm text-zinc-500">
        <p>
          © {new Date().getFullYear()} SL Automotive — Mentions légales — Politique
          de confidentialité
        </p>
        <p className="mt-2 text-xs">
          La performance, sans compromis. La transparence, sans surprise.
        </p>
      </footer>

      {/* MODAL DÉTAIL VÉHICULE */}
      {selectedCar && (
        <div
          className="fixed inset-0 z-[60] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          onClick={(e) => {
            if (e.target === e.currentTarget) setSelectedCar(null);
          }}
        >
          <div className="w-full max-w-6xl max-h-[90vh] overflow-y-auto border border-zinc-800 bg-black text-white shadow-2xl">
            {/* Modal header */}
            <div className="sticky top-0 z-10 flex items-center justify-between gap-4 border-b border-zinc-800 bg-black/95 px-5 md:px-8 py-5 backdrop-blur">
              <div className="min-w-0">
                <p className="text-xs font-black uppercase tracking-[0.2em] text-yellow-300">
                  Stock {selectedCar.stockId}
                </p>
                <h2 className="mt-2 truncate text-2xl md:text-3xl font-black uppercase tracking-[-0.03em]">
                  {selectedCar.marque} {selectedCar.modele} {selectedCar.finition || ""}
                </h2>
              </div>

              <div className="flex items-center gap-3">
                <span className="hidden sm:inline-flex bg-yellow-300 px-4 py-2 text-sm font-black text-black">
                  {formatPrice(selectedCar.price)}
                </span>

                <button
                  type="button"
                  onClick={() => setSelectedCar(null)}
                  aria-label="Fermer"
                  className="grid h-10 w-10 place-items-center border border-zinc-700 text-white hover:border-yellow-300 transition"
                >
                  ×
                </button>
              </div>
            </div>

            {/* Image + Specs */}
            <div className="grid grid-cols-1 md:grid-cols-[1.2fr_1fr] gap-6 px-5 md:px-8 py-6 items-start">
              <div className="relative bg-zinc-950 border border-zinc-800 p-3">
                <div className="absolute left-3 top-3 z-10 bg-yellow-300 px-3 py-2 text-xs font-black text-black">
                  {selectedCar.annee} • {selectedCar.km.toLocaleString("fr-LU")} km
                </div>

                <img
                  src={selectedCar.image}
                  alt={`${selectedCar.marque} ${selectedCar.modele}`}
                  className="w-full h-[320px] md:h-[430px] object-cover"
                />
              </div>

              <div>
                <div className="bg-yellow-300 p-5 text-black">
                  <p className="text-xs font-black uppercase tracking-[0.18em]">
                    Prix affiché
                  </p>
                  <p className="mt-2 text-4xl font-black">
                    {formatPrice(selectedCar.price)}
                  </p>
                </div>

                <div className="mt-4 grid grid-cols-1 gap-3">
                  {[
                    { label: "Boîte", value: selectedCar.boite },
                    { label: "Carburant", value: selectedCar.carburant },
                    { label: "Puissance", value: selectedCar.puissance },
                    { label: "Transmission", value: selectedCar.transmission },
                    { label: "Provenance", value: selectedCar.provenance },
                    { label: "Entretien", value: selectedCar.entretien },
                  ].map((it) => (
                    <div
                      key={it.label}
                      className="flex items-center justify-between gap-4 border border-zinc-800 bg-zinc-950 px-4 py-3"
                    >
                      <span className="text-xs font-black uppercase tracking-[0.16em] text-zinc-500">
                        {it.label}
                      </span>
                      <span className="text-sm font-bold text-white text-right">
                        {it.value}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Description + options */}
            <div className="px-5 md:px-8 pb-8">
              <div className="grid grid-cols-1 lg:grid-cols-[1fr_0.9fr] gap-6">
                <div className="border border-zinc-800 bg-zinc-950 p-5">
                  <p className="text-xs font-black uppercase tracking-[0.2em] text-yellow-300">
                    Description
                  </p>
                  <p className="mt-4 text-sm leading-relaxed text-zinc-300">
                    {selectedCar.description}
                  </p>
                </div>

                {selectedCar.options.length > 0 && (
                  <div className="border border-zinc-800 bg-zinc-950 p-5">
                    <p className="text-xs font-black uppercase tracking-[0.2em] text-yellow-300">
                      Options
                    </p>

                    <div className="mt-4 flex flex-wrap gap-2">
                      {selectedCar.options.map((o, i) => (
                        <span
                          key={`${o}-${i}`}
                          className="bg-black border border-zinc-800 px-3 py-2 text-xs font-bold text-zinc-200"
                        >
                          {o}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="mt-6 flex flex-wrap gap-3">
                <a
                  className="inline-flex items-center justify-center bg-yellow-300 px-6 py-3 text-sm font-black uppercase text-black hover:bg-white no-underline transition"
                  href={`https://wa.me/35200000000?text=Bonjour%20SL%20Automotive%2C%20je%20suis%20int%C3%A9ress%C3%A9%20par%20le%20${encodeURIComponent(
                    `${selectedCar.marque} ${selectedCar.modele}`
                  )}%20(Stock%20${encodeURIComponent(
                    selectedCar.stockId
                  )}).%20Est-il%20disponible%20%3F`}
                  target="_blank"
                  rel="noreferrer"
                >
                  WhatsApp — Stock {selectedCar.stockId}
                </a>

                <a
                  className="inline-flex items-center justify-center bg-white px-6 py-3 text-sm font-black uppercase text-black hover:bg-yellow-300 no-underline transition"
                  href={`/contact?stock=${encodeURIComponent(selectedCar.stockId)}`}
                >
                  Demander le dossier
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
