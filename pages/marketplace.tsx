import { useMemo, useState } from "react";

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
  provenance?: string;
  entretien?: string;
  couleur?: string;
  description: string;
  options?: string[];
};

export default function Marketplace() {
  // --------- Données démo (remplace par tes vraies données) ----------
  const allVehicles: Vehicle[] = [
    {
      stockId: "SLA-0001",
      marque: "Audi",
      modele: "S5 Sportback",
      finition: "Quattro",
      annee: 2019,
      km: 62000,
      price: 38900,
      image: "/audi-s5.jpg",
      boite: "Auto",
      carburant: "Essence",
      puissance: "354 ch (260 kW)",
      transmission: "Quattro",
      entretien: "Concession Audi",
      couleur: "Noir",
      description:
        "Fin de leasing 🇩🇪, historique constructeur complet, contrôle 150 points. Dossier transparent et prêt à être transmis.",
      options: ["Matrix LED", "Virtual Cockpit", "Sièges sport chauffants", "Toit pano"],
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
      boite: "Auto",
      carburant: "Essence",
      puissance: "258 ch (190 kW)",
      transmission: "Propulsion",
      couleur: "Gris",
      description:
        "Première main, suivi constructeur, fin de leasing. Rapport d’état détaillé disponible sur demande.",
      options: ["Driving Assistant", "Live Cockpit Pro", "Shadowline", "Harman/Kardon"],
    },
    {
      stockId: "SLA-0003",
      marque: "Mercedes-Benz",
      modele: "C220d",
      finition: "AMG Line",
      annee: 2018,
      km: 89000,
      price: null, // prix sur demande
      image: "/mb-c220d.jpg",
      boite: "Auto",
      carburant: "Diesel",
      puissance: "170 ch (125 kW)",
      transmission: "Propulsion",
      couleur: "Bleu",
      description:
        "Réservée. Dossier complet, CT à jour, transparence totale. Contacte-nous pour la prochaine dispo.",
      options: ["LED High Performance", "COMAND", "Pack Stationnement", "Keyless-Go"],
    },
  ];

  // --------- UI state ----------
  const [search, setSearch] = useState("");
  const [brand, setBrand] = useState("all");
  const [fuel, setFuel] = useState("all");
  const [gear, setGear] = useState("all");
  const [sort, setSort] = useState<"none" | "asc" | "desc" | "newest">("none");
  const [minYear, setMinYear] = useState<number | "">("");
  const [maxYear, setMaxYear] = useState<number | "">("");
  const [minPrice, setMinPrice] = useState<number | "">("");
  const [maxPrice, setMaxPrice] = useState<number | "">("");
  const [selectedCar, setSelectedCar] = useState<Vehicle | null>(null);

  // --------- Helpers ----------
  const formatPrice = (n: number | null) =>
    n == null ? "Prix sur demande" : new Intl.NumberFormat("fr-LU", { style: "currency", currency: "EUR" }).format(n);

  const brands = useMemo(
    () => Array.from(new Set(allVehicles.map(v => v.marque))).sort(),
    [allVehicles]
  );
  const fuels = useMemo(
    () => Array.from(new Set(allVehicles.map(v => v.carburant))).sort(),
    [allVehicles]
  );
  const gears = useMemo(
    () => Array.from(new Set(allVehicles.map(v => v.transmission))).sort(),
    [allVehicles]
  );

  // --------- Filtering & Sorting ----------
  const vehicles = useMemo(() => {
    let list = allVehicles.filter(v => {
      const q = search.trim().toLowerCase();
      if (q && !`${v.marque} ${v.modele} ${v.finition ?? ""} ${v.stockId}`.toLowerCase().includes(q)) return false;

      if (brand !== "all" && v.marque !== brand) return false;
      if (fuel !== "all" && v.carburant !== fuel) return false;
      if (gear !== "all" && v.transmission !== gear) return false;

      if (minYear !== "" && v.annee < minYear) return false;
      if (maxYear !== "" && v.annee > maxYear) return false;

      if (minPrice !== "" && (v.price == null || v.price < minPrice)) return false;
      if (maxPrice !== "" && (v.price == null || v.price > maxPrice)) return false;

      return true;
    });

    list.sort((a, b) => {
      if (sort === "asc") return (a.price ?? Infinity) - (b.price ?? Infinity);
      if (sort === "desc") return (b.price ?? -Infinity) - (a.price ?? -Infinity);
      if (sort === "newest") return b.annee - a.annee;
      return 0;
    });

    return list;
  }, [allVehicles, search, brand, fuel, gear, sort, minYear, maxYear, minPrice, maxPrice]);

  return (
    <div className="flex min-h-screen bg-black text-white">
      {/* Sidebar simple (cohérente avec le reste du site) */}
      <aside className="w-64 bg-black text-white flex flex-col px-4 space-y-6 shadow-xl">
        <a href="/"><img src="/logo-sl-automotive.jpg" alt="SL Automotive" className="h-56 w-56 mx-0" /></a>
        <nav className="space-y-4 text-sm mx-8">
          {[
            { icon: "/home.svg", label: "Accueil", href: "/" },
            { icon: "/star.svg", label: "Nos véhicules", href: "/marketplace", active: false },
            { icon: "/orders.svg", label: "Processus", href: "/process" },
            { icon: "/chat.svg", label: "Contact", href: "/contact" },
          ].map(({ icon, label, href, active }) => (
            <a
              key={label}
              href={href}
              className={`flex items-center gap-3 px-4 py-2 rounded-lg no-underline transition ${
                active ? "bg-[#B88A44] text-black" : "text-white hover:bg-yellow-400 hover:text-black"
              }`}
            >
              <img src={icon} alt="" className="w-5 h-5" />
              {label}
            </a>
          ))}
        </nav>
      </aside>

      {/* Main */}
      <main className="flex-1 overflow-y-auto pr-48 py-16 relative">
        {/* CTA rapide (WhatsApp) */}
        <div className="absolute top-6 right-6 z-50">
          <a
            className="w-40 h-12 flex items-center justify-center bg-yellow-400 no-underline text-black font-semibold hover:bg-white hover:border-white hover:border-2 transition rounded"
            href="https://wa.me/35200000000?text=Bonjour%20SL%20Automotive%2C%20je%20souhaite%20des%20infos."
            target="_blank"
            rel="noreferrer"
          >
            WhatsApp
          </a>
        </div>

        {/* Barres de filtres */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-12 pt-24">
          <input
            type="text"
            placeholder="Rechercher (marque, modèle, stock)…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="text-black px-3 py-2 rounded"
          />
          <select className="text-black px-3 py-2 rounded" value={brand} onChange={e => setBrand(e.target.value)}>
            <option value="all">Toutes marques</option>
            {brands.map(b => <option key={b} value={b}>{b}</option>)}
          </select>
          <select className="text-black px-3 py-2 rounded" value={fuel} onChange={e => setFuel(e.target.value)}>
            <option value="all">Tous carburants</option>
            {fuels.map(f => <option key={f} value={f}>{f}</option>)}
          </select>
          <select className="text-black px-3 py-2 rounded" value={gear} onChange={e => setGear(e.target.value)}>
            <option value="all">Toutes transmissions</option>
            {gears.map(g => <option key={g} value={g}>{g}</option>)}
          </select>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-6 gap-3 mb-8">
          <div className="col-span-1 md:col-span-2 flex items-center gap-2">
            <label className="text-sm text-gray-300 w-16">Année</label>
            <input type="number" placeholder="min" className="w-20 text-black px-2 py-1 rounded"
                   value={minYear as number | ""} onChange={e => setMinYear(e.target.value ? Number(e.target.value) : "")}/>
            <span className="text-sm text-gray-400">—</span>
            <input type="number" placeholder="max" className="w-20 text-black px-2 py-1 rounded"
                   value={maxYear as number | ""} onChange={e => setMaxYear(e.target.value ? Number(e.target.value) : "")}/>
          </div>
          <div className="col-span-1 md:col-span-2 flex items-center gap-2">
            <label className="text-sm text-gray-300 w-16">Prix</label>
            <input type="number" placeholder="min" className="w-24 text-black px-2 py-1 rounded"
                   value={minPrice as number | ""} onChange={e => setMinPrice(e.target.value ? Number(e.target.value) : "")}/>
            <span className="text-sm text-gray-400">—</span>
            <input type="number" placeholder="max" className="w-24 text-black px-2 py-1 rounded"
                   value={maxPrice as number | ""} onChange={e => setMaxPrice(e.target.value ? Number(e.target.value) : "")}/>
          </div>
          <div className="col-span-2 flex items-center gap-2 justify-end">
            <label className="text-sm">Trier :</label>
            <select className="text-black px-3 py-2 rounded" value={sort} onChange={e => setSort(e.target.value as any)}>
              <option value="none">Aucun</option>
              <option value="newest">Plus récent</option>
              <option value="asc">Prix ↑</option>
              <option value="desc">Prix ↓</option>
            </select>
          </div>
        </div>

        {/* Cards */}
        {vehicles.length === 0 ? (
          <div className="text-center text-gray-400 py-16">Aucun véhicule ne correspond à ces critères.</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10 max-w-7xl mx-auto">
            {vehicles.map((v) => (
              <button
                key={v.stockId}
                onClick={() => setSelectedCar(v)}
                className="text-left bg-[#111113] text-white text-xs rounded-2xl overflow-hidden hover:shadow-xl hover:scale-[1.02] transition border border-white/5"
                title="Voir le détail"
              >
                <div className="relative">
                  <img src={v.image} alt={`${v.marque} ${v.modele}`} className="w-full h-48 object-cover" />
                  <div className="absolute bottom-2 right-2 text- text-white xs bg-black/70 px-2 py-1 rounded">
                    {v.annee} • {v.km.toLocaleString("fr-LU")} km
                  </div>
                </div>
                <div className="p-">
                  <div className="flex items-center justify-between">
                    <div className="min-w-0">
                      <h3 className="font-semibold truncate">{v.marque} {v.modele} {v.finition ? ` ${v.finition}` : ""}</h3>
                      <p className="text-xs text-gray-400 mt-1">{v.boite} • {v.carburant} • {v.transmission}</p>
                    </div>
                    <span className="text-xs text-white whitespace-nowrap">{formatPrice(v.price)}</span>
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}

        {/* Modal véhicule (même style que Home) */}
        {selectedCar && (
          <div
            className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4"
            role="dialog" aria-modal="true"
            onClick={(e) => { if (e.target === e.currentTarget) setSelectedCar(null); }}
          >
            <div className="w-full max-w-6xl max-h-[90vh] overflow-y-auto rounded-2xl shadow-2xl ring-1 ring-white/10 bg-[#111113] text-zinc-100">
              {/* Header sticky */}
              <div className="sticky top-0 z-10 flex items-center justify-between px-6 md:px-8 py-4 border-b border-white/10 bg-[#111113]/95 backdrop-blur">
                <div className="min-w-0">
                  <h2 className="text-xl md:text-2xl font-semibold tracking-tight truncate">
                    {selectedCar.marque} {selectedCar.modele} {selectedCar.finition || ""}
                  </h2>
                  <p className="text-xs text-zinc-400 mt-1">
                    Stock {selectedCar.stockId} • {selectedCar.annee} • {selectedCar.km.toLocaleString("fr-LU")} km
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="inline-flex items-center rounded-full px-3 py-1.5 text-sm font-medium bg-white/10 text-amber-300">
                    {formatPrice(selectedCar.price)}
                  </span>
                  <button
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
                {/* Image grande à gauche */}
                <div>
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
                </div>

                {/* Specs à droite + options */}
                <div className="flex flex-col gap-3">
                <p className="text-xs uppercase tracking-widest text-white mb-2">Description</p>
                  {[
                    {
                      label: "Boîte", value: selectedCar.boite, icon: (
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="opacity-80">
                          <path d="M7 21V3M12 21V3M17 21V3" strokeWidth="2" />
                        </svg>
                      )
                    },
                    {
                      label: "Carburant", value: selectedCar.carburant, icon: (
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="opacity-80">
                          <path d="M3 3h10v18H3zM13 7h4l4 4v10h-4V11h-4V7z" strokeWidth="2" />
                        </svg>
                      )
                    },
                    {
                      label: "Puissance", value: selectedCar.puissance, icon: (
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="opacity-80">
                          <path d="M13 2L3 14h7l-1 8 10-12h-7l1-8z" strokeWidth="2" />
                        </svg>
                      )
                    },
                    {
                      label: "Année", value: selectedCar.annee, icon: (
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="opacity-80">
                          <rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/>
                        </svg>
                      )
                    },
                    {
                      label: "Couleur", value: selectedCar.couleur || "—", icon: (
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" className="opacity-80">
                          <circle cx="12" cy="12" r="7"/>
                        </svg>
                      )
                    },
                  ].map((it) => (
                    <div key={it.label} className="flex items-center justify-between gap-3 rounded-xl bg-white/5 ring-1 ring-white/10 px-4 py-3">
                      <div className="flex items-center gap-2.5">
                        {it.icon}
                        <span className="text-xs text-zinc-400 uppercase tracking-wider">{it.label}</span>
                      </div>
                      <span className="text-sm font-medium">{String(it.value)}</span>
                    </div>
                  ))}

                  {selectedCar.options?.length ? (
                    <div className="mt-2">
                      <p className="text-xs uppercase tracking-widest text-white mb-2">Options</p>
                      <div className="flex flex-wrap gap-2">
                        {selectedCar.options.map((o, i) => (
                          <span key={i} className="rounded-full bg-white/5 ring-1 ring-white/10 text-zinc-400 text-xs px-3 py-1.5">
                            {o}
                          </span>
                        ))}
                      </div>
                    </div>
                  ) : null}
                </div>
              </div>

              {/* Description & CTA */}
              <div className="px-6 md:px-8 pb-6">
                <details className="group rounded-xl bg-white/5 ring-1 ring-white/10">
                  <summary className="flex items-center justify-between cursor-pointer select-none list-none px-4 py-3">
                    <span className="text-sm font-medium">Voir plus d'information</span>
                    <span className="transition-transform group-open:rotate-45 text-xl leading-none">+</span>
                  </summary>
                  <div className="px-4 pb-4 text-[15px] leading-6 text-zinc-200">
                    <p>{selectedCar.description}</p>
                  </div>
                </details>

                <div className="mt-4 flex flex-wrap gap-3">
                  <a
                    className="inline-flex items-center justify-center rounded-full px-5 py-2.5 text-sm font-semibold bg-yellow-400 text-black hover:bg-white no-underline transition"
                    href={`https://wa.me/35200000000?text=Bonjour%20SL%20Automotive%2C%20je%20suis%20int%C3%A9ress%C3%A9%20par%20le%20${encodeURIComponent(
                      `${selectedCar.marque} ${selectedCar.modele}`
                    )}%20(Stock%20${encodeURIComponent(selectedCar.stockId)}).%20Est-il%20disponible%20%3F`}
                    target="_blank" rel="noreferrer"
                  >
                    WhatsApp — Stock {selectedCar.stockId}
                  </a>
                  <a
                    className="inline-flex items-center justify-center rounded-full px-5 py-2.5 text-sm font-semibold ring-1 ring-white/20 bg-white text-black hover:text-white hover:bg-black no-underline transition"
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

      {/* Rail droit décoratif (optionnel) */}
      <aside className="hidden xl:block w-6" />
    </div>
  );
}
