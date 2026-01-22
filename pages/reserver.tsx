import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/router";

// ======================
// Types
// ======================
type Discipline = "auto" | "karting";
type Level = "debutant" | "intermediaire" | "confirme";

type Product = {
  id: string;
  discipline: Discipline;
  level: Level;
  title: string;
  duration: string;
  price: number;
  blurb: string;
};

// ======================
// Catalogue
// ======================
const PRODUCTS: Product[] = [
  // 🚗 Pilotage auto
  { id: "auto-decouverte-20", discipline: "auto", level: "debutant", title: "Découverte circuit", duration: "20 min", price: 120, blurb: "Premiers tours, sensations et sécurité." },
  { id: "auto-initiation-30", discipline: "auto", level: "debutant", title: "Initiation trajectoires", duration: "30 min", price: 180, blurb: "Bases du freinage et des trajectoires." },
  { id: "auto-performance-45", discipline: "auto", level: "intermediaire", title: "Stage performance", duration: "45 min", price: 290, blurb: "Rythme, précision, confiance." },
  { id: "auto-attaque-60", discipline: "auto", level: "intermediaire", title: "Stage attaque", duration: "60 min", price: 390, blurb: "Repousser ses limites en sécurité." },
  { id: "auto-coaching-90", discipline: "auto", level: "confirme", title: "Coaching pro", duration: "90 min", price: 590, blurb: "Coaching individuel + data." },

  // 🏎️ Karting
  { id: "karting-loisir-20", discipline: "karting", level: "debutant", title: "Karting loisir", duration: "20 min", price: 60, blurb: "Fun et accessible." },
  { id: "karting-chrono-30", discipline: "karting", level: "intermediaire", title: "Karting chrono", duration: "30 min", price: 95, blurb: "Travail du temps au tour." },
  { id: "karting-coaching-60", discipline: "karting", level: "confirme", title: "Karting coaching", duration: "60 min", price: 160, blurb: "Coaching compétition." },
];

