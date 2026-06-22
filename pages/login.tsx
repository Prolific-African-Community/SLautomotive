import type { GetServerSideProps } from "next";
import { useRouter } from "next/router";
import { FormEvent, useState } from "react";
import { getLoginPageRedirectIfAuthenticated } from "../lib/simple-auth";

const inputClass =
  "w-full rounded-2xl border border-white/15 bg-black px-4 py-3 text-sm text-white placeholder:text-zinc-500 outline-none transition focus:border-yellow-300 focus:ring-2 focus:ring-yellow-300/20";

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();

    try {
      setSaving(true);
      setError(null);

      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username,
          password,
        }),
      });

      const json = await response.json();

      if (!response.ok || !json.success) {
        throw new Error(json.message || "Connexion impossible.");
      }

      await router.push("/dashboard/garage");
    } catch (err: any) {
      setError(err?.message || "Connexion impossible.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <main className="min-h-screen bg-black px-6 py-10 text-white">
      <div className="mx-auto flex min-h-[calc(100vh-5rem)] max-w-5xl items-center">
        <section className="grid w-full gap-8 lg:grid-cols-[1.1fr_440px]">
          <div className="flex flex-col justify-center">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-yellow-300">
              SL Automotive
            </p>
            <h1 className="mt-4 max-w-xl text-5xl font-black leading-tight text-white">
              Accès sécurisé au dashboard atelier
            </h1>
            <p className="mt-5 max-w-xl text-base leading-7 text-zinc-400">
              Connexion simple mono-utilisateur pour le cockpit garage, le suivi maintenance externe
              et les opérations internes SL Automotive.
            </p>
          </div>

          <div className="rounded-[28px] border border-white/10 bg-zinc-950 p-6 shadow-2xl shadow-black/60 sm:p-8">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-zinc-500">
              Connexion
            </p>
            <h2 className="mt-3 text-2xl font-black text-white">Bienvenue</h2>

            <form className="mt-8 space-y-4" onSubmit={handleSubmit}>
              <div>
                <label className="mb-2 block text-sm font-medium text-zinc-300">
                  Nom d’utilisateur
                </label>
                <input
                  className={inputClass}
                  value={username}
                  onChange={(event) => setUsername(event.target.value)}
                  placeholder="Nom d’utilisateur"
                  autoComplete="username"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-zinc-300">
                  Mot de passe
                </label>
                <input
                  type="password"
                  className={inputClass}
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="Votre mot de passe"
                  autoComplete="current-password"
                />
              </div>

              {error ? (
                <div className="rounded-2xl border border-red-400/20 bg-red-500/10 px-4 py-3 text-sm text-red-100">
                  {error}
                </div>
              ) : null}

              <button
                type="submit"
                disabled={saving}
                className="inline-flex w-full items-center justify-center rounded-2xl border border-yellow-300/70 bg-yellow-300 px-4 py-3 text-sm font-semibold text-black transition hover:bg-yellow-200 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {saving ? "Connexion..." : "Se connecter"}
              </button>
            </form>
          </div>
        </section>
      </div>
    </main>
  );
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  return getLoginPageRedirectIfAuthenticated(context);
};
