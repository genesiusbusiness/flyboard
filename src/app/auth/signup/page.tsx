"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { motion } from "framer-motion";
import Link from "next/link";
import { Footer } from "@/components/Footer";
import { bootstrapFlyboardProfile } from "@/lib/supabase/client-utils";

export default function SignupPage() {
  const router = useRouter();
  const supabase = createClient();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (password !== confirmPassword) {
      setError("Les mots de passe ne correspondent pas");
      setLoading(false);
      return;
    }

    if (password.length < 6) {
      setError("Le mot de passe doit contenir au moins 6 caractères");
      setLoading(false);
      return;
    }

    try {
      const { data, error: authError } = await supabase.auth.signUp({
        email,
        password,
      });

      if (authError) throw authError;

      // Bootstrap le profil FlyBoard
      await bootstrapFlyboardProfile();

      // Rediriger vers le dashboard
      router.push("/dashboard");
    } catch (err: any) {
      setError(err.message || "Erreur lors de l'inscription");
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
              <h2 className="text-2xl font-bold mb-2 text-gray-900">Créer un compte</h2>
              <p className="text-gray-600">Rejoignez FlyBoard et commencez à organiser vos projets</p>
            </div>

            <form onSubmit={handleSignup} className="space-y-5">
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

              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-semibold text-gray-700 mb-2">
                  Confirmer le mot de passe
                </label>
                <input
                  type="password"
                  id="confirmPassword"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
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
                {loading ? "Création..." : "Créer mon compte"}
              </button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-gray-500">
                Déjà un compte ?{" "}
                <Link href="/auth/login" className="vibrant-accent-text font-semibold hover:underline">
                  Se connecter
                </Link>
              </p>
            </div>
          </div>
        </motion.div>
      </div>
      <Footer variant="discrete" />
    </div>
  );
}

