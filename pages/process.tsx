import { useMemo, useState, useEffect } from "react";

/* ------------------ Utils ------------------ */
type ClassValue = string | false | null | undefined;
const cn = (...c: ClassValue[]) => c.filter(Boolean).join(" ");

/* ------------------ Design tokens ------------------ */
const H1 =
  "text-5xl md:text-7xl font-black uppercase tracking-[-0.045em] leading-[0.95]";
const H2 =
  "text-3xl md:text-5xl font-black uppercase tracking-[-0.035em] leading-[1]";
const H3 =
  "text-lg md:text-xl font-black uppercase tracking-[-0.02em] leading-[1.1]";
const LEAD = "text-base md:text-lg text-zinc-300 leading-relaxed";
const BODY = "text-sm md:text-base text-zinc-400 leading-relaxed";

export default function Process() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const steps = useMemo(
    () => [
      {
        n: "01",
        title: "Sélection",
        text: "Véhicules récents, fin de leasing, entretien constructeur et historique complet.",
      },
      {
        n: "02",
        title: "Contrôle",
        text: "150 points, carnet, factures, CT, photos HD et défauts signalés.",
      },
      {
        n: "03",
        title: "Import",
        text: "Achat en Allemagne ou au Luxembourg, puis transport jusqu’au port de Dakar.",
      },
      {
        n: "04",
        title: "Arrivée",
        text: "Localisation transmise, rendez-vous fixé et dossier prêt à consulter.",
      },
      {
        n: "05",
        title: "Essai",
        text: "Test drive, vérification finale, paiement et remise du véhicule.",
      },
    ],
    []
  );

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
        <nav className="max-w-7xl mx-auto px-5 md:px-6 py-4 flex justify-between items-center">
          <a href="/" className="flex items-center no-underline">
            <img
              src="/logo-sl-automotive.jpg"
              alt="SL Automotive logo"
              className="h-14 md:h-16 w-auto"
            />
          </a>

          <div className="hidden lg:flex items-center gap-8 text-xs font-black uppercase tracking-[0.18em]">
            
            <a href="/dealer" className="text-white no-underline hover:text-yellow-300">
              Véhicules disponibles
            </a>
            <a href="/garage" className="text-white no-underline hover:text-yellow-300">
              Garage
            </a>
            <a href="/dealer#stock" className="text-white no-underline hover:text-yellow-300">
              Stock
            </a>
            <a href="/process" className="text-yellow-300 no-underline">
              Process
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
                
                { label: "Véhicules disponibles", href: "/dealer" },
                { label: "Garage", href: "/garage" },
                { label: "Stock", href: "/dealer#stock" },
                { label: "Process", href: "/process" },
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
<section className="relative overflow-hidden bg-black px-5 md:px-6 pt-32 pb-16 md:pt-40 md:pb-20">
  {/* Subtle racing pattern */}
  <div className="absolute inset-0 opacity-[0.04] bg-[linear-gradient(135deg,#fde047_0_10%,transparent_10%_20%,#fde047_20%_30%,transparent_30%_100%)] bg-[length:110px_110px]" />

  <div className="relative z-10 max-w-7xl mx-auto">
    <div className="max-w-4xl">
      <div className="inline-flex items-center gap-3 border border-yellow-300/40 bg-yellow-300/10 px-4 py-2">
        <span className="h-2 w-2 bg-yellow-300" />
        <span className="text-xs font-black uppercase tracking-[0.22em] text-yellow-300">
          Processus Dealer
        </span>
      </div>

      <h1 className="mt-7 max-w-4xl text-4xl md:text-6xl font-black uppercase tracking-[-0.045em] leading-[0.95] text-white">
        Notre méthode pour acheter
        <br />
        <span className="text-yellow-300">sans mauvaise surprise</span>
      </h1>

      <p className="mt-6 max-w-2xl text-base md:text-lg leading-relaxed text-zinc-300">
        De la sélection du véhicule à la livraison, chaque étape est structurée :
        contrôle, dossier, import, essai et validation finale.
      </p>

      <div className="mt-8 flex flex-wrap gap-4">
        <a
          href="#etapes"
          className="bg-yellow-300 text-black px-6 py-3 text-sm font-black uppercase tracking-wide no-underline hover:bg-white transition"
        >
          Voir les étapes
        </a>

        <a
          href="/dealer#stock"
          className="bg-white text-black px-6 py-3 text-sm font-black uppercase tracking-wide no-underline hover:bg-yellow-300 transition"
        >
          Voir le stock
        </a>
      </div>
    </div>
  </div>

  <div className="absolute bottom-0 left-0 right-0 h-2 bg-yellow-300">
    <div className="h-full w-48 bg-black skew-x-[-25deg]" />
  </div>
