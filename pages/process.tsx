import { useMemo } from "react";

export default function Process() {
  const nav = useMemo(
    () => ([
      { icon: "/home.svg", label: "Accueil", href: "/" },
      { icon: "/star.svg", label: "Nos véhicules", href: "/marketplace" },
      { icon: "/orders.svg", label: "Processus", href: "/process", active: false },
      { icon: "/chat.svg", label: "Contact", href: "/contact" },
    ]), []
  );

  return (
    <div className="flex min-h-screen bg-black text-white">
      {/* Sidebar */}
      <aside className="w-64 bg-black text-white flex flex-col px-4 space-y-6 shadow-xl">
        <a href="/"><img src="/logo-sl-automotive.jpg" alt="SL Automotive" className="h-56 w-56 mx-auto" /></a>
        <nav className="space-y-2 text-sm mx-8">
          {nav.map(({ icon, label, href, active }) => (
            <a
              key={label}
              href={href}
              className={`flex items-center gap-3 px-4 py-2 rounded-lg no-underline transition ${
                active ? "bg-yellow-400 text-black" : "text-white hover:bg-yellow-400 hover:text-black"
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
        {/* CTA WhatsApp */}
        <div className="absolute top-6 right-6 z-50">
          <a
            className="w-40 h-12 flex items-center justify-center bg-yellow-400 no-underline text-black font-semibold hover:bg-white hover:border-white hover:border-2 transition rounded"
            href="https://wa.me/35200000000?text=Bonjour%20SL%20Automotive%2C%20je%20souhaite%20des%20infos%20sur%20votre%20processus."
            target="_blank"
            rel="noreferrer"
          >
            WhatsApp
          </a>
        </div>

        {/* HERO */}
        <section className="px-6 max-w-6xl mx-auto pt-10">
          <p className="text-xs tracking-widest text-gray-400 uppercase mb-2">SL Automotive</p>
          <h1 className="text-4xl md:text-6xl font-extrabold leading-tight mb-4">
            Notre processus, simple et transparent.
          </h1>
          <p className="text-lg md:text-xl text-gray-200 max-w-3xl">
            Des véhicules <span className="text-yellow-400 font-semibold">de moins de 5 ans</span>, en fin de leasing,
            sélectionnés en Allemagne et au Luxembourg, importés jusqu’au port de Dakar — <span className="italic">à nos frais</span>.
          </p>
          <div className="mt-6 flex gap-3">
            <a href="/marketplace" className="bg-yellow-400 text-black px-6 py-3 rounded-full font-semibold no-underline hover:bg-white transition">
              Voir le stock
            </a>
            <a href="/contact" className="bg-white text-black px-6 py-3 rounded-full font-semibold no-underline hover:bg-black hover:text-white transition">
              Nous contacter
            </a>
          </div>
        </section>

        {/* Étapes clés */}
        <section className="px-6 max-w-6xl mx-auto mt-14">
          <h2 className="text-2xl font-bold mb-6">Les 5 étapes</h2>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {[
              {
                n: 1,
                title: "Sélection",
                text: "Moins de 5 ans, fin de leasing, entretien constructeur + historique complet certifié.",
              },
              {
                n: 2,
                title: "Contrôle & Dossier",
                text: "150 points, carnet, factures, CT, photos HD, défauts signalés: zéro surprise.",
              },
              {
                n: 3,
                title: "Achat & Import",
                text: "Achat en Allemagne ou Luxembourg puis transport jusqu’au port de Dakar pris en charge par SL Automotive.",
              },
              {
                n: 4,
                title: "Arrivée à Dakar",
                text: "Annonce mise à jour + localisation au port. On convient d’un rendez-vous.",
              },
              {
                n: 5,
                title: "Essai & Achat",
                text: "Test drive, vérification du dossier, paiement et remise du véhicule. Garantie 12–24 mois en option.",
              },
            ].map((s) => (
              <div key={s.n} className="rounded-2xl bg-[#111113] border border-white/5 p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-white/20 text-sm text-semibold">{s.n}</span>
                </div>
                <h3 className="font-semibold mb-1">{s.title}</h3>
                <p className="text-sm text-gray-300 leading-relaxed">{s.text}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Transparence détaillée */}
        <section className="px-6 max-w-6xl mx-auto mt-16">
          <div className="rounded-2xl bg-[#111113] border border-white/5 p-6 md:p-8">
            <h2 className="text-2xl font-bold mb-4">Transparence totale</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                { t: "Dossier complet", d: "Carnet d’entretien, factures, contrôles, historique constructeur vérifiable." },
                { t: "Défauts signalés", d: "Photos HD + remarques explicites sur les micro-rayures, jantes, pneus, etc." },
                { t: "Traçabilité", d: "VIN communiqué, entretien réseau constructeur, provenance claire (🇩🇪 / 🇱🇺)." },
              ].map((b) => (
                <div key={b.t} className="rounded-xl bg-white/5 ring-1 ring-white/10 p-4">
                  <p className="text-sm font-semibold mb-1">{b.t}</p>
                  <p className="text-sm text-gray-300">{b.d}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Garantie & sérénité */}
        <section className="px-6 max-w-6xl mx-auto mt-16">
          <div className="rounded-2xl bg-[#111113] border border-white/5 p-6 md:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div>
              <h2 className="text-2xl font-bold mb-2">Achetez serein</h2>
              <p className="text-gray-300">
                Garantie **optionnelle 12 à 24 mois**, essai routier avant achat, voiture prête à rouler en Afrique de l’Ouest.
              </p>
            </div>
            <div className="flex gap-3">
              <a href="/marketplace" className="bg-yellow-400 text-black px-6 py-3 rounded-full font-semibold no-underline hover:bg-white transition">
                Voir le stock
              </a>
            </div>
          </div>
        </section>

        {/* FAQ courte */}
        <section className="px-6 max-w-6xl mx-auto mt-16">
          <h2 className="text-2xl font-bold mb-6">Questions fréquentes</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              {
                q: "Comment voir la voiture ?",
                a: "Nous partageons la localisation dès l’arrivée au port de Dakar et fixons un rendez-vous pour un essai.",
              },
              {
                q: "Puis-je réserver ?",
                a: "Oui. Contactez-nous sur WhatsApp pour un acompte et un créneau prioritaire à l’essai.",
              },
              {
                q: "Quels documents fournissez-vous ?",
                a: "Carnet, factures, CT, historique constructeur et dossier photos détaillé.",
              },
              {
                q: "Et la garantie ?",
                a: "Optionnelle 12 à 24 mois selon le véhicule. On vous conseille au cas par cas.",
              },
            ].map((f, i) => (
              <details key={i} className="group rounded-xl bg-[#111113] border border-white/5">
                <summary className="cursor-pointer select-none px-4 py-3 flex items-center justify-between">
                  <span className="text-sm font-medium">{f.q}</span>
                  <span className="text-xl leading-none transition-transform group-open:rotate-45">+</span>
                </summary>
                <div className="px-4 pb-4 text-sm text-gray-300">{f.a}</div>
              </details>
            ))}
          </div>
        </section>

        {/* CTA final */}
        <section className="px-6 max-w-6xl mx-auto mt-16 mb-10 text-center">
          <h2 className="text-3xl font-bold mb-4">Prêt à passer à l’étape suivante ?</h2>
          <p className="text-gray-300 mb-6">Parlez-nous de votre projet et on vous accompagne de A à Z.</p>
          <div className="flex items-center justify-center gap-4">
            <a
              className="bg-yellow-400 hover:bg-white text-black px-10 py-4 rounded-full shadow-lg font-medium no-underline transition hover:scale-105"
              href="https://wa.me/35200000000?text=Bonjour%20SL%20Automotive%2C%20je%20veux%20acheter%20une%20voiture."
              target="_blank"
              rel="noreferrer"
            >
              Discuter sur WhatsApp
            </a>
          </div>
        </section>

        {/* Footer */}
        <footer className="text-center text-sm pt-8 border-t border-gray-700 text-gray-400">
          <p className="mb-1">© {new Date().getFullYear()} SL Automotive — Mentions légales — Politique de confidentialité</p>
          <p className="text-[13px]">La performance, sans compromis. La transparence, sans surprise.</p>
        </footer>
      </main>
    </div>
  );
}
