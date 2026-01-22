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

export default function Dealer() {
  const [scrolled, setScrolled] = useState(false);

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
        options: [
          "Matrix LED",
          "Virtual Cockpit",
          "Sièges sport chauffants",
          "Toit pano",
        ],
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
        options: [
          "Driving Assistant",
          "Live Cockpit Pro",
          "Shadowline",
          "Harman/Kardon",
        ],
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
        options: [
          "LED High Performance",
          "COMAND",
          "Pack Stationnement",
          "Keyless-Go",
        ],
        description:
          "Réservée. Dossier complet, CT à jour, transparence totale. Contacte-nous pour la prochaine dispo.",
      },
    ],
    []
  );

  const [selectedCar, setSelectedCar] = useState<Vehicle | null>(null);

  const formatPrice = (n: number | null) =>
    n != null
      ? new Intl.NumberFormat("fr-LU", {
          style: "currency",
          currency: "EUR",
        }).format(n)
      : "Prix sur demande";

  return (
    <main className="bg-black text-white min-h-screen">
       {/* HEADER */}
       <header
        className={cn(
          "fixed top-0 w-full z-50 transition-all",
          scrolled
            ? "bg-black/80 backdrop-blur border-b border-slate-200"
            : "bg-transparent"
        )}
      >
        <nav className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <a href="/" className="flex items-center gap-3">
            <img
              src="/logo-sl-automotive.jpg"
              alt="SL Automotive logo"
              className="h-36 w-auto"
            />
            {/* Wordmark volontairement supprimé pour garder uniquement le logo */}
          </a>

          <div className="hidden lg:flex gap-8 text-sm font-semibold uppercase tracking-wide">
            <a href="/academy" className="text-slate-400 no-underline hover:text-orange-600">L'Académie</a>
            <a href="/formations" className="text-slate-400 no-underline hover:text-orange-600">Formations</a>
            <a href="/investor" className="text-slate-400 no-underline hover:text-orange-600">Investisseurs</a>
            <a href="/infrastructure" className="text-slate-400 no-underline hover:text-orange-600">Infrastructure</a>
            <a href="/dealer" className="text-slate-400 no-underline hover:text-orange-600">Dealer</a>
            <a href="/garage" className="text-slate-400 no-underline hover:text-orange-600">Garage</a>
          </div>

          <a
            href="#contact"
            className="no-underline bg-yellow-400 text-black px-6 py-3 rounded-full text-sm font-semibold hover:bg-orange-600 transition"
          >
            Contact
          </a>
        </nav>
      </header>

      <div className="pt-24 font-sans">
{/* Main */}
      <div className="max-w-7xl mx-auto pt-24 px-6 py-16 relative">
                {/* HERO */}
        <section className="relative text-center px-6">
          <h1 className="text-4xl md:text-6xl font-extrabold leading-tight text-white mt-4 mb-2">
            Occasions d’exception. Zéro surprise.
          </h1>

          <div className="w-full max-w-6xl mx-auto">
            <img
              src="/Hero-sl2.jpg"
              alt="SL Automotive — Occasions d’exception"
              className="w-full max-h-[300px] object-cover rounded-lg shadow-lg"
            />
          </div>

          <div className="mt-4 max-w-3xl mx-auto">
            <p className="text-lg md:text-xl text-gray-200 mb-4">
              Voitures en fin de leasing • Historique complet • Garantie disponible
            </p>

            <div className="flex items-center justify-center gap-4">
              <a
                href="/dealer"
                className="bg-yellow-400 text-black px-12 mt-12 py-4 rounded-full text-base font-semibold hover:scale-105 hover:bg-white no-underline transition"
              >
                Voir le stock
              </a>
              <a
                href="/process"
                className="no-underline text-black bg-white px-6 py-4 mt-12 rounded-full text-base font-semibold hover:scale-105 hover:bg-black hover:text-white transition"
              >
                Notre processus
              </a>
            </div>
          </div>
        </section>

        {/* Sélection du moment */}
        <section className="mb-20">
          <h2 className="text-3xl font-bold text-center mb-12 pt-24">
            Sélection du moment
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10 max-w-7xl mx-auto">
            {vehicles.map((v) => (
              <button
                key={v.stockId}
                type="button"
                className="text-white text-left bg-[#111113] rounded-2xl shadow-md overflow-hidden hover:shadow-lg hover:scale-[1.02] transition cursor-pointer border border-white/5"
                onClick={() => setSelectedCar(v)}
                title="Voir le détail"
              >
                <div className="relative">
                  <img
                    src={v.image}
                    alt={`${v.marque} ${v.modele}`}
                    className="w-full h-48 object-cover"
                  />
                  <div className="absolute text-black bottom-2 right-2 text-xs bg-white/70 px-2 py-1 rounded">
                    {v.annee} • {v.km.toLocaleString("fr-LU")} km
                  </div>
                </div>

                <div className="p-5">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold">
                      {v.marque} {v.modele}
                      {v.finition ? ` ${v.finition}` : ""}
                    </h3>
                    <span className="text-sm text-gray-300">
                      {formatPrice(v.price)}
                    </span>
                  </div>

                  <p className="text-sm text-gray-400 mt-1">
                    {v.boite} • {v.carburant} • {v.transmission}
                  </p>
                </div>
              </button>
            ))}
          </div>
        </section>

        {/* Valeur / Process clés */}
        <section className="mb-24">
          <h2 className="text-3xl font-bold text-center mb-12">
            Pourquoi SL Automotive ?
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {[
              {
                label: "Sélection",
                text:
                  "Véhicules de moins de 5 ans, fin de leasing, entretenus exclusivement en réseau constructeur avec historique complet.",
              },
              {
                label: "Transparence",
                text:
                  "Carnet, factures, CT, photos détaillées et défauts signalés : un dossier clair, zéro surprise.",
              },
              {
                label: "Sérénité",
                text:
                  "Import depuis l’Allemagne ou le Luxembourg jusqu’à Dakar, test drive sur place et garantie optionnelle 1 à 2 ans.",
              },
            ].map(({ label, text }) => (
              <div
                key={label}
                className="bg-[#111113] rounded-xl shadow p-6 border border-white/5"
              >
                <h3 className="text-lg font-semibold mb-2">{label}</h3>
                <p className="text-sm text-gray-300">{text}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Chiffres */}
        <section className="mb-24">
          <h2 className="text-3xl font-bold text-center mb-12">Nos chiffres</h2>

          <div className="flex justify-center flex-wrap gap-8 max-w-5xl mx-auto">
            {[
              { label: "Véhicules inspectés", value: "+600" },
              { label: "Points de contrôle", value: "150" },
              { label: "Clients satisfaits", value: "100%" },
            ].map(({ label, value }) => (
              <div
                key={label}
                className="bg-[#111113] rounded-xl shadow p-6 w-64 text-center border border-white/5"
              >
                <h3 className="text-4xl font-bold text-yellow-400">{value}</h3>
                <p className="text-sm text-white/80 mt-2">{label}</p>
              </div>
            ))}
          </div>
        </section>

        {/* CTA final */}
        <section className="text-center mb-10">
          <h2 className="text-3xl font-bold mb-6">Parlez-nous de votre projet.</h2>

          <div className="flex items-center justify-center gap-4">
            <a
              className="bg-yellow-400 hover:bg-white text-black px-10 py-4 rounded-full shadow-lg font-medium no-underline transition hover:scale-105"
              href="https://wa.me/35200000000?text=Bonjour%20SL%20Automotive%2C%20je%20souhaite%20obtenir%20le%20dossier%20d%E2%80%99un%20v%C3%A9hicule."
              target="_blank"
              rel="noreferrer"
            >
              Discuter sur WhatsApp
            </a>

            <a
              className="border border-white/40 hover:bg-black hover:text-white bg-white text-black px-10 py-4 rounded-full shadow-lg font-medium no-underline transition hover:scale-105"
              href="/contact"
            >
              Demander le dossier
            </a>
          </div>
        </section>

        {/* Footer */}
        <footer className="text-center text-sm pt-8 border-t border-gray-700 text-gray-400">
          <p className="mb-1">
            © {new Date().getFullYear()} SL Automotive — Mentions légales — Politique
            de confidentialité
          </p>
          <p className="text-[13px]">
            La performance, sans compromis. La transparence, sans surprise.
          </p>
        </footer>

        {/* MODAL DÉTAIL VÉHICULE */}
        {selectedCar && (
          <div
            className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4"
            role="dialog"
            aria-modal="true"
            onClick={(e) => {
              if (e.target === e.currentTarget) setSelectedCar(null);
            }}
          >
            <div className="w-full max-w-6xl max-h-[90vh] overflow-y-auto rounded-2xl shadow-2xl ring-1 ring-white/10 bg-[#111113] text-zinc-100">
              {/* Header */}
              <div className="sticky top-0 z-10 flex items-center justify-between px-6 md:px-8 py-4 border-b border-white/10 bg-[#111113]/95 backdrop-blur">
                <div className="min-w-0">
                  <h2 className="text-xl md:text-2xl font-semibold tracking-tight truncate">
                    {selectedCar.marque} {selectedCar.modele} {selectedCar.finition || ""}
                  </h2>
                  <p className="text-xs text-zinc-400 mt-1">
                    Stock {selectedCar.stockId} • {selectedCar.annee} •{" "}
                    {selectedCar.km.toLocaleString("fr-LU")} km
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <span className="inline-flex items-center rounded-full px-3 py-1.5 text-sm font-medium bg-white/10 text-amber-300">
                    {formatPrice(selectedCar.price)}
                  </span>

                  <button
                    type="button"
                    onClick={() => setSelectedCar(null)}
                    aria-label="Fermer"
                    className="w-9 h-9 grid place-items-center rounded-full border border-white/10 hover:bg-white/10 transition"
                  >
                    ×
                  </button>
                </div>
              </div>

              {/* Image + Specs */}
              <div className="grid grid-cols-1 md:grid-cols-[1.2fr_1fr] gap-6 px-6 md:px-8 py-6 items-start">
                {/* Image */}
                <div className="relative">
                  <img
                    src={selectedCar.image}
                    alt={`${selectedCar.marque} ${selectedCar.modele}`}
                    className="w-full h-[320px] md:h-[400px] object-cover rounded-xl ring-1 ring-white/10 shadow-lg"
                  />
                  <div className="absolute -top-3 right-2 text-[11px] md:text-xs bg-white/10 backdrop-blur rounded-full px-3 py-1 ring-1 ring-white/20">
                    {selectedCar.marque}
                  </div>
                </div>

                {/* Specs */}
                <div className="flex flex-col gap-3">
                  <p className="text-xs uppercase tracking-widest text-zinc-400 mb-2">
                    Détails
                  </p>

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
                      className="flex items-center justify-between gap-3 rounded-xl bg-white/5 ring-1 ring-white/10 px-4 py-3"
                    >
                      <span className="text-xs text-zinc-400 uppercase tracking-wider">
                        {it.label}
                      </span>
                      <span className="text-sm font-medium">{it.value}</span>
                    </div>
                  ))}

                  {/* Options */}
                  {selectedCar.options.length > 0 && (
                    <div className="mt-2">
                      <p className="text-xs uppercase tracking-widest text-zinc-400 mb-2">
                        Options
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {selectedCar.options.map((o, i) => (
                          <span
                            key={`${o}-${i}`}
                            className="rounded-full bg-white/5 ring-1 ring-white/10 text-zinc-100 text-xs px-3 py-1.5"
                          >
                            {o}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Description */}
              <div className="px-6 md:px-8 pb-6">
                <details className="group rounded-xl bg-white/5 ring-1 ring-white/10">
                  <summary className="flex items-center justify-between cursor-pointer select-none list-none px-4 py-3">
                    <span className="text-sm font-medium">Voir plus d'information</span>
                    <span className="transition-transform group-open:rotate-45 text-xl leading-none">
                      +
                    </span>
                  </summary>
                  <div className="px-4 pb-4 text-[15px] leading-6 text-zinc-200">
                    <p>{selectedCar.description}</p>
                  </div>
                </details>

                {/* CTA */}
                <div className="mt-4 flex flex-wrap gap-3">
                  <a
                    className="inline-flex items-center justify-center rounded-full px-5 py-2.5 text-sm font-semibold bg-yellow-400 text-black hover:bg-white no-underline transition"
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
                    className="inline-flex items-center justify-center rounded-full px-5 py-2.5 text-sm font-semibold ring-1 ring-white/20 bg-white text-black hover:bg-black hover:text-white no-underline transition"
                    href={`/contact?stock=${encodeURIComponent(selectedCar.stockId)}`}
                  >
                    Demander le dossier
                  </a>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
      </div>
    </main>
  );
}