</section>

      {/* STEPS */}
      <section className="px-5 md:px-6 py-16 md:py-20 bg-white text-black">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.22em] text-zinc-500">
                Les 5 étapes
              </p>
              <h2 className={cn("mt-4", H2)}>Du sourcing à la livraison</h2>
            </div>

            <a
              href="/dealer#stock"
              className="bg-black text-white px-6 py-4 text-sm font-black uppercase no-underline hover:bg-yellow-300 hover:text-black transition"
            >
              Voir les véhicules
            </a>
          </div>

          <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {steps.map((s) => (
              <div
                key={s.n}
                className="group border border-zinc-200 bg-white p-5 shadow-[0_12px_40px_rgba(0,0,0,0.04)] transition hover:-translate-y-1 hover:border-yellow-300 hover:shadow-[0_18px_60px_rgba(0,0,0,0.10)]"
              >
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-yellow-300 text-sm font-black text-black">
                  {s.n}
                </div>

                <h3 className="mt-5 text-sm font-black uppercase tracking-[0.14em] text-black">
                  {s.title}
                </h3>

                <p className="mt-4 text-sm leading-relaxed text-zinc-600">
                  {s.text}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* TRANSPARENCY */}
      <section className="px-5 md:px-6 py-16 md:py-20 bg-[#0b0b0b] text-white">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-[0.85fr_1.15fr] gap-10 lg:gap-16 items-start">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.22em] text-yellow-300">
              Transparence totale
            </p>
            <h2 className={cn("mt-4", H2)}>
              Chaque véhicule doit pouvoir être justifié
            </h2>
            <p className={cn("mt-6 max-w-xl", BODY)}>
              La promesse est simple : pas de dossier flou, pas de surprise cachée,
              pas de véhicule présenté sans éléments vérifiables.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              {
                t: "Dossier complet",
                d: "Carnet d’entretien, factures, contrôles et historique constructeur.",
              },
              {
                t: "Défauts signalés",
                d: "Photos HD, remarques visibles et état réel présenté avant décision.",
              },
              {
                t: "Traçabilité",
                d: "VIN communiqué, provenance claire et entretien réseau constructeur.",
              },
            ].map((b, index) => (
              <div key={b.t} className="border border-zinc-800 bg-black p-6 transition hover:border-yellow-300">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-yellow-300 text-sm font-black text-black">
                  0{index + 1}
                </div>

                <h3 className="mt-5 text-base font-black uppercase tracking-[0.12em] text-white">
                  {b.t}
                </h3>

                <p className="mt-4 text-sm leading-relaxed text-zinc-500">
                  {b.d}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* WARRANTY */}
      <section className="px-5 md:px-6 py-16 md:py-20 bg-white text-black">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-[1.1fr_0.9fr] gap-6">
            <div className="bg-black text-white p-8 md:p-10">
              <p className="text-xs font-black uppercase tracking-[0.22em] text-yellow-300">
                Sérénité
              </p>
              <h2 className={cn("mt-4", H2)}>Achetez avec méthode, pas au hasard</h2>
              <p className="mt-6 max-w-2xl text-base leading-relaxed text-zinc-400">
                Essai routier avant achat, vérification du dossier, conseil au cas par
                cas et garantie optionnelle selon le véhicule.
              </p>
            </div>

            <div className="bg-yellow-300 p-8 md:p-10 text-black flex flex-col justify-between">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.22em] text-black/60">
                  Garantie optionnelle
                </p>
                <h3 className="mt-4 text-5xl font-black uppercase tracking-[-0.04em]">
                  12 à 24 mois
                </h3>
              </div>

              <p className="mt-8 text-base font-semibold leading-relaxed text-black/70">
                Disponible selon le véhicule, son âge, son kilométrage et son éligibilité.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="px-5 md:px-6 py-16 md:py-20 bg-[#0b0b0b] text-white">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-[0.8fr_1.2fr] gap-10 lg:gap-16">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.22em] text-yellow-300">
              FAQ
            </p>
            <h2 className={cn("mt-4", H2)}>Questions fréquentes</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              {
                q: "Comment voir la voiture ?",
                a: "Nous partageons la localisation dès l’arrivée au port de Dakar et fixons un rendez-vous pour un essai.",
              },
              {
                q: "Puis-je réserver ?",
                a: "Oui. Contactez-nous sur WhatsApp pour définir les conditions de réservation.",
              },
              {
                q: "Quels documents fournissez-vous ?",
                a: "Carnet, factures, CT, historique constructeur et dossier photos détaillé.",
              },
              {
                q: "Et la garantie ?",
                a: "Optionnelle 12 à 24 mois selon le véhicule. Conseil au cas par cas.",
              },
            ].map((f, i) => (
              <details key={i} className="group border border-zinc-800 bg-black">
                <summary className="cursor-pointer select-none px-5 py-4 flex items-center justify-between gap-4">
                  <span className="text-sm font-black uppercase tracking-[0.08em]">
                    {f.q}
                  </span>
                  <span className="text-2xl leading-none text-yellow-300 transition-transform group-open:rotate-45">
                    +
                  </span>
                </summary>
                <div className="px-5 pb-5 text-sm leading-relaxed text-zinc-400">
                  {f.a}
                </div>
              </details>
            ))}
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
            <h2 className={cn("mt-4", H2)}>Prêt à passer à l’étape suivante ?</h2>
            <p className={cn("mt-6 max-w-2xl", LEAD)}>
              Parlez-nous de votre projet. Nous vous accompagnons de la recherche
              jusqu’à la livraison.
            </p>

            <div className="mt-10 flex flex-wrap gap-4">
              <a
                className="bg-yellow-300 text-black px-7 py-4 text-sm font-black uppercase no-underline hover:bg-white transition"
                href="https://wa.me/35200000000?text=Bonjour%20SL%20Automotive%2C%20je%20veux%20acheter%20une%20voiture."
                target="_blank"
                rel="noreferrer"
              >
                Discuter sur WhatsApp
              </a>

              <a
                className="bg-white text-black px-7 py-4 text-sm font-black uppercase no-underline hover:bg-yellow-300 transition"
                href="/dealer#stock"
              >
                Voir le stock
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
                placeholder="Modèle recherché, budget, délai..."
              />
              <a
                href="https://wa.me/35200000000?text=Bonjour%20SL%20Automotive%2C%20je%20souhaite%20des%20infos%20sur%20votre%20processus."
                target="_blank"
                rel="noreferrer"
                className="flex w-full justify-center bg-yellow-300 px-6 py-4 text-sm font-black uppercase text-black no-underline hover:bg-white transition"
              >
                Envoyer sur WhatsApp
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
    </main>
  );
}