export default function ReserverPage() {
  const router = useRouter();
  const slotsRef = useRef<HTMLDivElement | null>(null);

  // ======================
  // State
  // ======================
  const [discipline, setDiscipline] = useState<Discipline | null>(null);
  const [level, setLevel] = useState<Level | null>(null);
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);

  // ======================
  // Derived
  // ======================
  const visibleProducts = useMemo(() => {
    return PRODUCTS.filter(p => (!discipline || p.discipline === discipline) && (!level || p.level === level));
  }, [discipline, level]);

  const selectedProduct = useMemo(() => {
    return PRODUCTS.find(p => p.id === selectedProductId) ?? null;
  }, [selectedProductId]);

  const slots = useMemo(() => {
    if (!selectedDate) return [];
    const d = new Date(selectedDate).getDay();
    const weekend = d === 0 || d === 6;
    return weekend
      ? ["09:00", "10:30", "12:00", "14:00", "15:30", "17:00"]
      : ["10:00", "11:30", "14:00", "15:30", "17:00"];
  }, [selectedDate]);

  // ======================
  // Effects
  // ======================
  useEffect(() => {
    if (!router.isReady) return;
    const product = router.query.product;
    if (typeof product === "string") {
      const found = PRODUCTS.find(p => p.id === product);
      if (found) {
        setDiscipline(found.discipline);
        setLevel(found.level);
        setSelectedProductId(found.id);
      }
    }
  }, [router.isReady, router.query.product]);

  useEffect(() => {
    if (selectedProduct && slotsRef.current) {
      slotsRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [selectedProduct]);

  // ======================
  // Render
  // ======================
  return (
    <>
      {/* Quit / Cancel button */}
      <button
        onClick={() => router.back()}
        aria-label="Quitter la réservation"
        style={{
          position: "fixed",
          top: 16,
          right: 16,
          width: 40,
          height: 40,
          borderRadius: "50%",
          border: "1px solid #e2e8f0",
          background: "white",
          fontSize: 22,
          fontWeight: 600,
          cursor: "pointer",
          lineHeight: "36px",
          textAlign: "center",
          boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
          zIndex: 1000,
        }}
      >
        ×
      </button>

    <main style={{ maxWidth: 1100, margin: "0 auto", padding: "48px 24px" }}>
      <h1 style={{ fontSize: 34, marginBottom: 8 }}>Réservez votre expérience de pilotage</h1>
      <p style={{ color: "#475569", marginBottom: 32 }}>
        Choisissez votre formule, votre date, on s’occupe du reste.
      </p>

      {/* Discipline */}
      <section style={{ marginBottom: 24 }}>
        <h2>1. Discipline</h2>
        <div style={{ display: "flex", gap: 12, marginTop: 12 }}>
          {(["auto", "karting"] as Discipline[]).map(d => (
            <button
              key={d}
              onClick={() => {
                setDiscipline(d);
                setLevel(null);
                setSelectedProductId(null);
              }}
              style={{
                padding: "12px 16px",
                borderRadius: 14,
                border: discipline === d ? "1px solid #0f172a" : "1px solid #e2e8f0",
                background: discipline === d ? "#0f172a" : "white",
                color: discipline === d ? "white" : "#0f172a",
                fontWeight: 600,
              }}
            >
              {d === "auto" ? "🚗 Pilotage automobile" : "🏎️ Karting"}
            </button>
          ))}
        </div>
      </section>

      {/* Niveau */}
      {discipline && (
        <section style={{ marginBottom: 24 }}>
          <h2>2. Niveau</h2>
          <div style={{ display: "flex", gap: 12, marginTop: 12 }}>
            {(["debutant", "intermediaire", "confirme"] as Level[]).map(l => (
              <button
                key={l}
                onClick={() => {
                  setLevel(l);
                  setSelectedProductId(null);
                }}
                style={{
                  padding: "10px 14px",
                  borderRadius: 14,
                  border: level === l ? "1px solid #0f172a" : "1px solid #e2e8f0",
                  background: level === l ? "#0f172a" : "white",
                  color: level === l ? "white" : "#0f172a",
                  fontWeight: 600,
                }}
              >
                {l === "debutant" ? "Débutant" : l === "intermediaire" ? "Intermédiaire" : "Confirmé"}
              </button>
            ))}
          </div>
        </section>
      )}

      {/* Formations */}
      {discipline && level && (
        <section style={{ marginBottom: 32 }}>
          <h2>3. Formation</h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 12, marginTop: 12 }}>
            {visibleProducts.map(p => (
              <button
                key={p.id}
                onClick={() => setSelectedProductId(p.id)}
                style={{
                  textAlign: "left",
                  borderRadius: 16,
                  border: selectedProductId === p.id ? "1px solid #0f172a" : "1px solid #e2e8f0",
                  padding: 16,
                  background: "white",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <strong>{p.title}</strong>
                  <strong>{p.price}€</strong>
                </div>
                <div style={{ fontSize: 13, color: "#475569", marginTop: 6 }}>{p.duration} • {p.blurb}</div>
              </button>
            ))}
          </div>
        </section>
      )}

      {/* Créneaux */}
      {selectedProduct && (
        <section ref={slotsRef} style={{ marginBottom: 32 }}>
          <h2>4. Créneau</h2>

          <div
            style={{
              border: "1px solid #e2e8f0",
              borderRadius: 16,
              padding: 16,
              marginTop: 12,
              
            }}
          >
            <input
              type="date"
              value={selectedDate ?? ""}
              onChange={(e) => {
                setSelectedDate(e.target.value || null);
                setSelectedSlot(null);
              }}
              style={{ padding: 10, borderRadius: 10, border: "1px solid #e2e8f0" }}
            />

            {selectedDate && (
              <div
                style={{
                  marginTop: 16,
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))",
                  gap: 10,
                }}
              >
                {slots.map((t) => (
                  <button
                    key={t}
                    onClick={() => setSelectedSlot(t)}
                    style={{
                      padding: 12,
                      borderRadius: 12,
                      border: selectedSlot === t ? "1px solid #0f172a" : "1px solid #e2e8f0",
                      background: selectedSlot === t ? "#0f172a" : "white",
                      color: selectedSlot === t ? "white" : "#0f172a",
                      fontWeight: 600,
                    }}
                  >
                    {t}
                  </button>
                ))}
              </div>
            )}

            {selectedSlot && (
              <div style={{ marginTop: 12, fontSize: 13, color: "#475569" }}>
                ✔ Créneau sélectionné. Vous pouvez le modifier en revenant ici.
              </div>
            )}
          </div>
        </section>
      )}

      {/* Infos personnelles & confirmation */}
{selectedProduct && selectedDate && selectedSlot && (
  <section style={{ marginBottom: 48 }}>
    <h2>5. Vos informations</h2>

    <div
      style={{
        marginTop: 12,
        display: "grid",
        gridTemplateColumns: "1fr 320px",
        gap: 16,
      }}
    >
      {/* Formulaire */}
      <div style={{ border: "1px solid #e2e8f0", borderRadius: 16, padding: 16 }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <input
            placeholder="Prénom"
            style={{ padding: 12, borderRadius: 10, border: "1px solid #e2e8f0" }}
          />
          <input
            placeholder="Nom"
            style={{ padding: 12, borderRadius: 10, border: "1px solid #e2e8f0" }}
          />
          <input
            type="email"
            placeholder="Email"
            style={{
              gridColumn: "1 / -1",
              padding: 12,
              borderRadius: 10,
              border: "1px solid #e2e8f0",
            }}
          />
          <input
            placeholder="Téléphone"
            style={{
              gridColumn: "1 / -1",
              padding: 12,
              borderRadius: 10,
              border: "1px solid #e2e8f0",
            }}
          />
        </div>
      </div>

      {/* Récap */}
      <aside
        style={{
          border: "1px solid #e2e8f0",
          borderRadius: 16,
          padding: 16,
          height: "fit-content",
        }}
      >
        <div style={{ fontSize: 12, color: "#64748b" }}>Récap</div>
        <div style={{ fontWeight: 700, marginTop: 6 }}>
          {selectedProduct.title}
        </div>
        <div style={{ fontSize: 13, color: "#475569" }}>
          {selectedProduct.duration}
        </div>

        <div style={{ marginTop: 12, fontSize: 13 }}>
          {selectedDate} — {selectedSlot}
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginTop: 12,
          }}
        >
          <span>Prix</span>
          <strong>{selectedProduct.price}€</strong>
        </div>

        <button
          style={{
            marginTop: 16,
            width: "100%",
            padding: 14,
            borderRadius: 12,
            border: "none",
            background: "#0f172a",
            color: "white",
            fontWeight: 700,
            cursor: "pointer",
          }}
        >
          Confirmer & payer
        </button>
      </aside>
    </div>
  </section>
)}

      
    </main>
    </>
  );
}
