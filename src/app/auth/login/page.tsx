"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { motion } from "framer-motion";
import { Footer } from "@/components/Footer";
import { bootstrapFlyboardProfile } from "@/lib/supabase/client-utils";

export default function LoginPage() {
  const router = useRouter();
  const supabase = createClient();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) throw authError;

      // Bootstrap le profil FlyBoard
      await bootstrapFlyboardProfile();

      // Rediriger vers le dashboard
      router.push("/dashboard");
    } catch (err: any) {
      setError(err.message || "Erreur de connexion");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen light-blue-bg flex flex-col">
      <div className="flex-1 flex items-center justify-center px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
          style={{ opacity: 1, transform: 'translateY(0)' }}
        >
          <div className="glass-card rounded-3xl p-8 md:p-10 shadow-2xl">
            <div className="text-center mb-8">
              <div className="flex items-center justify-center gap-3 mb-4">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-tr from-[#6C63FF] to-[#FF77E9] rounded-2xl blur-md opacity-40"></div>
                  <img 
                    src="/favicon.png" 
                    alt="FlyBoard" 
                    className="relative w-14 h-14 rounded-2xl shadow-xl object-cover border-2 border-white/40"
                  />
                </div>
                <h1 className="text-3xl font-bold vibrant-accent-text">FlyBoard</h1>
              </div>
              <p className="text-gray-600">Connectez-vous pour accéder à votre espace</p>
            </div>

            <form onSubmit={handleLogin} className="space-y-5">
              <div>
                <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl glass-card border border-white/50 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
                  placeholder="votre@email.com"
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-semibold text-gray-700 mb-2">
                  Mot de passe
                </label>
                <input
                  type="password"
                  id="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl glass-card border border-white/50 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
                  placeholder="••••••••"
                />
              </div>

              {error && (
                <div className="p-3 rounded-lg bg-red-50 border border-red-200">
                  <p className="text-sm text-red-600">{error}</p>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full glass-button-accent px-6 py-3 text-sm font-semibold text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50"
              >
                {loading ? "Connexion..." : "Se connecter"}
              </button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-gray-500">
                Pas encore de compte ?{" "}
                <a href="/auth/signup" className="vibrant-accent-text font-semibold hover:underline">
                  Créer un compte
                </a>
              </p>
            </div>
          </div>
        </motion.div>
      </div>
      <Footer variant="discrete" />
    </div>
  );
}

